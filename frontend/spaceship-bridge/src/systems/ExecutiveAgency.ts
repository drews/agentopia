/**
 * Executive Agency Personalization System
 * Manages the development and expression of user's command authority and personal style
 */

export interface CommandVoice {
  id: string;
  name: string;
  description: string;
  characteristics: VoiceCharacteristic[];
  communicationStyle: CommunicationStyle;
  decisionPattern: DecisionPattern;
  delegationStyle: DelegationStyle;
}

export interface VoiceCharacteristic {
  trait: string;
  value: number; // 0-1 scale
  description: string;
}

export interface CommunicationStyle {
  directness: number; // 0-1: indirect to very direct
  formality: number; // 0-1: casual to formal
  frequency: number; // 0-1: minimal to constant updates
  detailLevel: number; // 0-1: summary to comprehensive
}

export interface DecisionPattern {
  speed: number; // 0-1: deliberate to rapid
  consultation: number; // 0-1: autonomous to collaborative
  riskTolerance: number; // 0-1: conservative to aggressive
  dataRequirement: number; // 0-1: intuitive to data-driven
}

export interface DelegationStyle {
  autonomyGiven: number; // 0-1: micromanage to full autonomy
  checkInFrequency: number; // 0-1: constant to rare check-ins
  interventionThreshold: number; // 0-1: intervene early to let it ride
  feedbackStyle: number; // 0-1: corrective to encouraging
}

export interface AgencyMetrics {
  confidence: number; // User's confidence in commanding
  delegation_comfort: number; // Comfort with agent autonomy
  system_mastery: number; // Understanding of ship capabilities
  strategic_thinking: number; // Long-term planning ability
  crisis_management: number; // Performance under pressure
  adaptive_leadership: number; // Ability to adjust style based on context
}

export interface PersonalizationProfile {
  userId: string;
  commandVoice: CommandVoice;
  agencyMetrics: AgencyMetrics;
  preferences: UserPreferences;
  learningHistory: LearningEvent[];
  adaptations: SystemAdaptation[];
  lastUpdated: Date;
}

export interface UserPreferences {
  interfaceStyle: 'minimal' | 'standard' | 'detailed';
  updateTiming: 'real-time' | 'batched' | 'scheduled';
  alertPriorities: AlertPriority[];
  workingRhythm: WorkingRhythm;
  visualTheme: VisualTheme;
}

export interface AlertPriority {
  category: string;
  threshold: 'low' | 'medium' | 'high' | 'critical';
  immediate: boolean;
  channels: ('visual' | 'audio' | 'haptic')[];
}

export interface WorkingRhythm {
  focusPeriods: TimeWindow[];
  preferredMeetingTimes: TimeWindow[];
  quietHours: TimeWindow[];
  energyPeaks: TimeWindow[];
}

export interface TimeWindow {
  start: string; // HH:MM format
  end: string;
  timezone?: string;
}

export interface VisualTheme {
  colorScheme: 'dark' | 'light' | 'auto';
  density: 'compact' | 'comfortable' | 'spacious';
  animations: 'minimal' | 'standard' | 'enhanced';
  accessibility: AccessibilitySettings;
}

export interface AccessibilitySettings {
  highContrast: boolean;
  largeText: boolean;
  reducedMotion: boolean;
  screenReaderOptimized: boolean;
  keyboardNavigation: boolean;
}

export interface LearningEvent {
  timestamp: Date;
  category: 'voice_discovery' | 'delegation' | 'decision' | 'communication';
  context: string;
  userChoice: any;
  outcome: 'positive' | 'neutral' | 'negative';
  adaptationMade?: string;
}

export interface SystemAdaptation {
  id: string;
  category: string;
  description: string;
  appliedAt: Date;
  basedOn: string[]; // Which learning events triggered this
  effectiveness?: number; // 0-1 scale if measurable
}

export class ExecutiveAgencyEngine {
  private profile: PersonalizationProfile;
  private voiceTemplates: Map<string, Partial<CommandVoice>> = new Map();
  private listeners: Set<(profile: PersonalizationProfile) => void> = new Set();

  constructor(userId: string) {
    this.profile = this.initializeProfile(userId);
    this.initializeVoiceTemplates();
  }

  private initializeProfile(userId: string): PersonalizationProfile {
    return {
      userId,
      commandVoice: {
        id: 'discovering',
        name: 'Discovering',
        description: 'Finding your unique command style',
        characteristics: [
          { trait: 'directness', value: 0.5, description: 'How explicit you are with commands' },
          { trait: 'patience', value: 0.5, description: 'How much time you give for responses' },
          { trait: 'collaboration', value: 0.5, description: 'How much you involve agents in planning' },
          { trait: 'adaptability', value: 0.5, description: 'How quickly you adjust to new situations' }
        ],
        communicationStyle: {
          directness: 0.5,
          formality: 0.5,
          frequency: 0.5,
          detailLevel: 0.5
        },
        decisionPattern: {
          speed: 0.5,
          consultation: 0.5,
          riskTolerance: 0.5,
          dataRequirement: 0.5
        },
        delegationStyle: {
          autonomyGiven: 0.3,
          checkInFrequency: 0.7,
          interventionThreshold: 0.6,
          feedbackStyle: 0.5
        }
      },
      agencyMetrics: {
        confidence: 0.1,
        delegation_comfort: 0.2,
        system_mastery: 0.0,
        strategic_thinking: 0.0,
        crisis_management: 0.0,
        adaptive_leadership: 0.0
      },
      preferences: {
        interfaceStyle: 'standard',
        updateTiming: 'batched',
        alertPriorities: [
          { category: 'system_error', threshold: 'critical', immediate: true, channels: ['visual', 'audio'] },
          { category: 'mission_complete', threshold: 'medium', immediate: false, channels: ['visual'] },
          { category: 'agent_question', threshold: 'medium', immediate: false, channels: ['visual'] }
        ],
        workingRhythm: {
          focusPeriods: [{ start: '09:00', end: '11:00' }, { start: '14:00', end: '16:00' }],
          preferredMeetingTimes: [{ start: '10:00', end: '12:00' }],
          quietHours: [{ start: '17:00', end: '09:00' }],
          energyPeaks: [{ start: '09:00', end: '11:00' }]
        },
        visualTheme: {
          colorScheme: 'dark',
          density: 'comfortable',
          animations: 'standard',
          accessibility: {
            highContrast: false,
            largeText: false,
            reducedMotion: false,
            screenReaderOptimized: false,
            keyboardNavigation: true
          }
        }
      },
      learningHistory: [],
      adaptations: [],
      lastUpdated: new Date()
    };
  }

  private initializeVoiceTemplates(): void {
    this.voiceTemplates.set('direct-commander', {
      name: 'Direct Commander',
      description: 'Clear, decisive, efficient communication',
      characteristics: [
        { trait: 'directness', value: 0.9, description: 'Very explicit and clear' },
        { trait: 'patience', value: 0.3, description: 'Expects quick responses' },
        { trait: 'collaboration', value: 0.4, description: 'Prefers giving instructions' },
        { trait: 'adaptability', value: 0.7, description: 'Quick to adjust tactics' }
      ],
      communicationStyle: {
        directness: 0.9,
        formality: 0.6,
        frequency: 0.4,
        detailLevel: 0.3
      },
      decisionPattern: {
        speed: 0.8,
        consultation: 0.3,
        riskTolerance: 0.6,
        dataRequirement: 0.4
      },
      delegationStyle: {
        autonomyGiven: 0.5,
        checkInFrequency: 0.6,
        interventionThreshold: 0.7,
        feedbackStyle: 0.7
      }
    });

    this.voiceTemplates.set('collaborative-guide', {
      name: 'Collaborative Guide',
      description: 'Inclusive, thoughtful, team-oriented approach',
      characteristics: [
        { trait: 'directness', value: 0.5, description: 'Balanced and considerate' },
        { trait: 'patience', value: 0.8, description: 'Gives time for input' },
        { trait: 'collaboration', value: 0.9, description: 'Highly values team input' },
        { trait: 'adaptability', value: 0.8, description: 'Flexible and responsive' }
      ],
      communicationStyle: {
        directness: 0.5,
        formality: 0.4,
        frequency: 0.7,
        detailLevel: 0.7
      },
      decisionPattern: {
        speed: 0.4,
        consultation: 0.9,
        riskTolerance: 0.4,
        dataRequirement: 0.8
      },
      delegationStyle: {
        autonomyGiven: 0.8,
        checkInFrequency: 0.4,
        interventionThreshold: 0.3,
        feedbackStyle: 0.9
      }
    });

    this.voiceTemplates.set('strategic-overseer', {
      name: 'Strategic Overseer',
      description: 'Big picture focus, systematic, analytical',
      characteristics: [
        { trait: 'directness', value: 0.6, description: 'Clear but measured' },
        { trait: 'patience', value: 0.7, description: 'Takes time for good decisions' },
        { trait: 'collaboration', value: 0.6, description: 'Values expertise' },
        { trait: 'adaptability', value: 0.5, description: 'Thoughtful about changes' }
      ],
      communicationStyle: {
        directness: 0.6,
        formality: 0.7,
        frequency: 0.3,
        detailLevel: 0.8
      },
      decisionPattern: {
        speed: 0.3,
        consultation: 0.6,
        riskTolerance: 0.3,
        dataRequirement: 0.9
      },
      delegationStyle: {
        autonomyGiven: 0.7,
        checkInFrequency: 0.3,
        interventionThreshold: 0.5,
        feedbackStyle: 0.6
      }
    });
  }

  public recordLearningEvent(event: Omit<LearningEvent, 'timestamp'>): void {
    const learningEvent: LearningEvent = {
      ...event,
      timestamp: new Date()
    };

    this.profile.learningHistory.push(learningEvent);
    this.analyzeAndAdapt(learningEvent);
    this.updateMetrics(learningEvent);
    this.profile.lastUpdated = new Date();
    this.notifyListeners();
  }

  private analyzeAndAdapt(event: LearningEvent): void {
    switch (event.category) {
      case 'voice_discovery':
        this.adaptCommandVoice(event);
        break;
      case 'delegation':
        this.adaptDelegationStyle(event);
        break;
      case 'decision':
        this.adaptDecisionPattern(event);
        break;
      case 'communication':
        this.adaptCommunicationStyle(event);
        break;
    }
  }

  private adaptCommandVoice(event: LearningEvent): void {
    if (event.outcome === 'positive' && event.userChoice.voiceTemplate) {
      const template = this.voiceTemplates.get(event.userChoice.voiceTemplate);
      if (template) {
        // Blend current voice with template based on positive feedback
        this.blendVoiceCharacteristics(template, 0.3);
        
        this.addAdaptation({
          id: `voice-adapt-${Date.now()}`,
          category: 'command_voice',
          description: `Adjusted voice towards ${template.name} style`,
          appliedAt: new Date(),
          basedOn: [event.context]
        });
      }
    }
  }

  private adaptDelegationStyle(event: LearningEvent): void {
    const delegation = this.profile.commandVoice.delegationStyle;
    
    if (event.context.includes('micromanagement') && event.outcome === 'negative') {
      delegation.autonomyGiven = Math.min(1, delegation.autonomyGiven + 0.2);
      delegation.checkInFrequency = Math.max(0, delegation.checkInFrequency - 0.2);
    } else if (event.context.includes('too_autonomous') && event.outcome === 'negative') {
      delegation.autonomyGiven = Math.max(0, delegation.autonomyGiven - 0.2);
      delegation.checkInFrequency = Math.min(1, delegation.checkInFrequency + 0.2);
    }
  }

  private adaptDecisionPattern(event: LearningEvent): void {
    const decision = this.profile.commandVoice.decisionPattern;
    
    if (event.context.includes('quick_decision') && event.outcome === 'positive') {
      decision.speed = Math.min(1, decision.speed + 0.1);
    } else if (event.context.includes('hasty_decision') && event.outcome === 'negative') {
      decision.speed = Math.max(0, decision.speed - 0.2);
      decision.dataRequirement = Math.min(1, decision.dataRequirement + 0.1);
    }
  }

  private adaptCommunicationStyle(event: LearningEvent): void {
    const comm = this.profile.commandVoice.communicationStyle;
    
    if (event.context.includes('too_frequent') && event.outcome === 'negative') {
      comm.frequency = Math.max(0, comm.frequency - 0.2);
    } else if (event.context.includes('not_enough_info') && event.outcome === 'negative') {
      comm.detailLevel = Math.min(1, comm.detailLevel + 0.2);
    }
  }

  private blendVoiceCharacteristics(template: Partial<CommandVoice>, blendFactor: number): void {
    if (template.characteristics) {
      template.characteristics.forEach(templateChar => {
        const currentChar = this.profile.commandVoice.characteristics.find(c => c.trait === templateChar.trait);
        if (currentChar) {
          currentChar.value = currentChar.value * (1 - blendFactor) + templateChar.value * blendFactor;
        }
      });
    }

    if (template.communicationStyle) {
      const current = this.profile.commandVoice.communicationStyle;
      const target = template.communicationStyle;
      Object.keys(target).forEach(key => {
        current[key] = current[key] * (1 - blendFactor) + target[key] * blendFactor;
      });
    }
  }

  private updateMetrics(event: LearningEvent): void {
    const metrics = this.profile.agencyMetrics;
    
    if (event.outcome === 'positive') {
      metrics.confidence = Math.min(1, metrics.confidence + 0.05);
      
      if (event.category === 'delegation') {
        metrics.delegation_comfort = Math.min(1, metrics.delegation_comfort + 0.1);
      }
      
      if (event.context.includes('system_use')) {
        metrics.system_mastery = Math.min(1, metrics.system_mastery + 0.05);
      }
      
      if (event.context.includes('strategic')) {
        metrics.strategic_thinking = Math.min(1, metrics.strategic_thinking + 0.1);
      }
    }
  }

  private addAdaptation(adaptation: SystemAdaptation): void {
    this.profile.adaptations.push(adaptation);
    
    // Keep only recent adaptations (last 50)
    if (this.profile.adaptations.length > 50) {
      this.profile.adaptations = this.profile.adaptations.slice(-50);
    }
  }

  public getPersonalizationSuggestions(): string[] {
    const suggestions: string[] = [];
    const voice = this.profile.commandVoice;
    const metrics = this.profile.agencyMetrics;
    
    // Suggest based on low metrics
    if (metrics.delegation_comfort < 0.5) {
      suggestions.push('Try delegating small tasks to build comfort with agent autonomy');
    }
    
    if (metrics.strategic_thinking < 0.3) {
      suggestions.push('Consider planning longer-term missions to develop strategic thinking');
    }
    
    // Suggest based on voice characteristics
    if (voice.delegationStyle.autonomyGiven < 0.3) {
      suggestions.push('Your agents might benefit from more autonomy in routine tasks');
    }
    
    if (voice.communicationStyle.frequency > 0.8) {
      suggestions.push('Consider reducing update frequency to avoid information overload');
    }
    
    return suggestions;
  }

  public getCommandVoiceSummary(): string {
    const voice = this.profile.commandVoice;
    const primaryTraits = voice.characteristics
      .filter(c => c.value > 0.7 || c.value < 0.3)
      .map(c => `${c.trait}: ${c.value > 0.7 ? 'high' : 'low'}`)
      .join(', ');
    
    return `Your command voice emphasizes ${primaryTraits || 'balanced approaches'}`;
  }

  public updatePreferences(preferences: Partial<UserPreferences>): void {
    this.profile.preferences = { ...this.profile.preferences, ...preferences };
    this.profile.lastUpdated = new Date();
    this.notifyListeners();
  }

  public getProfile(): PersonalizationProfile {
    return { ...this.profile };
  }

  public getAgencyMetrics(): AgencyMetrics {
    return { ...this.profile.agencyMetrics };
  }

  public getCommandVoice(): CommandVoice {
    return { ...this.profile.commandVoice };
  }

  public subscribe(listener: (profile: PersonalizationProfile) => void): void {
    this.listeners.add(listener);
  }

  public unsubscribe(listener: (profile: PersonalizationProfile) => void): void {
    this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.profile));
  }

  // Save/load functionality
  public exportProfile(): string {
    return JSON.stringify(this.profile, null, 2);
  }

  public importProfile(profileData: string): void {
    try {
      const imported = JSON.parse(profileData);
      this.profile = { ...this.profile, ...imported };
      this.profile.lastUpdated = new Date();
      this.notifyListeners();
    } catch (error) {
      console.error('Failed to import profile:', error);
    }
  }

  // Development helpers
  public resetProfile(): void {
    this.profile = this.initializeProfile(this.profile.userId);
    this.notifyListeners();
  }

  public simulateExperience(category: string, outcome: 'positive' | 'negative' = 'positive'): void {
    this.recordLearningEvent({
      category: category as any,
      context: `simulated_${category}`,
      userChoice: { simulated: true },
      outcome
    });
  }

  public boostMetric(metric: keyof AgencyMetrics, amount: number = 0.2): void {
    this.profile.agencyMetrics[metric] = Math.min(1, this.profile.agencyMetrics[metric] + amount);
    this.profile.lastUpdated = new Date();
    this.notifyListeners();
  }
}

// Create and export default instance (userId would come from auth)
export const executiveAgency = new ExecutiveAgencyEngine('default-user');

export default executiveAgency;