import React, { useEffect, useState } from 'react';
import BridgeStage from './components/BridgeStage';
import CreationOverlay from './components/CreationOverlay';
import { useBridgeStore, connectBridgeWebSocket } from './stores/bridgeStore';
import { usePlayerProfile } from './hooks/usePlayerProfile';
import { paletteById } from './playerPalettes';
import './App.css';

// Scene-first shell (openspec make-bridge-scene-first task 1.1): the Pixi
// bridge is the root view, full-viewport, no tab navigation. The old
// dashboard/roster/access/showcase/theater views are unrouted here (not
// deleted - see tasks.md 4.4) and the WS status is a tiny corner indicator
// rather than a nav bar element.
function App() {
  const connectionStatus = useBridgeStore((state) => state.connectionStatus);
  const setInitialState = useBridgeStore((state) => state.setInitialState);
  const { profile, completeCreation, justBoarded } = usePlayerProfile();
  const [showGreeting, setShowGreeting] = useState(false);

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  const wsUrl = apiUrl.replace('http', 'ws');

  useEffect(() => {
    fetch(`${apiUrl}/api/bridge/state`)
      .then((res) => res.json())
      .then((data) => setInitialState(data))
      .catch((err) => console.error('Failed to fetch bridge state:', err));
  }, [apiUrl, setInitialState]);

  useEffect(() => connectBridgeWebSocket(wsUrl), [wsUrl]);

  // Greet by callsign once the scene is revealed - a longer beat right
  // after boarding, a shorter one on a returning boot (tasks.md 6.2/6.3).
  useEffect(() => {
    if (!profile) return;
    setShowGreeting(true);
    const timeout = setTimeout(() => setShowGreeting(false), justBoarded ? 5000 : 3500);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!!profile]);

  if (!profile) {
    return <CreationOverlay onComplete={completeCreation} />;
  }

  const palette = paletteById(profile.paletteId);

  return (
    <div className="scene-root">
      <div className={`ws-indicator ${connectionStatus.toLowerCase()}`} title={`WebSocket: ${connectionStatus}`}>
        <span className="ws-dot" />
      </div>
      {showGreeting && (
        <div className="greeting-toast">
          {justBoarded ? `Welcome aboard, Captain ${profile.callsign}.` : `Welcome back, Captain ${profile.callsign}.`}
        </div>
      )}
      <div className="scene-viewport">
        <BridgeStage playerTint={{ coat: palette.coat, trim: palette.trim }} />
      </div>
    </div>
  );
}

export default App;
