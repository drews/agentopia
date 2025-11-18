import React from 'react';
import Agent, { Agent as AgentType } from './Agent';

// Simplified bridge types
interface Station {
  id: string;
  name: string;
  position: { x: number; y: number };
  dimensions: { width: number; height: number };
  icon: string;
  color: string;
}

interface BridgeState {
  bridge_id: string;
  status: string;
  agents: AgentType[];
  stations: Station[];
  layout: { width: number; height: number };
}

interface BridgeProps {
  bridgeState: BridgeState;
  connectionStatus: string;
}

const Bridge: React.FC<BridgeProps> = ({ bridgeState, connectionStatus }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Header */}
      <header style={{
        background: '#1a2332',
        padding: '16px 20px',
        borderBottom: '1px solid #333',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h1 style={{ 
          color: '#e0e6ed', 
          margin: 0, 
          fontSize: '24px',
          textTransform: 'uppercase',
          letterSpacing: '1px'
        }}>
          🚀 {bridgeState.bridge_id.toUpperCase()} Bridge
        </h1>
        
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <span style={{
            color: bridgeState.status === 'operational' ? '#66FF99' : '#FFAA00',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            fontSize: '12px'
          }}>
            {bridgeState.status}
          </span>
          <span style={{
            color: connectionStatus === 'Connected' ? '#66FF99' : '#FF6666',
            fontSize: '12px',
            textTransform: 'uppercase'
          }}>
            WS: {connectionStatus}
          </span>
        </div>
      </header>

      <main style={{ 
        flex: 1, 
        display: 'flex', 
        background: '#0a0f1a',
        overflow: 'hidden'
      }}>
        {/* Bridge Grid */}
        <div style={{ 
          flex: 1, 
          padding: '20px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${bridgeState.layout.width}, 60px)`,
              gridTemplateRows: `repeat(${bridgeState.layout.height}, 60px)`,
              gap: '2px',
              background: 'rgba(255, 255, 255, 0.02)',
              padding: '20px',
              borderRadius: '10px',
              border: '1px solid #333',
              position: 'relative'
            }}
          >
            {/* Render stations */}
            {bridgeState.stations.map(station => (
              <div
                key={station.id}
                style={{
                  gridColumnStart: station.position.x + 1,
                  gridColumnEnd: station.position.x + station.dimensions.width + 1,
                  gridRowStart: station.position.y + 1,
                  gridRowEnd: station.position.y + station.dimensions.height + 1,
                  backgroundColor: station.color,
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                  color: '#000',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  border: '2px solid rgba(255,255,255,0.3)'
                }}
              >
                <span style={{ fontSize: '16px', marginBottom: '2px' }}>{station.icon}</span>
                <span style={{ fontSize: '8px' }}>{station.name}</span>
              </div>
            ))}
            
            {/* Render agents */}
            {bridgeState.agents.map(agent => (
              <div
                key={agent.id}
                style={{
                  gridColumn: agent.position.x + 1,
                  gridRow: agent.position.y + 1,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
              >
                <Agent 
                  agent={agent} 
                  size={{ width: 54, height: 54 }}
                  theme="lcars"
                  interactive={false}
                />
              </div>
            ))}
          </div>
        </div>
        
        {/* Sidebar */}
        <aside style={{
          width: '300px',
          background: '#1a2332',
          padding: '20px',
          borderLeft: '1px solid #333',
          overflow: 'auto'
        }}>
          {/* Crew Status Panel */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '20px',
            border: '1px solid #333'
          }}>
            <h3 style={{ 
              color: '#FF9933', 
              margin: '0 0 12px 0',
              fontSize: '14px',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}>
              Crew Status
            </h3>
            {bridgeState.agents.map(agent => (
              <div key={agent.id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 0',
                borderBottom: '1px solid rgba(255,255,255,0.1)'
              }}>
                <span style={{ 
                  color: '#e0e6ed',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}>
                  {agent.name}
                </span>
                <span style={{
                  color: agent.status.state === 'error' ? '#FF6666' : 
                        agent.status.state === 'working' ? '#66FF99' :
                        agent.status.state === 'thinking' ? '#FFAA00' : '#CCCCCC',
                  fontSize: '10px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  {agent.status.state}
                </span>
              </div>
            ))}
          </div>
          
          {/* Systems Panel */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '8px',
            padding: '16px',
            border: '1px solid #333'
          }}>
            <h3 style={{ 
              color: '#3366CC', 
              margin: '0 0 12px 0',
              fontSize: '14px',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}>
              Bridge Systems
            </h3>
            {bridgeState.stations.map(station => (
              <div key={station.id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 0',
                borderBottom: '1px solid rgba(255,255,255,0.1)'
              }}>
                <span style={{ 
                  color: '#e0e6ed',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}>
                  {station.icon} {station.name}
                </span>
                <span style={{
                  color: '#66FF99',
                  fontSize: '10px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  ONLINE
                </span>
              </div>
            ))}
          </div>
        </aside>
      </main>
    </div>
  );
};

export default Bridge;