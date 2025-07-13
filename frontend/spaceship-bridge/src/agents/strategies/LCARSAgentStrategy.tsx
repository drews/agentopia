import React from 'react';
import { BaseAgentStrategy } from './BaseAgentStrategy';
import { Agent, AgentStatus, AgentType, AgentSize } from '../types';

// LCARS Semantic Color System - Color frames attention and meaning
// 
// Color Semantics (based on LCARS manifesto principles):
// - Orange frames: Primary controls and navigation (command functions)
// - Blue frames: Information display and critical data (science/analysis)
// - Purple frames: Secondary functions and auxiliary systems
// - Green: Operational/active status (systems working normally)
// - Yellow: Caution/processing status (systems thinking/analyzing)
// - Red: Critical/error status (requires immediate attention)
// - Gray: Neutral/idle status (systems on standby)
//
const LCARSColors = {
  background: '#000000',
  
  // Primary attention frames (most important information)
  primaryOrange: '#FF9933', // neon-carrot - Primary controls and navigation
  primaryBlue: '#3366CC',   // mariner - Critical information display
  
  // Secondary frames (supporting information)
  secondaryOrange: '#FFCC99', // atomic-tangerine - Secondary controls
  secondaryBlue: '#99CCFF',   // anakiwa - General information
  secondaryPurple: '#9999FF', // melrose - Analysis and secondary functions
  
  // Status indication frames
  statusOperational: '#66FF99', // Active/working systems
  statusCaution: '#FFFF66',     // Thinking/processing states
  statusCritical: '#FF6666',    // Error/offline states
  statusNeutral: '#CCCCCC',     // Idle/standby states
  
  // Alert state overrides
  alertRed: '#FF0000',
  alertBlue: '#0066FF',
  alertYellow: '#FFFF00',
  
  // Text colors
  textPrimary: '#FFCC99',
  textSecondary: '#99CCFF',
  textOnColor: '#000000'
};

// Operational Context for Dynamic Color Schemes
interface OperationalContext {
  alertLevel: 'normal' | 'yellow' | 'red' | 'blue';
  systemEfficiency: number;
  criticalAgentCount: number;
}

export class LCARSAgentStrategy extends BaseAgentStrategy {
  private operationalContext: OperationalContext = {
    alertLevel: 'normal',
    systemEfficiency: 100,
    criticalAgentCount: 0
  };

  constructor() {
    super({
      name: 'lcars',
      description: 'Star Trek LCARS interface with adaptive, personalized design philosophy',
      colors: {
        primary: LCARSColors.primaryOrange,
        secondary: LCARSColors.secondaryBlue,
        accent: LCARSColors.secondaryPurple,
        background: LCARSColors.background,
        text: LCARSColors.textPrimary,
        border: LCARSColors.primaryBlue,
        status: {
          idle: LCARSColors.statusNeutral,
          thinking: LCARSColors.statusCaution,
          working: LCARSColors.statusOperational,
          moving: LCARSColors.statusOperational,
          communicating: LCARSColors.statusOperational,
          error: LCARSColors.statusCritical,
          offline: LCARSColors.statusCritical
        }
      },
      typography: {
        fontFamily: "'Arial Narrow', 'Helvetica Condensed', sans-serif",
        fontSize: {
          small: '10px',
          medium: '12px',
          large: '14px'
        },
        fontWeight: {
          normal: 400,
          bold: 700
        }
      },
      spacing: {
        xs: '2px',
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px'
      },
      borderRadius: {
        small: '15px',
        medium: '20px',
        large: '25px'
      },
      animations: {
        transition: 'all 0.3s ease',
        pulse: 'lcars-pulse 2s infinite',
        glow: 'lcars-frame-glow 3s infinite',
        bounce: 'lcars-status-pulse 1s infinite'
      }
    });
  }

  // Update operational context to influence color schemes dynamically
  updateOperationalContext(context: Partial<OperationalContext>): void {
    this.operationalContext = { ...this.operationalContext, ...context };
  }

  // Auto-detect operational context from agent state (would be called by parent system)
  private detectOperationalContext(agent: Agent): void {
    // Determine alert level based on agent states
    if (agent.status.state === 'error' || agent.status.state === 'offline') {
      this.operationalContext.alertLevel = 'red';
    } else if (agent.status.efficiency && agent.status.efficiency < 50) {
      this.operationalContext.alertLevel = 'yellow';
    }
    
    // Update system efficiency context
    if (agent.status.efficiency) {
      this.operationalContext.systemEfficiency = agent.status.efficiency;
    }
  }

  // Dynamic color adjustment based on operational context
  private getContextualColor(baseColor: string, alertOverride = true): string {
    if (!alertOverride) return baseColor;
    
    switch (this.operationalContext.alertLevel) {
      case 'red':
        // Red alert: Override with red/white scheme
        return baseColor === LCARSColors.primaryOrange || baseColor === LCARSColors.primaryBlue ? 
               LCARSColors.alertRed : baseColor;
      case 'yellow':
        // Yellow alert: Add yellow tinting
        return baseColor === LCARSColors.primaryOrange ? 
               LCARSColors.alertYellow : baseColor;
      case 'blue':
        // Blue alert: Override with blue/white scheme  
        return baseColor === LCARSColors.primaryOrange ? 
               LCARSColors.alertBlue : baseColor;
      default:
        return baseColor;
    }
  }

  render(agent: Agent, size: AgentSize, interactive = false): React.ReactElement {
    // Auto-detect and update operational context
    this.detectOperationalContext(agent);
    
    const basePrimaryColor = this.getLCARSPrimaryColor(agent);
    const baseStatusColor = this.getLCARSStatusColor(agent.status.state);
    const baseAccentColor = this.getLCARSAccentColor(agent);
    
    // Apply contextual color modifications for dynamic response to operational state
    const primaryColor = this.getContextualColor(basePrimaryColor);
    const statusColor = this.getContextualColor(baseStatusColor, false); // Status colors stay semantic
    const accentColor = this.getContextualColor(baseAccentColor);
    
    // Determine if this agent needs high attention (critical states or high importance)
    const needsAttention = agent.status.state === 'error' || 
                          agent.status.state === 'offline' ||
                          (agent.status.efficiency && agent.status.efficiency < 60) ||
                          agent.type === AgentType.COMMANDER;
    
    return React.createElement('div', {
      className: `lcars-agent agent-${agent.type} ${interactive ? 'interactive' : ''}`,
      style: {
        width: `${size.width}px`,
        height: `${size.height}px`,
        backgroundColor: LCARSColors.background,
        position: 'relative',
        cursor: interactive ? 'pointer' : 'default',
        fontFamily: this.theme.typography.fontFamily,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        border: needsAttention ? `3px solid ${accentColor}` : `2px solid ${primaryColor}`,
        borderRadius: '15px 0 15px 0',
        boxShadow: needsAttention ? `0 0 8px ${accentColor}` : 'none'
      }
    }, [
      // Top status bar
      React.createElement('div', {
        key: 'status-bar',
        style: {
          position: 'absolute',
          top: '0',
          left: '0',
          right: '0',
          height: '20px',
          backgroundColor: statusColor,
          borderRadius: '13px 0 0 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }
      }, [
        React.createElement('span', {
          key: 'status-text',
          style: {
            fontSize: '8px',
            color: LCARSColors.textOnColor,
            fontWeight: 'bold',
            letterSpacing: '1px'
          }
        }, agent.status.state.toUpperCase())
      ]),
      
      // Main content area
      React.createElement('div', {
        key: 'main-content',
        style: {
          position: 'absolute',
          top: '25px',
          left: '8px',
          right: '8px',
          bottom: '25px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '4px'
        }
      }, [
        // Agent type icon
        React.createElement('div', {
          key: 'type-icon',
          style: {
            fontSize: '20px',
            color: primaryColor
          }
        }, this.getTypeEmoji(agent.type)),
        
        // Status indicator
        this.getLCARSStatusElement(agent.status),
        
        // Efficiency bars (only if high enough to be meaningful)
        agent.status.efficiency !== undefined && agent.status.efficiency > 0 &&
        React.createElement('div', {
          key: 'efficiency-display',
          style: {
            display: 'flex',
            alignItems: 'center',
            gap: '1px',
            marginTop: '2px'
          }
        }, this.generateLCARSEfficiencyBars(agent.status.efficiency))
      ]),
      
      // Bottom frame with name
      React.createElement('div', {
        key: 'name-frame',
        style: {
          position: 'absolute',
          bottom: '0',
          left: '0',
          right: '0',
          height: '20px',
          backgroundColor: primaryColor,
          borderRadius: '0 0 13px 13px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden'
        }
      }, [
        React.createElement('span', {
          key: 'agent-name',
          style: {
            fontSize: '8px',
            color: LCARSColors.textOnColor,
            fontWeight: 'bold',
            textAlign: 'center',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: '90%',
            letterSpacing: '0.5px'
          }
        }, agent.name.toUpperCase())
      ]),
      
      // Attention indicator - larger and more prominent for critical agents
      React.createElement('div', {
        key: 'attention-indicator',
        style: {
          position: 'absolute',
          top: '0px',
          right: '0px',
          width: needsAttention ? '20px' : '12px',
          height: needsAttention ? '20px' : '12px',
          backgroundColor: accentColor,
          borderRadius: '0 13px 0 8px',
          animation: needsAttention ? 'lcars-attention-pulse 1s infinite' : 'none'
        }
      })
    ]);
  }

  // Get basic type color (for type icons and simple displays)
  private getLCARSTypeColor(type: AgentType): string {
    const typeMap: Record<AgentType, string> = {
      [AgentType.COMMANDER]: LCARSColors.primaryOrange,
      [AgentType.SCIENTIST]: LCARSColors.primaryBlue,
      [AgentType.ENGINEER]: LCARSColors.secondaryOrange,
      [AgentType.NAVIGATOR]: LCARSColors.secondaryPurple,
      [AgentType.COMMUNICATIONS]: LCARSColors.secondaryBlue,
      [AgentType.SECURITY]: LCARSColors.primaryOrange,
      [AgentType.MEDICAL]: LCARSColors.secondaryBlue,
      [AgentType.OPERATIONS]: LCARSColors.secondaryPurple
    };
    return typeMap[type] || LCARSColors.primaryOrange;
  }

  // Attention-based color selection - Primary frame indicates importance level
  private getLCARSPrimaryColor(agent: Agent): string {
    // High-importance agents get primary attention colors
    const isHighImportance = agent.type === AgentType.COMMANDER || 
                           agent.capabilities.level === 'master' ||
                           (agent.status.efficiency && agent.status.efficiency > 90);
    
    if (isHighImportance) {
      // Use primary attention colors for critical agents
      const primaryMap: Record<AgentType, string> = {
        [AgentType.COMMANDER]: LCARSColors.primaryOrange,    // Command gets primary orange
        [AgentType.SCIENTIST]: LCARSColors.primaryBlue,      // Science gets primary blue  
        [AgentType.ENGINEER]: LCARSColors.primaryOrange,     // Engineering critical
        [AgentType.NAVIGATOR]: LCARSColors.primaryBlue,      // Navigation critical
        [AgentType.COMMUNICATIONS]: LCARSColors.primaryBlue, // Comms critical
        [AgentType.SECURITY]: LCARSColors.primaryOrange,     // Security critical
        [AgentType.MEDICAL]: LCARSColors.primaryBlue,        // Medical critical
        [AgentType.OPERATIONS]: LCARSColors.primaryOrange    // Ops critical
      };
      return primaryMap[agent.type] || LCARSColors.primaryOrange;
    }
    
    // Standard agents get secondary attention colors
    const secondaryMap: Record<AgentType, string> = {
      [AgentType.COMMANDER]: LCARSColors.secondaryOrange,
      [AgentType.SCIENTIST]: LCARSColors.secondaryBlue,
      [AgentType.ENGINEER]: LCARSColors.secondaryOrange,
      [AgentType.NAVIGATOR]: LCARSColors.secondaryPurple,
      [AgentType.COMMUNICATIONS]: LCARSColors.secondaryBlue,
      [AgentType.SECURITY]: LCARSColors.secondaryOrange,
      [AgentType.MEDICAL]: LCARSColors.secondaryBlue,
      [AgentType.OPERATIONS]: LCARSColors.secondaryPurple
    };
    return secondaryMap[agent.type] || LCARSColors.secondaryOrange;
  }

  // Status frames use semantic colors to indicate operational state
  private getLCARSStatusColor(state: string): string {
    const statusMap: Record<string, string> = {
      'idle': LCARSColors.statusNeutral,        // Neutral for standby
      'thinking': LCARSColors.statusCaution,    // Yellow for processing
      'working': LCARSColors.statusOperational, // Green for active work
      'moving': LCARSColors.statusOperational,  // Green for active movement
      'communicating': LCARSColors.statusOperational, // Green for active comms
      'error': LCARSColors.statusCritical,      // Red for problems
      'offline': LCARSColors.statusCritical     // Red for offline
    };
    return statusMap[state] || LCARSColors.statusNeutral;
  }

  // Attention accent - draws eye to most critical information
  private getLCARSAccentColor(agent: Agent): string {
    // Red accent for critical issues that need immediate attention
    if (agent.status.state === 'error' || agent.status.state === 'offline') {
      return LCARSColors.statusCritical;
    }
    
    // Yellow accent for items that need monitoring
    if (agent.status.efficiency && agent.status.efficiency < 60) {
      return LCARSColors.statusCaution;
    }
    
    // Green accent for excellent performance
    if (agent.status.efficiency && agent.status.efficiency > 90) {
      return LCARSColors.statusOperational;
    }
    
    // Default to primary color for normal operation
    return this.getLCARSPrimaryColor(agent);
  }

  // Status visualization with LCARS aesthetic (minimalist)
  private getLCARSStatusElement(status: AgentStatus): React.ReactElement {
    const symbol = this.getStatusSymbol(status.state);
    const statusColor = this.getLCARSStatusColor(status.state);
    const shouldAnimate = ['thinking', 'working', 'communicating'].includes(status.state);
    
    return React.createElement('div', {
      style: {
        fontSize: '12px',
        color: statusColor,
        animation: shouldAnimate ? 'lcars-status-pulse 1.5s infinite' : 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '14px',
        // Add background frame for critical status states to draw attention
        backgroundColor: ['error', 'offline'].includes(status.state) ? 
                        'rgba(255, 102, 102, 0.2)' : 'transparent',
        borderRadius: ['error', 'offline'].includes(status.state) ? '4px' : '0',
        padding: ['error', 'offline'].includes(status.state) ? '2px 4px' : '0'
      }
    }, symbol);
  }

  // LCARS-style efficiency visualization (simplified)
  private generateLCARSEfficiencyBars(efficiency: number): React.ReactElement[] {
    const barCount = 4;
    const activeCount = Math.ceil((efficiency / 100) * barCount);
    const efficiencyColor = efficiency > 80 ? LCARSColors.statusOperational : 
                           efficiency > 50 ? LCARSColors.secondaryOrange : 
                           LCARSColors.statusCritical;
    
    return Array.from({ length: barCount }, (_, i) => 
      React.createElement('div', {
        key: `efficiency-bar-${i}`,
        style: {
          width: '2px',
          height: i < activeCount ? '6px' : '2px',
          backgroundColor: i < activeCount ? efficiencyColor : 'rgba(255,255,255,0.2)',
          borderRadius: '1px'
        }
      })
    );
  }

  getStatusIndicator(status: AgentStatus): React.ReactElement {
    return React.createElement('div', {
      className: `lcars-status-indicator status-${status.state}`,
      style: {
        backgroundColor: this.getLCARSStatusColor(status.state),
        color: LCARSColors.background,
        padding: '2px 6px',
        borderRadius: '8px',
        fontSize: this.theme.typography.fontSize.small,
        fontWeight: 'bold'
      }
    }, status.state.toUpperCase());
  }

  getTypeIcon(type: AgentType): React.ReactElement {
    return React.createElement('div', {
      style: {
        backgroundColor: this.getLCARSTypeColor(type),
        color: LCARSColors.textOnColor,
        padding: '4px',
        borderRadius: '50%',
        fontSize: this.theme.typography.fontSize.medium
      }
    }, this.getTypeEmoji(type));
  }
}