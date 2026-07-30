import React from 'react';
import './CommanderDashboard.css';

// Purged of fabricated fleet/mission/performance numbers (openspec
// make-bridge-scene-first task 1.2, design.md D6 "a number renders only if
// it traces to a real source"). This view is unrouted after the task 1.1
// scene-first shell inversion - what's left is real-signal scaffolding
// (WS connection state) for the ops overlay (tasks.md 4.3) to mine later.
interface CommanderDashboardProps {
  connectionStatus: string;
}

const CommanderDashboard: React.FC<CommanderDashboardProps> = ({ connectionStatus }) => {
  return (
    <div className="commander-dashboard">
      <div className="dashboard-header">
        <h1>🚀 Fleet Command</h1>
        <div className="connection-status">
          <span className={`status-indicator ${connectionStatus.toLowerCase()}`}></span>
          Fleet Network: {connectionStatus}
        </div>
      </div>
    </div>
  );
};

export default CommanderDashboard;