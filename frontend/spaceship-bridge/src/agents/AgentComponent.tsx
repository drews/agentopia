import React, { useState, useEffect } from 'react';
import { Agent, AgentRepresentationStrategy, AgentSize, AgentInteractionHandlers, AgentDisplayPreferences } from './types';
import { RetroAgentStrategy } from './strategies/RetroAgentStrategy';
import { ModernAgentStrategy } from './strategies/ModernAgentStrategy';
import { MinimalAgentStrategy } from './strategies/MinimalAgentStrategy';

interface AgentComponentProps {
  agent: Agent;
  size?: AgentSize;
  theme?: string;
  interactive?: boolean;
  onInteraction?: AgentInteractionHandlers;
  preferences?: Partial<AgentDisplayPreferences>;
  className?: string;
}

const AgentComponent: React.FC<AgentComponentProps> = ({
  agent,
  size = { width: 120, height: 160 },
  theme = 'retro',
  interactive = false,
  onInteraction,
  preferences = {},
  className = ''
}) => {
  const [strategy, setStrategy] = useState<AgentRepresentationStrategy | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isSelected, setIsSelected] = useState(false);

  // Strategy factory
  useEffect(() => {
    const createStrategy = (themeName: string): AgentRepresentationStrategy => {
      switch (themeName) {
        case 'modern':
          return new ModernAgentStrategy();
        case 'minimal':
          return new MinimalAgentStrategy();
        case 'retro':
        default:
          return new RetroAgentStrategy();
      }
    };

    setStrategy(createStrategy(theme));
  }, [theme]);

  // Handle interactions
  const handleClick = (event: React.MouseEvent) => {
    if (!interactive || !onInteraction?.onClick) return;
    
    setIsSelected(!isSelected);
    onInteraction.onClick(agent);
  };

  const handleMouseEnter = () => {
    if (!interactive) return;
    
    setIsHovered(true);
    onInteraction?.onHover?.(agent);
  };

  const handleMouseLeave = () => {
    if (!interactive) return;
    
    setIsHovered(false);
  };

  const handleContextMenu = (event: React.MouseEvent) => {
    if (!interactive || !onInteraction?.onContextMenu) return;
    
    event.preventDefault();
    onInteraction.onContextMenu(agent, event);
  };

  if (!strategy) {
    return <div>Loading agent...</div>;
  }

  // Calculate responsive size
  const responsiveSize = {
    ...size,
    scale: preferences.compactMode ? 0.8 : 1
  };

  const finalSize = {
    width: Math.round(responsiveSize.width * (responsiveSize.scale || 1)),
    height: Math.round(responsiveSize.height * (responsiveSize.scale || 1))
  };

  return (
    <div 
      className={`agent-wrapper ${className} ${isHovered ? 'hovered' : ''} ${isSelected ? 'selected' : ''}`}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onContextMenu={handleContextMenu}
      style={{
        display: 'inline-block',
        position: 'relative',
        transform: isHovered && interactive ? 'scale(1.05)' : 'scale(1)',
        transition: 'transform 0.2s ease-out',
        zIndex: isHovered ? 10 : 1
      }}
      role={interactive ? 'button' : 'img'}
      tabIndex={interactive ? 0 : -1}
      aria-label={`${agent.name}, ${agent.type} agent, status: ${agent.status.state}`}
      aria-describedby={`agent-${agent.id}-description`}
    >
      {strategy.render(agent, finalSize, interactive)}
      
      {/* Tooltip */}
      {preferences.showTooltips && isHovered && (
        <div
          className="agent-tooltip"
          style={{
            position: 'absolute',
            top: `-${finalSize.height + 20}px`,
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            color: 'white',
            padding: '8px 12px',
            borderRadius: '6px',
            fontSize: '12px',
            whiteSpace: 'nowrap',
            zIndex: 1000,
            pointerEvents: 'none'
          }}
        >
          <div><strong>{agent.name}</strong></div>
          <div>{agent.type} • {agent.status.state}</div>
          {agent.capabilities.primary && (
            <div>Specialization: {agent.capabilities.primary}</div>
          )}
          {agent.status.efficiency !== undefined && (
            <div>Efficiency: {agent.status.efficiency}%</div>
          )}
        </div>
      )}
      
      {/* Screen reader description */}
      <div 
        id={`agent-${agent.id}-description`}
        className="sr-only"
        aria-hidden="true"
      >
        {agent.name} is a {agent.type} agent currently {agent.status.state}.
        Primary capability: {agent.capabilities.primary}.
        Experience level: {agent.capabilities.level}.
        {agent.status.efficiency !== undefined && ` Current efficiency: ${agent.status.efficiency}%.`}
        {agent.status.progress !== undefined && ` Task progress: ${agent.status.progress}%.`}
      </div>
    </div>
  );
};

export default AgentComponent;