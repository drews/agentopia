import { useCallback, useState } from 'react';
import { DEFAULT_PALETTE_ID } from '../playerPalettes';

// First-boarding profile (openspec make-bridge-scene-first task 6). Persisted
// client-side only, same tier as bridgeStore's playerPosition - no backend
// entity yet. Doubles as EF-preference capture that later work can wire into
// crew behavior (task 6.1 note in tasks.md).
export interface PlayerPrefs {
  nudgeTiming: 'gentle' | 'active' | 'off';
  morningBriefing: boolean;
}

export interface PlayerProfile {
  callsign: string;
  paletteId: string;
  prefs: PlayerPrefs;
}

const STORAGE_KEY = 'agentopia.player';

export function loadPlayerProfile(): PlayerProfile | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed.callsign !== 'string' || !parsed.callsign.trim()) return null;
    return {
      callsign: parsed.callsign,
      paletteId: typeof parsed.paletteId === 'string' ? parsed.paletteId : DEFAULT_PALETTE_ID,
      prefs: {
        nudgeTiming: parsed.prefs?.nudgeTiming ?? 'gentle',
        morningBriefing: parsed.prefs?.morningBriefing ?? true,
      },
    };
  } catch {
    return null;
  }
}

function savePlayerProfile(profile: PlayerProfile): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
}

/**
 * Boot-time player profile: null until the captain has boarded (localStorage
 * empty or corrupt), then persisted. `justBoarded` distinguishes a
 * fresh-creation boot from a returning one, for the greeting copy.
 */
export function usePlayerProfile() {
  const [profile, setProfile] = useState<PlayerProfile | null>(() => loadPlayerProfile());
  const [justBoarded, setJustBoarded] = useState(false);

  const completeCreation = useCallback((next: PlayerProfile) => {
    savePlayerProfile(next);
    setProfile(next);
    setJustBoarded(true);
  }, []);

  return { profile, completeCreation, justBoarded };
}
