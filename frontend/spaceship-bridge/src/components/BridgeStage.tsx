import React, { useEffect, useMemo, useRef } from 'react';
import { Application, Container, Graphics } from 'pixi.js';
import { useBridgeStore } from '../stores/bridgeStore';

// Deviation from the OpenSpec design doc: @pixi/react 8.0.5 has a packaging
// bug (an internal import of 'react-reconciler/constants' missing its .js
// extension) that breaks under strict Node ESM resolution - it fails to
// even collect under Vitest. Plain pixi.js in a ref'd div (the design
// doc's documented escape hatch) sidesteps the dependency entirely and is
// simpler for ~10 sprites anyway.

const STAGE_WIDTH = 900;
const STAGE_HEIGHT = 500;
const CELL = 60;
const AGENT_COLORS = [0xff6b6b, 0x4ecdc4, 0xffe66d, 0x9b5de5, 0x00bbf9, 0xf15bb5];

function agentColor(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return AGENT_COLORS[hash % AGENT_COLORS.length];
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
            g.x = position.x * CELL + CELL;
            g.y = position.y * CELL + CELL;
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
