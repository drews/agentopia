# Agentopia Design System

## Overview

The Agentopia design system provides a comprehensive foundation for building consistent, accessible, and effective AI agent management interfaces. This system follows mission-control design principles with a sci-fi aesthetic optimized for high-stakes operational environments.

## Design Principles

### 1. Clarity Over Aesthetics
- Information hierarchy drives visual design decisions
- Critical data must be immediately recognizable
- Aesthetic choices support operational efficiency

### 2. Consistency Across Context
- Uniform interaction patterns throughout the interface
- Consistent color coding and visual language
- Standardized component behaviors and states

### 3. Accessibility First
- WCAG 2.1 AA compliance minimum
- High contrast ratios for critical information
- Keyboard navigation support for all functions
- Screen reader compatibility

### 4. Responsive Performance
- Sub-100ms response times for critical actions
- Graceful degradation under system stress
- Efficient resource utilization

## Visual Foundation

### Color Palette

#### Primary Colors
```css
/* Terminal Green - Primary Brand */
--color-primary: #00ff00;
--color-primary-dark: #00cc00;
--color-primary-light: #33ff33;
--color-primary-alpha: rgba(0, 255, 0, 0.1);

/* Background System */
--color-bg-primary: #0a0a0a;
--color-bg-secondary: #1a1a2e;
--color-bg-tertiary: #16213e;
--color-bg-surface: rgba(0, 255, 0, 0.05);

/* Text Hierarchy */
--color-text-primary: #ffffff;
--color-text-secondary: #cccccc;
--color-text-tertiary: #999999;
--color-text-accent: #00ff00;
```

#### Status Colors
```css
/* Operational States */
--color-success: #00ff00;     /* Operational, Active */
--color-warning: #ffaa00;     /* Thinking, Caution */
--color-error: #ff4444;       /* Error, Critical */
--color-info: #0088ff;        /* Working, Processing */
--color-neutral: #666666;     /* Inactive, Disabled */
```

#### Agent State Colors
```css
/* Agent Status Indicators */
--color-agent-active: #00ff00;
--color-agent-thinking: #ffaa00;
--color-agent-working: #0088ff;
--color-agent-error: #ff4444;
--color-agent-moving: #ff00ff;
--color-agent-idle: #666666;
```

### Typography

#### Font Stack
```css
/* Primary Font - Monospace for terminal aesthetic */
--font-primary: 'Courier New', 'Monaco', 'Menlo', 'Consolas', monospace;

/* Secondary Font - System fallbacks */
--font-secondary: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
```

#### Type Scale
```css
/* Heading Hierarchy */
--font-size-h1: 2rem;     /* 32px - Main titles */
--font-size-h2: 1.5rem;   /* 24px - Section headers */
--font-size-h3: 1.25rem;  /* 20px - Subsections */
--font-size-h4: 1rem;     /* 16px - Component titles */

/* Body Text */
--font-size-body: 0.875rem;    /* 14px - Standard text */
--font-size-small: 0.75rem;    /* 12px - Captions, labels */
--font-size-micro: 0.625rem;   /* 10px - Metadata */

/* Line Heights */
--line-height-tight: 1.2;
--line-height-normal: 1.5;
--line-height-loose: 1.8;
```

### Spacing System

#### Spatial Units
```css
/* Base unit: 0.25rem (4px) */
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
```

#### Layout Dimensions
```css
/* Component Sizing */
--size-button-sm: 2rem;     /* 32px */
--size-button-md: 2.5rem;   /* 40px */
--size-button-lg: 3rem;     /* 48px */

/* Grid System */
--grid-gap: 1px;
--grid-padding: 0.5rem;
--sidebar-width: 300px;
--header-height: 4rem;
```

## Component Library

### Button System

#### Primary Actions
```css
.btn-primary {
  background: var(--color-primary);
  color: var(--color-bg-primary);
  border: 2px solid var(--color-primary);
  padding: var(--space-2) var(--space-4);
  font-family: var(--font-primary);
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 1px;
  transition: all 0.2s ease;
}

.btn-primary:hover {
  background: var(--color-primary-dark);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 255, 0, 0.3);
}
```

#### Secondary Actions
```css
.btn-secondary {
  background: transparent;
  color: var(--color-primary);
  border: 2px solid var(--color-primary);
  padding: var(--space-2) var(--space-4);
}

.btn-secondary:hover {
  background: var(--color-primary-alpha);
}
```

#### Danger Actions
```css
.btn-danger {
  background: var(--color-error);
  color: var(--color-text-primary);
  border: 2px solid var(--color-error);
}
```

### Status Indicators

#### Basic Status Badge
```css
.status-badge {
  display: inline-flex;
  align-items: center;
  padding: var(--space-1) var(--space-3);
  border: 1px solid;
  border-radius: 4px;
  font-size: var(--font-size-small);
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-badge.operational {
  color: var(--color-success);
  border-color: var(--color-success);
  background: rgba(0, 255, 0, 0.1);
}

.status-badge.error {
  color: var(--color-error);
  border-color: var(--color-error);
  background: rgba(255, 68, 68, 0.1);
}
```

#### Animated Status Indicators
```css
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

.status-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  display: inline-block;
  margin-right: var(--space-2);
}

.status-indicator.active {
  background: var(--color-success);
  animation: pulse 2s infinite;
}

.status-indicator.thinking {
  background: var(--color-warning);
  animation: pulse 1s infinite;
}
```

### Grid System

#### Bridge Layout Grid
```css
.bridge-grid {
  display: grid;
  grid-template-columns: repeat(var(--grid-width), 1fr);
  grid-template-rows: repeat(var(--grid-height), 1fr);
  gap: var(--grid-gap);
  background: var(--color-bg-surface);
  border: 2px solid rgba(0, 255, 0, 0.3);
  border-radius: 8px;
  padding: var(--grid-padding);
  position: relative;
  min-height: 0;
}
```

#### Responsive Grid
```css
/* Mobile - Stack layout */
@media (max-width: 768px) {
  .bridge-main {
    flex-direction: column;
  }
  
  .bridge-sidebar {
    width: 100%;
    height: 200px;
    order: 2;
  }
  
  .bridge-grid {
    min-height: 400px;
    order: 1;
  }
}

/* Desktop - Side-by-side layout */
@media (min-width: 769px) {
  .bridge-main {
    display: flex;
    gap: var(--space-4);
  }
  
  .bridge-grid {
    flex: 1;
  }
  
  .bridge-sidebar {
    width: var(--sidebar-width);
    flex-shrink: 0;
  }
}
```

### Animation System

#### Standard Transitions
```css
/* Hover transitions */
.transition-hover {
  transition: all 0.3s ease;
}

.transition-hover:hover {
  transform: scale(1.02);
}

/* State change transitions */
.transition-state {
  transition: color 0.2s ease, background-color 0.2s ease, border-color 0.2s ease;
}
```

#### Agent Animations
```css
@keyframes agent-pulse {
  0%, 100% { 
    transform: scale(1);
    filter: brightness(1);
  }
  50% { 
    transform: scale(1.05);
    filter: brightness(1.2);
  }
}

@keyframes agent-thinking {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

@keyframes agent-working {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(-2deg); }
  75% { transform: rotate(2deg); }
}

.agent.active { animation: agent-pulse 2s infinite; }
.agent.thinking { animation: agent-thinking 2s infinite; }
.agent.working { animation: agent-working 1s infinite; }
```

## Layout Patterns

### Page Structure
```html
<div class="app-container">
  <header class="app-header">
    <h1 class="app-title">Bridge Control</h1>
    <div class="status-indicators">
      <!-- Status badges -->
    </div>
  </header>
  
  <main class="app-main">
    <div class="content-area">
      <!-- Main content -->
    </div>
    
    <aside class="sidebar">
      <!-- Sidebar panels -->
    </aside>
  </main>
</div>
```

### Panel System
```css
.panel {
  background: var(--color-bg-surface);
  border: 2px solid rgba(0, 255, 0, 0.3);
  border-radius: 8px;
  padding: var(--space-4);
  margin-bottom: var(--space-4);
}

.panel-header {
  color: var(--color-primary);
  font-size: var(--font-size-h4);
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: var(--space-3);
  padding-bottom: var(--space-2);
  border-bottom: 1px solid rgba(0, 255, 0, 0.3);
}
```

## Accessibility Guidelines

### Color Contrast
- Primary text on dark background: 14:1 ratio
- Secondary text on dark background: 7:1 ratio
- Status indicators: 3:1 minimum for graphical elements

### Keyboard Navigation
- All interactive elements must be keyboard accessible
- Focus indicators must be clearly visible
- Tab order must follow logical reading sequence

### Screen Reader Support
- Semantic HTML elements for proper structure
- ARIA labels for complex interactive elements
- Status announcements for dynamic content updates

## Performance Considerations

### CSS Optimization
- Use CSS custom properties for consistent theming
- Minimize reflow-triggering properties in animations
- Implement efficient selector strategies

### Asset Loading
- Optimize font loading with font-display: swap
- Use efficient image formats (WebP, AVIF)
- Implement lazy loading for non-critical assets

## Usage Guidelines

### When to Use Components
- Use status badges for all state indicators
- Apply consistent spacing using the spacing system
- Follow the color coding system for all status representations

### Customization Guidelines
- Extend components through CSS custom properties
- Maintain accessibility standards in customizations
- Test customizations across different screen sizes

---

*This design system is a living document that evolves with the product. All changes should be documented and communicated to the development team.*