import React, { useState, useEffect } from 'react';
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
  const [bridgeState, setBridgeState] = useState<BridgeState | null>(null);
  const [websocket, setWebsocket] = useState<WebSocket | null>(null);
  const [connectionStatus, setConnectionStatus] = useState('Disconnected');

  useEffect(() => {
    // Fetch initial bridge state
    fetch('http://localhost:8000/api/bridge/state')
      .then(res => res.json())
      .then(data => setBridgeState(data))
      .catch(err => console.error('Failed to fetch bridge state:', err));

    // Setup WebSocket connection
    const ws = new WebSocket('ws://localhost:8000/ws');
    
    ws.onopen = () => {
      setConnectionStatus('Connected');
      setWebsocket(ws);
    };
    
    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log('WebSocket message:', message);
      
      if (message.type === 'initial_state') {
        setBridgeState(message.data);
      }
    };
    
    ws.onclose = () => {
      setConnectionStatus('Disconnected');
      setWebsocket(null);
    };
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setConnectionStatus('Error');
    };

    return () => {
      ws.close();
    };
  }, []);

  if (!bridgeState) {
    return (
      <div className="App">
        <header className="App-header">
          <h1>🚀 Loading USS Agentopia Bridge...</h1>
          <p>Status: {connectionStatus}</p>
        </header>
      </div>
    );
  }

  return (
    <div className="App">
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
