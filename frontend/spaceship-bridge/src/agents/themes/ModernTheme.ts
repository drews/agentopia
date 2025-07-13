import { AgentThemeConfig } from '../types';

export const ModernTheme: AgentThemeConfig = {
  name: 'modern',
  description: 'Clean, contemporary design with subtle gradients and smooth animations',
  colors: {
    primary: '#3b82f6',
    secondary: '#1e40af',
    accent: '#06b6d4',
    background: '#f8fafc',
    text: '#1e293b',
    border: '#e2e8f0',
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
  typography: {
    fontFamily: '"Inter", "SF Pro Display", system-ui, -apple-system, sans-serif',
    fontSize: {
      small: '12px',
      medium: '14px',
      large: '16px'
    },
    fontWeight: {
      normal: 400,
      bold: 600
    }
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px'
  },
  borderRadius: {
    small: '6px',
    medium: '8px',
    large: '12px'
  },
  animations: {
    transition: 'all 0.2s ease-out',
    pulse: 'modern-pulse 2s infinite',
    glow: 'modern-glow 2s infinite ease-in-out',
    bounce: 'modern-bounce 0.5s ease-out'
  }
};