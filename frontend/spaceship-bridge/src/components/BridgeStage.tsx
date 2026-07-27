import React, { useEffect, useMemo, useRef } from 'react';
import { Application, Container, Graphics, Text } from 'pixi.js';
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
    const sprites = new Map<string, Graphics>();

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

        for (const id of agentIds) {
          const g = new Graphics().circle(0, 0, 16).fill({ color: agentColor(id) });
          stage.addChild(g);
          sprites.set(id, g);
        }

        // Read positions straight from the store's vanilla API on every
        // Pixi tick - not the useBridgeStore() hook - so a WS position
        // update never triggers a React re-render, only this draw call
        // moves the sprite.
        app.ticker.add(() => {
          const { agentPositions } = useBridgeStore.getState();
          sprites.forEach((g, id) => {
            const position = agentPositions[id];
            if (!position) return;
            g.x = position.x * CELL + CELL / 2;
            g.y = position.y * CELL + CELL / 2;
          });
        });
      });

    return () => {
      destroyed = true;
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
