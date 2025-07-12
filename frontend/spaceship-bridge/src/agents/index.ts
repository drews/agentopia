// Agent representation system exports

export * from './types';
export { default as AgentComponent } from './AgentComponent';

// Strategies
export { BaseAgentStrategy } from './strategies/BaseAgentStrategy';
export { RetroAgentStrategy } from './strategies/RetroAgentStrategy';
export { ModernAgentStrategy } from './strategies/ModernAgentStrategy';
export { MinimalAgentStrategy } from './strategies/MinimalAgentStrategy';

// Themes
export { RetroTheme } from './themes/RetroTheme';
export { ModernTheme } from './themes/ModernTheme';
export { MinimalTheme } from './themes/MinimalTheme';

// Strategy factory
import { AgentRepresentationStrategy } from './types';
import { RetroAgentStrategy } from './strategies/RetroAgentStrategy';
import { ModernAgentStrategy } from './strategies/ModernAgentStrategy';
import { MinimalAgentStrategy } from './strategies/MinimalAgentStrategy';

export const createAgentStrategy = (theme: string): AgentRepresentationStrategy => {
  switch (theme.toLowerCase()) {
    case 'modern':
      return new ModernAgentStrategy();
    case 'minimal':
      return new MinimalAgentStrategy();
    case 'retro':
    default:
      return new RetroAgentStrategy();
  }
};

// Utility functions
export const getAvailableThemes = (): string[] => {
  return ['retro', 'modern', 'minimal'];
};

export const getDefaultTheme = (): string => {
  return 'retro';
};