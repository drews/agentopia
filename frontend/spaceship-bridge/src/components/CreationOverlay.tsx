import React, { useState } from 'react';
import { PLAYER_PALETTES, DEFAULT_PALETTE_ID, hexToCss } from '../playerPalettes';
import { PlayerPrefs, PlayerProfile } from '../hooks/usePlayerProfile';
import './CreationOverlay.css';

interface CreationOverlayProps {
  onComplete: (profile: PlayerProfile) => void;
}

const NUDGE_OPTIONS: { id: PlayerPrefs['nudgeTiming']; label: string; hint: string }[] = [
  { id: 'gentle', label: 'Gentle', hint: 'a quiet ping, easy to miss on purpose' },
  { id: 'active', label: 'Active', hint: "the crew won't let it slide" },
  { id: 'off', label: "Don't nudge", hint: "I'll ask when I want to" },
];

// A boarding ceremony, not a settings form (design.md D6 / tasks.md 6.1):
// three short beats - name, colors, two preferences - then straight into
// the scene.
const CreationOverlay: React.FC<CreationOverlayProps> = ({ onComplete }) => {
  const [callsign, setCallsign] = useState('');
  const [paletteId, setPaletteId] = useState(DEFAULT_PALETTE_ID);
  const [nudgeTiming, setNudgeTiming] = useState<PlayerPrefs['nudgeTiming']>('gentle');
  const [morningBriefing, setMorningBriefing] = useState(true);

  const canBoard = callsign.trim().length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canBoard) return;
    onComplete({
      callsign: callsign.trim(),
      paletteId,
      prefs: { nudgeTiming, morningBriefing },
    });
  };

  return (
    <div className="creation-overlay" role="dialog" aria-label="Welcome aboard">
      <form className="creation-panel" onSubmit={handleSubmit}>
        <p className="creation-eyebrow">USS AGENTOPIA · BOARDING</p>
        <h1 className="creation-title">Welcome aboard, Captain.</h1>
        <p className="creation-copy">
          Nova, Chen, and Torres are already at their stations. Tell them who they're serving.
        </p>

        <label className="creation-field">
          <span className="creation-label">Callsign</span>
          <input
            className="creation-input"
            value={callsign}
            onChange={(e) => setCallsign(e.target.value)}
            placeholder="What should the crew call you?"
            maxLength={24}
            autoFocus
          />
        </label>

        <div className="creation-field">
          <span className="creation-label">Your colors</span>
          <div className="palette-row">
            {PLAYER_PALETTES.map((palette) => (
              <button
                type="button"
                key={palette.id}
                className={`palette-swatch ${paletteId === palette.id ? 'selected' : ''}`}
                style={{ background: hexToCss(palette.coat), borderColor: hexToCss(palette.trim) }}
                onClick={() => setPaletteId(palette.id)}
                aria-pressed={paletteId === palette.id}
                title={palette.label}
              >
                <span className="palette-trim" style={{ background: hexToCss(palette.trim) }} />
              </button>
            ))}
          </div>
        </div>

        <div className="creation-field">
          <span className="creation-label">When should the crew nudge you?</span>
          <div className="option-row">
            {NUDGE_OPTIONS.map((opt) => (
              <button
                type="button"
                key={opt.id}
                className={`option-pill ${nudgeTiming === opt.id ? 'selected' : ''}`}
                onClick={() => setNudgeTiming(opt.id)}
                title={opt.hint}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="creation-field">
          <span className="creation-label">Morning briefing from the crew?</span>
          <div className="option-row">
            <button
              type="button"
              className={`option-pill ${morningBriefing ? 'selected' : ''}`}
              onClick={() => setMorningBriefing(true)}
            >
              Yes
            </button>
            <button
              type="button"
              className={`option-pill ${!morningBriefing ? 'selected' : ''}`}
              onClick={() => setMorningBriefing(false)}
            >
              No
            </button>
          </div>
        </div>

        <button type="submit" className="creation-submit" disabled={!canBoard}>
          Report for duty
        </button>
      </form>
    </div>
  );
};

export default CreationOverlay;
