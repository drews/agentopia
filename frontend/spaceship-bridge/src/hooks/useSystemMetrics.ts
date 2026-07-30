import { useMemo } from 'react';
import { Agent } from '../agents/types';
import { ConnectionStatus } from '../stores/bridgeStore';

// Purged of fabricated metrics (openspec make-bridge-scene-first task 1.2,
// design.md D6 "a number renders only if it traces to a real source").
// Previously generated random response_time/memory_usage/mcp_servers on a
// 2s interval; now derives only from real inputs (the bridge store's WS
// connectionStatus and the live agent roster). Currently unused (AccessView
// is unrouted after task 1.1) - kept compiling for the ops overlay
// (tasks.md 4.3) to wire up against real /api/mcp/status data.
export interface SystemHealth {
  websocket: 'connected' | 'connecting' | 'disconnected';
  active_agents: number;
}

function toWebsocketHealth(status: ConnectionStatus): SystemHealth['websocket'] {
  if (status === 'Connected') return 'connected';
  if (status === 'Connecting' || status === 'Reconnecting') return 'connecting';
  return 'disconnected';
}

export const useSystemMetrics = (connectionStatus: ConnectionStatus, agents: Agent[]) => {
  const systemHealth = useMemo<SystemHealth>(
    () => ({
      websocket: toWebsocketHealth(connectionStatus),
      active_agents: agents.filter((a) => a.status.state !== 'offline').length,
    }),
    [connectionStatus, agents]
  );

  return { systemHealth };
};
