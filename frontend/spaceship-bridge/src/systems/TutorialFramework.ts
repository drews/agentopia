/**
 * Context-Aware Tutorial Framework
 * Provides adaptive guidance based on user progress, system state, and discovered voice
 */

import { progressiveDisclosure, DisclosureContext } from './ProgressiveDisclosure';

export interface TutorialStep {
  id: string;
  title: string;
  description: string;
  targetElement?: string;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  requiredCapability?: string;
  triggerCondition?: TutorialTrigger;
  content: TutorialContent;
  actions?: TutorialAction[];
  skippable: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface TutorialTrigger {
  type: 'capability_unlock' | 'state_change' | 'user_action' | 'time_delay' | 'context_change';
  condition: string;
  delay?: number; // milliseconds
}

export interface TutorialContent {
  type: 'tooltip' | 'overlay' | 'modal' | 'highlight' | 'contextual_hint';
  text: string;
  animation?: string;
  voiceOver?: string; // For accessibility
  visualCues?: VisualCue[];
}

export interface VisualCue {
  type: 'pulse' | 'glow' | 'arrow' | 'spotlight' | 'breadcrumb';
  target: string;
  duration?: number;
  intensity?: 'subtle' | 'medium' | 'strong';
}

export interface TutorialAction {
  label: string;
  action: 'next' | 'skip' | 'retry' | 'explore' | 'custom';
  callback?: () => void;
}

export interface TutorialState {
  currentStep?: TutorialStep;
  completedSteps: Set<string>;
  skippedSteps: Set<string>;
  userPreferences: TutorialPreferences;
  contextualHints: Map<string, ContextualHint>;
  active: boolean;
}

export interface TutorialPreferences {
  enabled: boolean;
  verbosity: 'minimal' | 'standard' | 'detailed';
  animationsEnabled: boolean;
  voiceOverEnabled: boolean;
  autoAdvance: boolean;
  hintFrequency: 'low' | 'medium' | 'high';
}

export interface ContextualHint {
  id: string;
  text: string;
  element: string;
  priority: number;
  expiresAt?: Date;
  conditions?: string[];
}

export class TutorialEngine {
  private state: TutorialState;
  private tutorialSteps: Map<string, TutorialStep> = new Map();
  private listeners: Set<(state: TutorialState) => void> = new Set();
  private contextListeners: Set<(context: DisclosureContext) => void> = new Set();

  constructor() {
    this.state = {
      completedSteps: new Set(),
      skippedSteps: new Set(),
      userPreferences: {
        enabled: true,
        verbosity: 'standard',
        animationsEnabled: true,
        voiceOverEnabled: false,
        autoAdvance: false,
        hintFrequency: 'medium'
      },
      contextualHints: new Map(),
      active: false
    };

    this.initializeTutorialSteps();
    this.subscribeToDisclosureUpdates();
  }

  private initializeTutorialSteps(): void {
    const steps: TutorialStep[] = [
      // Act I: Awakening Tutorials
      {
        id: 'first-awakening',
        title: 'Welcome to Your Ship',
        description: 'This is your command bridge. Click the pulsing button to bring systems online.',
        targetElement: '[data-testid="initialize-systems"]',
        position: 'bottom',
        triggerCondition: {
          type: 'state_change',
          condition: 'STASIS'
        },
        content: {
          type: 'tooltip',
          text: 'Click here to wake up your ship systems',
          animation: 'gentle-pulse',
          visualCues: [{
            type: 'pulse',
            target: '[data-testid="initialize-systems"]',
            intensity: 'medium'
          }]
        },
        actions: [
          { label: 'Got it', action: 'next' },
          { label: 'Skip tutorials', action: 'skip' }
        ],
        skippable: true,
        priority: 'critical'
      },

      {
        id: 'ai-introduction',
        title: 'Meet Your AI',
        description: 'ARIA will help you manage your ship. Set up how you want to communicate.',
        targetElement: '.communication-preferences',
        position: 'right',
        triggerCondition: {
          type: 'capability_unlock',
          condition: 'ai-introduction'
        },
        content: {
          type: 'overlay',
          text: 'Choose how you prefer to work with AI agents',
          visualCues: [{
            type: 'spotlight',
            target: '.communication-preferences',
            intensity: 'subtle'
          }]
        },
        actions: [
          { label: 'Explore options', action: 'explore' },
          { label: 'Continue', action: 'next' }
        ],
        skippable: true,
        priority: 'high'
      },

      {
        id: 'bridge-overview',
        title: 'Your Bridge Layout',
        description: 'This grid shows your ship systems and any active agents.',
        targetElement: '.bridge-grid',
        position: 'top',
        triggerCondition: {
          type: 'capability_unlock',
          condition: 'system-overview'
        },
        content: {
          type: 'contextual_hint',
          text: 'Each square represents a station or area where agents can work',
          animation: 'fade-in',
          visualCues: [{
            type: 'breadcrumb',
            target: '.bridge-grid .station',
            intensity: 'subtle'
          }]
        },
        actions: [
          { label: 'Show me more', action: 'next' }
        ],
        skippable: true,
        priority: 'medium'
      },

      // Act II: Resonance Tutorials
      {
        id: 'voice-discovery-intro',
        title: 'Finding Your Command Voice',
        description: 'Time to discover how you naturally like to give commands.',
        targetElement: '[data-testid="begin-voice-discovery"]',
        position: 'bottom',
        triggerCondition: {
          type: 'capability_unlock',
          condition: 'voice-assessment'
        },
        content: {
          type: 'modal',
          text: 'Every commander has a unique style. Let\'s find yours through some scenarios.',
          animation: 'slide-up'
        },
        actions: [
          { label: 'Let\'s start', action: 'next' },
          { label: 'Maybe later', action: 'skip' }
        ],
        skippable: true,
        priority: 'high'
      },

      {
        id: 'system-tuning',
        title: 'Tuning Your Ship',
        description: 'Now we\'ll adjust how the ship responds to match your style.',
        targetElement: '.system-tuning',
        position: 'left',
        triggerCondition: {
          type: 'user_action',
          condition: 'complete-voice-assessment'
        },
        content: {
          type: 'tooltip',
          text: 'These settings control how quickly and directly the ship responds to you',
          visualCues: [{
            type: 'glow',
            target: '.system-tuning .slider',
            intensity: 'medium'
          }]
        },
        actions: [
          { label: 'Adjust settings', action: 'explore' }
        ],
        skippable: true,
        priority: 'medium'
      },

      {
        id: 'first-mission-guide',
        title: 'Your First Mission',
        description: 'Ready to put your tuned system to the test?',
        targetElement: '.mission-interface',
        position: 'center',
        triggerCondition: {
          type: 'capability_unlock',
          condition: 'mission-planning'
        },
        content: {
          type: 'overlay',
          text: 'Choose a simple mission to see how well you and your agents work together',
          animation: 'zoom-in'
        },
        actions: [
          { label: 'Pick a mission', action: 'next' },
          { label: 'I\'ll explore first', action: 'skip' }
        ],
        skippable: true,
        priority: 'high'
      },

      // Act III: Emergence Tutorials
      {
        id: 'system-expansion-intro',
        title: 'New Possibilities',
        description: 'With proven operations, new capabilities become available.',
        targetElement: '[data-testid="system-expansion"]',
        position: 'bottom',
        triggerCondition: {
          type: 'capability_unlock',
          condition: 'fleet-overview'
        },
        content: {
          type: 'highlight',
          text: 'You can now coordinate multiple systems and unlock advanced operations',
          animation: 'pulse-glow'
        },
        actions: [
          { label: 'Show me', action: 'next' },
          { label: 'I\'ll figure it out', action: 'skip' }
        ],
        skippable: true,
        priority: 'medium'
      },

      {
        id: 'advanced-coordination',
        title: 'Advanced Coordination',
        description: 'Manage complex operations across multiple systems.',
        targetElement: '.coordination-options',
        position: 'right',
        triggerCondition: {
          type: 'capability_unlock',
          condition: 'cross-ship-coordination'
        },
        content: {
          type: 'contextual_hint',
          text: 'These tools let you orchestrate missions that single ships couldn\'t handle',
          visualCues: [{
            type: 'arrow',
            target: '.coordination-panel',
            intensity: 'medium'
          }]
        },
        actions: [
          { label: 'Try it out', action: 'explore' }
        ],
        skippable: true,
        priority: 'low'
      }
    ];

    steps.forEach(step => {
      this.tutorialSteps.set(step.id, step);
    });
  }

  private subscribeToDisclosureUpdates(): void {
    progressiveDisclosure.subscribe((context) => {
      this.handleContextUpdate(context);
    });
  }

  private handleContextUpdate(context: DisclosureContext): void {
    // Check for new tutorial triggers
    this.tutorialSteps.forEach((step, stepId) => {
      if (this.shouldTriggerStep(step, context)) {
        this.triggerStep(stepId);
      }
    });

    // Update contextual hints
    this.updateContextualHints(context);
  }

  private shouldTriggerStep(step: TutorialStep, context: DisclosureContext): boolean {
    // Don't trigger if already completed or skipped
    if (this.state.completedSteps.has(step.id) || 
        this.state.skippedSteps.has(step.id)) {
      return false;
    }

    // Don't trigger if tutorials disabled
    if (!this.state.userPreferences.enabled) {
      return false;
    }

    // Check trigger condition
    if (!step.triggerCondition) {
      return false;
    }

    const trigger = step.triggerCondition;
    switch (trigger.type) {
      case 'capability_unlock':
        return context.unlockedCapabilities.includes(trigger.condition);
      
      case 'state_change':
        return context.systemState === trigger.condition;
      
      case 'user_action':
        return context.completedActions.includes(trigger.condition);
      
      case 'context_change':
        return this.evaluateContextCondition(trigger.condition, context);
      
      default:
        return false;
    }
  }

  private evaluateContextCondition(condition: string, context: DisclosureContext): boolean {
    // Simple condition evaluation - could be expanded
    if (condition.includes('successful_missions')) {
      const threshold = parseInt(condition.split('>')[1]);
      return (context.userMetrics.successful_missions || 0) > threshold;
    }
    return false;
  }

  public triggerStep(stepId: string): void {
    const step = this.tutorialSteps.get(stepId);
    if (!step) return;

    // Apply delay if specified
    const delay = step.triggerCondition?.delay || 0;
    
    setTimeout(() => {
      this.state.currentStep = step;
      this.state.active = true;
      this.notifyListeners();
    }, delay);
  }

  public completeStep(stepId: string): void {
    this.state.completedSteps.add(stepId);
    
    if (this.state.currentStep?.id === stepId) {
      this.state.currentStep = undefined;
      this.state.active = false;
    }
    
    this.notifyListeners();
  }

  public skipStep(stepId: string): void {
    this.state.skippedSteps.add(stepId);
    
    if (this.state.currentStep?.id === stepId) {
      this.state.currentStep = undefined;
      this.state.active = false;
    }
    
    this.notifyListeners();
  }

  public updatePreferences(preferences: Partial<TutorialPreferences>): void {
    this.state.userPreferences = { ...this.state.userPreferences, ...preferences };
    this.notifyListeners();
  }

  private updateContextualHints(context: DisclosureContext): void {
    // Clear expired hints
    const now = new Date();
    this.state.contextualHints.forEach((hint, id) => {
      if (hint.expiresAt && hint.expiresAt < now) {
        this.state.contextualHints.delete(id);
      }
    });

    // Add new contextual hints based on current state
    this.generateContextualHints(context);
  }

  private generateContextualHints(context: DisclosureContext): void {
    const hintFrequency = this.state.userPreferences.hintFrequency;
    if (hintFrequency === 'low') return;

    // Generate hints based on system state
    switch (context.systemState) {
      case 'STASIS':
        this.addContextualHint({
          id: 'stasis-help',
          text: 'Click the glowing button to begin',
          element: '[data-testid="initialize-systems"]',
          priority: 1,
          expiresAt: new Date(Date.now() + 30000) // 30 seconds
        });
        break;

      case 'AWAKENING':
        this.addContextualHint({
          id: 'awakening-patience',
          text: 'Systems are coming online...',
          element: '.bridge-container',
          priority: 2,
          expiresAt: new Date(Date.now() + 10000)
        });
        break;

      case 'DIAGNOSTIC':
        if (!context.completedActions.includes('view-crew-manifest')) {
          this.addContextualHint({
            id: 'crew-suggestion',
            text: 'Check out your available crew members',
            element: '[data-testid="crew-manifest"]',
            priority: 3,
            expiresAt: new Date(Date.now() + 60000)
          });
        }
        break;

      case 'PERSONALIZATION':
        if (hintFrequency === 'high') {
          this.addContextualHint({
            id: 'voice-discovery-reminder',
            text: 'Take your time finding your command style',
            element: '.voice-discovery',
            priority: 2,
            expiresAt: new Date(Date.now() + 45000)
          });
        }
        break;
    }
  }

  private addContextualHint(hint: ContextualHint): void {
    this.state.contextualHints.set(hint.id, hint);
    this.notifyListeners();
  }

  public getActiveHints(): ContextualHint[] {
    return Array.from(this.state.contextualHints.values())
      .filter(hint => !hint.expiresAt || hint.expiresAt > new Date())
      .sort((a, b) => a.priority - b.priority);
  }

  public dismissHint(hintId: string): void {
    this.state.contextualHints.delete(hintId);
    this.notifyListeners();
  }

  public getCurrentStep(): TutorialStep | undefined {
    return this.state.currentStep;
  }

  public isActive(): boolean {
    return this.state.active;
  }

  public getCompletedSteps(): string[] {
    return Array.from(this.state.completedSteps);
  }

  public getProgress(): { completed: number; total: number; percentage: number } {
    const total = this.tutorialSteps.size;
    const completed = this.state.completedSteps.size;
    const percentage = total > 0 ? (completed / total) * 100 : 0;
    
    return { completed, total, percentage };
  }

  public subscribe(listener: (state: TutorialState) => void): void {
    this.listeners.add(listener);
  }

  public unsubscribe(listener: (state: TutorialState) => void): void {
    this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.state));
  }

  // Debug and development helpers
  public triggerStepById(stepId: string): void {
    this.triggerStep(stepId);
  }

  public resetTutorials(): void {
    this.state.completedSteps.clear();
    this.state.skippedSteps.clear();
    this.state.currentStep = undefined;
    this.state.active = false;
    this.state.contextualHints.clear();
    this.notifyListeners();
  }

  public skipAllTutorials(): void {
    this.tutorialSteps.forEach((step, stepId) => {
      this.state.skippedSteps.add(stepId);
    });
    this.state.currentStep = undefined;
    this.state.active = false;
    this.notifyListeners();
  }

  public enableTutorials(): void {
    this.updatePreferences({ enabled: true });
  }

  public disableTutorials(): void {
    this.updatePreferences({ enabled: false });
    this.state.currentStep = undefined;
    this.state.active = false;
    this.notifyListeners();
  }
}

// Export singleton instance
export const tutorialEngine = new TutorialEngine();

export default tutorialEngine;