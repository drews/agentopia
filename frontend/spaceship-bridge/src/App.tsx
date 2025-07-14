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
  const [currentView, setCurrentView] = useState<'ship' | 'roster' | 'mechanics'>('ship');
  const [bridgeState, setBridgeState] = useState<BridgeState | null>(null);
  const [connectionStatus, setConnectionStatus] = useState('Disconnected');

  useEffect(() => {
    if (currentView !== 'ship') return; // Skip bridge connection when not showing ship view
    
    // Fetch initial bridge state
    fetch('http://localhost:8000/api/bridge/state')
      .then(res => res.json())
      .then(data => setBridgeState(data))
      .catch(err => console.error('Failed to fetch bridge state:', err));

    // Setup WebSocket connection
    const ws = new WebSocket('ws://localhost:8000/ws');
    
    ws.onopen = () => {
      setConnectionStatus('Connected');
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
    };
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setConnectionStatus('Error');
    };

    return () => {
      ws.close();
    };
  }, [currentView]);

  // LCARS Navigation component
  const renderNavigation = () => (
    <div style={{
      position: 'relative',
      height: '60px',
      backgroundColor: '#000000',
      display: 'flex',
      alignItems: 'stretch'
    }}>
      {/* Left LCARS Panel */}
      <div style={{
        width: '320px',
        height: '100%',
        background: 'linear-gradient(90deg, #CC6699 0%, #CC6699 280px, #000000 320px)',
        borderRadius: '0 30px 0 0',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        paddingLeft: '20px'
      }}>
        <div style={{
          fontFamily: "'Arial Narrow', 'Helvetica Condensed', sans-serif",
          fontSize: '16px',
          fontWeight: 'bold',
          color: '#000000',
          textTransform: 'uppercase',
          letterSpacing: '1px'
        }}>
          AGENTOPIA BRIDGE
        </div>
      </div>

      {/* Center Navigation Buttons */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '2px',
        paddingLeft: '20px'
      }}>
        {[
          { id: 'ship', label: 'SHIP OPERATIONS', color: '#99CCFF' },
          { id: 'roster', label: 'PERSONNEL', color: '#FFCC99' },
          { id: 'mechanics', label: 'SYSTEMS', color: '#CCFF99' }
        ].map((view, index) => (
          <div key={view.id} style={{ display: 'flex' }}>
            <button 
              onClick={() => setCurrentView(view.id as any)}
              style={{
                height: '30px',
                minWidth: '120px',
                border: 'none',
                borderRadius: index === 0 ? '15px 0 0 15px' : index === 2 ? '0 15px 15px 0' : '0',
                backgroundColor: currentView === view.id ? view.color : '#333366',
                color: currentView === view.id ? '#000000' : '#FFCC99',
                cursor: 'pointer',
                fontSize: '11px',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                fontFamily: "'Arial Narrow', 'Helvetica Condensed', sans-serif",
                transition: 'all 0.2s ease',
                padding: '0 12px',
                position: 'relative'
              }}
            >
              {view.label}
            </button>
            {index < 2 && (
              <div style={{
                width: '2px',
                height: '30px',
                backgroundColor: '#000000'
              }} />
            )}
          </div>
        ))}
      </div>

      {/* Right LCARS Panel */}
      <div style={{
        width: '200px',
        height: '100%',
        background: 'linear-gradient(270deg, #99CCFF 0%, #99CCFF 150px, #000000 200px)',
        borderRadius: '30px 0 0 0',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingRight: '20px'
      }}>
        <div style={{
          fontFamily: "'Arial Narrow', 'Helvetica Condensed', sans-serif",
          fontSize: '11px',
          fontWeight: 'bold',
          color: '#000000',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          textAlign: 'right'
        }}>
          STATUS: {connectionStatus}
        </div>
      </div>

      {/* Corner curves */}
      <div style={{
        position: 'absolute',
        bottom: '-8px',
        left: '312px',
        width: '16px',
        height: '8px',
        backgroundColor: '#CC6699',
        borderRadius: '0 0 16px 0'
      }} />
      
      <div style={{
        position: 'absolute',
        bottom: '-8px',
        right: '192px',
        width: '16px',
        height: '8px',
        backgroundColor: '#99CCFF',
        borderRadius: '0 0 0 16px'
      }} />
    </div>
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