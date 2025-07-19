# Frontend Architecture - Agentopia Bridge Interface

## Overview

This document outlines the frontend architecture for the Agentopia bridge interface, designed to support the **Awakening → Resonance → Emergence** user journey with progressive disclosure, adaptive personalization, and scalable multi-view management.

## Architecture Principles

### 1. Progressive Architecture
- **Components unlock with capabilities**: Interface elements appear as users demonstrate mastery
- **Complexity gradual reveal**: Simple views evolve into sophisticated dashboards
- **Contextual adaptation**: Architecture adapts to user's command voice and preferences

### 2. State-Driven Design
- **System state as source of truth**: UI driven by progressive disclosure system state
- **Reactive updates**: Components automatically adapt to state changes
- **Persistent user context**: Personalization survives across sessions

### 3. Modular & Extensible
- **Component composition**: Views built from reusable, adaptive components
- **Plugin architecture**: New capabilities can be added without core changes
- **API-driven**: All data flows through well-defined interfaces

## Core Architecture Stack

### Frontend Framework
```typescript
// React 19+ with concurrent features
// TypeScript for type safety
// CSS-in-JS with styled-components for dynamic theming
// React Query for API state management
// Zustand for client state management
// Framer Motion for animations
```

### Key Libraries
```json
{
  "react": "^19.1.0",
  "typescript": "^4.9.5",
  "styled-components": "^6.0.0",
  "@tanstack/react-query": "^5.0.0",
  "zustand": "^4.4.0",
  "framer-motion": "^10.0.0",
  "react-hook-form": "^7.45.0",
  "zod": "^3.22.0",
  "lucide-react": "^0.300.0"
}
```

## Component Hierarchy

### 1. App-Level Components

#### App Container
```typescript
// src/App.tsx
interface AppProps {
  children: React.ReactNode;
}

const App = () => {
  return (
    <SystemProvider>
      <ThemeProvider>
        <QueryProvider>
          <ProgressiveDisclosureProvider>
            <TutorialProvider>
              <ExecutiveAgencyProvider>
                <BridgeInterface />
              </ExecutiveAgencyProvider>
            </TutorialProvider>
          </ProgressiveDisclosureProvider>
        </QueryProvider>
      </ThemeProvider>
    </SystemProvider>
  );
};
```

#### System Providers
```typescript
// src/providers/SystemProvider.tsx
interface SystemState {
  currentAct: 'awakening' | 'resonance' | 'emergence';
  systemStatus: 'stasis' | 'awakening' | 'diagnostic' | 'operational' | 'mastery';
  unlockedCapabilities: string[];
  userMetrics: AgencyMetrics;
}

// src/providers/ThemeProvider.tsx
interface ThemeState {
  colorScheme: 'dark' | 'light' | 'auto';
  density: 'compact' | 'comfortable' | 'spacious';
  animations: 'minimal' | 'standard' | 'enhanced';
  userVoice: 'direct' | 'collaborative' | 'strategic';
}
```

### 2. Layout Components

#### Bridge Interface (Main Layout)
```typescript
// src/components/layouts/BridgeInterface.tsx
interface BridgeInterfaceProps {
  systemState: SystemState;
  userPreferences: UserPreferences;
}

const BridgeInterface = () => {
  const { systemState } = useSystem();
  const { currentStep } = useTutorial();
  
  return (
    <StyledBridgeContainer systemState={systemState}>
      <BridgeHeader />
      <BridgeMain>
        <BridgeGrid />
        <BridgeSidebar />
      </BridgeMain>
      <CommandInterface />
      {currentStep && <TutorialOverlay />}
    </StyledBridgeContainer>
  );
};
```

#### Adaptive Layout System
```typescript
// src/components/layouts/AdaptiveLayout.tsx
interface AdaptiveLayoutProps {
  children: React.ReactNode;
  layout: 'stasis' | 'basic' | 'advanced' | 'mastery';
  userVoice: CommandVoice;
}

const AdaptiveLayout = ({ children, layout, userVoice }: AdaptiveLayoutProps) => {
  return (
    <LayoutContainer 
      layout={layout} 
      voice={userVoice}
      className={`layout-${layout} voice-${userVoice.id}`}
    >
      {children}
    </LayoutContainer>
  );
};
```

### 3. Feature Components

#### Progressive Bridge Grid
```typescript
// src/components/bridge/BridgeGrid.tsx
interface BridgeGridProps {
  dimensions: { width: number; height: number };
  stations: Station[];
  agents: Agent[];
  onCellClick: (position: Position) => void;
  capabilities: string[];
}

const BridgeGrid = ({ dimensions, stations, agents, capabilities }: BridgeGridProps) => {
  const { isCapabilityUnlocked } = useProgressiveDisclosure();
  
  return (
    <GridContainer dimensions={dimensions}>
      {renderGridCells()}
      {stations.map(station => (
        <GridStation 
          key={station.id}
          station={station}
          unlocked={isCapabilityUnlocked('station-management')}
        />
      ))}
      {agents.map(agent => (
        <GridAgent 
          key={agent.id}
          agent={agent}
          unlocked={isCapabilityUnlocked('agent-assignment')}
        />
      ))}
    </GridContainer>
  );
};
```

#### Voice Discovery Interface
```typescript
// src/components/voice/VoiceDiscovery.tsx
interface VoiceDiscoveryProps {
  onVoiceUpdate: (voice: Partial<CommandVoice>) => void;
  currentScenario: VoiceScenario;
}

const VoiceDiscovery = ({ onVoiceUpdate, currentScenario }: VoiceDiscoveryProps) => {
  const [selectedApproach, setSelectedApproach] = useState<string | null>(null);
  
  return (
    <VoiceContainer>
      <ScenarioPresentation scenario={currentScenario} />
      <ApproachSelector 
        approaches={currentScenario.approaches}
        onSelect={setSelectedApproach}
      />
      <ImpactPreview approach={selectedApproach} />
      <ActionButtons onConfirm={() => onVoiceUpdate(selectedApproach)} />
    </VoiceContainer>
  );
};
```

#### Mission Control Interface
```typescript
// src/components/missions/MissionControl.tsx
interface MissionControlProps {
  missions: Mission[];
  capabilities: string[];
  userVoice: CommandVoice;
}

const MissionControl = ({ missions, capabilities, userVoice }: MissionControlProps) => {
  const adaptiveLayout = useMemo(() => 
    calculateLayoutForVoice(userVoice), [userVoice]
  );
  
  return (
    <MissionContainer layout={adaptiveLayout}>
      <MissionSelector missions={missions} />
      <TeamCoordination />
      <ProgressMonitoring />
      <InterventionControls />
    </MissionContainer>
  );
};
```

### 4. Adaptive UI Components

#### Smart Panels
```typescript
// src/components/ui/SmartPanel.tsx
interface SmartPanelProps {
  title: string;
  children: React.ReactNode;
  priority: 'low' | 'medium' | 'high' | 'critical';
  userVoice: CommandVoice;
  collapsible?: boolean;
}

const SmartPanel = ({ title, children, priority, userVoice }: SmartPanelProps) => {
  const panelStyle = useMemo(() => 
    calculatePanelStyle(priority, userVoice), [priority, userVoice]
  );
  
  return (
    <PanelContainer style={panelStyle} className={`voice-${userVoice.id}`}>
      <PanelHeader priority={priority}>
        {title}
      </PanelHeader>
      <PanelContent>
        {children}
      </PanelContent>
    </PanelContainer>
  );
};
```

#### Contextual Notifications
```typescript
// src/components/ui/NotificationSystem.tsx
interface NotificationSystemProps {
  userPreferences: UserPreferences;
  currentContext: DisclosureContext;
}

const NotificationSystem = ({ userPreferences, currentContext }: NotificationSystemProps) => {
  const { notifications } = useNotifications();
  const filteredNotifications = useMemo(() => 
    filterNotificationsByContext(notifications, currentContext, userPreferences),
    [notifications, currentContext, userPreferences]
  );
  
  return (
    <NotificationContainer>
      <AnimatePresence>
        {filteredNotifications.map(notification => (
          <NotificationItem 
            key={notification.id}
            notification={notification}
            userVoice={userPreferences.commandVoice}
          />
        ))}
      </AnimatePresence>
    </NotificationContainer>
  );
};
```

## State Management Architecture

### 1. Global State (Zustand)
```typescript
// src/stores/systemStore.ts
interface SystemStore {
  // State
  systemState: SystemState;
  userProfile: PersonalizationProfile;
  unlockedCapabilities: Set<string>;
  currentSession: SessionData;
  
  // Actions
  updateSystemState: (state: Partial<SystemState>) => void;
  unlockCapability: (capability: string) => void;
  updateUserProfile: (profile: Partial<PersonalizationProfile>) => void;
  recordUserAction: (action: string, context: any) => void;
}

const useSystemStore = create<SystemStore>((set, get) => ({
  systemState: initialSystemState,
  userProfile: initialUserProfile,
  unlockedCapabilities: new Set(),
  currentSession: initialSession,
  
  updateSystemState: (newState) => 
    set(state => ({ systemState: { ...state.systemState, ...newState } })),
  
  unlockCapability: (capability) =>
    set(state => ({ 
      unlockedCapabilities: new Set([...state.unlockedCapabilities, capability])
    })),
    
  // ... other actions
}));
```

### 2. Server State (React Query)
```typescript
// src/api/hooks/useBridgeState.ts
export const useBridgeState = () => {
  return useQuery({
    queryKey: ['bridge', 'state'],
    queryFn: fetchBridgeState,
    refetchInterval: 5000, // Real-time updates
    staleTime: 1000,
  });
};

// src/api/hooks/useMissions.ts
export const useMissions = (filters?: MissionFilters) => {
  return useQuery({
    queryKey: ['missions', filters],
    queryFn: () => fetchMissions(filters),
    enabled: !!filters,
  });
};

// src/api/hooks/useAgents.ts
export const useAgents = () => {
  return useQuery({
    queryKey: ['agents'],
    queryFn: fetchAgents,
    select: (data) => adaptAgentsToUserVoice(data, userVoice),
  });
};
```

### 3. Component State (React Hooks)
```typescript
// src/hooks/useProgressiveDisclosure.ts
export const useProgressiveDisclosure = () => {
  const { systemState, unlockedCapabilities } = useSystemStore();
  
  const isCapabilityUnlocked = useCallback((capability: string) => {
    return unlockedCapabilities.has(capability);
  }, [unlockedCapabilities]);
  
  const getNextUnlockables = useCallback(() => {
    return progressiveDisclosure.getNextUnlockableCapabilities();
  }, [systemState]);
  
  return {
    isCapabilityUnlocked,
    getNextUnlockables,
    currentState: systemState,
  };
};

// src/hooks/useAdaptiveInterface.ts
export const useAdaptiveInterface = () => {
  const { userProfile } = useSystemStore();
  const commandVoice = userProfile.commandVoice;
  
  const getComponentProps = useCallback((componentType: string) => {
    return adaptPropsToVoice(componentType, commandVoice);
  }, [commandVoice]);
  
  const getLayoutConfiguration = useCallback(() => {
    return calculateLayoutForVoice(commandVoice);
  }, [commandVoice]);
  
  return {
    getComponentProps,
    getLayoutConfiguration,
    commandVoice,
  };
};
```

## Routing and Navigation

### Progressive Routing
```typescript
// src/routing/ProgressiveRouter.tsx
const ProgressiveRouter = () => {
  const { systemState, unlockedCapabilities } = useProgressiveDisclosure();
  
  const routes = useMemo(() => {
    const baseRoutes = [
      { path: '/', component: BridgeInterface, required: [] },
      { path: '/diagnostics', component: DiagnosticsView, required: ['system-overview'] },
    ];
    
    const advancedRoutes = [
      { path: '/voice-discovery', component: VoiceDiscovery, required: ['voice-assessment'] },
      { path: '/missions', component: MissionControl, required: ['mission-planning'] },
      { path: '/fleet', component: FleetManagement, required: ['fleet-overview'] },
    ];
    
    return filterRoutesByCapabilities(
      [...baseRoutes, ...advancedRoutes], 
      unlockedCapabilities
    );
  }, [unlockedCapabilities]);
  
  return (
    <Router>
      <Routes>
        {routes.map(route => (
          <Route 
            key={route.path}
            path={route.path}
            element={<route.component />}
          />
        ))}
      </Routes>
    </Router>
  );
};
```

## Performance Optimizations

### 1. Code Splitting by Capability
```typescript
// src/components/lazy/LazyComponents.ts
const VoiceDiscovery = lazy(() => 
  import('../voice/VoiceDiscovery').then(module => ({
    default: module.VoiceDiscovery
  }))
);

const FleetManagement = lazy(() => 
  import('../fleet/FleetManagement').then(module => ({
    default: module.FleetManagement
  }))
);

// Only load when capability is unlocked
const ConditionalComponent = ({ capability, children }: ConditionalProps) => {
  const { isCapabilityUnlocked } = useProgressiveDisclosure();
  
  if (!isCapabilityUnlocked(capability)) {
    return null;
  }
  
  return (
    <Suspense fallback={<ComponentLoader />}>
      {children}
    </Suspense>
  );
};
```

### 2. Memoization and Virtualization
```typescript
// src/components/bridge/VirtualizedGrid.tsx
const VirtualizedGrid = memo(({ stations, agents, dimensions }: GridProps) => {
  const visibleCells = useMemo(() => 
    calculateVisibleCells(dimensions, viewport), 
    [dimensions, viewport]
  );
  
  return (
    <VirtualGrid
      itemCount={visibleCells.length}
      itemSize={calculateCellSize}
      renderItem={({ index }) => (
        <GridCell 
          key={visibleCells[index].id}
          cell={visibleCells[index]}
        />
      )}
    />
  );
});
```

### 3. Background State Synchronization
```typescript
// src/services/backgroundSync.ts
export const setupBackgroundSync = () => {
  // WebSocket connection for real-time updates
  const ws = new WebSocket(WS_ENDPOINT);
  
  ws.onmessage = (event) => {
    const update = JSON.parse(event.data);
    
    // Update React Query cache
    queryClient.setQueryData(['bridge', 'state'], update.bridgeState);
    
    // Update progressive disclosure
    if (update.unlockedCapabilities) {
      update.unlockedCapabilities.forEach(capability => {
        progressiveDisclosure.unlockCapability(capability);
      });
    }
  };
  
  // Service Worker for offline capability
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js');
  }
};
```

## Testing Strategy

### Component Testing
```typescript
// src/components/__tests__/BridgeGrid.test.tsx
describe('BridgeGrid', () => {
  it('adapts to user voice preferences', () => {
    const directVoice = createMockVoice('direct');
    const collaborativeVoice = createMockVoice('collaborative');
    
    const { rerender } = render(
      <BridgeGrid userVoice={directVoice} {...defaultProps} />
    );
    
    expect(screen.getByTestId('grid-container')).toHaveClass('voice-direct');
    
    rerender(<BridgeGrid userVoice={collaborativeVoice} {...defaultProps} />);
    
    expect(screen.getByTestId('grid-container')).toHaveClass('voice-collaborative');
  });
  
  it('shows only unlocked capabilities', () => {
    const unlockedCapabilities = ['basic-grid', 'agent-assignment'];
    
    render(
      <BridgeGrid 
        capabilities={unlockedCapabilities}
        {...defaultProps}
      />
    );
    
    expect(screen.getByTestId('agent-controls')).toBeInTheDocument();
    expect(screen.queryByTestId('advanced-controls')).not.toBeInTheDocument();
  });
});
```

### Integration Testing
```typescript
// src/__tests__/UserJourney.test.tsx
describe('User Journey Integration', () => {
  it('progresses through awakening to resonance', async () => {
    const { user } = renderWithProviders(<App />);
    
    // Start in stasis
    expect(screen.getByText(/stasis mode/i)).toBeInTheDocument();
    
    // Initialize systems
    await user.click(screen.getByTestId('initialize-systems'));
    
    // Should transition to awakening
    await waitFor(() => {
      expect(screen.getByText(/awakening/i)).toBeInTheDocument();
    });
    
    // Complete voice discovery
    await user.click(screen.getByTestId('begin-voice-discovery'));
    // ... continue through journey
  });
});
```

This architecture provides a solid foundation for building the progressive, adaptive interface that grows with user mastery while maintaining performance and accessibility across all devices and interaction patterns.

---

*Next: Component hierarchy mapping and data flow documentation.*