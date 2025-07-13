import { AgentThemeConfig } from '../types';

export const RetroTheme: AgentThemeConfig = {
  name: 'retro',
  description: 'Classic 80s terminal aesthetic with green phosphor styling',
  colors: {
    primary: '#00ff41',
    secondary: '#008f11',
    accent: '#00ff88', 
    background: '#0a0f0a',
    text: '#00ff41',
    border: '#008f11',
    status: {
      idle: '#00ff41',
      thinking: '#ffff00',
      working: '#00ff88',
      moving: '#00aaff',
      communicating: '#ff8800',
      error: '#ff3333',
      offline: '#666666'
    }
  },
  typography: {
    fontFamily: '"Courier New", "Monaco", "Lucida Console", monospace',
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
    small: '2px',
    medium: '4px',
    large: '6px'
  },
  animations: {
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    pulse: 'retro-pulse 2s infinite',
    glow: 'retro-glow 1.5s infinite alternate',
    bounce: 'retro-bounce 0.6s infinite'
  }
};