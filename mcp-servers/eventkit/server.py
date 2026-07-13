#!/usr/bin/env python3
"""
EventKit MCP Server (host-side)

Exposes Apple Calendar + Reminders as a small, flat-schema MCP tool surface,
over streamable-HTTP on 127.0.0.1:3010.

WHY THIS RUNS ON THE HOST, NOT IN DOCKER
-----------------------------------------
EventKit is a macOS framework accessed via PyObjC; it requires TCC
(Transparency, Consent, and Control) permission grants tied to the actual
process requesting access, and it has no meaning inside a Linux container.
A stdio MCP server cannot be spawned by the containerized FastAPI backend
across the VM boundary Docker Desktop imposes on macOS. So this process runs
directly on the Mac (outside Docker) and speaks streamable-HTTP; the backend
reaches it at http://host.docker.internal:3010/mcp. See README.md.

Run: ./run.sh  (or `python3 server.py` inside the venv)
"""

import asyncio
import logging
import sys
from datetime import datetime, timedelta

from fastmcp import FastMCP

try:
    from EventKit import (
        EKEventStore,
        EKEntityTypeEvent,
        EKEntityTypeReminder,
        EKEvent,
        EKReminder,
        EKAlarm,
        EKSpan,
        EKAuthorizationStatusAuthorized,
        EKAuthorizationStatusFullAccess,
        EKAuthorizationStatusNotDetermined,
    )
    from Foundation import NSDate, NSRunLoop
except ImportError as exc:  # pragma: no cover - environment guard
    print(
        "PyObjC EventKit bindings not found. Install with:\n"
        "  pip install pyobjc-framework-EventKit\n"
        f"Original error: {exc}",
        file=sys.stderr,
    )
    raise

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("eventkit-mcp")

mcp = FastMCP("eventkit")

_store = EKEventStore.alloc().init()


# ---------------------------------------------------------------------------
# Authorization
# ---------------------------------------------------------------------------

def _pump_runloop_until(predicate, timeout_s: float = 60.0) -> bool:
    """Spin the Cocoa run loop so async EventKit completion handlers fire.

    EventKit's request*Access callbacks run on the main run loop; a plain
    Python asyncio server never drives that loop, so without this the
    callback never executes and the request appears to hang.
    """
    deadline = datetime.now() + timedelta(seconds=timeout_s)
    run_loop = NSRunLoop.currentRunLoop()
    while not predicate() and datetime.now() < deadline:
        run_loop.runMode_beforeDate_(
            "kCFRunLoopDefaultMode", NSDate.dateWithTimeIntervalSinceNow_(0.1)
        )
    return predicate()


def _request_access(entity_type, label: str, timeout_s: float = 10.0) -> tuple[bool, str]:
    """Check current authorization first; if already decided, return
    immediately. Otherwise request full access (macOS 14+ API) and block
    (via run-loop pumping) until the user responds to the TCC dialog or
    timeout_s elapses — never hang indefinitely.

    Returns (granted, message).
    """
    status = EKEventStore.authorizationStatusForEntityType_(entity_type)
    if status in (EKAuthorizationStatusAuthorized, EKAuthorizationStatusFullAccess):
        return True, "granted"
    if status != EKAuthorizationStatusNotDetermined:
        # Denied or restricted: no dialog will appear, so don't wait for one.
        return False, (
            f"{label} access is denied or restricted (status={int(status)}). Grant access in "
            "System Settings > Privacy & Security > Calendars/Reminders for the "
            "terminal/python binary running this server, then restart it."
        )

    result = {"done": False, "granted": False, "error": None}

    def _completion(granted, error):
        result["granted"] = bool(granted)
        result["error"] = str(error) if error else None
        result["done"] = True

    if entity_type == EKEntityTypeEvent:
        _store.requestFullAccessToEventsWithCompletion_(_completion)
    else:
        _store.requestFullAccessToRemindersWithCompletion_(_completion)

    finished = _pump_runloop_until(lambda: result["done"], timeout_s=timeout_s)

    if not finished:
        return False, (
            f"{label} access request timed out after {timeout_s:.0f}s waiting for a "
            "response to the macOS permission dialog. Grant access in "
            "System Settings > Privacy & Security > Calendars/Reminders, or "
            "click Allow on the prompt, then retry."
        )
    if not result["granted"]:
        detail = f" ({result['error']})" if result["error"] else ""
        return False, (
            f"{label} access was denied or not determined{detail}. Grant access in "
            "System Settings > Privacy & Security > Calendars/Reminders and re-run."
        )
    return True, "granted"


def _ensure_events_access() -> str | None:
    ok, message = _request_access(EKEntityTypeEvent, "Calendar")
    return None if ok else message


def _ensure_reminders_access() -> str | None:
    ok, message = _request_access(EKEntityTypeReminder, "Reminders")
    return None if ok else message


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _nsdate_to_iso(nsdate) -> str | None:
    if nsdate is None:
        return None
    # NSDate -> Python datetime via timeIntervalSince1970
    ts = nsdate.timeIntervalSince1970()
    return datetime.fromtimestamp(ts).astimezone().isoformat()


def _iso_to_nsdate(iso: str):
    dt = datetime.fromisoformat(iso)
    if dt.tzinfo is None:
        dt = dt.astimezone()
    return NSDate.dateWithTimeIntervalSince1970_(dt.timestamp())


def _event_to_dict(ev) -> dict:
    return {
        "id": str(ev.eventIdentifier()),
        "title": str(ev.title() or ""),
        "start_iso": _nsdate_to_iso(ev.startDate()),
        "end_iso": _nsdate_to_iso(ev.endDate()),
        "all_day": bool(ev.isAllDay()),
        "calendar": str(ev.calendar().title()) if ev.calendar() else None,
        "location": str(ev.location()) if ev.location() else None,
    }


def _reminder_to_dict(rem) -> dict:
    due = rem.dueDateComponents()
    due_iso = None
    if due is not None:
        cal = __import__("Foundation").NSCalendar.currentCalendar()
        d = cal.dateFromComponents_(due)
        due_iso = _nsdate_to_iso(d)
    return {
        "id": str(rem.calendarItemIdentifier()),
        "title": str(rem.title() or ""),
        "completed": bool(rem.isCompleted()),
        "due_iso": due_iso,
        "list": str(rem.calendar().title()) if rem.calendar() else None,
    }


async def _fetch_reminders(predicate) -> list:
    """EKEventStore reminder fetches are async-callback based even though
    there's no network I/O; wrap in a future so tool functions can await."""
    loop = asyncio.get_event_loop()
    future: asyncio.Future = loop.create_future()

    def _completion(reminders):
        if not future.done():
            loop.call_soon_threadsafe(future.set_result, list(reminders or []))

    _store.fetchRemindersMatchingPredicate_completion_(predicate, _completion)

    # Drive the run loop while we wait (same reasoning as _pump_runloop_until)
    deadline = datetime.now() + timedelta(seconds=15)
    run_loop = NSRunLoop.currentRunLoop()
    while not future.done() and datetime.now() < deadline:
        run_loop.runMode_beforeDate_(
            "kCFRunLoopDefaultMode", NSDate.dateWithTimeIntervalSinceNow_(0.1)
        )
        await asyncio.sleep(0)
    if not future.done():
        return []
    return future.result()


# ---------------------------------------------------------------------------
# Tools (flat schemas only — see design.md D3)
# ---------------------------------------------------------------------------

@mcp.tool
def list_todays_events() -> dict:
    """List all calendar events on today's date."""
    err = _ensure_events_access()
    if err:
        return {"error": err}

    now = datetime.now().astimezone()
    start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    end = start + timedelta(days=1)

    predicate = _store.predicateForEventsWithStartDate_endDate_calendars_(
        _iso_to_nsdate(start.isoformat()), _iso_to_nsdate(end.isoformat()), None
    )
    events = _store.eventsMatchingPredicate_(predicate)
    return {"events": [_event_to_dict(e) for e in events]}


@mcp.tool
def list_upcoming_events(days: int = 7) -> dict:
    """List calendar events from now through the given number of days ahead."""
    err = _ensure_events_access()
    if err:
        return {"error": err}

    start = datetime.now().astimezone()
    end = start + timedelta(days=days)

    predicate = _store.predicateForEventsWithStartDate_endDate_calendars_(
        _iso_to_nsdate(start.isoformat()), _iso_to_nsdate(end.isoformat()), None
    )
    events = _store.eventsMatchingPredicate_(predicate)
    return {"events": [_event_to_dict(e) for e in events]}


@mcp.tool
async def list_reminders(completed: bool = False) -> dict:
    """List reminders, filtered by completion status."""
    err = _ensure_reminders_access()
    if err:
        return {"error": err}

    if completed:
        predicate = _store.predicateForRemindersInCalendars_(None)
        reminders = await _fetch_reminders(predicate)
        reminders = [r for r in reminders if r.isCompleted()]
    else:
        predicate = _store.predicateForIncompleteRemindersWithDueDateStarting_ending_calendars_(
            None, None, None
        )
        reminders = await _fetch_reminders(predicate)

    return {"reminders": [_reminder_to_dict(r) for r in reminders]}


@mcp.tool
def create_reminder(title: str, due_iso: str | None = None) -> dict:
    """Create a new reminder with an optional ISO-8601 due date/time."""
    err = _ensure_reminders_access()
    if err:
        return {"error": err}

    rem = EKReminder.reminderWithEventStore_(_store)
    rem.setTitle_(title)
    rem.setCalendar_(_store.defaultCalendarForNewReminders())

    if due_iso:
        dt = datetime.fromisoformat(due_iso)
        if dt.tzinfo is None:
            dt = dt.astimezone()
        cal = __import__("Foundation").NSCalendar.currentCalendar()
        components = cal.components_fromDate_(
            (1 << 0) | (1 << 1) | (1 << 2) | (1 << 3) | (1 << 4),  # year/month/day/hour/minute
            _iso_to_nsdate(dt.isoformat()),
        )
        rem.setDueDateComponents_(components)
        rem.addAlarm_(EKAlarm.alarmWithAbsoluteDate_(_iso_to_nsdate(dt.isoformat())))

    ok, error = _store.saveReminder_commit_error_(rem, True, None)
    if not ok:
        return {"error": str(error)}
    return {"id": str(rem.calendarItemIdentifier()), "title": title}


@mcp.tool
def complete_reminder(id: str) -> dict:
    """Mark a reminder as completed by its identifier."""
    err = _ensure_reminders_access()
    if err:
        return {"error": err}

    item = _store.calendarItemWithIdentifier_(id)
    if item is None:
        return {"error": f"No reminder found with id {id}"}
    item.setCompleted_(True)
    ok, error = _store.saveReminder_commit_error_(item, True, None)
    if not ok:
        return {"error": str(error)}
    return {"id": id, "completed": True}


@mcp.tool
def create_event(title: str, start_iso: str, end_iso: str) -> dict:
    """Create a new calendar event with ISO-8601 start/end times."""
    err = _ensure_events_access()
    if err:
        return {"error": err}

    ev = EKEvent.eventWithEventStore_(_store)
    ev.setTitle_(title)
    ev.setStartDate_(_iso_to_nsdate(start_iso))
    ev.setEndDate_(_iso_to_nsdate(end_iso))
    ev.setCalendar_(_store.defaultCalendarForNewEvents())

    ok, error = _store.saveEvent_span_commit_error_(ev, EKSpan.EKSpanThisEvent, True, None)
    if not ok:
        return {"error": str(error)}
    return {"id": str(ev.eventIdentifier()), "title": title}


if __name__ == "__main__":
    logger.info("Starting EventKit MCP server on 127.0.0.1:3010 (streamable-http)")
    mcp.run(transport="streamable-http", host="127.0.0.1", port=3010)
