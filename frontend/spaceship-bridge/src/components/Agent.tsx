import React, { useState } from 'react';

// Simplified types (consolidated from agents/types.ts)
export interface AgentStatus {
  state: 'idle' | 'thinking' | 'working' | 'moving' | 'communicating' | 'error' | 'offline';
  progress?: number;
  efficiency?: number;
}

export interface Agent {
  id: string;
  name: string;
  type: 'commander' | 'scientist' | 'engineer' | 'navigator' | 'communications' | 'medical' | 'security' | 'operations';
  status: AgentStatus;
  position: { x: number; y: number };
}

interface AgentProps {
  agent: Agent;
  size?: { width: number; height: number };
  theme?: 'lcars' | 'modern' | 'minimal';
  interactive?: boolean;
  onClick?: (agent: Agent) => void;
  onHover?: (agent: Agent) => void;
}

// Simplified theme definitions (no separate files)
const themes = {
  lcars: {
    colors: {
      primary: '#FF9933',
      secondary: '#3366CC', 
      background: '#000000',
      text: '#FFCC99',
      status: {
        idle: '#CCCCCC',
        thinking: '#FFFF66',
        working: '#66FF99',
        moving: '#66FF99',
        communicating: '#66FF99',
        error: '#FF6666',
        offline: '#FF6666'
      }
    },
    border: '15px 0 15px 0',
    font: "'Arial Narrow', 'Helvetica Condensed', sans-serif"
  },
  modern: {
    colors: {
      primary: '#3b82f6',
      secondary: '#1e40af',
      background: '#f8fafc',
      text: '#1e293b',
      status: {
        idle: '#64748b',
        thinking: '#f59e0b',
        working: '#10b981',
        moving: '#3b82f6',
        communicating: '#8b5cf6',
        error: '#ef4444',
        offline: '#9ca3af'
      }
    },
    border: '8px',
    font: '"Inter", system-ui, sans-serif'
  },
  minimal: {
    colors: {
      primary: '#374151',
      secondary: '#6b7280',
      background: '#ffffff',
      text: '#111827',
      status: {
        idle: '#9ca3af',
        thinking: '#f59e0b',
        working: '#059669',
        moving: '#3b82f6',
        communicating: '#7c3aed',
        error: '#dc2626',
        offline: '#6b7280'
      }
    },
    border: '4px',
    font: 'system-ui, sans-serif'
  }
};

// Simplified emoji mapping (no separate functions)
const typeEmojis = {
  commander: '⭐',
  scientist: '🔬',
  engineer: '🔧',
  navigator: '🧭',
  communications: '📡',
  medical: '⚕️',
  security: '🛡️',
  operations: '⚙️'
};

const statusSymbols = {
  idle: '⏸️',
  thinking: '💭',
  working: '⚡',
  moving: '🚀',
  communicating: '📡',
  error: '❌',
  offline: '🔴'
};

const Agent: React.FC<AgentProps> = ({
  agent,
  size = { width: 120, height: 160 },
  theme = 'lcars',
  interactive = false,
  onClick,
  onHover
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const currentTheme = themes[theme];
  const statusColor = currentTheme.colors.status[agent.status.state];

  const handleClick = () => {
    if (interactive && onClick) {
      onClick(agent);
    }
  };

  const handleMouseEnter = () => {
    if (interactive) {
      setIsHovered(true);
      onHover?.(agent);
    }
  };

  const handleMouseLeave = () => {
    if (interactive) {
      setIsHovered(false);
    }
  };

  const needsAttention = agent.status.state === 'error' || agent.status.state === 'offline';
  
  return (
    <div
      style={{
        width: `${size.width}px`,
        height: `${size.height}px`,
        backgroundColor: currentTheme.colors.background,
        border: `2px solid ${needsAttention ? statusColor : currentTheme.colors.primary}`,
        borderRadius: currentTheme.border,
        position: 'relative',
        cursor: interactive ? 'pointer' : 'default',
        fontFamily: currentTheme.font,
        fontWeight: 'bold',
        fontSize: '12px',
        textTransform: 'uppercase',
        color: currentTheme.colors.text,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px',
        transform: isHovered && interactive ? 'scale(1.05)' : 'scale(1)',
        transition: 'all 0.2s ease',
        boxShadow: needsAttention ? `0 0 8px ${statusColor}` : 'none'
      }}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      role={interactive ? 'button' : 'img'}
      aria-label={`${agent.name}, ${agent.type} agent, status: ${agent.status.state}`}
    >
      {/* Status bar */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '20px',
          backgroundColor: statusColor,
          borderRadius: theme === 'lcars' ? '13px 0 0 0' : `${currentTheme.border} ${currentTheme.border} 0 0`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '8px',
          color: theme === 'lcars' ? '#000000' : '#ffffff'
        }}
      >
        {agent.status.state.toUpperCase()}
      </div>

      {/* Agent icon */}
      <div style={{ 
        fontSize: '24px', 
        color: currentTheme.colors.primary,
        marginTop: '20px'
      }}>
        {typeEmojis[agent.type]}
      </div>

      {/* Status symbol */}
      <div style={{ 
        fontSize: '16px',
        animation: ['thinking', 'working', 'communicating'].includes(agent.status.state) 
          ? 'pulse 1.5s infinite' : 'none'
      }}>
        {statusSymbols[agent.status.state]}
      </div>

      {/* Efficiency bars */}
      {agent.status.efficiency !== undefined && agent.status.efficiency > 0 && (
        <div style={{ display: 'flex', gap: '1px', marginBottom: '8px' }}>
          {Array.from({ length: 4 }, (_, i) => (
            <div
              key={i}
              style={{
                width: '3px',
                height: i < Math.ceil((agent.status.efficiency! / 100) * 4) ? '8px' : '3px',
                backgroundColor: i < Math.ceil((agent.status.efficiency! / 100) * 4) 
                  ? (agent.status.efficiency! > 80 ? '#66FF99' : agent.status.efficiency! > 50 ? '#FFAA00' : '#FF6666')
                  : 'rgba(255,255,255,0.3)',
                borderRadius: '1px'
              }}
            />
          ))}
        </div>
      )}

      {/* Name */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '20px',
          backgroundColor: currentTheme.colors.primary,
          borderRadius: theme === 'lcars' ? '0 0 13px 13px' : `0 0 ${currentTheme.border} ${currentTheme.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '8px',
          color: theme === 'lcars' ? '#000000' : '#ffffff',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}
      >
        {agent.name.toUpperCase()}
      </div>

      {/* Attention indicator */}
      <div
        style={{
          position: 'absolute',
          top: '0px',
          right: '0px',
          width: needsAttention ? '20px' : '12px',
          height: needsAttention ? '20px' : '12px',
          backgroundColor: needsAttention ? statusColor : currentTheme.colors.secondary,
          borderRadius: theme === 'lcars' ? '0 13px 0 8px' : `0 ${currentTheme.border} 0 ${currentTheme.border}`,
          animation: needsAttention ? 'pulse 1s infinite' : 'none'
        }}
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

export default Agent;