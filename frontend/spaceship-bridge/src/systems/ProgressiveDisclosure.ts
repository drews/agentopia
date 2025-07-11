/**
 * Progressive Disclosure System
 * Manages the gradual revelation of mind-ship capabilities based on user mastery and context
 */

export interface SystemState {
  STASIS: 'stasis';
  AWAKENING: 'awakening';
  DIAGNOSTIC: 'diagnostic';
  PERSONALIZATION: 'personalization';
  OPERATIONAL: 'operational';
  MASTERY: 'mastery';
}

export interface DisclosureRule {
  id: string;
  name: string;
  description: string;
  requiredState: keyof SystemState;
  requiredMetrics?: MetricRequirement[];
  requiredActions?: string[];
  unlocks: string[];
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface MetricRequirement {
  metric: string;
  threshold: number;
  operator: '>' | '<' | '>=' | '<=' | '=';
}

export interface UserCapability {
  id: string;
  name: string;
  unlocked: boolean;
  unlockedAt?: Date;
  proficiency: number; // 0-1 scale
  lastUsed?: Date;
  usageCount: number;
}

export interface DisclosureContext {
  systemState: keyof SystemState;
  userMetrics: Record<string, number>;
  completedActions: string[];
  unlockedCapabilities: string[];
  sessionDuration: number;
  userPreferences: Record<string, any>;
}

export class ProgressiveDisclosureEngine {
  private disclosureRules: DisclosureRule[] = [];
  private userCapabilities: Map<string, UserCapability> = new Map();
  private currentContext: DisclosureContext;
  private listeners: Set<(context: DisclosureContext) => void> = new Set();

  constructor(initialContext: DisclosureContext) {
    this.currentContext = initialContext;
    this.initializeDisclosureRules();
    this.initializeUserCapabilities();
  }

  private initializeDisclosureRules(): void {
    this.disclosureRules = [
      // Act I: Awakening Rules
      {
        id: 'system-initialization',
        name: 'System Initialization',
        description: 'Activate basic ship systems from stasis',
        requiredState: 'STASIS',
        unlocks: ['emergency-lighting', 'basic-interface', 'ai-introduction'],
        priority: 'critical'
      },
      {
        id: 'ai-communication',
        name: 'AI Communication Setup',
        description: 'Establish communication protocols with ship AI',
        requiredState: 'AWAKENING',
        requiredActions: ['initialize-systems'],
        unlocks: ['voice-interface', 'preference-setup', 'communication-styles'],
        priority: 'high'
      },
      {
        id: 'ship-diagnostics',
        name: 'Ship Systems Diagnostics',
        description: 'Full assessment of ship capabilities and crew',
        requiredState: 'AWAKENING',
        requiredActions: ['setup-preferences'],
        unlocks: ['system-overview', 'crew-manifest', 'department-details'],
        priority: 'high'
      },
      {
        id: 'crew-assignment',
        name: 'Initial Crew Assignment',
        description: 'Assign first agent to ship department',
        requiredState: 'DIAGNOSTIC',
        requiredActions: ['view-crew-manifest'],
        unlocks: ['agent-assignment', 'department-management', 'skill-profiles'],
        priority: 'medium'
      },

      // Act II: Resonance Rules
      {
        id: 'voice-discovery',
        name: 'Command Voice Discovery',
        description: 'Find your natural command style and rhythm',
        requiredState: 'DIAGNOSTIC',
        requiredActions: ['assign-first-agent'],
        unlocks: ['voice-assessment', 'system-tuning', 'rhythm-customization'],
        priority: 'high'
      },
      {
        id: 'interface-adaptation',
        name: 'Bridge Interface Adaptation',
        description: 'Customize bridge to match your command voice',
        requiredState: 'PERSONALIZATION',
        requiredActions: ['complete-voice-assessment'],
        unlocks: ['adaptive-layout', 'voice-responsive-ui', 'smart-alerts'],
        priority: 'medium'
      },
      {
        id: 'smooth-operations',
        name: 'Smooth Operations Setup',
        description: 'Establish natural communication rhythms',
        requiredState: 'PERSONALIZATION',
        requiredActions: ['setup-system-tuning'],
        unlocks: ['natural-rhythm', 'anticipatory-updates', 'flow-optimization'],
        priority: 'medium'
      },
      {
        id: 'first-mission',
        name: 'First Mission Assignment',
        description: 'Launch first agent mission to validate executive agency',
        requiredState: 'PERSONALIZATION',
        requiredActions: ['setup-communication-rhythm'],
        unlocks: ['mission-planning', 'agent-coordination', 'progress-monitoring'],
        priority: 'critical'
      },

      // Act III: Mastery Rules
      {
        id: 'fleet-awareness',
        name: 'Multi-Ship Fleet Awareness',
        description: 'Expand oversight to multiple ships and complex operations',
        requiredState: 'OPERATIONAL',
        requiredMetrics: [
          { metric: 'successful_missions', threshold: 3, operator: '>=' },
          { metric: 'agent_trust_level', threshold: 0.7, operator: '>=' }
        ],
        unlocks: ['fleet-overview', 'cross-ship-coordination', 'resource-sharing'],
        priority: 'high'
      },
      {
        id: 'strategic-planning',
        name: 'Strategic Mission Planning',
        description: 'Long-term strategic planning and resource optimization',
        requiredState: 'MASTERY',
        requiredMetrics: [
          { metric: 'delegation_comfort', threshold: 0.8, operator: '>=' },
          { metric: 'system_mastery', threshold: 0.6, operator: '>=' }
        ],
        unlocks: ['strategic-planner', 'resource-optimizer', 'long-term-objectives'],
        priority: 'high'
      },
      {
        id: 'crisis-management',
        name: 'Crisis Management Protocols',
        description: 'Advanced crisis response and emergency coordination',
        requiredState: 'MASTERY',
        requiredMetrics: [
          { metric: 'multi_objective_management', threshold: 0.7, operator: '>=' },
          { metric: 'strategic_thinking', threshold: 0.6, operator: '>=' }
        ],
        unlocks: ['crisis-protocols', 'emergency-reallocation', 'rapid-response'],
        priority: 'critical'
      },
      {
        id: 'executive-mastery',
        name: 'Executive Mastery Achievement',
        description: 'Full command of fleet operations and strategic oversight',
        requiredState: 'MASTERY',
        requiredMetrics: [
          { metric: 'strategic_thinking', threshold: 0.9, operator: '>=' },
          { metric: 'multi_objective_management', threshold: 0.8, operator: '>=' },
          { metric: 'crisis_resolution_success', threshold: 0.7, operator: '>=' }
        ],
        unlocks: ['advanced-analytics', 'predictive-planning', 'autonomous-fleet-ops'],
        priority: 'critical'
      }
    ];
  }

  private initializeUserCapabilities(): void {
    const baseCapabilities = [
      // Basic Interface
      'emergency-lighting', 'basic-interface', 'ai-introduction',
      
      // Communication
      'voice-interface', 'preference-setup', 'communication-styles',
      
      // Diagnostics
      'system-overview', 'crew-manifest', 'department-details',
      
      // Agent Management
      'agent-assignment', 'department-management', 'skill-profiles',
      
      // Personalization
      'leadership-assessment', 'delegation-setup', 'workflow-customization',
      'layout-editor', 'widget-customization', 'alert-configuration',
      
      // Operations
      'briefing-schedule', 'report-frequency', 'escalation-protocols',
      'mission-planning', 'agent-coordination', 'progress-monitoring',
      
      // Fleet Management
      'fleet-overview', 'cross-ship-coordination', 'resource-sharing',
      
      // Strategic
      'strategic-planner', 'resource-optimizer', 'long-term-objectives',
      
      // Crisis Management
      'crisis-protocols', 'emergency-reallocation', 'rapid-response',
      
      // Mastery
      'advanced-analytics', 'predictive-planning', 'autonomous-fleet-ops'
    ];

    baseCapabilities.forEach(capability => {
      this.userCapabilities.set(capability, {
        id: capability,
        name: this.formatCapabilityName(capability),
        unlocked: false,
        proficiency: 0,
        usageCount: 0
      });
    });
  }

  private formatCapabilityName(id: string): string {
    return id.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  }

  public updateContext(updates: Partial<DisclosureContext>): void {
    this.currentContext = { ...this.currentContext, ...updates };
    this.evaluateDisclosureRules();
    this.notifyListeners();
  }

  public recordAction(action: string): void {
    if (!this.currentContext.completedActions.includes(action)) {
      this.currentContext.completedActions.push(action);
      this.evaluateDisclosureRules();
      this.notifyListeners();
    }
  }

  public updateUserMetric(metric: string, value: number): void {
    this.currentContext.userMetrics[metric] = value;
    this.evaluateDisclosureRules();
    this.notifyListeners();
  }

  public useCapability(capabilityId: string): void {
    const capability = this.userCapabilities.get(capabilityId);
    if (capability && capability.unlocked) {
      capability.lastUsed = new Date();
      capability.usageCount++;
      capability.proficiency = Math.min(1, capability.proficiency + 0.1);
      this.userCapabilities.set(capabilityId, capability);
    }
  }

  private evaluateDisclosureRules(): void {
    const newlyUnlocked: string[] = [];

    this.disclosureRules.forEach(rule => {
      if (this.shouldUnlockRule(rule)) {
        rule.unlocks.forEach(capabilityId => {
          const capability = this.userCapabilities.get(capabilityId);
          if (capability && !capability.unlocked) {
            capability.unlocked = true;
            capability.unlockedAt = new Date();
            this.userCapabilities.set(capabilityId, capability);
            newlyUnlocked.push(capabilityId);
          }
        });
      }
    });

    if (newlyUnlocked.length > 0) {
      this.currentContext.unlockedCapabilities.push(...newlyUnlocked);
    }
  }

  private shouldUnlockRule(rule: DisclosureRule): boolean {
    // Check system state requirement
    if (this.currentContext.systemState !== rule.requiredState) {
      return false;
    }

    // Check required actions
    if (rule.requiredActions) {
      const hasAllActions = rule.requiredActions.every(action =>
        this.currentContext.completedActions.includes(action)
      );
      if (!hasAllActions) {
        return false;
      }
    }

    // Check required metrics
    if (rule.requiredMetrics) {
      const meetsAllMetrics = rule.requiredMetrics.every(req => {
        const currentValue = this.currentContext.userMetrics[req.metric] || 0;
        switch (req.operator) {
          case '>': return currentValue > req.threshold;
          case '<': return currentValue < req.threshold;
          case '>=': return currentValue >= req.threshold;
          case '<=': return currentValue <= req.threshold;
          case '=': return currentValue === req.threshold;
          default: return false;
        }
      });
      if (!meetsAllMetrics) {
        return false;
      }
    }

    return true;
  }

  public getAvailableCapabilities(): UserCapability[] {
    return Array.from(this.userCapabilities.values()).filter(cap => cap.unlocked);
  }

  public getNextUnlockableCapabilities(): { capability: string; requirements: string[] }[] {
    const nextUnlocks: { capability: string; requirements: string[] }[] = [];

    this.disclosureRules.forEach(rule => {
      const unlockedCapabilities = rule.unlocks.filter(capId => {
        const capability = this.userCapabilities.get(capId);
        return capability && !capability.unlocked;
      });

      if (unlockedCapabilities.length > 0) {
        const requirements: string[] = [];
        
        if (this.currentContext.systemState !== rule.requiredState) {
          requirements.push(`Reach ${rule.requiredState} state`);
        }

        if (rule.requiredActions) {
          const missingActions = rule.requiredActions.filter(action =>
            !this.currentContext.completedActions.includes(action)
          );
          requirements.push(...missingActions.map(action => `Complete: ${action}`));
        }

        if (rule.requiredMetrics) {
          const unmetMetrics = rule.requiredMetrics.filter(req => {
            const currentValue = this.currentContext.userMetrics[req.metric] || 0;
            switch (req.operator) {
              case '>': return currentValue <= req.threshold;
              case '<': return currentValue >= req.threshold;
              case '>=': return currentValue < req.threshold;
              case '<=': return currentValue > req.threshold;
              case '=': return currentValue !== req.threshold;
              default: return true;
            }
          });
          requirements.push(...unmetMetrics.map(req => 
            `${req.metric} must be ${req.operator} ${req.threshold}`
          ));
        }

        unlockedCapabilities.forEach(capId => {
          nextUnlocks.push({
            capability: capId,
            requirements: requirements
          });
        });
      }
    });

    return nextUnlocks;
  }

  public getProgressSummary(): {
    currentAct: string;
    completionPercentage: number;
    unlockedCapabilities: number;
    totalCapabilities: number;
    nextMilestones: string[];
  } {
    const totalCapabilities = this.userCapabilities.size;
    const unlockedCapabilities = Array.from(this.userCapabilities.values())
      .filter(cap => cap.unlocked).length;
    
    const completionPercentage = (unlockedCapabilities / totalCapabilities) * 100;

    let currentAct = 'Act I: Awakening';
    if (this.currentContext.systemState === 'PERSONALIZATION' || 
        this.currentContext.systemState === 'OPERATIONAL') {
      currentAct = 'Act II: Personalization';
    } else if (this.currentContext.systemState === 'MASTERY') {
      currentAct = 'Act III: Mastery';
    }

    const nextMilestones = this.getNextUnlockableCapabilities()
      .slice(0, 3)
      .map(unlock => unlock.capability);

    return {
      currentAct,
      completionPercentage,
      unlockedCapabilities,
      totalCapabilities,
      nextMilestones
    };
  }

  public subscribe(listener: (context: DisclosureContext) => void): void {
    this.listeners.add(listener);
  }

  public unsubscribe(listener: (context: DisclosureContext) => void): void {
    this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.currentContext));
  }

  public getCurrentContext(): DisclosureContext {
    return { ...this.currentContext };
  }

  public getCapabilityById(id: string): UserCapability | undefined {
    return this.userCapabilities.get(id);
  }

  public isCapabilityUnlocked(id: string): boolean {
    const capability = this.userCapabilities.get(id);
    return capability ? capability.unlocked : false;
  }

  public getSystemState(): keyof SystemState {
    return this.currentContext.systemState;
  }

  public transitionToState(newState: keyof SystemState): void {
    this.currentContext.systemState = newState;
    this.evaluateDisclosureRules();
    this.notifyListeners();
  }

  // Debugging and development helpers
  public unlockAllCapabilities(): void {
    this.userCapabilities.forEach((capability, id) => {
      capability.unlocked = true;
      capability.unlockedAt = new Date();
      this.userCapabilities.set(id, capability);
    });
    this.notifyListeners();
  }

  public resetProgress(): void {
    this.userCapabilities.forEach((capability, id) => {
      capability.unlocked = false;
      capability.unlockedAt = undefined;
      capability.proficiency = 0;
      capability.usageCount = 0;
      capability.lastUsed = undefined;
      this.userCapabilities.set(id, capability);
    });
    
    this.currentContext = {
      systemState: 'STASIS',
      userMetrics: {},
      completedActions: [],
      unlockedCapabilities: [],
      sessionDuration: 0,
      userPreferences: {}
    };
    
    this.notifyListeners();
  }
}

// Export singleton instance
export const progressiveDisclosure = new ProgressiveDisclosureEngine({
  systemState: 'STASIS',
  userMetrics: {},
  completedActions: [],
  unlockedCapabilities: [],
  sessionDuration: 0,
  userPreferences: {}
});

export default progressiveDisclosure;