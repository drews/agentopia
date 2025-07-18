import React, { useState, useEffect } from 'react';
import AgentShowcase from './AgentShowcase';
import CharacterShowcase from './components/CharacterShowcase';
import './App.css';

interface Position {
  x: number;
  y: number;
}

interface Dimensions {
  width: number;
  height: number;
}

interface Agent {
  id: string;
  name: string;
  position: Position;
  status: string;
  avatar: string;
}

interface Station {
  id: string;
  name: string;
  position: Position;
  dimensions: Dimensions;
  icon: string;
  color: string;
}

interface BridgeState {
  bridge_id: string;
  status: string;
  agents: Agent[];
  stations: Station[];
  layout: {
    width: number;
    height: number;
  };
}

function App() {
  const [currentView, setCurrentView] = useState<'ship' | 'roster' | 'mechanics'>('mechanics');
  const [bridgeState, setBridgeState] = useState<BridgeState | null>(null);
  const [connectionStatus, setConnectionStatus] = useState('Disconnected');

  // Get API URL from environment or default to localhost
  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';
  const wsUrl = apiUrl.replace('http', 'ws');

  useEffect(() => {
    if (currentView !== 'ship') return; // Skip bridge connection when not showing ship view
    
    // Fetch initial bridge state
    fetch(`${apiUrl}/api/bridge/state`)
      .then(res => res.json())
      .then(data => setBridgeState(data))
      .catch(err => console.error('Failed to fetch bridge state:', err));

    // Setup WebSocket connection with reconnection
    let ws: WebSocket | null = null;
    let reconnectTimeout: NodeJS.Timeout | null = null;
    let mounted = true;
    
    const connectWebSocket = () => {
      if (!mounted || ws) return; // Don't connect if already have a connection or unmounted
      
      setConnectionStatus('Connecting');
      
      ws = new WebSocket(`${wsUrl}/ws`);
      
      ws.onopen = () => {
        if (!mounted) return;
        setConnectionStatus('Connected');
        // Clear any pending reconnection
        if (reconnectTimeout) {
          clearTimeout(reconnectTimeout);
          reconnectTimeout = null;
        }
      };
      
      ws.onmessage = (event) => {
        if (!mounted) return;
        
        const message = JSON.parse(event.data);
        console.log('WebSocket message:', message);
        
        if (message.type === 'initial_state') {
          setBridgeState(message.data);
        } else if (message.type === 'agent_movement') {
          // Update agent position in bridge state
          setBridgeState(prevState => {
            if (!prevState) return prevState;
            
            const updatedAgents = prevState.agents.map(agent => {
              if (agent.id === message.data.agent_id) {
                return {
                  ...agent,
                  position: message.data.position,
                  status: message.data.is_moving ? 'moving' : message.data.activity_hint
                };
              }
              return agent;
            });
            
            return { ...prevState, agents: updatedAgents };
          });
        }
      };
      
      ws.onclose = (event) => {
        ws = null; // Clear reference
        if (!mounted) return;
        
        setConnectionStatus('Disconnected');
        // Attempt to reconnect after 2 seconds
        reconnectTimeout = setTimeout(() => {
          if (mounted) {
            console.log('Attempting to reconnect WebSocket...');
            connectWebSocket();
          }
        }, 2000);
      };
      
      ws.onerror = (error) => {
        if (!mounted) return;
        console.log('WebSocket connection error, will retry...');
        setConnectionStatus('Reconnecting');
      };
    };
    
    // Connect immediately
    connectWebSocket();

    return () => {
      mounted = false;
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
      if (ws) {
        ws.close();
        ws = null;
      }
    };
  }, [currentView]);

  // Navigation component
  const renderNavigation = () => (
    <nav style={{ 
      padding: '10px 20px', 
      borderBottom: '1px solid #333',
      backgroundColor: '#1a2332',
      display: 'flex',
      gap: '10px',
      alignItems: 'center'
    }}>
      <div style={{ display: 'flex', gap: '8px' }}>
        {[
          { id: 'mechanics', label: 'Screen' },
          { id: 'ship', label: 'Ship' },
          { id: 'roster', label: 'Manifest' }
        ].map(view => (
          <button 
            key={view.id}
            onClick={() => setCurrentView(view.id as any)}
            style={{
              padding: '8px 16px',
              border: currentView === view.id ? '2px solid #42a5f5' : '1px solid #555',
              borderRadius: '4px',
              backgroundColor: currentView === view.id ? '#42a5f5' : 'transparent',
              color: currentView === view.id ? '#000' : '#e0e6ed',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: currentView === view.id ? '600' : '400',
              textTransform: 'uppercase',
              letterSpacing: '0.3px',
              transition: 'all 0.2s ease'
            }}
          >
            {view.label}
          </button>
        ))}
      </div>
      <div style={{ marginLeft: 'auto', fontSize: '12px', color: '#78909c' }}>
        Agentopia Bridge • {connectionStatus}
      </div>
    </nav>
  );

  // Show game mechanics (formerly agent showcase)
  if (currentView === 'mechanics') {
    return (
      <div className="App">
        {renderNavigation()}
        <AgentShowcase />
      </div>
    );
  }

  // Show roster (formerly character stories)
  if (currentView === 'roster') {
    return (
      <div className="App" style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
        {renderNavigation()}
        <CharacterShowcase />
      </div>
    );
  }

  if (!bridgeState) {
    return (
      <div className="App">
        {renderNavigation()}
        <header className="App-header">
          <h1>🚀 Loading USS Agentopia Bridge...</h1>
          <p>Status: {connectionStatus}</p>
        </header>
      </div>
    );
  }

  return (
    <div className="App">
      {renderNavigation()}
      <header className="bridge-header">
        <h1>🚀 {bridgeState.bridge_id.toUpperCase()} Bridge</h1>
        <div className="status-indicators">
          <span className={`status ${bridgeState.status}`}>
            {bridgeState.status.toUpperCase()}
          </span>
          <span className={`connection ${connectionStatus.toLowerCase()}`}>
            WS: {connectionStatus}
          </span>
        </div>
      </header>
      
      <main className="bridge-main">
        <div 
          className="bridge-grid"
          style={{
            '--grid-width': bridgeState.layout.width,
            '--grid-height': bridgeState.layout.height
          } as React.CSSProperties}
        >
          {/* Render stations */}
          {bridgeState.stations.map(station => (
            <div
              key={station.id}
              className="station"
              style={{
                gridColumnStart: station.position.x + 1,
                gridColumnEnd: station.position.x + station.dimensions.width + 1,
                gridRowStart: station.position.y + 1,
                gridRowEnd: station.position.y + station.dimensions.height + 1,
                backgroundColor: station.color,
              }}
              title={station.name}
            >
              <span className="station-icon">{station.icon}</span>
              <span className="station-name">{station.name}</span>
            </div>
          ))}
          
          {/* Render agents */}
          {bridgeState.agents.map(agent => (
            <div
              key={agent.id}
              className={`agent ${agent.status}`}
              style={{
                gridColumn: agent.position.x + 1,
                gridRow: agent.position.y + 1,
              }}
              title={`${agent.name} - ${agent.status}`}
            >
              <span className="agent-avatar">{agent.avatar}</span>
              <span className="agent-name">{agent.name}</span>
            </div>
          ))}
        </div>
        
        <aside className="bridge-sidebar">
          <div className="panel">
            <h3>Crew Status</h3>
            {bridgeState.agents.map(agent => (
              <div key={agent.id} className="crew-item">
                <span>{agent.avatar} {agent.name}</span>
                <span className={`status ${agent.status}`}>{agent.status}</span>
              </div>
            ))}
          </div>
          
          <div className="panel">
            <h3>Bridge Systems</h3>
            {bridgeState.stations.map(station => (
              <div key={station.id} className="system-item">
                <span>{station.icon} {station.name}</span>
                <span className="status operational">ONLINE</span>
              </div>
            ))}
          </div>
        </aside>
      </main>
    </div>
  );
}

export default App;