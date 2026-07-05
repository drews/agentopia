import { useState, useEffect, useCallback } from 'react';
import { Agent } from '../agents/types';

interface SystemHealth {
  websocket: 'connected' | 'connecting' | 'disconnected';
  mcp_servers: 'online' | 'degraded' | 'offline';
  response_time: number;
  memory_usage: number;
  active_agents: number;
}

interface MetricsUpdate {
  timestamp: number;
  agents: Agent[];
  systemHealth: SystemHealth;
}

export const useSystemMetrics = (wsUrl: string, agents: Agent[]) => {
  const [systemHealth, setSystemHealth] = useState<SystemHealth>({
    websocket: 'disconnected',
    mcp_servers: 'offline',
    response_time: 0,
    memory_usage: 0,
    active_agents: 0
  });
  
  const [metricsHistory, setMetricsHistory] = useState<MetricsUpdate[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Simulate system metrics (replace with real WebSocket data)
  const generateMockMetrics = useCallback((): SystemHealth => {
    const baseResponseTime = 150;
    const variance = Math.random() * 100 - 50; // ±50ms variance
    
    return {
      websocket: agents.length > 0 ? 'connected' : 'connecting',
      mcp_servers: Math.random() > 0.1 ? 'online' : 'degraded',
      response_time: Math.max(50, baseResponseTime + variance),
      memory_usage: Math.round(45 + Math.random() * 20), // 45-65%
      active_agents: agents.filter(a => a.status.state !== 'offline').length
    };
  }, [agents]);

  // Update metrics every 2 seconds
  useEffect(() => {
    const updateMetrics = () => {
      const newMetrics = generateMockMetrics();
      setSystemHealth(newMetrics);
      setLastUpdate(new Date());
      
      // Keep last 50 metrics updates for trending
      setMetricsHistory(prev => {
        const newHistory = [...prev, {
          timestamp: Date.now(),
          agents: [...agents],
          systemHealth: newMetrics
        }];
        return newHistory.slice(-50);
      });
    };

    // Initial update
    updateMetrics();
    
    const interval = setInterval(updateMetrics, 2000);
    return () => clearInterval(interval);
  }, [generateMockMetrics, agents]);

  // Calculate trends from history
  const getTrend = useCallback((metric: keyof SystemHealth): 'up' | 'down' | 'stable' => {
    if (metricsHistory.length < 3) return 'stable';
    
    const recent = metricsHistory.slice(-3);
    const values = recent.map(h => h.systemHealth[metric] as number);
    
    if (values[2] > values[0] * 1.1) return 'up';
    if (values[2] < values[0] * 0.9) return 'down';
    return 'stable';
  }, [metricsHistory]);

  // Get performance score (0-100)
  const getPerformanceScore = useCallback((): number => {
    const weights = {
      response_time: 0.3,  // Lower is better
      memory_usage: 0.2,   // Lower is better
      agent_efficiency: 0.4, // Higher is better
      error_rate: 0.1      // Lower is better
    };

    const responseScore = Math.max(0, 100 - (systemHealth.response_time / 10));
    const memoryScore = Math.max(0, 100 - systemHealth.memory_usage);
    
    const avgEfficiency = agents.length > 0 
      ? agents.reduce((sum, a) => sum + (a.status.efficiency || 0), 0) / agents.length
      : 0;
    
    const errorRate = agents.length > 0
      ? (agents.filter(a => a.status.state === 'error').length / agents.length) * 100
      : 0;
    const errorScore = Math.max(0, 100 - errorRate * 10);

    const score = (
      responseScore * weights.response_time +
      memoryScore * weights.memory_usage +
      avgEfficiency * weights.agent_efficiency +
      errorScore * weights.error_rate
    );

    return Math.round(score);
  }, [systemHealth, agents]);

  // Detect anomalies in metrics
  const detectAnomalies = useCallback((): string[] => {
    const anomalies: string[] = [];
    
    if (systemHealth.response_time > 1000) {
      anomalies.push('High response time detected');
    }
    
    if (systemHealth.memory_usage > 90) {
      anomalies.push('Memory usage critically high');
    }
    
    const errorRate = agents.length > 0
      ? (agents.filter(a => a.status.state === 'error').length / agents.length) * 100
      : 0;
    
    if (errorRate > 25) {
      anomalies.push('High agent error rate');
    }
    
    const offlineRate = agents.length > 0
      ? (agents.filter(a => a.status.state === 'offline').length / agents.length) * 100
      : 0;
    
    if (offlineRate > 50) {
      anomalies.push('Many agents offline');
    }
    
    return anomalies;
  }, [systemHealth, agents]);

  return {
    systemHealth,
    metricsHistory,
    lastUpdate,
    getTrend,
    getPerformanceScore,
    detectAnomalies
  };
};