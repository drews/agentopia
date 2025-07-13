import React from 'react';
import { BaseAgentStrategy } from './BaseAgentStrategy';
import { Agent, AgentStatus, AgentType, AgentSize } from '../types';
import { ModernTheme } from '../themes/ModernTheme';

export class ModernAgentStrategy extends BaseAgentStrategy {
  constructor() {
    super(ModernTheme);
  }

  render(agent: Agent, size: AgentSize, interactive = false): React.ReactElement {
    const statusColor = this.getStatusColor(agent.status);
    const animationClass = this.getAnimationClass(agent.status.state);
    
    return React.createElement('div', {
      className: `modern-agent ${animationClass} ${interactive ? 'interactive' : ''}`,
      style: {
        width: `${size.width}px`,
        height: `${size.height}px`,
        background: `linear-gradient(135deg, ${this.theme.colors.background} 0%, #f1f5f9 100%)`,
        border: `1px solid ${this.theme.colors.border}`,
        borderRadius: this.theme.borderRadius.large,
        padding: this.theme.spacing.md,
        fontFamily: this.theme.typography.fontFamily,
        fontSize: this.theme.typography.fontSize.medium,
        color: this.theme.colors.text,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        cursor: interactive ? 'pointer' : 'default',
        transition: this.theme.animations.transition,
        boxShadow: interactive 
          ? '0 4px 12px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0, 0, 0, 0.05)' 
          : '0 2px 8px rgba(0, 0, 0, 0.1)',
        position: 'relative',
        overflow: 'hidden'
      }
    }, [
      // Status glow effect
      React.createElement('div', {
        key: 'glow',
        style: {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: `linear-gradient(90deg, transparent 0%, ${statusColor} 50%, transparent 100%)`,
          opacity: agent.status.state === 'working' ? 0.8 : 0.4,
          animation: agent.status.state === 'working' ? 'modern-glow 2s infinite' : 'none'
        }
      }),
      
      // Agent avatar and type
      React.createElement('div', {
        key: 'avatar',
        style: {
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          marginBottom: this.theme.spacing.sm
        }
      }, [
        React.createElement('div', {
          key: 'type-badge',
          style: {
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: statusColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px',
            marginBottom: this.theme.spacing.sm,
            boxShadow: `0 0 20px ${statusColor}20`
          }
        }, this.getTypeEmoji(agent.type)),
        
        React.createElement('div', {
          key: 'name',
          style: {
            fontSize: this.theme.typography.fontSize.medium,
            fontWeight: this.theme.typography.fontWeight.bold,
            textAlign: 'center',
            color: this.theme.colors.text
          }
        }, agent.name)
      ]),
      
      // Status and capabilities
      React.createElement('div', {
        key: 'info',
        style: {
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: this.theme.spacing.sm,
          width: '100%'
        }
      }, [
        this.getStatusIndicator(agent.status),
        
        React.createElement('div', {
          key: 'capabilities',
          style: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: this.theme.spacing.xs
          }
        }, [
          React.createElement('span', {
            key: 'primary',
            style: {
              fontSize: this.theme.typography.fontSize.small,
              color: this.theme.colors.secondary,
              textTransform: 'capitalize',
              fontWeight: this.theme.typography.fontWeight.bold
            }
          }, agent.capabilities.primary),
          
          React.createElement('span', {
            key: 'level',
            style: {
              fontSize: this.theme.typography.fontSize.small,
              color: this.theme.colors.primary
            }
          }, this.getCapabilityLevel(agent.capabilities.level))
        ])
      ]),
      
      // Progress bar for working state
      agent.status.state === 'working' && agent.status.progress !== undefined
        ? React.createElement('div', {
            key: 'progress-container',
            style: {
              width: '100%',
              marginTop: this.theme.spacing.sm
            }
          }, [
            this.generateProgressBar(agent.status.progress),
            React.createElement('div', {
              key: 'progress-text',
              style: {
                fontSize: this.theme.typography.fontSize.small,
                color: this.theme.colors.secondary,
                textAlign: 'center',
                marginTop: this.theme.spacing.xs
              }
            }, `${agent.status.progress}% Complete`)
          ])
        : null
    ]);
  }

  getStatusIndicator(status: AgentStatus): React.ReactElement {
    const color = this.getStatusColor(status);
    
    return React.createElement('div', {
      className: `modern-status-indicator status-${status.state}`,
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: this.theme.spacing.sm,
        padding: `${this.theme.spacing.xs} ${this.theme.spacing.sm}`,
        backgroundColor: `${color}15`,
        borderRadius: this.theme.borderRadius.medium,
        border: `1px solid ${color}30`
      }
    }, [
      React.createElement('div', {
        key: 'indicator',
        style: {
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          backgroundColor: color,
          boxShadow: `0 0 8px ${color}`,
          animation: status.state === 'thinking' ? this.theme.animations.pulse : 'none'
        }
      }),
      
      React.createElement('span', {
        key: 'status-text',
        style: {
          fontSize: this.theme.typography.fontSize.small,
          color: color,
          fontWeight: this.theme.typography.fontWeight.bold,
          textTransform: 'capitalize'
        }
      }, status.state),
      
      status.efficiency !== undefined && React.createElement('span', {
        key: 'efficiency',
        style: {
          fontSize: this.theme.typography.fontSize.small,
          color: this.theme.colors.secondary,
          marginLeft: 'auto'
        }
      }, `${status.efficiency}%`)
    ]);
  }

  getTypeIcon(type: AgentType): React.ReactElement {
    return React.createElement('span', {
      style: {
        fontSize: '18px'
      }
    }, this.getTypeEmoji(type));
  }
}