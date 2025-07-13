import React from 'react';
import { Agent, AgentRepresentationStrategy, AgentStatus, AgentType, AgentSize, AgentThemeConfig } from '../types';

export abstract class BaseAgentStrategy implements AgentRepresentationStrategy {
  protected theme: AgentThemeConfig;

  constructor(theme: AgentThemeConfig) {
    this.theme = theme;
  }

  abstract render(agent: Agent, size: AgentSize, interactive?: boolean): React.ReactElement;
  abstract getStatusIndicator(status: AgentStatus): React.ReactElement;
  abstract getTypeIcon(type: AgentType): React.ReactElement;

  getAnimationClass(status: AgentStatus['state']): string {
    const baseClass = 'agent-animation';
    switch (status) {
      case 'thinking':
        return `${baseClass} thinking-pulse`;
      case 'working':
        return `${baseClass} working-glow`;
      case 'moving':
        return `${baseClass} moving-bounce`;
      case 'communicating':
        return `${baseClass} communicating-flash`;
      case 'error':
        return `${baseClass} error-shake`;
      case 'offline':
        return `${baseClass} offline-fade`;
      default:
        return `${baseClass} idle-subtle`;
    }
  }

  getThemeName(): string {
    return this.theme.name;
  }

  protected getStatusColor(status: AgentStatus): string {
    return this.theme.colors.status[status.state];
  }

  protected getTypeEmoji(type: AgentType): string {
    const typeEmojis = {
      [AgentType.COMMANDER]: '👨‍✈️',
      [AgentType.SCIENTIST]: '👩‍🔬',
      [AgentType.ENGINEER]: '👨‍🔧',
      [AgentType.NAVIGATOR]: '🧭',
      [AgentType.COMMUNICATIONS]: '📡',
      [AgentType.MEDICAL]: '⚕️',
      [AgentType.SECURITY]: '🛡️',
      [AgentType.OPERATIONS]: '⚙️'
    };
    return typeEmojis[type] || '🤖';
  }

  protected getStatusSymbol(status: AgentStatus['state']): string {
    const symbols = {
      idle: '●',
      thinking: '◉',
      working: '◈',
      moving: '→',
      communicating: '◊',
      error: '⚠',
      offline: '○'
    };
    return symbols[status] || '●';
  }

  protected generateProgressBar(progress?: number): React.ReactElement {
    if (progress === undefined) return React.createElement('div');
    
    return React.createElement('div', {
      className: 'agent-progress',
      style: {
        width: '100%',
        height: '4px',
        backgroundColor: this.theme.colors.background,
        borderRadius: this.theme.borderRadius.small,
        overflow: 'hidden',
        marginTop: this.theme.spacing.xs
      }
    }, React.createElement('div', {
      style: {
        width: `${progress}%`,
        height: '100%',
        backgroundColor: this.theme.colors.accent,
        transition: this.theme.animations.transition
      }
    }));
  }

  protected getCapabilityLevel(level: string): string {
    const levels = {
      novice: '★☆☆☆',
      competent: '★★☆☆',
      expert: '★★★☆',
      master: '★★★★'
    };
    return levels[level as keyof typeof levels] || '☆☆☆☆';
  }
}