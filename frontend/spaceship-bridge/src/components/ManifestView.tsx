import React, { useState, useEffect } from 'react';

interface AgentMetrics {
  id: string;
  name: string;
  status: 'active' | 'idle' | 'processing' | 'error';
  performance: {
    tasksCompleted: number;
    averageResponseTime: number;
    successRate: number;
    uptime: number;
  };
  resources: {
    cpuUsage: number;
    memoryUsage: number;
    apiCalls: number;
    tokens: number;
  };
  lastActivity: string;
  timestamp: Date;
}

interface SystemHealth {
  overall: 'healthy' | 'warning' | 'critical';
  components: {
    backend: 'online' | 'degraded' | 'offline';
    database: 'online' | 'degraded' | 'offline';
    websocket: 'connected' | 'reconnecting' | 'disconnected';
    mcp: 'active' | 'limited' | 'inactive';
  };
  metrics: {
    totalAgents: number;
    activeConnections: number;
    queueDepth: number;
    errorRate: number;
  };
}

interface TaskFlow {
  id: string;
  type: 'routine' | 'user_request' | 'system' | 'emergency';
  priority: 'low' | 'normal' | 'high' | 'critical';
  assignedAgent: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number;
  estimatedCompletion: Date;
  startTime: Date;
}

const ManifestView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'agents' | 'system' | 'tasks'>('agents');
  const [agentMetrics, setAgentMetrics] = useState<AgentMetrics[]>([]);
  const [systemHealth, setSystemHealth] = useState<SystemHealth>({
    overall: 'healthy',
    components: {
      backend: 'online',
      database: 'online', 
      websocket: 'connected',
      mcp: 'active'
    },
    metrics: {
      totalAgents: 3,
      activeConnections: 3,
      queueDepth: 0,
      errorRate: 0
    }
  });
  const [taskFlow, setTaskFlow] = useState<TaskFlow[]>([]);

  // Mock data generation for demonstration
  useEffect(() => {
    const generateMockMetrics = (): AgentMetrics[] => [
      {
        id: 'chen-001',
        name: 'Dr. Chen',
        status: 'processing',
        performance: {
          tasksCompleted: 147,
          averageResponseTime: 2.3,
          successRate: 0.96,
          uptime: 23.7
        },
        resources: {
          cpuUsage: 34,
          memoryUsage: 67,
          apiCalls: 1240,
          tokens: 45600
        },
        lastActivity: 'Analyzing quantum sensor data',
        timestamp: new Date()
      },
      {
        id: 'nova-001',
        name: 'Commander Nova',
        status: 'active',
        performance: {
          tasksCompleted: 89,
          averageResponseTime: 1.8,
          successRate: 0.98,
          uptime: 24.0
        },
        resources: {
          cpuUsage: 12,
          memoryUsage: 23,
          apiCalls: 876,
          tokens: 32100
        },
        lastActivity: 'Coordinating mission parameters',
        timestamp: new Date()
      },
      {
        id: 'torres-001',
        name: 'Torres',
        status: 'idle',
        performance: {
          tasksCompleted: 203,
          averageResponseTime: 1.2,
          successRate: 0.94,
          uptime: 22.1
        },
        resources: {
          cpuUsage: 8,
          memoryUsage: 15,
          apiCalls: 1890,
          tokens: 67800
        },
        lastActivity: 'System monitoring complete',
        timestamp: new Date()
      }
    ];

    const generateMockTasks = (): TaskFlow[] => [
      {
        id: 'task-001',
        type: 'user_request',
        priority: 'high',
        assignedAgent: 'chen-001',
        status: 'processing',
        progress: 65,
        estimatedCompletion: new Date(Date.now() + 120000),
        startTime: new Date(Date.now() - 300000)
      },
      {
        id: 'task-002',
        type: 'routine',
        priority: 'normal',
        assignedAgent: 'torres-001',
        status: 'queued',
        progress: 0,
        estimatedCompletion: new Date(Date.now() + 180000),
        startTime: new Date()
      },
      {
        id: 'task-003',
        type: 'system',
        priority: 'low',
        assignedAgent: 'nova-001',
        status: 'completed',
        progress: 100,
        estimatedCompletion: new Date(Date.now() - 60000),
        startTime: new Date(Date.now() - 240000)
      }
    ];

    setAgentMetrics(generateMockMetrics());
    setTaskFlow(generateMockTasks());

    // Update every 5 seconds with slight variations
    const interval = setInterval(() => {
      setAgentMetrics(prev => prev.map(agent => ({
        ...agent,
        resources: {
          ...agent.resources,
          cpuUsage: Math.max(0, Math.min(100, agent.resources.cpuUsage + (Math.random() - 0.5) * 10)),
          memoryUsage: Math.max(0, Math.min(100, agent.resources.memoryUsage + (Math.random() - 0.5) * 5))
        },
        timestamp: new Date()
      })));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const formatUptime = (hours: number) => {
    const h = Math.floor(hours);
    const m = Math.floor((hours - h) * 60);
    return `${h}h ${m}m`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': case 'processing': case 'online': case 'connected': case 'healthy': return '#4caf50';
      case 'idle': case 'warning': case 'degraded': case 'reconnecting': return '#ff9800';
      case 'error': case 'critical': case 'offline': case 'disconnected': case 'failed': return '#f44336';
      default: return '#78909c';
    }
  };

  const renderAgentsTab = () => (
    <div className="agents-grid">
      {agentMetrics.map(agent => (
        <div key={agent.id} className="agent-card">
          <div className="agent-header">
            <div className="agent-info">
              <h3>{agent.name}</h3>
              <span 
                className="status-badge" 
                style={{ backgroundColor: getStatusColor(agent.status) }}
              >
                {agent.status.toUpperCase()}
              </span>
            </div>
            <div className="timestamp">
              {agent.timestamp.toLocaleTimeString()}
            </div>
          </div>
          
          <div className="metrics-section">
            <div className="metric-group">
              <h4>Performance</h4>
              <div className="metric-row">
                <span>Tasks: {agent.performance.tasksCompleted}</span>
                <span>Avg Response: {agent.performance.averageResponseTime}s</span>
              </div>
              <div className="metric-row">
                <span>Success Rate: {(agent.performance.successRate * 100).toFixed(1)}%</span>
                <span>Uptime: {formatUptime(agent.performance.uptime)}</span>
              </div>
            </div>
            
            <div className="metric-group">
              <h4>Resources</h4>
              <div className="resource-bar">
                <label>CPU: {agent.resources.cpuUsage}%</label>
                <div className="bar">
                  <div 
                    className="fill" 
                    style={{ 
                      width: `${agent.resources.cpuUsage}%`,
                      backgroundColor: agent.resources.cpuUsage > 80 ? '#f44336' : '#42a5f5'
                    }}
                  />
                </div>
              </div>
              <div className="resource-bar">
                <label>Memory: {agent.resources.memoryUsage}%</label>
                <div className="bar">
                  <div 
                    className="fill" 
                    style={{ 
                      width: `${agent.resources.memoryUsage}%`,
                      backgroundColor: agent.resources.memoryUsage > 80 ? '#f44336' : '#4caf50'
                    }}
                  />
                </div>
              </div>
              <div className="metric-row small">
                <span>API Calls: {agent.resources.apiCalls.toLocaleString()}</span>
                <span>Tokens: {agent.resources.tokens.toLocaleString()}</span>
              </div>
            </div>
          </div>
          
          <div className="last-activity">
            <strong>Current:</strong> {agent.lastActivity}
          </div>
        </div>
      ))}
    </div>
  );

  const renderSystemTab = () => (
    <div className="system-overview">
      <div className="health-summary">
        <div className="overall-status">
          <h3>System Health</h3>
          <span 
            className="status-indicator large"
            style={{ backgroundColor: getStatusColor(systemHealth.overall) }}
          >
            {systemHealth.overall.toUpperCase()}
          </span>
        </div>
        
        <div className="components-grid">
          {Object.entries(systemHealth.components).map(([component, status]) => (
            <div key={component} className="component-card">
              <div className="component-name">{component.toUpperCase()}</div>
              <div 
                className="component-status"
                style={{ color: getStatusColor(status) }}
              >
                {status.toUpperCase()}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="system-metrics">
        <h4>System Metrics</h4>
        <div className="metrics-grid">
          <div className="metric-item">
            <div className="metric-value">{systemHealth.metrics.totalAgents}</div>
            <div className="metric-label">Total Agents</div>
          </div>
          <div className="metric-item">
            <div className="metric-value">{systemHealth.metrics.activeConnections}</div>
            <div className="metric-label">Active Connections</div>
          </div>
          <div className="metric-item">
            <div className="metric-value">{systemHealth.metrics.queueDepth}</div>
            <div className="metric-label">Queue Depth</div>
          </div>
          <div className="metric-item">
            <div className="metric-value">{(systemHealth.metrics.errorRate * 100).toFixed(1)}%</div>
            <div className="metric-label">Error Rate</div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTasksTab = () => (
    <div className="tasks-view">
      <div className="tasks-header">
        <h3>Active Task Flow</h3>
        <div className="task-counts">
          <span>Queued: {taskFlow.filter(t => t.status === 'queued').length}</span>
          <span>Processing: {taskFlow.filter(t => t.status === 'processing').length}</span>
          <span>Completed: {taskFlow.filter(t => t.status === 'completed').length}</span>
        </div>
      </div>
      
      <div className="tasks-list">
        {taskFlow.map(task => (
          <div key={task.id} className="task-card">
            <div className="task-header">
              <div className="task-id">{task.id}</div>
              <div 
                className="task-priority"
                style={{ 
                  backgroundColor: 
                    task.priority === 'critical' ? '#f44336' :
                    task.priority === 'high' ? '#ff9800' :
                    task.priority === 'normal' ? '#42a5f5' : '#78909c'
                }}
              >
                {task.priority.toUpperCase()}
              </div>
            </div>
            
            <div className="task-details">
              <div className="task-info">
                <span>Type: {task.type.replace('_', ' ')}</span>
                <span>Agent: {agentMetrics.find(a => a.id === task.assignedAgent)?.name || task.assignedAgent}</span>
              </div>
              
              <div className="task-progress">
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ 
                      width: `${task.progress}%`,
                      backgroundColor: getStatusColor(task.status)
                    }}
                  />
                </div>
                <span>{task.progress}%</span>
              </div>
              
              <div className="task-timing">
                <span>Started: {task.startTime.toLocaleTimeString()}</span>
                <span>ETA: {task.estimatedCompletion.toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="manifest-view">
      <style>{`
        .manifest-view {
          height: 100%;
          background: linear-gradient(135deg, #0f1419 0%, #1a2332 100%);
          color: #e0e6ed;
          font-family: 'Arial Narrow', 'Helvetica Condensed', sans-serif;
          display: flex;
          flex-direction: column;
        }
        
        .manifest-tabs {
          display: flex;
          background: rgba(0, 0, 0, 0.3);
          border-bottom: 1px solid #333;
        }
        
        .tab-button {
          padding: 12px 24px;
          background: transparent;
          border: none;
          color: #78909c;
          cursor: pointer;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          transition: all 0.2s ease;
          border-bottom: 2px solid transparent;
        }
        
        .tab-button:hover {
          color: #e0e6ed;
          background: rgba(255, 255, 255, 0.05);
        }
        
        .tab-button.active {
          color: #42a5f5;
          border-bottom-color: #42a5f5;
        }
        
        .tab-content {
          flex: 1;
          padding: 20px;
          overflow-y: auto;
        }
        
        .agents-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 16px;
        }
        
        .agent-card {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid #333;
          border-radius: 8px;
          padding: 16px;
        }
        
        .agent-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }
        
        .agent-info h3 {
          margin: 0 0 4px 0;
          font-size: 16px;
          font-weight: 600;
        }
        
        .status-badge {
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 10px;
          font-weight: 600;
          color: white;
        }
        
        .timestamp {
          font-size: 10px;
          color: #78909c;
        }
        
        .metrics-section {
          margin-bottom: 12px;
        }
        
        .metric-group {
          margin-bottom: 12px;
        }
        
        .metric-group h4 {
          margin: 0 0 6px 0;
          font-size: 12px;
          color: #78909c;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }
        
        .metric-row {
          display: flex;
          justify-content: space-between;
          font-size: 11px;
          margin-bottom: 4px;
        }
        
        .metric-row.small {
          font-size: 10px;
          color: #78909c;
        }
        
        .resource-bar {
          margin-bottom: 6px;
        }
        
        .resource-bar label {
          font-size: 10px;
          color: #78909c;
          display: block;
          margin-bottom: 2px;
        }
        
        .bar {
          height: 4px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 2px;
          overflow: hidden;
        }
        
        .fill {
          height: 100%;
          transition: width 0.3s ease;
        }
        
        .last-activity {
          font-size: 11px;
          color: #78909c;
          border-top: 1px solid #333;
          padding-top: 8px;
        }
        
        .system-overview {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        
        .health-summary {
          display: flex;
          gap: 24px;
        }
        
        .overall-status {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }
        
        .status-indicator.large {
          padding: 8px 16px;
          border-radius: 4px;
          font-weight: 600;
          color: white;
        }
        
        .components-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
          flex: 1;
        }
        
        .component-card {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid #333;
          border-radius: 4px;
          padding: 12px;
          text-align: center;
        }
        
        .component-name {
          font-size: 11px;
          color: #78909c;
          margin-bottom: 4px;
        }
        
        .component-status {
          font-weight: 600;
          font-size: 12px;
        }
        
        .system-metrics {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid #333;
          border-radius: 8px;
          padding: 16px;
        }
        
        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-top: 12px;
        }
        
        .metric-item {
          text-align: center;
        }
        
        .metric-value {
          font-size: 24px;
          font-weight: 600;
          color: #42a5f5;
        }
        
        .metric-label {
          font-size: 10px;
          color: #78909c;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }
        
        .tasks-view {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        
        .tasks-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .task-counts {
          display: flex;
          gap: 16px;
          font-size: 11px;
          color: #78909c;
        }
        
        .tasks-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        
        .task-card {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid #333;
          border-radius: 6px;
          padding: 12px;
        }
        
        .task-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }
        
        .task-id {
          font-family: monospace;
          font-size: 11px;
          color: #78909c;
        }
        
        .task-priority {
          padding: 2px 6px;
          border-radius: 10px;
          font-size: 9px;
          font-weight: 600;
          color: white;
        }
        
        .task-details {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        
        .task-info {
          display: flex;
          justify-content: space-between;
          font-size: 11px;
          color: #78909c;
        }
        
        .task-progress {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .progress-bar {
          flex: 1;
          height: 6px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
          overflow: hidden;
        }
        
        .progress-fill {
          height: 100%;
          transition: width 0.3s ease;
        }
        
        .task-timing {
          display: flex;
          justify-content: space-between;
          font-size: 10px;
          color: #78909c;
        }
      `}</style>
      
      <div className="manifest-tabs">
        {[
          { id: 'agents', label: 'Agent Performance' },
          { id: 'system', label: 'System Health' },
          { id: 'tasks', label: 'Task Flow' }
        ].map(tab => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id as any)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      
      <div className="tab-content">
        {activeTab === 'agents' && renderAgentsTab()}
        {activeTab === 'system' && renderSystemTab()}
        {activeTab === 'tasks' && renderTasksTab()}
      </div>
    </div>
  );
};

export default ManifestView;