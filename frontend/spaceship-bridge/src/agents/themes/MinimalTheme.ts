import { AgentThemeConfig } from '../types';

export const MinimalTheme: AgentThemeConfig = {
  name: 'minimal',
  description: 'Ultra-clean, distraction-free design focused on essential information',
  colors: {
    primary: '#2563eb',
    secondary: '#475569',
    accent: '#0ea5e9',
    background: '#ffffff',
    text: '#0f172a',
    border: '#e4e4e7',
    status: {
      idle: '#71717a',
      thinking: '#eab308',
      working: '#059669',
      moving: '#2563eb',
      communicating: '#7c3aed',
      error: '#dc2626',
      offline: '#a1a1aa'
    }
  },
  typography: {
    fontFamily: '"Helvetica Neue", "Arial", sans-serif',
    fontSize: {
      small: '11px',
      medium: '13px',
      large: '15px'
    },
    fontWeight: {
      normal: 400,
      bold: 500
    }
  },
  spacing: {
    xs: '2px',
    sm: '6px',
    md: '10px',
    lg: '14px',
    xl: '20px'
  },
  borderRadius: {
    small: '4px',
    medium: '6px',
    large: '8px'
  },
  animations: {
    transition: 'all 0.15s ease',
    pulse: 'minimal-pulse 3s infinite',
    glow: 'minimal-glow 2s infinite ease-in-out',
    bounce: 'minimal-bounce 0.4s ease'
  }
};