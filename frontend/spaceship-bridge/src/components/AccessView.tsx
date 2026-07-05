import React, { useState, useEffect } from 'react';
import { Agent, AgentStatus } from '../agents/types';
import MetricDetailModal from './MetricDetailModal';

interface MicroMetric {
  id: string;
  label: string;
  value: number | string;
  unit?: string;
  trend?: 'up' | 'down' | 'stable';
  threshold?: {
    good: number;
    warning: number;
  };
}

interface SystemHealth {
  websocket: 'connected' | 'connecting' | 'disconnected';
  mcp_servers: 'online' | 'degraded' | 'offline';
  response_time: number;
  memory_usage: number;
  active_agents: number;
}

interface AccessViewProps {
  agents: Agent[];
  systemHealth: SystemHealth;
  onAgentInteraction?: (agentId: string, action: string) => void;
}

const AccessView: React.FC<AccessViewProps> = ({ 
  agents = [], 
  systemHealth,
  onAgentInteraction 
}) => {
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);
  const [celebrationQueue, setCelebrationQueue] = useState<string[]>([]);
  const [modalMetric, setModalMetric] = useState<MicroMetric | null>(null);

  // Calculate micro-scale metrics from agent data
  const calculateMicroMetrics = (): MicroMetric[] => {
    const totalAgents = agents.length;
    const activeAgents = agents.filter(a => a.status.state !== 'offline').length;
    const avgEfficiency = agents.reduce((sum, a) => sum + (a.status.efficiency || 0), 0) / totalAgents;
    const workingAgents = agents.filter(a => a.status.state === 'working').length;
    const errorCount = agents.filter(a => a.status.state === 'error').length;
    
    const recentActivity = agents.filter(a => {
      const timeDiff = Date.now() - new Date(a.status.lastActivity ?? 0).getTime();
      return timeDiff < 30000; // last 30 seconds
    }).length;

    return [
      {
        id: 'active_ratio',
        label: 'Active Agents',
        value: `${activeAgents}/${totalAgents}`,
        trend: activeAgents > totalAgents * 0.7 ? 'up' : 'down'
      },
      {
        id: 'avg_efficiency',
        label: 'Fleet Efficiency',
        value: Math.round(avgEfficiency),
        unit: '%',
        trend: avgEfficiency > 80 ? 'up' : avgEfficiency > 60 ? 'stable' : 'down',
        threshold: { good: 80, warning: 60 }
      },
      {
        id: 'response_time',
        label: 'Response Time',
        value: systemHealth.response_time,
        unit: 'ms',
        trend: systemHealth.response_time < 200 ? 'up' : 'down',
        threshold: { good: 200, warning: 500 }
      },
      {
        id: 'working_agents',
        label: 'Active Tasks',
        value: workingAgents,
        trend: workingAgents > 0 ? 'up' : 'stable'
      },
      {
        id: 'recent_activity',
        label: 'Recent Activity',
        value: recentActivity,
        unit: 'agents',
        trend: recentActivity > 0 ? 'up' : 'stable'
      },
      {
        id: 'error_rate',
        label: 'Error Rate',
        value: Math.round((errorCount / totalAgents) * 100),
        unit: '%',
        trend: errorCount === 0 ? 'up' : 'down',
        threshold: { good: 0, warning: 10 }
      }
    ];
  };

  const microMetrics = calculateMicroMetrics();

  // Micro-celebration system
  useEffect(() => {
    const checkForCelebrations = () => {
      const celebrations: string[] = [];
      
      // Check for efficiency milestones
      const avgEfficiency = microMetrics.find(m => m.id === 'avg_efficiency')?.value as number;
      if (avgEfficiency >= 95) celebrations.push('🎯 Excellence Achieved!');
      else if (avgEfficiency >= 90) celebrations.push('⭐ High Performance!');
      
      // Check for zero errors
      const errorRate = microMetrics.find(m => m.id === 'error_rate')?.value as number;
      if (errorRate === 0) celebrations.push('✨ Flawless Operation!');
      
      // Check for fast response
      const responseTime = microMetrics.find(m => m.id === 'response_time')?.value as number;
      if (responseTime < 100) celebrations.push('⚡ Lightning Fast!');
      
      setCelebrationQueue(celebrations);
    };

    checkForCelebrations();
  }, [microMetrics]);

  const getMetricColor = (metric: MicroMetric): string => {
    if (!metric.threshold) {
      return metric.trend === 'up' ? '#10b981' : metric.trend === 'down' ? '#ef4444' : '#6b7280';
    }
    
    const value = metric.value as number;
    if (value >= metric.threshold.good) return '#10b981';
    if (value >= metric.threshold.warning) return '#f59e0b';
    return '#ef4444';
  };

  const getTrendIcon = (trend?: string): string => {
    switch (trend) {
      case 'up': return '↗';
      case 'down': return '↘';
      default: return '→';
    }
  };

  const getHealthStatus = (status: string): { color: string; icon: string } => {
    switch (status) {
      case 'connected':
      case 'online':
        return { color: '#10b981', icon: '●' };
      case 'connecting':
      case 'degraded':
        return { color: '#f59e0b', icon: '◐' };
      default:
        return { color: '#ef4444', icon: '○' };
    }
  };

  return (
    <div style={{
      padding: '20px',
      backgroundColor: '#0f172a',
      color: '#e2e8f0',
      minHeight: '100vh',
      fontFamily: 'monospace'
    }}>
      {/* Header */}
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ 
          fontSize: '24px', 
          fontWeight: 'bold', 
          marginBottom: '10px',
          color: '#38bdf8' 
        }}>
          Access: Micro-Scale Data
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '14px' }}>
          Real-time granular metrics and system insights
        </p>
      </div>

      {/* Celebrations */}
      {celebrationQueue.length > 0 && (
        <div style={{
          backgroundColor: '#059669',
          color: 'white',
          padding: '12px 16px',
          borderRadius: '8px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <span style={{ fontSize: '18px' }}>🎉</span>
          <div>
            {celebrationQueue.map((celebration, idx) => (
              <div key={idx} style={{ fontSize: '14px', fontWeight: 'bold' }}>
                {celebration}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* System Health Panel */}
      <div style={{
        backgroundColor: '#1e293b',
        border: '1px solid #334155',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '20px'
      }}>
        <h3 style={{ marginBottom: '16px', color: '#38bdf8' }}>System Health</h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '12px'
        }}>
          {[
            { label: 'WebSocket', value: systemHealth.websocket },
            { label: 'MCP Servers', value: systemHealth.mcp_servers },
            { label: 'Memory Usage', value: `${systemHealth.memory_usage}%` },
            { label: 'Active Agents', value: systemHealth.active_agents.toString() }
          ].map((item, idx) => {
            const health = getHealthStatus(item.value);
            return (
              <div key={idx} style={{
                backgroundColor: '#0f172a',
                padding: '12px',
                borderRadius: '6px',
                border: '1px solid #334155'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '4px'
                }}>
                  <span style={{ color: health.color, fontSize: '12px' }}>
                    {health.icon}
                  </span>
                  <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                    {item.label}
                  </span>
                </div>
                <div style={{ 
                  fontSize: '14px', 
                  fontWeight: 'bold',
                  color: health.color,
                  textTransform: 'uppercase'
                }}>
                  {item.value}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Micro-Metrics Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '30px'
      }}>
        {microMetrics.map((metric) => {
          const color = getMetricColor(metric);
          const isSelected = selectedMetric === metric.id;
          
          return (
            <div
              key={metric.id}
              onClick={() => setSelectedMetric(isSelected ? null : metric.id)}
              onDoubleClick={() => setModalMetric(metric)}
              style={{
                backgroundColor: isSelected ? '#1e40af' : '#1e293b',
                border: `2px solid ${isSelected ? '#3b82f6' : '#334155'}`,
                borderRadius: '8px',
                padding: '16px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '8px'
              }}>
                <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                  {metric.label}
                </span>
                <span style={{ 
                  color: color, 
                  fontSize: '14px',
                  fontWeight: 'bold' 
                }}>
                  {getTrendIcon(metric.trend)}
                </span>
              </div>
              
              <div style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: color,
                marginBottom: '4px'
              }}>
                {metric.value}
                {metric.unit && (
                  <span style={{ fontSize: '14px', color: '#94a3b8' }}>
                    {metric.unit}
                  </span>
                )}
              </div>

              {/* Threshold indicator */}
              {metric.threshold && (
                <div style={{
                  height: '4px',
                  backgroundColor: '#334155',
                  borderRadius: '2px',
                  overflow: 'hidden'
                }}>
                  <div
                    style={{
                      height: '100%',
                      backgroundColor: color,
                      width: `${Math.min(100, ((metric.value as number) / 100) * 100)}%`,
                      transition: 'width 0.3s ease'
                    }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Agent Micro-Status */}
      <div style={{
        backgroundColor: '#1e293b',
        border: '1px solid #334155',
        borderRadius: '8px',
        padding: '16px'
      }}>
        <h3 style={{ marginBottom: '16px', color: '#38bdf8' }}>
          Agent Micro-Status
        </h3>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
          gap: '8px'
        }}>
          {agents.map((agent) => {
            const timeSinceActivity = Date.now() - new Date(agent.status.lastActivity ?? 0).getTime();
            const isRecent = timeSinceActivity < 30000;
            
            return (
              <div
                key={agent.id}
                onClick={() => onAgentInteraction?.(agent.id, 'inspect')}
                style={{
                  backgroundColor: isRecent ? '#0f172a' : '#111827',
                  border: `1px solid ${isRecent ? '#3b82f6' : '#374151'}`,
                  borderRadius: '6px',
                  padding: '8px',
                  cursor: 'pointer',
                  position: 'relative'
                }}
              >
                {/* Activity pulse for recent activity */}
                {isRecent && (
                  <div style={{
                    position: 'absolute',
                    top: '4px',
                    right: '4px',
                    width: '6px',
                    height: '6px',
                    backgroundColor: '#10b981',
                    borderRadius: '50%',
                    animation: 'pulse 2s infinite'
                  }} />
                )}
                
                <div style={{
                  fontSize: '10px',
                  color: '#94a3b8',
                  marginBottom: '4px'
                }}>
                  {agent.name}
                </div>
                
                <div style={{
                  fontSize: '12px',
                  fontWeight: 'bold',
                  color: agent.status.state === 'error' ? '#ef4444' : 
                         agent.status.state === 'offline' ? '#6b7280' : '#10b981'
                }}>
                  {agent.status.efficiency || 0}%
                </div>
                
                <div style={{
                  fontSize: '8px',
                  color: '#64748b',
                  textTransform: 'uppercase'
                }}>
                  {agent.status.state}
                </div>
                
                {agent.status.progress !== undefined && (
                  <div style={{
                    height: '2px',
                    backgroundColor: '#334155',
                    borderRadius: '1px',
                    marginTop: '4px',
                    overflow: 'hidden'
                  }}>
                    <div
                      style={{
                        height: '100%',
                        backgroundColor: '#3b82f6',
                        width: `${agent.status.progress}%`,
                        transition: 'width 0.3s ease'
                      }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Metric Detail Modal */}
      <MetricDetailModal
        isOpen={modalMetric !== null}
        onClose={() => setModalMetric(null)}
        metricId={modalMetric?.id || ''}
        metricLabel={modalMetric?.label || ''}
        currentValue={modalMetric?.value || 0}
        threshold={modalMetric?.threshold}
        history={[]} // Could be enhanced with real historical data
      />

      {/* CSS animations */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};

export default AccessView;