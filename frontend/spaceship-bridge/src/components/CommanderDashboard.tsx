import React, { useState } from 'react';
import './CommanderDashboard.css';

interface FleetMetrics {
  total_ships: number;
  operational_ships: number;
  ships_in_mission: number;
  average_crew_efficiency: number;
  total_missions_active: number;
  resource_allocation_efficiency: number;
}

interface MissionData {
  id: string;
  title: string;
  status: 'planned' | 'active' | 'completed' | 'failed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  progress_percentage: number;
  estimated_duration: string;
  assigned_ships: string[];
}

interface PerformanceMetrics {
  power_efficiency: number;
  crew_productivity: number;
  response_time_average: number;
  error_rate: number;
  uptime_percentage: number;
  resource_utilization: Record<string, number>;
}

interface TrendData {
  timestamp: string;
  value: number;
}

interface CommanderDashboardProps {
  connectionStatus: string;
}

const CommanderDashboard: React.FC<CommanderDashboardProps> = ({ connectionStatus }) => {
  const [fleetMetrics] = useState<FleetMetrics>({
    total_ships: 3,
    operational_ships: 3,
    ships_in_mission: 1,
    average_crew_efficiency: 87.5,
    total_missions_active: 2,
    resource_allocation_efficiency: 92.3
  });

  const [missions] = useState<MissionData[]>([
    {
      id: 'mission-001',
      title: 'Deep Space Exploration Protocol',
      status: 'active',
      priority: 'high',
      progress_percentage: 65,
      estimated_duration: '4.2 hours',
      assigned_ships: ['USS Agentopia', 'USS Discovery']
    },
    {
      id: 'mission-002',
      title: 'Resource Optimization Analysis',
      status: 'active',
      priority: 'medium',
      progress_percentage: 23,
      estimated_duration: '2.8 hours',
      assigned_ships: ['USS Agentopia']
    }
  ]);

  const [performanceMetrics] = useState<PerformanceMetrics>({
    power_efficiency: 94.2,
    crew_productivity: 89.7,
    response_time_average: 1.23,
    error_rate: 0.8,
    uptime_percentage: 99.7,
    resource_utilization: {
      computational: 76.4,
      power: 68.9,
      network: 45.2,
      storage: 82.1
    }
  });

  useState<Record<string, TrendData[]>>({
    efficiency: [
      { timestamp: '06:00', value: 85.2 },
      { timestamp: '08:00', value: 87.1 },
      { timestamp: '10:00', value: 89.7 },
      { timestamp: '12:00', value: 91.3 },
      { timestamp: '14:00', value: 89.5 },
      { timestamp: '16:00', value: 92.1 }
    ],
    missions: [
      { timestamp: '06:00', value: 3 },
      { timestamp: '08:00', value: 2 },
      { timestamp: '10:00', value: 2 },
      { timestamp: '12:00', value: 2 },
      { timestamp: '14:00', value: 3 },
      { timestamp: '16:00', value: 2 }
    ]
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#4CAF50';
      case 'planned': return '#2196F3';
      case 'completed': return '#8BC34A';
      case 'failed': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return '#FF1744';
      case 'high': return '#FF9800';
      case 'medium': return '#2196F3';
      case 'low': return '#4CAF50';
      default: return '#9E9E9E';
    }
  };

  const formatMetric = (value: number, suffix: string = '%') => {
    return `${value.toFixed(1)}${suffix}`;
  };

  return (
    <div className="commander-dashboard">
      <div className="dashboard-header">
        <h1>🚀 Fleet Command Strategic Overview</h1>
        <div className="connection-status">
          <span className={`status-indicator ${connectionStatus.toLowerCase()}`}></span>
          Fleet Network: {connectionStatus}
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Fleet Operations Overview */}
        <div className="panel fleet-overview">
          <h2>Fleet Operations</h2>
          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-value">{fleetMetrics.total_ships}</div>
              <div className="metric-label">Total Ships</div>
            </div>
            <div className="metric-card">
              <div className="metric-value">{fleetMetrics.operational_ships}</div>
              <div className="metric-label">Operational</div>
            </div>
            <div className="metric-card">
              <div className="metric-value">{fleetMetrics.ships_in_mission}</div>
              <div className="metric-label">In Mission</div>
            </div>
            <div className="metric-card">
              <div className="metric-value">{formatMetric(fleetMetrics.average_crew_efficiency)}</div>
              <div className="metric-label">Crew Efficiency</div>
            </div>
            <div className="metric-card">
              <div className="metric-value">{fleetMetrics.total_missions_active}</div>
              <div className="metric-label">Active Missions</div>
            </div>
            <div className="metric-card">
              <div className="metric-value">{formatMetric(fleetMetrics.resource_allocation_efficiency)}</div>
              <div className="metric-label">Resource Efficiency</div>
            </div>
          </div>
        </div>

        {/* Mission Command Center */}
        <div className="panel mission-command">
          <h2>Mission Command Center</h2>
          <div className="mission-list">
            {missions.map(mission => (
              <div key={mission.id} className="mission-card">
                <div className="mission-header">
                  <div className="mission-title">{mission.title}</div>
                  <div className="mission-badges">
                    <span 
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(mission.status) }}
                    >
                      {mission.status.toUpperCase()}
                    </span>
                    <span 
                      className="priority-badge"
                      style={{ backgroundColor: getPriorityColor(mission.priority) }}
                    >
                      {mission.priority.toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="mission-progress">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ width: `${mission.progress_percentage}%` }}
                    ></div>
                  </div>
                  <div className="progress-text">{mission.progress_percentage}% Complete</div>
                </div>
                <div className="mission-details">
                  <div className="mission-eta">ETA: {mission.estimated_duration}</div>
                  <div className="mission-ships">
                    Ships: {mission.assigned_ships.join(', ')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Analytics */}
        <div className="panel performance-analytics">
          <h2>System Performance</h2>
          <div className="performance-grid">
            <div className="performance-metric">
              <div className="metric-name">Power Efficiency</div>
              <div className="metric-bar">
                <div 
                  className="metric-fill"
                  style={{ width: `${performanceMetrics.power_efficiency}%` }}
                ></div>
              </div>
              <div className="metric-text">{formatMetric(performanceMetrics.power_efficiency)}</div>
            </div>
            <div className="performance-metric">
              <div className="metric-name">Crew Productivity</div>
              <div className="metric-bar">
                <div 
                  className="metric-fill"
                  style={{ width: `${performanceMetrics.crew_productivity}%` }}
                ></div>
              </div>
              <div className="metric-text">{formatMetric(performanceMetrics.crew_productivity)}</div>
            </div>
            <div className="performance-metric">
              <div className="metric-name">System Uptime</div>
              <div className="metric-bar">
                <div 
                  className="metric-fill"
                  style={{ width: `${performanceMetrics.uptime_percentage}%` }}
                ></div>
              </div>
              <div className="metric-text">{formatMetric(performanceMetrics.uptime_percentage)}</div>
            </div>
            <div className="performance-metric">
              <div className="metric-name">Error Rate</div>
              <div className="metric-bar error-rate">
                <div 
                  className="metric-fill"
                  style={{ width: `${performanceMetrics.error_rate * 10}%` }}
                ></div>
              </div>
              <div className="metric-text">{formatMetric(performanceMetrics.error_rate)}</div>
            </div>
          </div>
        </div>

        {/* Resource Utilization */}
        <div className="panel resource-utilization">
          <h2>Resource Allocation</h2>
          <div className="resource-chart">
            {Object.entries(performanceMetrics.resource_utilization).map(([resource, usage]) => (
              <div key={resource} className="resource-item">
                <div className="resource-header">
                  <span className="resource-name">{resource.charAt(0).toUpperCase() + resource.slice(1)}</span>
                  <span className="resource-value">{formatMetric(usage)}</span>
                </div>
                <div className="resource-bar">
                  <div 
                    className="resource-fill"
                    style={{ 
                      width: `${usage}%`,
                      backgroundColor: usage > 80 ? '#FF5722' : usage > 60 ? '#FF9800' : '#4CAF50'
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Strategic Intelligence */}
        <div className="panel strategic-intelligence">
          <h2>Strategic Intelligence</h2>
          <div className="intelligence-sections">
            <div className="intelligence-section">
              <h3>Optimization Recommendations</h3>
              <ul className="recommendation-list">
                <li>🔧 Redistribute power allocation to increase computational capacity by 12%</li>
                <li>⚡ Schedule maintenance window for optimal crew rotation efficiency</li>
                <li>📊 Mission complexity analysis suggests crew cross-training opportunity</li>
              </ul>
            </div>
            <div className="intelligence-section">
              <h3>Trend Analysis</h3>
              <div className="trend-indicators">
                <div className="trend-item">
                  <span className="trend-label">Crew Efficiency</span>
                  <span className="trend-arrow trend-up">↗</span>
                  <span className="trend-value">+5.3% (24h)</span>
                </div>
                <div className="trend-item">
                  <span className="trend-label">Mission Success Rate</span>
                  <span className="trend-arrow trend-up">↗</span>
                  <span className="trend-value">+2.1% (7d)</span>
                </div>
                <div className="trend-item">
                  <span className="trend-label">Resource Efficiency</span>
                  <span className="trend-arrow trend-down">↘</span>
                  <span className="trend-value">-1.7% (24h)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Operational Timeline */}
        <div className="panel operational-timeline">
          <h2>Recent Operations</h2>
          <div className="timeline-events">
            <div className="timeline-event">
              <div className="event-time">14:32</div>
              <div className="event-icon success">✓</div>
              <div className="event-description">Mission "Resource Optimization Analysis" milestone reached</div>
            </div>
            <div className="timeline-event">
              <div className="event-time">13:45</div>
              <div className="event-icon info">ℹ</div>
              <div className="event-description">Agent reallocation completed - efficiency increased 3.2%</div>
            </div>
            <div className="timeline-event">
              <div className="event-time">12:18</div>
              <div className="event-icon warning">⚠</div>
              <div className="event-description">Network utilization spike detected - auto-scaling activated</div>
            </div>
            <div className="timeline-event">
              <div className="event-time">11:02</div>
              <div className="event-icon success">✓</div>
              <div className="event-description">System maintenance completed - all systems nominal</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommanderDashboard;