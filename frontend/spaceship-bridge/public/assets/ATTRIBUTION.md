# Asset Attribution

## Character sprites (bridge stage)

The crew sprites rendered on the Pixi bridge stage (`src/components/BridgeStage.tsx`) are
**original, procedurally generated pixel art** — not adapted from any third-party asset pack.

Deviation from `openspec/changes/make-bridge-scene-first/design.md` D2, which preferred adapting
a16z's ai-town (MIT-licensed) spritesheets: cloning, vetting, and re-licensing that asset pack
was out of scope for this pass's time budget. D2 explicitly documents this fallback:

> "Fallback if adaptation stalls: colored-circle sprites with the same animation hooks —
> choreography code is asset-agnostic."

This implementation goes one step past a plain circle: each character is a small 16x24 pixel
figure (torso, head, direction-facing visor, alternating-leg walk frames) generated at runtime
via `PIXI.Graphics` + `renderer.generateTexture`, with 4 facing directions x 3 frames (idle,
walk-A, walk-B) per crew member — the same animation-hook shape a real spritesheet would need,
so swapping in adapted ai-town assets later is a drop-in replacement of `buildCharacterTextures`,
not a rework of the animation/facing logic.

Colors are drawn from character canon (`characters/nova.md`, `characters/chen.md`,
`characters/torres.md`): Nova is command-red, Chen is science-blue, Torres is ops-gold.

No files in this directory are derived from ai-town or any other external asset pack.
