import React from 'react';
import { BaseAgentStrategy } from './BaseAgentStrategy';
import { Agent, AgentStatus, AgentType, AgentSize } from '../types';
import { MinimalTheme } from '../themes/MinimalTheme';

export class MinimalAgentStrategy extends BaseAgentStrategy {
  constructor() {
    super(MinimalTheme);
  }

  render(agent: Agent, size: AgentSize, interactive = false): React.ReactElement {
    const statusColor = this.getStatusColor(agent.status);
    const animationClass = this.getAnimationClass(agent.status.state);
    
    return React.createElement('div', {
      className: `minimal-agent ${animationClass} ${interactive ? 'interactive' : ''}`,
      style: {
        width: `${size.width}px`,
        height: `${size.height}px`,
        backgroundColor: this.theme.colors.background,
        border: `1px solid ${this.theme.colors.border}`,
        borderRadius: this.theme.borderRadius.medium,
        padding: this.theme.spacing.md,
        fontFamily: this.theme.typography.fontFamily,
        fontSize: this.theme.typography.fontSize.medium,
        color: this.theme.colors.text,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: interactive ? 'pointer' : 'default',
        transition: this.theme.animations.transition,
        position: 'relative',
        borderLeftColor: statusColor,
        borderLeftWidth: '3px'
      }
    }, [
      // Simple type indicator
      React.createElement('div', {
        key: 'type',
        style: {
          fontSize: '24px',
          marginBottom: this.theme.spacing.sm,
          opacity: 0.8
        }
      }, this.getTypeEmoji(agent.type)),
      
      // Agent name
      React.createElement('div', {
        key: 'name',
        style: {
          fontSize: this.theme.typography.fontSize.medium,
          fontWeight: this.theme.typography.fontWeight.bold,
          textAlign: 'center',
          marginBottom: this.theme.spacing.sm,
          color: this.theme.colors.text
        }
      }, agent.name),
      
      // Minimal status indicator
      this.getStatusIndicator(agent.status),
      
      // Capability level (simplified)
      React.createElement('div', {
        key: 'level',
        style: {
          fontSize: this.theme.typography.fontSize.small,
          color: this.theme.colors.secondary,
          marginTop: this.theme.spacing.sm,
          textAlign: 'center'
        }
      }, agent.capabilities.level),
      
      // Progress for working state (simplified)
      agent.status.state === 'working' && agent.status.progress !== undefined
        ? React.createElement('div', {
            key: 'progress',
            style: {
              width: '100%',
              marginTop: this.theme.spacing.sm,
              textAlign: 'center'
            }
          }, [
            this.generateProgressBar(agent.status.progress),
            React.createElement('span', {
              key: 'progress-text',
              style: {
                fontSize: this.theme.typography.fontSize.small,
                color: this.theme.colors.secondary,
                marginTop: this.theme.spacing.xs,
                display: 'block'
              }
            }, `${agent.status.progress}%`)
          ])
        : null
    ]);
  }

  getStatusIndicator(status: AgentStatus): React.ReactElement {
    const color = this.getStatusColor(status);
    
    return React.createElement('div', {
      className: `minimal-status-indicator status-${status.state}`,
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: this.theme.spacing.sm
      }
    }, [
      React.createElement('div', {
        key: 'dot',
        style: {
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: color,
          animation: status.state === 'thinking' ? this.theme.animations.pulse : 'none'
        }
      }),
      
      React.createElement('span', {
        key: 'status',
        style: {
          fontSize: this.theme.typography.fontSize.small,
          color: this.theme.colors.secondary,
          textTransform: 'lowercase'
        }
      }, status.state)
    ]);
  }

  getTypeIcon(type: AgentType): React.ReactElement {
    return React.createElement('span', {
      style: {
        fontSize: '16px',
        opacity: 0.7
      }
    }, this.getTypeEmoji(type));
  }
}