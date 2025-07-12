# Enhanced Design System - Agentopia Bridge Interface

## Component Architecture

### Core Design Philosophy
- **Spacey but Grounded**: Sci-fi aesthetics that feel tactile and functional
- **Progressive Disclosure**: Components reveal complexity as user demonstrates mastery
- **Resonance-Based**: Interface elements that adapt to user's command voice
- **Contextual Intelligence**: Smart components that respond to system state

## Advanced Component Library

### 1. Adaptive Panels

#### System Status Panel
```css
.system-panel {
  --panel-glow: var(--color-primary-alpha);
  --panel-border: 2px solid rgba(0, 255, 0, 0.3);
  --panel-bg: rgba(0, 255, 0, 0.05);
  
  background: var(--panel-bg);
  border: var(--panel-border);
  border-radius: 8px;
  padding: var(--space-4);
  backdrop-filter: blur(10px);
  
  /* Adaptive states based on user voice */
  &.voice-direct {
    --panel-border: 2px solid rgba(0, 255, 0, 0.6);
    border-radius: 4px; /* Sharper for direct users */
  }
  
  &.voice-collaborative {
    --panel-border: 2px solid rgba(0, 255, 0, 0.3);
    border-radius: 12px; /* Softer for collaborative users */
  }
  
  &.voice-strategic {
    --panel-border: 2px solid rgba(0, 255, 0, 0.4);
    border-radius: 8px;
    box-shadow: inset 0 0 10px rgba(0, 255, 0, 0.1); /* Depth for strategic users */
  }
}
```

#### Agent Cards
```css
.agent-card {
  position: relative;
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid transparent;
  border-radius: 8px;
  padding: var(--space-3);
  transition: all 0.3s ease;
  
  /* Agent status indicators */
  &::before {
    content: '';
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    border-radius: 8px;
    background: linear-gradient(45deg, transparent, var(--agent-status-color), transparent);
    z-index: -1;
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  &.status-active::before {
    --agent-status-color: var(--color-success);
    opacity: 1;
    animation: agent-pulse 2s infinite;
  }
  
  &.status-thinking::before {
    --agent-status-color: var(--color-warning);
    opacity: 0.7;
    animation: agent-thinking 1.5s infinite;
  }
  
  &.status-working::before {
    --agent-status-color: var(--color-info);
    opacity: 0.8;
    animation: agent-working 1s infinite;
  }
}

.agent-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  background: rgba(0, 255, 0, 0.1);
  border: 2px solid rgba(0, 255, 0, 0.3);
  margin-bottom: var(--space-2);
}

.agent-info {
  text-align: center;
}

.agent-name {
  font-size: var(--font-size-small);
  font-weight: bold;
  color: var(--color-text-primary);
  margin-bottom: var(--space-1);
}

.agent-role {
  font-size: var(--font-size-micro);
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
```

### 2. Interactive Bridge Grid

#### Adaptive Grid System
```css
.bridge-grid {
  display: grid;
  grid-template-columns: repeat(var(--grid-cols), 1fr);
  grid-template-rows: repeat(var(--grid-rows), 1fr);
  gap: 2px;
  background: rgba(0, 255, 0, 0.03);
  border: 2px solid rgba(0, 255, 0, 0.2);
  border-radius: 12px;
  padding: var(--space-3);
  position: relative;
  overflow: hidden;
  
  /* Scanning effect for active state */
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 2px;
    background: linear-gradient(90deg, transparent, var(--color-primary), transparent);
    animation: scanner 3s infinite;
  }
  
  &.grid-active::after {
    animation-duration: 2s;
  }
}

.grid-cell {
  background: rgba(0, 255, 0, 0.02);
  border: 1px solid rgba(0, 255, 0, 0.1);
  border-radius: 4px;
  position: relative;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(0, 255, 0, 0.08);
    border-color: rgba(0, 255, 0, 0.3);
  }
  
  &.cell-occupied {
    background: rgba(0, 255, 0, 0.1);
    border-color: rgba(0, 255, 0, 0.4);
  }
  
  &.cell-available {
    background: rgba(255, 255, 255, 0.02);
    border-style: dashed;
  }
}

/* Station styling within grid */
.station {
  background: var(--station-color, rgba(255, 255, 255, 0.1));
  border: 2px solid var(--station-border, rgba(255, 255, 255, 0.3));
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: scale(1.02);
    box-shadow: 0 4px 12px rgba(255, 255, 255, 0.2);
  }
  
  &.station-critical {
    --station-color: rgba(255, 68, 68, 0.1);
    --station-border: rgba(255, 68, 68, 0.5);
    animation: critical-pulse 1.5s infinite;
  }
  
  &.station-active {
    --station-color: rgba(0, 255, 0, 0.15);
    --station-border: rgba(0, 255, 0, 0.6);
  }
}
```

### 3. Command Interface Components

#### Voice-Responsive Command Bar
```css
.command-bar {
  position: fixed;
  bottom: var(--space-4);
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 20, 40, 0.9);
  border: 2px solid rgba(0, 255, 0, 0.4);
  border-radius: 24px;
  padding: var(--space-2) var(--space-4);
  backdrop-filter: blur(15px);
  display: flex;
  align-items: center;
  gap: var(--space-3);
  transition: all 0.3s ease;
  
  /* Adaptive sizing based on user preference */
  &.voice-direct {
    border-radius: 8px;
    padding: var(--space-1) var(--space-3);
    border-color: rgba(0, 255, 0, 0.6);
  }
  
  &.voice-collaborative {
    border-radius: 32px;
    padding: var(--space-3) var(--space-5);
    border-color: rgba(0, 255, 0, 0.3);
  }
  
  &.voice-strategic {
    border-radius: 16px;
    padding: var(--space-2) var(--space-4);
    border-color: rgba(0, 255, 0, 0.5);
    box-shadow: 0 4px 20px rgba(0, 255, 0, 0.2);
  }
}

.command-input {
  background: transparent;
  border: none;
  color: var(--color-text-primary);
  font-family: var(--font-primary);
  font-size: var(--font-size-body);
  outline: none;
  min-width: 300px;
  
  &::placeholder {
    color: var(--color-text-tertiary);
  }
}

.voice-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--color-neutral);
  transition: all 0.3s ease;
  
  &.listening {
    background: var(--color-warning);
    animation: voice-pulse 1s infinite;
  }
  
  &.processing {
    background: var(--color-info);
    animation: voice-process 0.8s infinite;
  }
  
  &.responding {
    background: var(--color-success);
    animation: voice-respond 1.2s infinite;
  }
}
```

### 4. Status and Notification System

#### Adaptive Notifications
```css
.notification {
  background: rgba(0, 20, 40, 0.95);
  border-left: 4px solid var(--notification-color);
  border-radius: 0 8px 8px 0;
  padding: var(--space-3);
  margin-bottom: var(--space-2);
  backdrop-filter: blur(10px);
  transform: translateX(-100%);
  transition: transform 0.3s ease;
  
  &.notification-enter {
    transform: translateX(0);
  }
  
  &.priority-low {
    --notification-color: var(--color-neutral);
    border-left-width: 2px;
  }
  
  &.priority-medium {
    --notification-color: var(--color-info);
    border-left-width: 3px;
  }
  
  &.priority-high {
    --notification-color: var(--color-warning);
    border-left-width: 4px;
    animation: notification-pulse 2s infinite;
  }
  
  &.priority-critical {
    --notification-color: var(--color-error);
    border-left-width: 6px;
    animation: critical-flash 1s infinite;
  }
}

.notification-content {
  display: flex;
  align-items: flex-start;
  gap: var(--space-2);
}

.notification-icon {
  font-size: 1.2rem;
  color: var(--notification-color);
  margin-top: 2px;
}

.notification-text {
  flex: 1;
  font-size: var(--font-size-small);
  line-height: var(--line-height-normal);
}

.notification-timestamp {
  font-size: var(--font-size-micro);
  color: var(--color-text-tertiary);
  margin-top: var(--space-1);
}
```

### 5. Progressive Enhancement Elements

#### Capability Unlock Animations
```css
.capability-unlock {
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(0, 255, 0, 0.3),
      transparent
    );
    transition: left 0.8s ease;
  }
  
  &.unlocking::before {
    left: 100%;
  }
}

.mastery-indicator {
  position: relative;
  width: 100%;
  height: 4px;
  background: rgba(0, 255, 0, 0.1);
  border-radius: 2px;
  overflow: hidden;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: var(--mastery-percentage, 0%);
    background: linear-gradient(
      90deg,
      var(--color-warning),
      var(--color-success)
    );
    border-radius: 2px;
    transition: width 0.5s ease;
  }
}
```

## Animations and Micro-interactions

### Core Animation Library
```css
/* Scanning effect */
@keyframes scanner {
  0% { left: -100%; }
  100% { left: 100%; }
}

/* Voice indicators */
@keyframes voice-pulse {
  0%, 100% { 
    transform: scale(1);
    opacity: 1;
  }
  50% { 
    transform: scale(1.2);
    opacity: 0.7;
  }
}

@keyframes voice-process {
  0%, 100% { 
    transform: rotate(0deg);
    background: var(--color-info);
  }
  50% { 
    transform: rotate(180deg);
    background: var(--color-warning);
  }
}

@keyframes voice-respond {
  0% { 
    transform: scale(1);
    background: var(--color-success);
  }
  25% { 
    transform: scale(1.1);
    background: var(--color-primary);
  }
  50% { 
    transform: scale(1);
    background: var(--color-success);
  }
  75% { 
    transform: scale(1.1);
    background: var(--color-primary);
  }
  100% { 
    transform: scale(1);
    background: var(--color-success);
  }
}

/* Agent state animations */
@keyframes agent-pulse {
  0%, 100% { 
    opacity: 1;
    transform: scale(1);
  }
  50% { 
    opacity: 0.7;
    transform: scale(1.05);
  }
}

@keyframes agent-thinking {
  0%, 100% { 
    opacity: 0.7;
    filter: brightness(1);
  }
  50% { 
    opacity: 1;
    filter: brightness(1.2);
  }
}

@keyframes agent-working {
  0%, 100% { 
    transform: rotate(0deg) scale(1);
  }
  25% { 
    transform: rotate(-3deg) scale(1.02);
  }
  75% { 
    transform: rotate(3deg) scale(1.02);
  }
}

/* Critical alerts */
@keyframes critical-pulse {
  0%, 100% { 
    box-shadow: 0 0 5px rgba(255, 68, 68, 0.5);
  }
  50% { 
    box-shadow: 0 0 20px rgba(255, 68, 68, 0.8);
  }
}

@keyframes critical-flash {
  0%, 50%, 100% { 
    border-left-color: var(--color-error);
  }
  25%, 75% { 
    border-left-color: transparent;
  }
}

/* Notification animations */
@keyframes notification-pulse {
  0%, 100% { 
    border-left-width: 4px;
  }
  50% { 
    border-left-width: 6px;
  }
}
```

## Responsive Behavior

### Adaptive Layouts
```css
/* Mobile-first approach */
.bridge-interface {
  display: grid;
  grid-template-areas: 
    "header"
    "main"
    "sidebar"
    "command";
  grid-template-rows: auto 1fr auto auto;
  height: 100vh;
  gap: var(--space-2);
  padding: var(--space-2);
}

/* Tablet layout */
@media (min-width: 768px) {
  .bridge-interface {
    grid-template-areas: 
      "header header"
      "main sidebar"
      "command command";
    grid-template-columns: 1fr 300px;
    grid-template-rows: auto 1fr auto;
  }
}

/* Desktop layout */
@media (min-width: 1024px) {
  .bridge-interface {
    grid-template-areas: 
      "header header header"
      "sidebar main status"
      "command command command";
    grid-template-columns: 250px 1fr 200px;
    grid-template-rows: auto 1fr auto;
    gap: var(--space-4);
    padding: var(--space-4);
  }
}

/* Ultra-wide layout */
@media (min-width: 1440px) {
  .bridge-interface {
    grid-template-areas: 
      "sidebar header status"
      "sidebar main status"
      "sidebar command status";
    grid-template-columns: 300px 1fr 250px;
    grid-template-rows: auto 1fr auto;
  }
}
```

## Accessibility Enhancements

### Screen Reader Optimizations
```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
  border-radius: 4px;
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .bridge-interface {
    --color-primary: #00ff00;
    --color-bg-primary: #000000;
    --color-text-primary: #ffffff;
    border: 2px solid var(--color-primary);
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
  
  .scanner::after,
  .voice-pulse,
  .agent-pulse {
    animation: none;
  }
}
```

This enhanced design system provides a solid foundation for building the adaptive, spacey-but-grounded interface that grows with user mastery while maintaining accessibility and responsive behavior across all devices.

---

*Next: Creating view mockups for different system states and user progression levels.*