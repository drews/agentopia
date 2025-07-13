#!/usr/bin/env python3
"""
DateTime Tools MCP Server

A simple offline MCP server providing basic datetime semantics and calendar calculations.
Perfect for answering questions like "How many days until Christmas?"
"""

import asyncio
import json
import sys
from datetime import datetime, timedelta, date
from typing import Any, Dict, List, Optional
import calendar

# MCP imports
from mcp.server.fastmcp import FastMCP
from mcp.server.stdio import stdio_server
from mcp.server.sse import SseServerTransport
from mcp.types import Resource, Tool
import os

# Initialize MCP server
mcp = FastMCP("DateTime Tools")

# Holiday definitions (major US holidays)
HOLIDAYS = {
    "New Year's Day": (1, 1),
    "Martin Luther King Jr. Day": (1, 15),  # 3rd Monday, approximated
    "Presidents' Day": (2, 15),  # 3rd Monday, approximated
    "Memorial Day": (5, 25),  # Last Monday, approximated
    "Independence Day": (7, 4),
    "Labor Day": (9, 1),  # 1st Monday, approximated
    "Columbus Day": (10, 8),  # 2nd Monday, approximated
    "Veterans Day": (11, 11),
    "Thanksgiving": (11, 22),  # 4th Thursday, approximated
    "Christmas": (12, 25),
}

def parse_date_string(date_str: str) -> date:
    """Parse various date string formats."""
    formats = [
        "%Y-%m-%d",
        "%m/%d/%Y",
        "%m-%d-%Y",
        "%B %d, %Y",
        "%b %d, %Y",
        "%Y/%m/%d"
    ]
    
    for fmt in formats:
        try:
            return datetime.strptime(date_str, fmt).date()
        except ValueError:
            continue
    
    raise ValueError(f"Could not parse date: {date_str}")

@mcp.tool()
def current_time() -> str:
    """Get the current date and time."""
    now = datetime.now()
    return {
        "datetime": now.isoformat(),
        "date": now.date().isoformat(),
        "time": now.time().isoformat(),
        "weekday": now.strftime("%A"),
        "formatted": now.strftime("%A, %B %d, %Y at %I:%M %p")
    }

@mcp.tool()
def days_until(target_date: str) -> Dict[str, Any]:
    """Calculate how many days until a target date.
    
    Args:
        target_date: Target date in YYYY-MM-DD format or holiday name
    """
    today = date.today()
    
    # Check if it's a holiday name
    if target_date.lower() in [h.lower() for h in HOLIDAYS.keys()]:
        holiday_name = next(h for h in HOLIDAYS.keys() if h.lower() == target_date.lower())
        month, day = HOLIDAYS[holiday_name]
        
        # Try this year first
        target = date(today.year, month, day)
        if target < today:
            # If already passed, use next year
            target = date(today.year + 1, month, day)
        
        days = (target - today).days
        return {
            "holiday": holiday_name,
            "target_date": target.isoformat(),
            "days_until": days,
            "message": f"{days} days until {holiday_name} ({target.strftime('%A, %B %d, %Y')})"
        }
    
    # Parse as regular date
    try:
        target = parse_date_string(target_date)
        days = (target - today).days
        
        if days < 0:
            return {
                "target_date": target.isoformat(),
                "days_until": days,
                "message": f"That date was {abs(days)} days ago ({target.strftime('%A, %B %d, %Y')})"
            }
        elif days == 0:
            return {
                "target_date": target.isoformat(),
                "days_until": 0,
                "message": "That's today!"
            }
        else:
            return {
                "target_date": target.isoformat(),
                "days_until": days,
                "message": f"{days} days until {target.strftime('%A, %B %d, %Y')}"
            }
    except ValueError as e:
        return {"error": str(e)}

@mcp.tool()
def days_between(start_date: str, end_date: str) -> Dict[str, Any]:
    """Calculate the number of days between two dates.
    
    Args:
        start_date: Start date in YYYY-MM-DD format
        end_date: End date in YYYY-MM-DD format
    """
    try:
        start = parse_date_string(start_date)
        end = parse_date_string(end_date)
        
        days = (end - start).days
        return {
            "start_date": start.isoformat(),
            "end_date": end.isoformat(),
            "days_between": abs(days),
            "direction": "forward" if days >= 0 else "backward",
            "message": f"{abs(days)} days between {start.strftime('%B %d, %Y')} and {end.strftime('%B %d, %Y')}"
        }
    except ValueError as e:
        return {"error": str(e)}

@mcp.tool()
def day_of_week(target_date: str) -> Dict[str, Any]:
    """Get the day of the week for a given date.
    
    Args:
        target_date: Date in YYYY-MM-DD format
    """
    try:
        target = parse_date_string(target_date)
        return {
            "date": target.isoformat(),
            "day_of_week": target.strftime("%A"),
            "day_number": target.weekday() + 1,  # 1-7, Monday=1
            "is_weekend": target.weekday() >= 5,
            "message": f"{target.strftime('%B %d, %Y')} is a {target.strftime('%A')}"
        }
    except ValueError as e:
        return {"error": str(e)}

@mcp.tool()
def is_leap_year(year: int) -> Dict[str, Any]:
    """Check if a year is a leap year.
    
    Args:
        year: Year to check
    """
    is_leap = calendar.isleap(year)
    return {
        "year": year,
        "is_leap_year": is_leap,
        "days_in_year": 366 if is_leap else 365,
        "message": f"{year} {'is' if is_leap else 'is not'} a leap year"
    }

@mcp.tool()
def days_in_month(year: int, month: int) -> Dict[str, Any]:
    """Get the number of days in a specific month and year.
    
    Args:
        year: Year
        month: Month (1-12)
    """
    try:
        days = calendar.monthrange(year, month)[1]
        month_name = calendar.month_name[month]
        return {
            "year": year,
            "month": month,
            "month_name": month_name,
            "days_in_month": days,
            "message": f"{month_name} {year} has {days} days"
        }
    except ValueError as e:
        return {"error": str(e)}

@mcp.tool()
def next_holiday() -> Dict[str, Any]:
    """Find the next upcoming holiday."""
    today = date.today()
    next_holiday_date = None
    next_holiday_name = None
    
    for holiday_name, (month, day) in HOLIDAYS.items():
        # Try this year
        holiday_date = date(today.year, month, day)
        if holiday_date >= today:
            if next_holiday_date is None or holiday_date < next_holiday_date:
                next_holiday_date = holiday_date
                next_holiday_name = holiday_name
        else:
            # Try next year
            holiday_date = date(today.year + 1, month, day)
            if next_holiday_date is None or holiday_date < next_holiday_date:
                next_holiday_date = holiday_date
                next_holiday_name = holiday_name
    
    if next_holiday_date:
        days = (next_holiday_date - today).days
        return {
            "holiday": next_holiday_name,
            "date": next_holiday_date.isoformat(),
            "days_until": days,
            "message": f"Next holiday is {next_holiday_name} in {days} days ({next_holiday_date.strftime('%A, %B %d, %Y')})"
        }
    
    return {"message": "No holidays found"}

@mcp.tool()
def holidays_in_year(year: int) -> Dict[str, Any]:
    """List all holidays in a given year.
    
    Args:
        year: Year to get holidays for
    """
    year_holidays = []
    
    for holiday_name, (month, day) in HOLIDAYS.items():
        holiday_date = date(year, month, day)
        year_holidays.append({
            "name": holiday_name,
            "date": holiday_date.isoformat(),
            "day_of_week": holiday_date.strftime("%A"),
            "formatted": holiday_date.strftime("%A, %B %d")
        })
    
    # Sort by date
    year_holidays.sort(key=lambda x: x["date"])
    
    return {
        "year": year,
        "holidays": year_holidays,
        "count": len(year_holidays),
        "message": f"Found {len(year_holidays)} holidays in {year}"
    }

@mcp.tool()
def is_holiday(target_date: str) -> Dict[str, Any]:
    """Check if a given date is a holiday.
    
    Args:
        target_date: Date in YYYY-MM-DD format
    """
    try:
        target = parse_date_string(target_date)
        
        for holiday_name, (month, day) in HOLIDAYS.items():
            if target.month == month and target.day == day:
                return {
                    "date": target.isoformat(),
                    "is_holiday": True,
                    "holiday_name": holiday_name,
                    "message": f"{target.strftime('%B %d, %Y')} is {holiday_name}"
                }
        
        return {
            "date": target.isoformat(),
            "is_holiday": False,
            "message": f"{target.strftime('%B %d, %Y')} is not a major holiday"
        }
    except ValueError as e:
        return {"error": str(e)}

@mcp.tool()
def add_days(start_date: str, days: int) -> Dict[str, Any]:
    """Add or subtract days from a date.
    
    Args:
        start_date: Starting date in YYYY-MM-DD format
        days: Number of days to add (positive) or subtract (negative)
    """
    try:
        start = parse_date_string(start_date)
        result = start + timedelta(days=days)
        
        action = "added" if days >= 0 else "subtracted"
        return {
            "start_date": start.isoformat(),
            "days_changed": days,
            "result_date": result.isoformat(),
            "day_of_week": result.strftime("%A"),
            "message": f"{action.capitalize()} {abs(days)} days: {start.strftime('%B %d, %Y')} → {result.strftime('%A, %B %d, %Y')}"
        }
    except ValueError as e:
        return {"error": str(e)}

async def run_http_server():
    """Run the DateTime Tools MCP server in HTTP mode."""
    from fastapi import FastAPI, HTTPException
    from fastapi.responses import JSONResponse
    import uvicorn
    
    # Create FastAPI app for health checks and HTTP transport
    app = FastAPI(title="DateTime Tools MCP Server")
    
    @app.get("/health")
    async def health_check():
        return {"status": "healthy", "service": "datetime-tools-mcp"}
    
    @app.get("/capabilities")
    async def get_capabilities():
        return {
            "tools": [
                "current_time", "days_until", "days_between", "day_of_week",
                "is_leap_year", "days_in_month", "next_holiday", 
                "holidays_in_year", "is_holiday", "add_days"
            ],
            "resources": ["datetime://holidays", "datetime://help"],
            "capabilities": ["datetime", "calendar", "holidays", "calculations"]
        }
    
    # Add MCP endpoints
    @app.post("/mcp/tools/{tool_name}")
    async def call_tool(tool_name: str, request: dict):
        """Call an MCP tool."""
        try:
            # Map tool calls to our functions
            if tool_name == "current_time":
                return current_time()
            elif tool_name == "days_until":
                return days_until(request.get("target_date", ""))
            elif tool_name == "days_between":
                return days_between(request.get("start_date", ""), request.get("end_date", ""))
            elif tool_name == "day_of_week":
                return day_of_week(request.get("target_date", ""))
            elif tool_name == "is_leap_year":
                return is_leap_year(request.get("year", 0))
            elif tool_name == "days_in_month":
                return days_in_month(request.get("year", 0), request.get("month", 0))
            elif tool_name == "next_holiday":
                return next_holiday()
            elif tool_name == "holidays_in_year":
                return holidays_in_year(request.get("year", 0))
            elif tool_name == "is_holiday":
                return is_holiday(request.get("target_date", ""))
            elif tool_name == "add_days":
                return add_days(request.get("start_date", ""), request.get("days", 0))
            else:
                raise HTTPException(status_code=404, detail=f"Tool {tool_name} not found")
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    
    @app.get("/mcp/resources/{resource_name}")
    async def get_resource(resource_name: str):
        """Get an MCP resource."""
        if resource_name == "holidays":
            holiday_list = "\n".join([f"- {name}: {month}/{day}" for name, (month, day) in HOLIDAYS.items()])
            return {"content": f"Supported Holidays:\n{holiday_list}"}
        elif resource_name == "help":
            help_text = """
DateTime Tools MCP Server

Available tools:
- current_time() - Get current date/time
- days_until(date) - Days until a date or holiday
- days_between(start, end) - Days between two dates  
- day_of_week(date) - What day of the week
- is_leap_year(year) - Check if leap year
- days_in_month(year, month) - Days in a month
- next_holiday() - Find next holiday
- holidays_in_year(year) - List holidays in year
- is_holiday(date) - Check if date is holiday
- add_days(date, days) - Add/subtract days

Date formats supported:
- YYYY-MM-DD (recommended)
- MM/DD/YYYY
- MM-DD-YYYY
- Month DD, YYYY
- Holiday names (e.g., "Christmas")

Examples:
- "How many days until Christmas?" → days_until("Christmas")
- "What day is New Year's?" → day_of_week("2025-01-01") 
- "Is 2024 a leap year?" → is_leap_year(2024)
"""
            return {"content": help_text}
        else:
            raise HTTPException(status_code=404, detail=f"Resource {resource_name} not found")
    
    # Get configuration from environment
    host = os.getenv("MCP_HOST", "0.0.0.0")
    port = int(os.getenv("MCP_PORT", "3000"))
    
    # Run the server
    config = uvicorn.Config(app, host=host, port=port, log_level="info")
    server = uvicorn.Server(config)
    await server.serve()

async def main():
    """Run the DateTime Tools MCP server."""
    
    # Check if running in container (HTTP mode) or command line (stdio mode)
    if os.getenv("MCP_HOST") or os.getenv("MCP_PORT"):
        # Container mode - use HTTP server
        await run_http_server()
    else:
        # Command line mode - use stdio
        # Add resources for documentation
        @mcp.resource("datetime://holidays")
        async def get_holidays() -> str:
            """List of supported holidays."""
            holiday_list = "\n".join([f"- {name}: {month}/{day}" for name, (month, day) in HOLIDAYS.items()])
            return f"Supported Holidays:\n{holiday_list}"
        
        @mcp.resource("datetime://help")
        async def get_help() -> str:
            """Help documentation for DateTime Tools."""
            return """
DateTime Tools MCP Server

Available tools:
- current_time() - Get current date/time
- days_until(date) - Days until a date or holiday
- days_between(start, end) - Days between two dates  
- day_of_week(date) - What day of the week
- is_leap_year(year) - Check if leap year
- days_in_month(year, month) - Days in a month
- next_holiday() - Find next holiday
- holidays_in_year(year) - List holidays in year
- is_holiday(date) - Check if date is holiday
- add_days(date, days) - Add/subtract days

Date formats supported:
- YYYY-MM-DD (recommended)
- MM/DD/YYYY
- MM-DD-YYYY
- Month DD, YYYY
- Holiday names (e.g., "Christmas")

Examples:
- "How many days until Christmas?" → days_until("Christmas")
- "What day is New Year's?" → day_of_week("2025-01-01") 
- "Is 2024 a leap year?" → is_leap_year(2024)
"""
        
        # Run the server
        async with stdio_server() as streams:
            await mcp.run(streams[0], streams[1])

if __name__ == "__main__":
    asyncio.run(main())