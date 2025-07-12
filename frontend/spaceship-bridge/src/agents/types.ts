// Agent representation types and interfaces for Strategy pattern implementation

export interface Position {
  x: number;
  y: number;
}

export interface AgentStatus {
  state: 'idle' | 'thinking' | 'working' | 'moving' | 'communicating' | 'error' | 'offline';
  progress?: number; // 0-100 for working states
  lastActivity?: Date;
  efficiency?: number; // 0-100 performance metric
}

export interface AgentCapabilities {
  primary: string; // e.g., 'engineering', 'science', 'command'
  secondary?: string[];
  specializations?: string[];
  level: 'novice' | 'competent' | 'expert' | 'master';
}

export interface Agent {
  id: string;
  name: string;
  type: AgentType;
  position: Position;
  status: AgentStatus;
  capabilities: AgentCapabilities;
  personality?: AgentPersonality;
  metadata?: Record<string, any>;
}

export enum AgentType {
  COMMANDER = 'commander',
  SCIENTIST = 'scientist', 
  ENGINEER = 'engineer',
  NAVIGATOR = 'navigator',
  COMMUNICATIONS = 'communications',
  MEDICAL = 'medical',
  SECURITY = 'security',
  OPERATIONS = 'operations'
}

export interface AgentPersonality {
  communication_style: 'formal' | 'casual' | 'technical' | 'diplomatic';
  decision_speed: 'deliberate' | 'balanced' | 'quick';
  risk_tolerance: 'conservative' | 'moderate' | 'aggressive';
  collaboration: 'independent' | 'cooperative' | 'team_leader';
}

// Strategy pattern for agent representation
export interface AgentRepresentationStrategy {
  render(agent: Agent, size: AgentSize, interactive?: boolean): React.ReactElement;
  getStatusIndicator(status: AgentStatus): React.ReactElement;
  getTypeIcon(type: AgentType): React.ReactElement;
  getAnimationClass(status: AgentStatus['state']): string;
  getThemeName(): string;
}

export interface AgentSize {
  width: number;
  height: number;
  scale?: number;
}

export interface AgentInteractionHandlers {
  onClick?: (agent: Agent) => void;
  onHover?: (agent: Agent) => void;
  onSelect?: (agent: Agent) => void;
  onContextMenu?: (agent: Agent, event: React.MouseEvent) => void;
}

export interface AgentThemeConfig {
  name: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    border: string;
    status: {
      idle: string;
      thinking: string;
      working: string;
      moving: string;
      communicating: string;
      error: string;
      offline: string;
    };
  };
  typography: {
    fontFamily: string;
    fontSize: {
      small: string;
      medium: string;
      large: string;
    };
    fontWeight: {
      normal: number;
      bold: number;
    };
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  borderRadius: {
    small: string;
    medium: string;
    large: string;
  };
  animations: {
    transition: string;
    pulse: string;
    glow: string;
    bounce: string;
  };
}

export interface AgentDisplayPreferences {
  theme: string;
  showStatus: boolean;
  showCapabilities: boolean;
  showProgress: boolean;
  showTooltips: boolean;
  animationsEnabled: boolean;
  compactMode: boolean;
}