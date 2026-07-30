import { create } from 'zustand';

export interface Position {
  x: number;
  y: number;
}

export interface Dimensions {
  width: number;
  height: number;
}

export interface BridgeAgent {
  id: string;
  name: string;
  position: Position;
  status: string;
  avatar: string;
}

export interface Station {
  id: string;
  name: string;
  position: Position;
  dimensions: Dimensions;
  icon: string;
  color: string;
}

export interface BridgeState {
  bridge_id: string;
  status: string;
  agents: BridgeAgent[];
  stations: Station[];
  layout: {
    width: number;
    height: number;
  };
}

export type ConnectionStatus = 'Disconnected' | 'Connecting' | 'Connected' | 'Reconnecting';

// D3 activity choreography (openspec/changes/make-bridge-scene-first):
// `agent_activity` and `tool_activity` are new WS event types the backend
// broadcasts alongside the existing `agent_movement_intent`/`chat_message`.
export type AgentActivityState = 'thinking' | 'responding' | 'idle';

// A short-lived record of one tool call, used to drive a console glow in
// BridgeStage. Kept in the store (not component state) so the dev
// simulation hook and the real WS path share one code path.
export interface ToolPulse {
  id: string;
  tool: string;
  server: string;
  ok: boolean;
  createdAt: number;
}

export interface SpeechBubble {
  text: string;
  createdAt: number;
}

// Pulses older than this are pruned on the next push - bounds the array
// without needing a separate ticker-driven cleanup.
const TOOL_PULSE_PRUNE_MS = 5000;

interface BridgeStore {
  connectionStatus: ConnectionStatus;
  bridgeState: BridgeState | null;
  // Latest known position per agent, updated on every WS tick. Read this
  // directly via `useBridgeStore.getState().agentPositions` (e.g. from a
  // Pixi ticker) for per-frame interpolation without subscribing React to
  // every position tick - see bridgeStore.getState() usage note below.
  agentPositions: Record<string, Position>;
  // The player's own avatar - client-side only, no backend entity. Spawns
  // at the command center (this is the captain's ship; the crew organizes
  // *their* day). `playerPosition` is the continuously-interpolated float
  // position the Pixi ticker lerps toward `playerTarget` each frame -
  // mirrors the crew's agentPositions shape so BridgeStage can render both
  // the same way.
  playerPosition: Position;
  playerTarget: Position | null;
  // D3 choreography state - read directly via getState() from the Pixi
  // ticker, same pattern as agentPositions above.
  agentActivity: Record<string, AgentActivityState>;
  toolPulses: ToolPulse[];
  speechBubbles: Record<string, SpeechBubble>;
  setConnectionStatus: (status: ConnectionStatus) => void;
  setInitialState: (state: BridgeState) => void;
  applyMovementIntent: (agentId: string, targetPosition: Position, activityHint?: string) => void;
  setPlayerTarget: (target: Position) => void;
  setAgentActivity: (agentId: string, state: AgentActivityState) => void;
  pushToolPulse: (tool: string, server: string, ok: boolean) => void;
  setSpeechBubble: (agentId: string, text: string) => void;
}

// Command center is at (10,6) 4x3 (backend/database.py) - spawn the player
// just inside its near corner, clear of the console block at its center.
const PLAYER_HOME: Position = { x: 10, y: 6 };

export const useBridgeStore = create<BridgeStore>((set) => ({
  connectionStatus: 'Disconnected',
  bridgeState: null,
  agentPositions: {},
  playerPosition: { ...PLAYER_HOME },
  playerTarget: null,
  agentActivity: {},
  toolPulses: [],
  speechBubbles: {},

  setPlayerTarget: (target) => set({ playerTarget: target }),

  setAgentActivity: (agentId, state) =>
    set((prev) => ({ agentActivity: { ...prev.agentActivity, [agentId]: state } })),

  pushToolPulse: (tool, server, ok) =>
    set((prev) => {
      const now = Date.now();
      const fresh = prev.toolPulses.filter((p) => now - p.createdAt < TOOL_PULSE_PRUNE_MS);
      return {
        toolPulses: [...fresh, { id: `${now}-${Math.random().toString(36).slice(2, 8)}`, tool, server, ok, createdAt: now }],
      };
    }),

  setSpeechBubble: (agentId, text) =>
    set((prev) => ({
      speechBubbles: { ...prev.speechBubbles, [agentId]: { text: text.slice(0, 60), createdAt: Date.now() } },
    })),

  setConnectionStatus: (status) => set({ connectionStatus: status }),

  setInitialState: (state) =>
    set({
      bridgeState: state,
      agentPositions: Object.fromEntries(state.agents.map((a) => [a.id, a.position])),
    }),

  applyMovementIntent: (agentId, targetPosition, activityHint) =>
    set((prev) => {
      // Always keep the transient position map current, even if we haven't
      // received an initial_state yet.
      const agentPositions = { ...prev.agentPositions, [agentId]: targetPosition };

      if (!prev.bridgeState) {
        return { agentPositions };
      }

      const agents = prev.bridgeState.agents.map((agent) =>
        agent.id === agentId
          ? { ...agent, position: targetPosition, status: activityHint || 'moving' }
          : agent
      );

      return { agentPositions, bridgeState: { ...prev.bridgeState, agents } };
    }),
}));

// Wire schema (design.md D3 / tasks.md 2.1, built ahead of the live
// backend broadcasts):
//   {"type":"agent_activity","data":{"agent_id":..., "state":"thinking"|"responding"|"idle"}}
//   {"type":"tool_activity","data":{"tool":..., "server":..., "ok":bool}}
//   {"type":"chat_message","data":{"from":agent_id, "to":..., "message":str, ...}}
// (chat_message already exists on the wire - see backend/services/websocket_manager.py
// broadcast_chat_message - but was previously unhandled here.)
//
// Shared by the real WS path and the dev simulation hook below so both
// stay in sync with exactly one place that knows the wire shape.
type IncomingActivityMessage =
  | { type: 'agent_activity'; data: { agent_id: string; state: AgentActivityState } }
  | { type: 'tool_activity'; data: { tool: string; server: string; ok: boolean } }
  | { type: 'chat_message'; data: { from?: string; message?: string } };

function applyActivityMessage(message: IncomingActivityMessage): boolean {
  const { setAgentActivity, pushToolPulse, setSpeechBubble } = useBridgeStore.getState();

  if (message.type === 'agent_activity') {
    setAgentActivity(message.data.agent_id, message.data.state);
    return true;
  }
  if (message.type === 'tool_activity') {
    pushToolPulse(message.data.tool, message.data.server, message.data.ok);
    return true;
  }
  if (message.type === 'chat_message') {
    if (message.data.from) setSpeechBubble(message.data.from, message.data.message ?? '');
    return true;
  }
  return false;
}

// Dev-only escape hatch to exercise the scene choreography before the
// backend events (tasks.md 2.1) are live: from the browser console,
//   window.__simulateActivity('agent_activity', { agent_id: 'red_agent', state: 'thinking' })
//   window.__simulateActivity('tool_activity', { tool: 'eventkit_list_todays_events', server: 'eventkit', ok: true })
//   window.__simulateActivity('chat_message', { from: 'red_agent', message: 'Course plotted, captain.' })
declare global {
  interface Window {
    __simulateActivity?: (type: IncomingActivityMessage['type'], data: unknown) => void;
  }
}

if (typeof window !== 'undefined') {
  window.__simulateActivity = (type, data) => {
    applyActivityMessage({ type, data } as IncomingActivityMessage);
  };
  // debug-only: temporary state inspector for choreography verification, remove before commit
  (window as any).__bridgeStoreDebug = () => useBridgeStore.getState();
}

/**
 * Owns the single WebSocket connection for the bridge and feeds updates
 * into useBridgeStore. Call once (e.g. from App's top-level effect).
 * Returns a cleanup function to close the socket and cancel reconnects.
 */
export function connectBridgeWebSocket(wsUrl: string): () => void {
  const { setConnectionStatus, setInitialState, applyMovementIntent } = useBridgeStore.getState();

  let ws: WebSocket | null = null;
  let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  let mounted = true;

  const connect = () => {
    if (!mounted || ws) return;

    setConnectionStatus('Connecting');
    ws = new WebSocket(`${wsUrl}/ws`);

    ws.onopen = () => {
      if (!mounted) return;
      setConnectionStatus('Connected');
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
        reconnectTimeout = null;
      }
    };

    ws.onmessage = (event) => {
      if (!mounted) return;

      const message = JSON.parse(event.data);

      if (message.type === 'initial_state') {
        setInitialState(message.data);
      } else if (message.type === 'agent_movement_intent') {
        applyMovementIntent(
          message.data.agent_id,
          message.data.target_position,
          message.data.activity_hint
        );
      } else {
        applyActivityMessage(message);
      }
    };

    ws.onclose = () => {
      ws = null;
      if (!mounted) return;
      setConnectionStatus('Disconnected');
      reconnectTimeout = setTimeout(() => {
        if (mounted) connect();
      }, 2000);
    };

    ws.onerror = () => {
      if (!mounted) return;
      setConnectionStatus('Reconnecting');
    };
  };

  connect();

  return () => {
    mounted = false;
    if (reconnectTimeout) clearTimeout(reconnectTimeout);
    if (ws) {
      ws.close();
      ws = null;
    }
  };
}
