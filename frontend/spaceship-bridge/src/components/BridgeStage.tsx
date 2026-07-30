import React, { useEffect, useMemo, useRef } from 'react';
import { Application, Container, Graphics, Rectangle, Sprite, Text, Texture } from 'pixi.js';
import { useBridgeStore, Position } from '../stores/bridgeStore';

// Deviation from the OpenSpec design doc: @pixi/react 8.0.5 has a packaging
// bug (an internal import of 'react-reconciler/constants' missing its .js
// extension) that breaks under strict Node ESM resolution - it fails to
// even collect under Vitest. Plain pixi.js in a ref'd div (the design
// doc's documented escape hatch) sidesteps the dependency entirely and is
// simpler for ~10 sprites anyway.

// Grid matches the backend's real bridge layout (backend/database.py /
// spaceship_service.py: 24x16, stations at the coordinates below). The
// tilemap below is a visual skin over that same coordinate space - no
// backend movement changes required (design.md D1).
const GRID_WIDTH = 24;
const GRID_HEIGHT = 16;
const CELL = 34;
const STAGE_WIDTH = GRID_WIDTH * CELL;
const STAGE_HEIGHT = GRID_HEIGHT * CELL;

const AGENT_COLORS = [0xff6b6b, 0x4ecdc4, 0xffe66d, 0x9b5de5, 0x00bbf9, 0xf15bb5];

function agentColor(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return AGENT_COLORS[hash % AGENT_COLORS.length];
}

// Character canon colors (characters/nova.md, chen.md, torres.md): Nova is
// command-red presence, Chen is science-blue precision, Torres is
// ops-gold pragmatism. Unknown/extra agent ids fall back to the hashed
// palette above so the scene never breaks if the roster grows.
const CHARACTER_COLORS: Record<string, number> = {
  red_agent: 0xff4d4d, // Nova
  blue_agent: 0x4da6ff, // Chen
  yellow_agent: 0xffcc33, // Torres
};

function characterColor(id: string): number {
  return CHARACTER_COLORS[id] ?? agentColor(id);
}

type Direction = 'down' | 'up' | 'left' | 'right';
type WalkFrame = 'idle' | 'walkA' | 'walkB';
type CharacterTextures = Record<Direction, Record<WalkFrame, Texture>>;

const SPRITE_W = 16;
const SPRITE_H = 24;
const DIRECTIONS: Direction[] = ['down', 'up', 'left', 'right'];
const WALK_FRAMES: WalkFrame[] = ['idle', 'walkA', 'walkB'];

// Minimal original pixel sprites, generated procedurally (16x24, 3 frames
// x 4 directions) rather than adapted from ai-town: cloning + relicensing
// the ai-town asset pack was out of scope for this pass per design.md D2's
// documented fallback ("colored-circle sprites with the same animation
// hooks... choreography code is asset-agnostic"). These go one step
// further than a circle - a recognizable little pixel body with a
// direction-facing visor and an alternating walk-cycle leg frame - while
// keeping the same animation hooks the real asset pipeline would use.
function buildCharacterTextures(app: Application, primary: number): CharacterTextures {
  const shade = (color: number, factor: number) => {
    const r = Math.max(0, Math.min(255, Math.round(((color >> 16) & 0xff) * factor)));
    const g = Math.max(0, Math.min(255, Math.round(((color >> 8) & 0xff) * factor)));
    const b = Math.max(0, Math.min(255, Math.round((color & 0xff) * factor)));
    return (r << 16) | (g << 8) | b;
  };
  const dark = shade(primary, 0.6);
  const skin = 0xf1c27d;

  const result = {} as CharacterTextures;
  for (const dir of DIRECTIONS) {
    result[dir] = {} as Record<WalkFrame, Texture>;
    for (const frame of WALK_FRAMES) {
      const g = new Graphics();

      // Torso.
      g.roundRect(3, 8, 10, 12, 2).fill({ color: primary });
      // Head.
      g.circle(SPRITE_W / 2, 6, 5).fill({ color: skin });
      // Visor/face notch shows facing direction.
      if (dir === 'down') g.rect(SPRITE_W / 2 - 3, 7, 6, 2).fill({ color: dark });
      else if (dir === 'up') g.rect(SPRITE_W / 2 - 4, 2, 8, 3).fill({ color: dark });
      else if (dir === 'left') g.rect(SPRITE_W / 2 - 5, 4, 3, 4).fill({ color: dark });
      else g.rect(SPRITE_W / 2 + 2, 4, 3, 4).fill({ color: dark });

      // Legs - alternate offset per walk frame; idle frame keeps them even.
      const legOffset = frame === 'walkA' ? 2 : frame === 'walkB' ? -2 : 0;
      g.rect(4, 20, 3, 4 + legOffset).fill({ color: dark });
      g.rect(9, 20, 3, 4 - legOffset).fill({ color: dark });

      result[dir][frame] = app.renderer.generateTexture(g);
      g.destroy();
    }
  }
  return result;
}

// The player's own avatar (Drew's mindship: the player is the captain the
// crew serves). Client-side only - lives in bridgeStore.playerPosition,
// no backend entity. Deliberately not a department color: a captain's
// coat + gold trim/cap, distinct silhouette from the crew's flat jumpsuit
// palette (see characters/player.md).
const PLAYER_ID = '__player__';

function buildPlayerTextures(app: Application, tint?: { coat: number; trim: number }): CharacterTextures {
  const coat = tint?.coat ?? 0x2c3e50;
  const trim = tint?.trim ?? 0xf6c945;
  const skin = 0xf1c27d;
  const dark = 0x1c2733;

  const result = {} as CharacterTextures;
  for (const dir of DIRECTIONS) {
    result[dir] = {} as Record<WalkFrame, Texture>;
    for (const frame of WALK_FRAMES) {
      const g = new Graphics();

      // Coat - a longer silhouette than the crew's jumpsuits.
      g.roundRect(2, 7, 12, 14, 3).fill({ color: coat });
      // Gold trim band, constant regardless of facing - a rank marker, not a walk frame.
      g.rect(2, 12, 12, 2).fill({ color: trim });
      // Head + captain's cap brim.
      g.circle(SPRITE_W / 2, 6, 5).fill({ color: skin });
      g.roundRect(SPRITE_W / 2 - 5, 1, 10, 4, 2).fill({ color: coat });
      g.rect(SPRITE_W / 2 - 5, 4, 10, 1).fill({ color: trim });

      // Facing notch on the cap brim.
      if (dir === 'down') g.rect(SPRITE_W / 2 - 2, 5, 4, 1).fill({ color: dark });
      else if (dir === 'up') g.rect(SPRITE_W / 2 - 3, 1, 6, 1).fill({ color: dark });
      else if (dir === 'left') g.rect(SPRITE_W / 2 - 5, 3, 2, 2).fill({ color: dark });
      else g.rect(SPRITE_W / 2 + 3, 3, 2, 2).fill({ color: dark });

      const legOffset = frame === 'walkA' ? 2 : frame === 'walkB' ? -2 : 0;
      g.rect(4, 20, 3, 4 + legOffset).fill({ color: dark });
      g.rect(9, 20, 3, 4 - legOffset).fill({ color: dark });

      result[dir][frame] = app.renderer.generateTexture(g);
      g.destroy();
    }
  }
  return result;
}

// Ship interior tilemap: rooms mapped onto the existing backend station
// grid (design.md D1 - "rooms are stations, stations are tool surfaces").
// Coordinates for command/science/engineering match the real station
// positions from backend/database.py so the room a character stands in
// always matches the console they're actually using. Comms nook and vault
// are decorative rooms (no backend station yet) reserved for the eventkit
// and filesystem MCP namespaces per design.md D1.
interface Room {
  id: string;
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
  floor: number;
  wall: number;
}

const ROOMS: Room[] = [
  { id: 'command', label: 'COMMAND CENTER', x: 10, y: 6, w: 4, h: 3, floor: 0x2a2410, wall: 0xffd700 },
  { id: 'science', label: 'SCIENCE LAB', x: 18, y: 4, w: 3, h: 2, floor: 0x0f2233, wall: 0x4a90e2 },
  { id: 'ops', label: 'OPS BAY', x: 3, y: 10, w: 3, h: 2, floor: 0x2e1a0d, wall: 0xff6b35 },
  { id: 'comms', label: 'COMMS NOOK', x: 1, y: 1, w: 5, h: 3, floor: 0x1a2a1f, wall: 0x2ecc71 },
  { id: 'vault', label: 'VAULT', x: 19, y: 10, w: 4, h: 4, floor: 0x241a2e, wall: 0x9b5de5 },
];

const CORRIDOR_Y = 8;

function drawTilemap(g: Graphics) {
  // Base hull floor.
  g.rect(0, 0, STAGE_WIDTH, STAGE_HEIGHT).fill({ color: 0x0a0d16 });

  // Main corridor (matches backend's seeded corridor at y=8).
  g.rect(CELL, CORRIDOR_Y * CELL, (GRID_WIDTH - 2) * CELL, CELL * 2).fill({ color: 0x141a28 });

  for (const room of ROOMS) {
    const px = room.x * CELL;
    const py = room.y * CELL;
    const pw = room.w * CELL;
    const ph = room.h * CELL;

    g.rect(px, py, pw, ph).fill({ color: room.floor });
    g.rect(px, py, pw, ph).stroke({ width: 2, color: room.wall, alpha: 0.9 });

    // Console block - a simple tile suggesting the station/console furniture.
    const consoleSize = Math.min(pw, ph) * 0.35;
    g.rect(px + pw / 2 - consoleSize / 2, py + ph / 2 - consoleSize / 2, consoleSize, consoleSize)
      .fill({ color: room.wall, alpha: 0.55 });
  }

  // Outer hull border.
  g.rect(1, 1, STAGE_WIDTH - 2, STAGE_HEIGHT - 2).stroke({ width: 2, color: 0x334155 });
}

// A tile is unwalkable only where a room's console block sits (mirrors
// the backend's own station-blocks-movement rule in spaceship_service.py,
// applied here client-side for the player's click-to-move).
function isWalkableTile(x: number, y: number): boolean {
  if (x < 0 || y < 0 || x >= GRID_WIDTH || y >= GRID_HEIGHT) return false;
  for (const room of ROOMS) {
    const consoleSize = Math.min(room.w, room.h) * 0.35;
    const cx0 = room.x + room.w / 2 - consoleSize / 2;
    const cy0 = room.y + room.h / 2 - consoleSize / 2;
    if (x >= cx0 && x < cx0 + consoleSize && y >= cy0 && y < cy0 + consoleSize) return false;
  }
  return true;
}

const PLAYER_SPEED_CELLS_PER_SEC = 5;

// D3 activity choreography (design.md D3 / tasks.md 2.2): map
// agent_activity / tool_activity / chat_message onto scene responses.
const THOUGHT_GLYPH = '\u{1F4AD}'; // 💭
const SPEECH_GLYPH = '\u{1F4AC}'; // 💬
const TOOL_PULSE_TTL_MS = 8000; // TEMP-VERIFY-BUMP
const SPEECH_BUBBLE_TTL_MS = 5000;
const SPEECH_BUBBLE_FADE_MS = 900;

// MCP tool namespace -> the room whose console pulses (design.md D1: rooms
// are stations, stations are tool surfaces).
const SERVER_ROOM: Record<string, string> = {
  eventkit: 'comms',
  filesystem: 'vault',
};

interface BridgeStageProps {
  // Recolors the captain's coat/trim per the creation overlay's palette
  // choice (tasks.md 6.1). Undefined keeps the default gold captain.
  playerTint?: { coat: number; trim: number };
}

const BridgeStage: React.FC<BridgeStageProps> = ({ playerTint }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  // Select the stable `agents` array reference (it only changes identity
  // when the store actually replaces it) and derive ids locally - mapping
  // inside the selector itself would return a fresh array on every call
  // and break useSyncExternalStore's snapshot caching (infinite loop).
  const agents = useBridgeStore((state) => state.bridgeState?.agents);
  const agentIds = useMemo(() => agents?.map((a) => a.id) ?? [], [agents]);

  useEffect(() => {
    const host = containerRef.current;
    if (!host) return;

    let destroyed = false;
    const app = new Application();
    const sprites = new Map<string, Sprite>();
    const textures = new Map<string, CharacterTextures>();
    // D3 choreography display objects, keyed by agent id (player excluded -
    // it has no backend activity feed).
    const glyphLabels = new Map<string, Text>();
    const bubbleLabels = new Map<string, Text>();
    const bubbleBgs = new Map<string, Graphics>();
    // Per-agent animation state, derived from tick-to-tick position deltas
    // (the store snaps straight to the latest WS-reported position - see
    // bridgeStore.applyMovementIntent - so "moving" here means "position
    // changed recently", not an interpolated tween).
    const animState = new Map<
      string,
      { facing: Direction; lastPos: { x: number; y: number }; lastMoveAt: number }
    >();

    app
      .init({
        width: STAGE_WIDTH,
        height: STAGE_HEIGHT,
        background: 0x05070d,
        antialias: true,
      })
      .then(() => {
        if (destroyed) {
          app.destroy(true, { children: true });
          return;
        }
        host.appendChild(app.canvas);

        const stage = new Container();
        app.stage.addChild(stage);

        const tilemap = new Graphics();
        drawTilemap(tilemap);
        stage.addChild(tilemap);

        // Click-to-move for the player avatar: click a walkable tile, the
        // captain paths there (straight-line lerp, same feel as the crew's
        // movement). Hit area covers the full stage so clicks land
        // anywhere, including over room floors and the corridor.
        tilemap.eventMode = 'static';
        tilemap.hitArea = new Rectangle(0, 0, STAGE_WIDTH, STAGE_HEIGHT);
        tilemap.on('pointertap', (event) => {
          const gridX = Math.floor(event.global.x / CELL);
          const gridY = Math.floor(event.global.y / CELL);
          if (isWalkableTile(gridX, gridY)) {
            useBridgeStore.getState().setPlayerTarget({ x: gridX, y: gridY });
          }
        });

        // Room name plates - legible beats beautiful (design.md non-goal:
        // pixel-perfect art).
        for (const room of ROOMS) {
          const label = new Text({
            text: room.label,
            style: { fontFamily: 'monospace', fontSize: 9, fill: room.wall, letterSpacing: 1 },
          });
          label.x = room.x * CELL + 4;
          label.y = room.y * CELL + 3;
          stage.addChild(label);
        }

        // Console glow per room, driven by tool_activity pulses. Drawn
        // white once and tinted per-frame (room color normally, red on
        // fail) rather than redrawn - tint is cheap on a Graphics view.
        const roomGlows = new Map<string, Graphics>();
        for (const room of ROOMS) {
          const glow = new Graphics();
          glow.rect(room.x * CELL, room.y * CELL, room.w * CELL, room.h * CELL).fill({ color: 0xffffff });
          glow.tint = room.wall;
          glow.alpha = 0;
          stage.addChild(glow);
          roomGlows.set(room.id, glow);
        }

        const initialPositions = useBridgeStore.getState().agentPositions;
        for (const id of agentIds) {
          const charTextures = buildCharacterTextures(app, characterColor(id));
          textures.set(id, charTextures);

          const sprite = new Sprite(charTextures.down.idle);
          sprite.anchor.set(0.5, 0.75);
          stage.addChild(sprite);
          sprites.set(id, sprite);

          const start = initialPositions[id] ?? { x: 0, y: 0 };
          animState.set(id, { facing: 'down', lastPos: { ...start }, lastMoveAt: 0 });

          // Thought/speech glyph - small, pulsing, hovers above the head.
          const glyph = new Text({
            text: '',
            style: { fontFamily: 'monospace', fontSize: 14 },
          });
          glyph.anchor.set(0.5, 1);
          glyph.visible = false;
          stage.addChild(glyph);
          glyphLabels.set(id, glyph);

          // Speech bubble excerpt (chat_message reply) - background drawn
          // fresh each frame it's active, sized to the text; simpler than
          // a DOM-positioned label since we're already in the Pixi stage.
          const bubbleBg = new Graphics();
          bubbleBg.visible = false;
          stage.addChild(bubbleBg);
          bubbleBgs.set(id, bubbleBg);

          const bubble = new Text({
            text: '',
            style: {
              fontFamily: 'monospace',
              fontSize: 10,
              fill: 0xe6edf3,
              wordWrap: true,
              wordWrapWidth: 150,
              align: 'left',
            },
          });
          bubble.anchor.set(0.5, 1);
          bubble.visible = false;
          stage.addChild(bubble);
          bubbleLabels.set(id, bubble);
        }

        // Player avatar - same sprite/animation machinery as the crew,
        // just with its own texture set and a store-driven position that
        // this component itself lerps (see the ticker below) instead of
        // one driven by WS updates.
        {
          const playerTextures = buildPlayerTextures(app, playerTint);
          textures.set(PLAYER_ID, playerTextures);

          const sprite = new Sprite(playerTextures.down.idle);
          sprite.anchor.set(0.5, 0.75);
          stage.addChild(sprite);
          sprites.set(PLAYER_ID, sprite);

          const start = useBridgeStore.getState().playerPosition;
          animState.set(PLAYER_ID, { facing: 'down', lastPos: { ...start }, lastMoveAt: 0 });
        }

        // Read positions straight from the store's vanilla API on every
        // Pixi tick - not the useBridgeStore() hook - so a WS position
        // update never triggers a React re-render, only this draw call
        // moves the sprite.
        app.ticker.add(() => {
          const { agentPositions, playerPosition, playerTarget } = useBridgeStore.getState();

          // Client-side straight-line lerp toward the last clicked tile -
          // the player has no backend intent to follow, so this component
          // owns the interpolation instead of just mirroring a WS position.
          let nextPlayerPosition = playerPosition;
          if (playerTarget) {
            const dx = playerTarget.x - playerPosition.x;
            const dy = playerTarget.y - playerPosition.y;
            const distance = Math.hypot(dx, dy);
            const step = PLAYER_SPEED_CELLS_PER_SEC * (app.ticker.deltaMS / 1000);
            nextPlayerPosition =
              distance <= step
                ? { x: playerTarget.x, y: playerTarget.y }
                : { x: playerPosition.x + (dx / distance) * step, y: playerPosition.y + (dy / distance) * step };
            if (nextPlayerPosition.x !== playerPosition.x || nextPlayerPosition.y !== playerPosition.y) {
              useBridgeStore.setState({ playerPosition: nextPlayerPosition });
            }
          }

          const positions: Record<string, Position> = { ...agentPositions, [PLAYER_ID]: nextPlayerPosition };
          const now = Date.now();
          sprites.forEach((sprite, id) => {
            const position = positions[id];
            const state = animState.get(id);
            const charTextures = textures.get(id);
            if (!position || !state || !charTextures) return;

            const dx = position.x - state.lastPos.x;
            const dy = position.y - state.lastPos.y;
            if (Math.abs(dx) > 0.001 || Math.abs(dy) > 0.001) {
              state.lastMoveAt = now;
              if (Math.abs(dx) >= Math.abs(dy)) {
                if (dx !== 0) state.facing = dx > 0 ? 'right' : 'left';
              } else if (dy !== 0) {
                state.facing = dy > 0 ? 'down' : 'up';
              }
              state.lastPos = { x: position.x, y: position.y };
            }

            // Recently-moved window covers the gap between discrete WS
            // position updates so the walk cycle reads as continuous
            // motion rather than a single-frame twitch per update.
            const moving = now - state.lastMoveAt < 600;
            const frame: WalkFrame = moving ? (Math.floor(now / 180) % 2 === 0 ? 'walkA' : 'walkB') : 'idle';
            sprite.texture = charTextures[state.facing][frame];

            sprite.x = position.x * CELL + CELL / 2;
            sprite.y = position.y * CELL + CELL / 2;
          });

          // Thought/speech glyphs + fading speech bubbles (design.md D3).
          const { agentActivity, speechBubbles } = useBridgeStore.getState();
          for (const id of agentIds) {
            const sprite = sprites.get(id);
            const glyph = glyphLabels.get(id);
            const bubble = bubbleLabels.get(id);
            const bubbleBg = bubbleBgs.get(id);
            if (!sprite || !glyph || !bubble || !bubbleBg) continue;

            const speech = speechBubbles[id];
            const bubbleAge = speech ? now - speech.createdAt : Infinity;
            const bubbleActive = bubbleAge < SPEECH_BUBBLE_TTL_MS;

            if (bubbleActive && speech) {
              glyph.visible = false;

              const remaining = SPEECH_BUBBLE_TTL_MS - bubbleAge;
              bubble.alpha = remaining < SPEECH_BUBBLE_FADE_MS ? remaining / SPEECH_BUBBLE_FADE_MS : 1;
              bubble.text = speech.text;
              bubble.visible = true;
              bubble.x = sprite.x;
              bubble.y = sprite.y - SPRITE_H - 16;

              bubbleBg.visible = true;
              bubbleBg.alpha = bubble.alpha;
              bubbleBg.clear();
              bubbleBg
                .roundRect(
                  bubble.x - bubble.width / 2 - 6,
                  bubble.y - bubble.height - 6,
                  bubble.width + 12,
                  bubble.height + 10,
                  4
                )
                .fill({ color: 0x0a0d16, alpha: 0.85 })
                .stroke({ width: 1, color: 0x334155, alpha: 0.9 });
            } else {
              bubble.visible = false;
              bubbleBg.visible = false;

              const activity = agentActivity[id] ?? 'idle';
              if (activity === 'idle') {
                glyph.visible = false;
              } else {
                glyph.visible = true;
                glyph.text = activity === 'thinking' ? THOUGHT_GLYPH : SPEECH_GLYPH;
                glyph.alpha = 0.55 + 0.45 * Math.sin(now / (activity === 'thinking' ? 220 : 160));
                glyph.x = sprite.x;
                glyph.y = sprite.y - SPRITE_H - 14;
              }
            }
          }

          // Console pulses: owning room's console glows on tool_activity,
          // blinking red when ok=false (design.md D3).
          const { toolPulses } = useBridgeStore.getState();
          for (const room of ROOMS) {
            const glow = roomGlows.get(room.id);
            if (!glow) continue;

            const active = toolPulses.filter(
              (p) => SERVER_ROOM[p.server] === room.id && now - p.createdAt < TOOL_PULSE_TTL_MS
            );
            if (!active.length) {
              glow.alpha = 0;
              continue;
            }

            const latest = active.reduce((a, b) => (a.createdAt > b.createdAt ? a : b));
            const life = Math.max(0, 1 - (now - latest.createdAt) / TOOL_PULSE_TTL_MS);
            if (latest.ok) {
              glow.tint = room.wall;
              glow.alpha = life * 0.6;
            } else {
              const blink = Math.floor(now / 120) % 2 === 0;
              glow.tint = 0xff3b3b;
              glow.alpha = blink ? life * 0.85 : life * 0.15;
            }
          }
        });
      });

    return () => {
      destroyed = true;
      textures.forEach((byDirection) =>
        Object.values(byDirection).forEach((byFrame) =>
          Object.values(byFrame).forEach((texture) => texture.destroy(true))
        )
      );
      if (app.renderer) app.destroy(true, { children: true });
    };
    // Depend on "roster known yet?" (not agentIds itself, and not the
    // agents array): on a cold load the WS initial_state round-trip lands
    // after this effect's first commit, so agentIds is empty at mount and
    // the crew never got sprites - the only WS-driven avatar was the
    // player. This boolean flips at most once (empty -> populated), so it
    // rebuilds the Pixi app once when the roster arrives instead of on
    // every per-tick position update (agentIds/agents would both change
    // identity on every movement broadcast - see agentPositions above).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agentIds.length > 0]);

  return (
    <div
      ref={containerRef}
      style={{ width: STAGE_WIDTH, height: STAGE_HEIGHT, background: '#05070d', borderRadius: 8 }}
    />
  );
};

export default BridgeStage;
