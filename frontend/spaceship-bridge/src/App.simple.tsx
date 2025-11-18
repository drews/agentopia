import React, { useState, useEffect } from 'react';
import Bridge from './components/Bridge';
import Character from './components/Character';
import Agent from './components/Agent';
import { BridgeState, Character as CharacterType, Agent as AgentType, ViewType } from './types';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState<ViewType>('mechanics');
  const [bridgeState, setBridgeState] = useState<BridgeState | null>(null);
  const [connectionStatus, setConnectionStatus] = useState('Disconnected');

  useEffect(() => {
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';
    const wsUrl = apiUrl.replace('http', 'ws');

    // Fetch initial bridge state only when showing ship view
    if (currentView === 'ship') {
      fetch(`${apiUrl}/api/bridge/state`)
        .then(res => res.json())
        .then(data => setBridgeState(data))
        .catch(err => console.error('Failed to fetch bridge state:', err));
    }

    // WebSocket connection with simplified reconnection
    let ws: WebSocket | null = null;
    let reconnectTimeout: NodeJS.Timeout | null = null;
    let mounted = true;
    
    const connectWebSocket = () => {
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
        console.log('WebSocket message:', message);
        
        if (message.type === 'initial_state') {
          setBridgeState(message.data);
        } else if (message.type === 'agent_movement_intent') {
          setBridgeState(prevState => {
            if (!prevState) return prevState;
            
            const updatedAgents = prevState.agents.map(agent => {
              if (agent.id === message.data.agent_id) {
                return {
                  ...agent,
                  position: message.data.target_position,
                  status: { ...agent.status, state: message.data.activity_hint || 'moving' }
                };
              }
              return agent;
            });
            
            return { ...prevState, agents: updatedAgents };
          });
        }
      };
      
      ws.onclose = () => {
        ws = null;
        if (!mounted) return;
        
        setConnectionStatus('Disconnected');
        reconnectTimeout = setTimeout(() => {
          if (mounted) {
            console.log('Attempting to reconnect WebSocket...');
            connectWebSocket();
          }
        }, 2000);
      };
      
      ws.onerror = () => {
        if (!mounted) return;
        console.log('WebSocket connection error, will retry...');
        setConnectionStatus('Reconnecting');
      };
    };
    
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

  // Simplified navigation
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
            onClick={() => setCurrentView(view.id as ViewType)}
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

  // Simplified demo agents for mechanics view
  const demoAgents: AgentType[] = [
    {
      id: '1',
      name: 'Commander Data',
      type: 'commander',
      position: { x: 0, y: 0 },
      status: { state: 'thinking', efficiency: 95 }
    },
    {
      id: '2',
      name: 'Chief O\'Brien',
      type: 'engineer',
      position: { x: 1, y: 0 },
      status: { state: 'working', efficiency: 87 }
    },
    {
      id: '3',
      name: 'Dr. Crusher',
      type: 'medical',
      position: { x: 2, y: 0 },
      status: { state: 'idle', efficiency: 78 }
    }
  ];

  // Simplified demo characters for roster view
  const demoCharacters: CharacterType[] = [
    {
      id: '1',
      name: 'Alex Chen',
      attributeValues: { courage: 75, intellect: 85, empathy: 60 },
      currentTraits: ['analytical', 'cautious', 'growing_confident'],
      appearance: {
        visualState: 'focused',
        accessories: ['research_badge'],
        posture: 'upright'
      },
      lastActivity: 'Analyzing sensor data'
    },
    {
      id: '2',
      name: 'Jordan Rivers',
      attributeValues: { courage: 60, intellect: 70, empathy: 90 },
      currentTraits: ['empathetic', 'diplomatic', 'thoughtful'],
      appearance: {
        visualState: 'calm',
        accessories: ['communication_device'],
        posture: 'alert'
      },
      lastActivity: 'Mediating crew discussion'
    }
  ];

  // Show mechanics view (agent showcase)
  if (currentView === 'mechanics') {
    return (
      <div className="App">
        {renderNavigation()}
        <div style={{ 
          padding: '40px', 
          display: 'flex', 
          gap: '20px', 
          justifyContent: 'center',
          background: '#0a0f1a',
          minHeight: 'calc(100vh - 60px)'
        }}>
          {demoAgents.map(agent => (
            <Agent 
              key={agent.id}
              agent={agent}
              size={{ width: 160, height: 200 }}
              theme="lcars"
              interactive={true}
              onClick={(agent) => console.log('Clicked agent:', agent.name)}
            />
          ))}
        </div>
      </div>
    );
  }

  // Show roster view (character showcase)
  if (currentView === 'roster') {
    return (
      <div className="App" style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
        {renderNavigation()}
        <div style={{ 
          flex: 1,
          padding: '40px', 
          display: 'flex', 
          gap: '20px', 
          justifyContent: 'center',
          background: '#0a0f1a'
        }}>
          {demoCharacters.map(character => (
            <Character 
              key={character.id}
              character={character}
              size="large"
              showDetails={true}
              onClick={(character) => console.log('Clicked character:', character.name)}
            />
          ))}
        </div>
      </div>
    );
  }

  // Show ship view (bridge interface)
  if (!bridgeState) {
    return (
      <div className="App">
        {renderNavigation()}
        <header className="App-header">
          <h1>🚀 Loading USS Agentopia Bridge...</h1>
          <p>Status: <span style={{ color: connectionStatus === 'Connected' ? '#66FF99' : '#FF6666' }}>
            WS: {connectionStatus}
          </span></p>
        </header>
      </div>
    );
  }

  return (
    <div className="App">
      {renderNavigation()}
      <Bridge bridgeState={bridgeState} connectionStatus={connectionStatus} />
    </div>
  );
}

export default App;