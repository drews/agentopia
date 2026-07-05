import React from 'react';

interface MetricDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  metricId: string;
  metricLabel: string;
  currentValue: number | string;
  history?: Array<{ timestamp: number; value: number }>;
  threshold?: {
    good: number;
    warning: number;
  };
}

const MetricDetailModal: React.FC<MetricDetailModalProps> = ({
  isOpen,
  onClose,
  metricId,
  metricLabel,
  currentValue,
  history = [],
  threshold
}) => {
  if (!isOpen) return null;

  const getMetricInsight = () => {
    switch (metricId) {
      case 'avg_efficiency':
        return {
          description: 'Average efficiency across all active agents',
          recommendations: [
            'Efficiency above 90% indicates excellent performance',
            'Consider load balancing if efficiency drops below 70%',
            'Review agent task assignments for optimization'
          ]
        };
      case 'response_time':
        return {
          description: 'Average system response time for agent interactions',
          recommendations: [
            'Response times under 200ms provide optimal user experience',
            'Times over 500ms may indicate system stress',
            'Check network connectivity and server load'
          ]
        };
      case 'error_rate':
        return {
          description: 'Percentage of agents currently in error state',
          recommendations: [
            'Zero errors is the ideal target',
            'Error rates above 10% require immediate attention',
            'Check agent logs for common failure patterns'
          ]
        };
      default:
        return {
          description: 'Real-time system metric',
          recommendations: ['Monitor trends for optimal performance']
        };
    }
  };

  const insight = getMetricInsight();

  // Simple sparkline chart using SVG
  const renderSparkline = () => {
    if (history.length < 2) return null;

    const width = 200;
    const height = 40;
    const values = history.map(h => h.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;

    const points = history.map((point, index) => {
      const x = (index / (history.length - 1)) * width;
      const y = height - ((point.value - min) / range) * height;
      return `${x},${y}`;
    }).join(' ');

    return (
      <div style={{ marginBottom: '16px' }}>
        <h4 style={{ fontSize: '14px', marginBottom: '8px', color: '#94a3b8' }}>
          Recent Trend
        </h4>
        <svg width={width} height={height} style={{ border: '1px solid #334155' }}>
          <polyline
            points={points}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="2"
          />
          {threshold && (
            <>
              <line
                x1="0"
                y1={height - ((threshold.good - min) / range) * height}
                x2={width}
                y2={height - ((threshold.good - min) / range) * height}
                stroke="#10b981"
                strokeWidth="1"
                strokeDasharray="3,3"
              />
              <line
                x1="0"
                y1={height - ((threshold.warning - min) / range) * height}
                x2={width}
                y2={height - ((threshold.warning - min) / range) * height}
                stroke="#f59e0b"
                strokeWidth="1"
                strokeDasharray="3,3"
              />
            </>
          )}
        </svg>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          fontSize: '10px',
          color: '#64748b',
          marginTop: '4px'
        }}>
          <span>{history.length > 0 ? new Date(history[0].timestamp).toLocaleTimeString() : ''}</span>
          <span>{history.length > 0 ? new Date(history[history.length - 1].timestamp).toLocaleTimeString() : ''}</span>
        </div>
      </div>
    );
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: '#1e293b',
        border: '1px solid #334155',
        borderRadius: '12px',
        padding: '24px',
        maxWidth: '500px',
        width: '90%',
        maxHeight: '80vh',
        overflow: 'auto',
        color: '#e2e8f0'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <h3 style={{ 
            fontSize: '18px', 
            fontWeight: 'bold',
            color: '#38bdf8'
          }}>
            {metricLabel}
          </h3>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              fontSize: '18px',
              cursor: 'pointer',
              padding: '4px'
            }}
          >
            ×
          </button>
        </div>

        {/* Current Value */}
        <div style={{
          backgroundColor: '#0f172a',
          padding: '16px',
          borderRadius: '8px',
          marginBottom: '20px',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '32px',
            fontWeight: 'bold',
            color: '#3b82f6',
            marginBottom: '4px'
          }}>
            {currentValue}
          </div>
          <div style={{
            fontSize: '12px',
            color: '#94a3b8',
            textTransform: 'uppercase'
          }}>
            Current Value
          </div>
        </div>

        {/* Sparkline Chart */}
        {renderSparkline()}

        {/* Thresholds */}
        {threshold && (
          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ fontSize: '14px', marginBottom: '8px', color: '#94a3b8' }}>
              Performance Thresholds
            </h4>
            <div style={{ display: 'flex', gap: '12px', fontSize: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div style={{
                  width: '12px',
                  height: '2px',
                  backgroundColor: '#10b981'
                }} />
                <span>Good: {threshold.good}+</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div style={{
                  width: '12px',
                  height: '2px',
                  backgroundColor: '#f59e0b'
                }} />
                <span>Warning: {threshold.warning}+</span>
              </div>
            </div>
          </div>
        )}

        {/* Description */}
        <div style={{ marginBottom: '20px' }}>
          <h4 style={{ fontSize: '14px', marginBottom: '8px', color: '#94a3b8' }}>
            Description
          </h4>
          <p style={{ fontSize: '14px', lineHeight: '1.5', color: '#cbd5e1' }}>
            {insight.description}
          </p>
        </div>

        {/* Recommendations */}
        <div>
          <h4 style={{ fontSize: '14px', marginBottom: '8px', color: '#94a3b8' }}>
            Recommendations
          </h4>
          <ul style={{ 
            fontSize: '14px', 
            lineHeight: '1.5',
            color: '#cbd5e1',
            paddingLeft: '16px'
          }}>
            {insight.recommendations.map((rec, index) => (
              <li key={index} style={{ marginBottom: '4px' }}>
                {rec}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default MetricDetailModal;