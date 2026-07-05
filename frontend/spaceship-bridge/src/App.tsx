import React, { useState, useEffect } from 'react';
import AgentShowcase from './AgentShowcase';
import TheaterDemo from './TheaterDemo';
import ManifestView from './components/ManifestView';
import CommanderDashboard from './components/CommanderDashboard';
import AccessView from './components/AccessView';
import { Agent as AccessAgent } from './agents/types';
import { useSystemMetrics } from './hooks/useSystemMetrics';
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
  const [currentView, setCurrentView] = useState<'ship' | 'roster' | 'mechanics' | 'theater' | 'access'>('mechanics');
  const [bridgeState, setBridgeState] = useState<BridgeState | null>(null);
  const [connectionStatus, setConnectionStatus] = useState('Disconnected');

  // Get API URL from environment or default to localhost
  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';
  const wsUrl = apiUrl.replace('http', 'ws');

  // Convert bridge agents to the Agent type for AccessView
  const accessAgents: AccessAgent[] = bridgeState?.agents.map(agent => ({
    id: agent.id,
    name: agent.name,
    type: 'operations' as any, // Default type, could be enhanced
    position: agent.position,
    status: {
      state: agent.status as any,
      lastActivity: new Date(),
      efficiency: Math.floor(Math.random() * 40) + 60 // Mock efficiency 60-100%
    },
    capabilities: {
      primary: 'operations',
      secondary: ['monitoring', 'analysis'],
      level: 'competent' as const
    }
  })) || [];

  // Use system metrics hook
  const { systemHealth, detectAnomalies } = useSystemMetrics(wsUrl, accessAgents);

  useEffect(() => {
    // Get API URL from environment or default to localhost
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';
    const wsUrl = apiUrl.replace('http', 'ws');
    // Always maintain WebSocket connection for real-time updates
    // Only fetch bridge state when actually showing ship view
    if (currentView === 'ship') {
      // Fetch initial bridge state
      fetch(`${apiUrl}/api/bridge/state`)
        .then(res => res.json())
        .then(data => setBridgeState(data))
        .catch(err => console.error('Failed to fetch bridge state:', err));
    }

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
        } else if (message.type === 'agent_movement_intent') {
          // Update agent position in bridge state based on movement intent
          setBridgeState(prevState => {
            if (!prevState) return prevState;
            
            const updatedAgents = prevState.agents.map(agent => {
              if (agent.id === message.data.agent_id) {
                return {
                  ...agent,
                  position: message.data.target_position,
                  status: message.data.activity_hint || 'moving'
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

  // Simplified LCARS Navigation
  const renderNavigation = () => (
    <div className="lcars-nav">
      <div className="lcars-nav-left">
        <span className="lcars-title">AGENTOPIA</span>
      </div>
      
      <div className="lcars-nav-center">
        {[
          { id: 'ship', label: 'BRIDGE', icon: '🚀' },
          { id: 'roster', label: 'CREW', icon: '👥' },
          { id: 'access', label: 'ACCESS', icon: '📊' },
          { id: 'mechanics', label: 'SYSTEMS', icon: '⚙️' },
          { id: 'theater', label: 'THEATER', icon: '🎭' }
        ].map((view) => (
          <button 
            key={view.id}
            onClick={() => setCurrentView(view.id as any)}
            className={`lcars-nav-btn ${currentView === view.id ? 'active' : ''}`}
          >
            <span className="nav-icon">{view.icon}</span>
            <span className="nav-label">{view.label}</span>
          </button>
        ))}
      </div>
      
      <div className="lcars-nav-right">
        <span className={`lcars-status ${connectionStatus.toLowerCase()}`}>
          {connectionStatus}
        </span>
      </div>
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

  // Show access view (micro-scale data and metrics)
  if (currentView === 'access') {
    return (
      <div className="App">
        {renderNavigation()}
        <AccessView 
          agents={accessAgents}
          systemHealth={systemHealth}
          onAgentInteraction={(agentId, action) => {
            console.log(`Agent interaction: ${agentId} - ${action}`);
            // Could trigger agent detail modal or actions
          }}
        />
      </div>
    );
  }

  // Show roster (formerly character stories)
  if (currentView === 'roster') {
    return (
      <div className="App" style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
        {renderNavigation()}
        <ManifestView />
      </div>
    );
  }

  // Show theater demo (stagecraft system)
  if (currentView === 'theater') {
    return (
      <div className="App">
        <TheaterDemo />
      </div>
    );
  }

  if (!bridgeState) {
    return (
      <div className="App">
        {renderNavigation()}
        <header className="App-header">
          <h1>🚀 Loading USS Agentopia Bridge...</h1>
          <p>Status: <span className={`connection ${connectionStatus.toLowerCase()}`}>WS: {connectionStatus}</span></p>
        </header>
      </div>
    );
  }

  return (
    <div className="App">
      {renderNavigation()}
      <CommanderDashboard connectionStatus={connectionStatus} />
    </div>
  );
}

export default App;