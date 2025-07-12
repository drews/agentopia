import React from 'react';
import { BaseAgentStrategy } from './BaseAgentStrategy';
import { Agent, AgentStatus, AgentType, AgentSize } from '../types';
import { RetroTheme } from '../themes/RetroTheme';

export class RetroAgentStrategy extends BaseAgentStrategy {
  constructor() {
    super(RetroTheme);
  }

  render(agent: Agent, size: AgentSize, interactive = false): React.ReactElement {
    const statusColor = this.getStatusColor(agent.status);
    const animationClass = this.getAnimationClass(agent.status.state);
    
    return React.createElement('div', {
      className: `retro-agent ${animationClass} ${interactive ? 'interactive' : ''}`,
      style: {
        width: `${size.width}px`,
        height: `${size.height}px`,
        backgroundColor: this.theme.colors.background,
        border: `1px solid ${statusColor}`,
        borderRadius: this.theme.borderRadius.small,
        padding: this.theme.spacing.sm,
        fontFamily: this.theme.typography.fontFamily,
        fontSize: this.theme.typography.fontSize.medium,
        color: this.theme.colors.text,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        cursor: interactive ? 'pointer' : 'default',
        transition: this.theme.animations.transition,
        boxShadow: agent.status.state === 'working' ? `0 0 8px ${statusColor}` : 'none',
        position: 'relative',
        overflow: 'hidden'
      }
    }, [
      // Scanline effect for retro aesthetic
      React.createElement('div', {
        key: 'scanlines',
        className: 'retro-scanlines',
        style: {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 255, 65, 0.1) 2px, rgba(0, 255, 65, 0.1) 4px)',
          pointerEvents: 'none',
          zIndex: 1
        }
      }),
      
      // Agent type and status row
      React.createElement('div', {
        key: 'header',
        style: {
          display: 'flex',
          width: '100%',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: this.theme.spacing.xs,
          zIndex: 2
        }
      }, [
        React.createElement('span', {
          key: 'type',
          style: {
            fontSize: this.theme.typography.fontSize.large,
            fontWeight: this.theme.typography.fontWeight.bold
          }
        }, this.getTypeEmoji(agent.type)),
        
        this.getStatusIndicator(agent.status)
      ]),
      
      // Agent name
      React.createElement('div', {
        key: 'name',
        style: {
          fontSize: this.theme.typography.fontSize.small,
          textAlign: 'center',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          marginBottom: this.theme.spacing.xs,
          color: statusColor,
          textShadow: `0 0 4px ${statusColor}`,
          zIndex: 2
        }
      }, agent.name),
      
      // Capabilities indicator
      React.createElement('div', {
        key: 'capabilities',
        style: {
          fontSize: this.theme.typography.fontSize.small,
          color: this.theme.colors.secondary,
          textAlign: 'center',
          zIndex: 2
        }
      }, [
        React.createElement('div', {
          key: 'primary',
          style: { marginBottom: '2px' }
        }, agent.capabilities.primary.toUpperCase()),
        
        React.createElement('div', {
          key: 'level',
          style: { fontSize: '8px' }
        }, this.getCapabilityLevel(agent.capabilities.level))
      ]),
      
      // Progress bar for working state
      agent.status.state === 'working' && agent.status.progress !== undefined
        ? this.generateProgressBar(agent.status.progress)
        : null,
      
      // Activity timestamp
      React.createElement('div', {
        key: 'timestamp',
        style: {
          fontSize: '8px',
          color: this.theme.colors.secondary,
          marginTop: this.theme.spacing.xs,
          zIndex: 2
        }
      }, this.formatTimestamp(agent.status.lastActivity))
    ]);
  }

  getStatusIndicator(status: AgentStatus): React.ReactElement {
    const color = this.getStatusColor(status);
    const symbol = this.getStatusSymbol(status.state);
    
    return React.createElement('div', {
      className: `retro-status-indicator status-${status.state}`,
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: this.theme.spacing.xs
      }
    }, [
      React.createElement('span', {
        key: 'symbol',
        style: {
          color: color,
          fontSize: this.theme.typography.fontSize.medium,
          textShadow: `0 0 4px ${color}`,
          animation: status.state === 'thinking' ? this.theme.animations.pulse : 'none'
        }
      }, symbol),
      
      status.efficiency !== undefined && React.createElement('span', {
        key: 'efficiency',
        style: {
          fontSize: '8px',
          color: this.theme.colors.secondary
        }
      }, `${status.efficiency}%`)
    ]);
  }

  getTypeIcon(type: AgentType): React.ReactElement {
    return React.createElement('span', {
      style: {
        fontSize: this.theme.typography.fontSize.large
      }
    }, this.getTypeEmoji(type));
  }

  private formatTimestamp(date?: Date): string {
    if (!date) return '--:--:--';
    return date.toLocaleTimeString('en-US', { 
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }
}