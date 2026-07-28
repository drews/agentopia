import React, { useEffect, useMemo, useRef } from 'react';
import { Application, Container, Graphics, Sprite, Text, Texture } from 'pixi.js';
import { useBridgeStore } from '../stores/bridgeStore';

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

const BridgeStage: React.FC = () => {
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
        }

        // Read positions straight from the store's vanilla API on every
        // Pixi tick - not the useBridgeStore() hook - so a WS position
        // update never triggers a React re-render, only this draw call
        // moves the sprite.
        app.ticker.add(() => {
          const { agentPositions } = useBridgeStore.getState();
          const now = Date.now();
          sprites.forEach((sprite, id) => {
            const position = agentPositions[id];
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
    // agentIds intentionally not a dep: sprite set is built once from the
    // ids known at mount. Rebuilding the whole Pixi app on every roster
    // change is unnecessary for this view.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={containerRef}
      style={{ width: STAGE_WIDTH, height: STAGE_HEIGHT, background: '#05070d', borderRadius: 8 }}
    />
  );
};

export default BridgeStage;
