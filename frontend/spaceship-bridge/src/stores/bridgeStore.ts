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
  setConnectionStatus: (status: ConnectionStatus) => void;
  setInitialState: (state: BridgeState) => void;
  applyMovementIntent: (agentId: string, targetPosition: Position, activityHint?: string) => void;
  setPlayerTarget: (target: Position) => void;
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

  setPlayerTarget: (target) => set({ playerTarget: target }),

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
