import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, test, expect, beforeEach, vi } from 'vitest';

// jsdom has no real <canvas> 2D/WebGL context, so pixi.js's Application.init
// throws deep inside its renderer setup once BridgeStage always mounts
// (previously it only mounted behind a toggled-off "STAGE VIEW" button).
// This is a test-environment gap, not a BridgeStage bug - stub the pixi.js
// surface BridgeStage touches so App can render in these unit tests.
vi.mock('pixi.js', () => {
  class Application {
    canvas = document.createElement('canvas');
    renderer = { generateTexture: () => ({ destroy: () => {} }) };
    ticker = { add: () => {}, deltaMS: 16 };
    stage = { addChild: () => {} };
    async init() {
      return this;
    }
    destroy() {}
  }
  class Container {
    addChild() {}
  }
  class Graphics {
    rect() {
      return this;
    }
    roundRect() {
      return this;
    }
    circle() {
      return this;
    }
    fill() {
      return this;
    }
    stroke() {
      return this;
    }
    clear() {
      return this;
    }
    destroy() {}
    on() {
      return this;
    }
  }
  class Sprite {
    anchor = { set: () => {} };
    visible = true;
    alpha = 1;
    x = 0;
    y = 0;
    texture: unknown = null;
    constructor() {}
  }
  class Text {
    anchor = { set: () => {} };
    visible = true;
    alpha = 1;
    x = 0;
    y = 0;
    text = '';
    width = 0;
    height = 0;
  }
  class Texture {
    destroy() {}
  }
  class Rectangle {}
  return { Application, Container, Graphics, Rectangle, Sprite, Text, Texture };
});

import App from './App';

// jsdom's real localStorage is shadowed by Node's own experimental global
// localStorage in this test runtime (no .clear/.setItem without a
// --localstorage-file backing store) - swap in a minimal in-memory mock so
// window.localStorage behaves like a browser's for these tests.
function installMemoryLocalStorage() {
  let store: Record<string, string> = {};
  Object.defineProperty(window, 'localStorage', {
    configurable: true,
    value: {
      getItem: (key: string) => store[key] ?? null,
      setItem: (key: string, value: string) => {
        store[key] = value;
      },
      removeItem: (key: string) => {
        delete store[key];
      },
      clear: () => {
        store = {};
      },
    },
  });
}
installMemoryLocalStorage();

describe('App', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  test('shows the boarding creation overlay when no player profile exists', () => {
    render(<App />);
    expect(screen.getByRole('dialog', { name: /welcome aboard/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /BRIDGE/i })).not.toBeInTheDocument();
  });

  test('skips creation and boots straight into the scene when a profile is saved', () => {
    window.localStorage.setItem(
      'agentopia.player',
      JSON.stringify({
        callsign: 'Drew',
        paletteId: 'gold',
        prefs: { nudgeTiming: 'gentle', morningBriefing: true },
      })
    );
    render(<App />);
    expect(screen.queryByRole('dialog', { name: /welcome aboard/i })).not.toBeInTheDocument();
  });
});
