import React, { useState, useEffect, useMemo } from 'react';
import AgentShowcase from './AgentShowcase';
import TheaterDemo from './TheaterDemo';
import ManifestView from './components/ManifestView';
import CommanderDashboard from './components/CommanderDashboard';
import BridgeStage from './components/BridgeStage';
import AccessView from './components/AccessView';
import { Agent as AccessAgent } from './agents/types';
import { useSystemMetrics } from './hooks/useSystemMetrics';
import { useBridgeStore, connectBridgeWebSocket } from './stores/bridgeStore';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState<'ship' | 'roster' | 'mechanics' | 'theater' | 'access'>('mechanics');
  const [showStage, setShowStage] = useState(false);
  const bridgeState = useBridgeStore((state) => state.bridgeState);
  const connectionStatus = useBridgeStore((state) => state.connectionStatus);
  const setInitialState = useBridgeStore((state) => state.setInitialState);

  // Get API URL from environment or default to localhost
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  const wsUrl = apiUrl.replace('http', 'ws');

  // Convert bridge agents to the Agent type for AccessView
  // Memoized so identity is stable across renders when bridgeState hasn't
  // changed - otherwise a fresh array every render destabilizes the
  // useCallback/useEffect deps inside useSystemMetrics and loops forever.
  const accessAgents: AccessAgent[] = useMemo(() => bridgeState?.agents.map(agent => ({
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
  })) || [], [bridgeState]);

  // Use system metrics hook
  const { systemHealth } = useSystemMetrics(wsUrl, accessAgents);

  // Only fetch bridge state via REST when actually showing the ship view;
  // the WebSocket connection below (mount-once) covers real-time updates.
  useEffect(() => {
    if (currentView !== 'ship') return;
    fetch(`${apiUrl}/api/bridge/state`)
      .then(res => res.json())
      .then(data => setInitialState(data))
      .catch(err => console.error('Failed to fetch bridge state:', err));
  }, [currentView, apiUrl, setInitialState]);

  // The single WebSocket connection lives in the bridge store (agent
  // positions/status), owned for the lifetime of the app rather than
  // reconnecting on every view change.
  useEffect(() => connectBridgeWebSocket(wsUrl), [wsUrl]);

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
      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '8px 16px' }}>
        <button
          className="lcars-nav-btn"
          onClick={() => setShowStage((prev) => !prev)}
        >
          {showStage ? 'DASHBOARD VIEW' : 'STAGE VIEW'}
        </button>
      </div>
      {showStage ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '16px' }}>
          <BridgeStage />
        </div>
      ) : (
        <CommanderDashboard connectionStatus={connectionStatus} />
      )}
    </div>
  );
}

export default App;