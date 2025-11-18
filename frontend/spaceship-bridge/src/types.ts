// Stagecraft-Inspired Types for Agentopia
// Theater metaphor: Characters perform in Scenes, using Props, with Lighting and Sound Design

// === CHARACTERS (formerly "Agents") ===
// The performers in our AI theater
export interface CharacterMood {
  state: 'waiting' | 'rehearsing' | 'performing' | 'moving' | 'improvising' | 'struggling' | 'offstage';
  energy?: number; // 0-100 performance energy
  focus?: number; // 0-100 concentration level
}

export interface Character {
  id: string;
  name: string;
  role: 'lead' | 'supporting' | 'ensemble' | 'understudy'; // character importance
  specialty: 'director' | 'scientist' | 'technician' | 'navigator' | 'communicator' | 'medic' | 'guardian' | 'coordinator';
  position: { x: number; y: number };
  mood: CharacterMood;
  // Performance attributes
  attributes: Record<string, number>;  // { "confidence": 75, "creativity": 60 }
  traits: string[];                    // ["methodical", "inspiring", "collaborative"]
  costume: {
    appearance: string;    // "confident" | "uncertain" | "focused"
    accessories: string[]; // ["badge", "toolkit", "communicator"]
    posture: string;       // "upright" | "leaning" | "alert"
  };
  lastPerformance?: string; // what they were last doing
}

// === SCENES & ACTS ===
// The theatrical framework for AI performance
export interface Scene {
  id: string;
  title: string;
  act: 'prologue' | 'act1' | 'act2' | 'act3' | 'epilogue';
  sceneType: 'dialogue' | 'action' | 'monologue' | 'ensemble' | 'transition';
  
  // Current cast and props
  cast: string[];           // character IDs in this scene
  props: string[];          // available props for this scene
  
  // Stage direction
  set: {
    background?: string;           // backdrop/environment
    characterMarks: Record<string, { x: number; y: number }>; // where characters stand
    propPlacement: Record<string, { x: number; y: number }>;  // where props are placed
  };
  
  // Production elements
  lighting: LightingCue;
  soundscape: SoundDesign;
  atmosphere: 'tense' | 'collaborative' | 'exploratory' | 'urgent' | 'celebratory';
}

export interface Act {
  id: string;
  title: string;
  scenes: Scene[];
  overallObjective: string; // what this act accomplishes
  transitionCue?: TransitionCue;
}

// === PROPS ===
// Interactive elements characters can use
export interface Prop {
  id: string;
  name: string;
  category: 'tool' | 'device' | 'interface' | 'resource' | 'artifact';
  
  // Technical connection
  mcpToolRef?: string;    // reference to actual MCP functionality
  
  // Stage properties
  appearance: 'pristine' | 'well-used' | 'improvised' | 'high-tech' | 'vintage';
  icon: string;
  size: 'handheld' | 'desktop' | 'console' | 'room-scale';
  
  // Performance state
  inUse: boolean;
  currentUser?: string;   // character ID using it
  availability: 'ready' | 'in-use' | 'maintenance' | 'broken';
  
  // Story elements
  significance: 'crucial' | 'helpful' | 'atmospheric' | 'red-herring';
  backstory?: string;     // narrative importance
}

// === LIGHTING DESIGN ===
// Visual atmosphere and focus control
export interface LightingCue {
  id: string;
  name: string;
  mood: 'bright' | 'dim' | 'dramatic' | 'warm' | 'cool' | 'emergency' | 'celebration';
  
  // Technical implementation
  primaryColor: string;    // main lighting color
  accentColor?: string;    // highlight color
  intensity: number;       // 0-100 brightness
  
  // Focus and attention
  spotlight?: { x: number; y: number; radius: number }; // where attention should go
  shadowAreas?: { x: number; y: number; radius: number }[]; // de-emphasized areas
  
  // Animation
  transition: 'instant' | 'fade' | 'pulse' | 'strobe' | 'sweep';
  duration?: number; // transition time in ms
}

// === SOUND DESIGN ===
// Audio atmosphere and cues
export interface SoundDesign {
  id: string;
  name: string;
  
  // Atmosphere
  ambience: 'quiet' | 'busy' | 'tense' | 'mysterious' | 'triumphant' | 'contemplative';
  backgroundLevel: number; // 0-100 volume
  
  // Effects
  stingers?: string[];     // sound effects for emphasis
  motifs?: string[];       // recurring musical themes
  
  // Character audio
  characterAudio?: Record<string, {
    voiceLevel: number;    // how prominent their voice is
    audioStyle: 'clear' | 'distorted' | 'whispered' | 'urgent';
  }>;
}

// === STAGE MANAGEMENT ===
// Overall production control
export interface StageState {
  production_id: string;
  currentAct: string;
  currentScene: string;
  status: 'rehearsal' | 'performance' | 'intermission' | 'finale';
  
  // Current state
  cast: Character[];
  activeSets: Set[];
  activeProps: Prop[];
  
  // Production elements
  lighting: LightingCue;
  sound: SoundDesign;
  
  // Stage layout
  stageLayout: { width: number; height: number };
}

export interface Set {
  id: string;
  name: string;
  position: { x: number; y: number };
  dimensions: { width: number; height: number };
  purpose: 'workstation' | 'meeting' | 'storage' | 'display' | 'transition';
  icon: string;
  color: string;
  lighting: 'bright' | 'ambient' | 'dramatic';
}

// === CUES & TRANSITIONS ===
// Direction and timing for scene changes
export interface Cue {
  id: string;
  type: 'lighting' | 'sound' | 'character-entrance' | 'character-exit' | 'prop-change' | 'scene-transition';
  trigger: 'time' | 'character-action' | 'story-beat' | 'user-input';
  timing: number; // when to execute (relative to trigger)
  description: string;
}

export interface TransitionCue {
  id: string;
  fromScene: string;
  toScene: string;
  transitionType: 'crossfade' | 'blackout' | 'seamless' | 'montage';
  duration: number; // in milliseconds
  characterMovements?: Record<string, { from: { x: number; y: number }, to: { x: number; y: number } }>;
}

// === UI COMPONENT TYPES ===
// Technical implementation types
export interface ComponentSize {
  width: number;
  height: number;
}

export type VisualTheme = 'theatrical' | 'technical' | 'minimal'; // renamed from ThemeType
export type ViewMode = 'stage' | 'cast' | 'rehearsal'; // renamed from ViewType