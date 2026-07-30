import React from 'react';
import { Agent } from '../agents/types';

// Purged of fabricated micro-metrics (openspec make-bridge-scene-first task
// 1.2, design.md D6 "a number renders only if it traces to a real source").
// Dropped: avg_efficiency/error_rate (derived from Agent.status.efficiency,
// which upstream was Math.random()-mocked), response_time/memory_usage
// (fully synthetic in useSystemMetrics), and the celebration banner (fired
// off those fake numbers). What's left is real-signal only: WS status,
// agent count/state from the live bridge store. This view is unrouted
// after the task 1.1 shell inversion - kept compiling for the ops overlay
// (tasks.md 4.3) to mine real tiles from later.
interface SystemHealth {
  websocket: 'connected' | 'connecting' | 'disconnected';
  active_agents: number;
}

interface AccessViewProps {
  agents: Agent[];
  systemHealth: SystemHealth;
  onAgentInteraction?: (agentId: string, action: string) => void;
}

const AccessView: React.FC<AccessViewProps> = ({ agents = [], systemHealth, onAgentInteraction }) => {
  const getHealthStatus = (status: string): { color: string; icon: string } => {
    switch (status) {
      case 'connected':
        return { color: '#10b981', icon: '●' };
      case 'connecting':
        return { color: '#f59e0b', icon: '◐' };
      default:
        return { color: '#ef4444', icon: '○' };
    }
  };

  return (
    <div
      style={{
        padding: '20px',
        backgroundColor: '#0f172a',
        color: '#e2e8f0',
        minHeight: '100vh',
        fontFamily: 'monospace',
      }}
    >
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '10px', color: '#38bdf8' }}>
          Access: System Status
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '14px' }}>Real-time signals only - no fleet fiction.</p>
      </div>

      {/* System Health Panel - real signals only */}
      <div
        style={{
          backgroundColor: '#1e293b',
          border: '1px solid #334155',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '20px',
        }}
      >
        <h3 style={{ marginBottom: '16px', color: '#38bdf8' }}>System Health</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
          {[
            { label: 'WebSocket', value: systemHealth.websocket },
            { label: 'Active Agents', value: systemHealth.active_agents.toString() },
          ].map((item, idx) => {
            const health = getHealthStatus(item.value);
            return (
              <div
                key={idx}
                style={{ backgroundColor: '#0f172a', padding: '12px', borderRadius: '6px', border: '1px solid #334155' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ color: health.color, fontSize: '12px' }}>{health.icon}</span>
                  <span style={{ fontSize: '12px', color: '#94a3b8' }}>{item.label}</span>
                </div>
                <div style={{ fontSize: '14px', fontWeight: 'bold', color: health.color, textTransform: 'uppercase' }}>
                  {item.value}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Agent Status - real state only, no fabricated efficiency % */}
      <div style={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '16px' }}>
        <h3 style={{ marginBottom: '16px', color: '#38bdf8' }}>Agent Status</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '8px' }}>
          {agents.map((agent) => (
            <div
              key={agent.id}
              onClick={() => onAgentInteraction?.(agent.id, 'inspect')}
              style={{
                backgroundColor: '#0f172a',
                border: '1px solid #374151',
                borderRadius: '6px',
                padding: '8px',
                cursor: 'pointer',
              }}
            >
              <div style={{ fontSize: '10px', color: '#94a3b8', marginBottom: '4px' }}>{agent.name}</div>
              <div
                style={{
                  fontSize: '10px',
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                  color:
                    agent.status.state === 'error' ? '#ef4444' : agent.status.state === 'offline' ? '#6b7280' : '#10b981',
                }}
              >
                {agent.status.state}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AccessView;
