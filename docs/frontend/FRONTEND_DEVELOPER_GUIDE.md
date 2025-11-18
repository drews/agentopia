# Frontend Developer Guide - Agentopia Bridge Interface

## 🚀 Quick Start

### Prerequisites
```bash
# Ensure you have Node.js 18+ and npm installed
node --version  # Should be 18+
npm --version
```

### Setup
```bash
# From project root
cd frontend/spaceship-bridge
npm install
npm start  # Runs on localhost:3000
```

### Key Commands
```bash
npm start        # Development server
npm test         # Run tests
npm run build    # Production build
npm run typecheck # TypeScript validation
npm run lint     # ESLint checking
```

## 🏗️ Architecture Overview

### Component Hierarchy
```
App.tsx (Main app with navigation)
├── AgentShowcase.tsx (Agent mechanics demo)
├── components/
│   ├── CharacterShowcase.tsx (Character roster)
│   ├── CharacterCard.tsx (Individual character display)
│   └── SceneView.tsx (Scene rendering)
└── agents/
    ├── AgentComponent.tsx (Main agent wrapper)
    ├── strategies/ (Theme implementations)
    │   ├── LCARSAgentStrategy.tsx ⭐ (Primary theme)
    │   ├── ModernAgentStrategy.tsx
    │   ├── MinimalAgentStrategy.tsx
    │   └── RetroAgentStrategy.tsx
    └── themes/ (Theme configurations)
```

### Strategy Pattern Implementation
The agent system uses the Strategy pattern for flexible theming:

```typescript
// agents/strategies/BaseAgentStrategy.ts
export abstract class BaseAgentStrategy {
  abstract render(agent: Agent, size: AgentSize, interactive: boolean): React.ReactElement;
}

// Usage in AgentComponent.tsx
const strategy = new LCARSAgentStrategy();
const renderedAgent = strategy.render(agent, size, interactive);
```

## 🎨 Design System

### Core Themes
1. **LCARS** (Primary) - Star Trek-inspired interface with semantic color system
2. **Modern** - Clean contemporary design
3. **Minimal** - Simplified interface
4. **Retro** - Nostalgic styling

### LCARS Color Semantics
```typescript
const LCARSColors = {
  // Primary attention frames
  primaryOrange: '#FF9933',  // Command functions
  primaryBlue: '#3366CC',    // Critical information
  
  // Status indication
  statusOperational: '#66FF99',  // Active/working
  statusCaution: '#FFFF66',      // Thinking/processing
  statusCritical: '#FF6666',     // Error/offline
  statusNeutral: '#CCCCCC',      // Idle/standby
};
```

### Component Styling Patterns
Components use inline styles with theme-based calculations:

```typescript
// Example from LCARSAgentStrategy.tsx
style: {
  backgroundColor: LCARSColors.background,
  border: `2px solid ${primaryColor}`,
  borderRadius: '15px 0 15px 0',  // LCARS characteristic shape
  fontFamily: "'Arial Narrow', 'Helvetica Condensed', sans-serif"
}
```

## 🧩 Component Development

### Creating New Components

1. **Basic Component Structure**
```typescript
// components/MyComponent.tsx
import React from 'react';

interface MyComponentProps {
  // Define props with TypeScript
  title: string;
  optional?: boolean;
}

const MyComponent: React.FC<MyComponentProps> = ({ 
  title, 
  optional = false 
}) => {
  return (
    <div className="my-component">
      <h2>{title}</h2>
      {optional && <p>Optional content</p>}
    </div>
  );
};

export default MyComponent;
```

2. **Adding to Agent Strategies**
If creating agent-related components, follow the strategy pattern:

```typescript
// agents/strategies/MyCustomStrategy.tsx
export class MyCustomStrategy extends BaseAgentStrategy {
  render(agent: Agent, size: AgentSize, interactive: boolean): React.ReactElement {
    return React.createElement('div', {
      className: 'my-custom-agent',
      style: { /* your styles */ }
    }, [
      // Your component elements
    ]);
  }
}
```

### Component Best Practices

1. **TypeScript First**: Always define interfaces for props
2. **Accessibility**: Include ARIA labels and roles
3. **Responsive**: Consider different screen sizes
4. **Theme Aware**: Use theme colors and spacing
5. **Performance**: Use React.memo for expensive components

```typescript
// Example with all best practices
interface AccessibleComponentProps {
  id: string;
  title: string;
  status: 'active' | 'inactive';
  onClick?: () => void;
}

const AccessibleComponent = React.memo<AccessibleComponentProps>(({ 
  id, 
  title, 
  status, 
  onClick 
}) => {
  return (
    <button
      id={id}
      onClick={onClick}
      className={`component-button status-${status}`}
      role="button"
      aria-label={`${title} - ${status}`}
      tabIndex={0}
    >
      {title}
    </button>
  );
});
```

## 📡 State Management Patterns

### Local State (React Hooks)
```typescript
const [currentView, setCurrentView] = useState<'ship' | 'roster' | 'mechanics'>('mechanics');
const [bridgeState, setBridgeState] = useState<BridgeState | null>(null);
```

### WebSocket Integration
```typescript
// Real-time updates pattern
useEffect(() => {
  const ws = new WebSocket(`${wsUrl}/ws`);
  
  ws.onmessage = (event) => {
    const message = JSON.parse(event.data);
    if (message.type === 'agent_movement_intent') {
      setBridgeState(prevState => {
        // Update state based on WebSocket message
        return updateAgentPosition(prevState, message.data);
      });
    }
  };
  
  return () => ws.close();
}, []);
```

## 🧪 Testing Patterns

### Component Testing
```typescript
// components/__tests__/MyComponent.test.tsx
import { render, screen } from '@testing-library/react';
import MyComponent from '../MyComponent';

describe('MyComponent', () => {
  it('renders with required props', () => {
    render(<MyComponent title="Test Title" />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });
  
  it('handles optional props', () => {
    render(<MyComponent title="Test" optional={true} />);
    expect(screen.getByText('Optional content')).toBeInTheDocument();
  });
});
```

### Strategy Testing
```typescript
// agents/strategies/__tests__/LCARSAgentStrategy.test.tsx
import { LCARSAgentStrategy } from '../LCARSAgentStrategy';
import { mockAgent } from '../../__mocks__/agents';

describe('LCARSAgentStrategy', () => {
  const strategy = new LCARSAgentStrategy();
  
  it('renders agent with LCARS styling', () => {
    const result = strategy.render(mockAgent, { width: 120, height: 160 }, false);
    expect(result.props.className).toContain('lcars-agent');
  });
});
```

## 📱 Responsive Design

### Breakpoint System
```css
/* Current approach uses inline styles with conditional logic */
/* Consider implementing CSS custom properties for consistency */

:root {
  --mobile-breakpoint: 768px;
  --tablet-breakpoint: 1024px;
  --desktop-breakpoint: 1200px;
}
```

### Mobile-First Components
```typescript
const ResponsiveComponent: React.FC = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return (
    <div style={{
      flexDirection: isMobile ? 'column' : 'row',
      padding: isMobile ? '8px' : '16px'
    }}>
      {/* Responsive content */}
    </div>
  );
};
```

## 🔌 API Integration

### Current API Patterns
```typescript
// Fetch bridge state
const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';
const response = await fetch(`${apiUrl}/api/bridge/state`);
const bridgeState = await response.json();

// WebSocket connection
const wsUrl = apiUrl.replace('http', 'ws');
const ws = new WebSocket(`${wsUrl}/ws`);
```

## 🎯 Common Development Tasks

### Adding a New Agent Type
1. Update `agents/types.ts` with new `AgentType` enum value
2. Add type-specific logic to strategy classes
3. Update `getTypeEmoji()` method in base strategy
4. Add tests for new type

### Creating a Custom Theme
1. Extend `BaseAgentStrategy` class
2. Define theme colors and typography
3. Implement `render()` method
4. Add to strategy factory in `AgentComponent.tsx`

### Adding Real-time Features
1. Define WebSocket message types
2. Add message handlers in `App.tsx`
3. Update state management logic
4. Test WebSocket reconnection

## 🚨 Common Pitfalls

1. **Inline Styles Overuse**: Consider CSS modules for complex components
2. **Missing Keys**: Always provide keys for dynamic arrays
3. **Accessibility Oversight**: Test with screen readers
4. **Performance**: Large lists need virtualization
5. **TypeScript Any**: Avoid `any` - define proper interfaces

## 📚 Resources

- **Design Documentation**: `docs/design/UX_GUIDELINES.md`
- **Architecture Details**: `docs/legacy/FRONTEND_ARCHITECTURE.md`
- **Component Examples**: Study `agents/strategies/LCARSAgentStrategy.tsx`
- **Testing Patterns**: Existing test files in `__tests__` directories

## 🛠️ Development Workflow

1. **Feature Development**
   ```bash
   git checkout -b feature/my-new-feature
   npm test -- --watch  # Run tests in watch mode
   npm start            # Start development server
   ```

2. **Before Committing**
   ```bash
   npm run typecheck  # Ensure TypeScript compiles
   npm run lint       # Check for lint issues
   npm test           # Run full test suite
   ```

3. **Component Development Cycle**
   - Create component with TypeScript interface
   - Add basic styling (inline or CSS-in-JS)
   - Write unit tests
   - Test accessibility with screen reader
   - Add to Storybook (if implemented)

---

*This guide assumes familiarity with React and TypeScript. For React basics, see the [official React documentation](https://react.dev/).*