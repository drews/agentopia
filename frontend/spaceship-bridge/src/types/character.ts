// Simplified character representation - references external character system
// Does not define character mechanics, only display state

export interface Position {
  x: number;
  y: number;
}

export interface Character {
  id: string;
  name: string;
  
  // External references (mechanics defined elsewhere)
  attributeValues: Record<string, number>;  // { "courage": 75, "intellect": 60 }
  currentTraits: string[];                  // ["analytical", "cautious", "growing_confident"]
  relationshipIds: string[];               // references to relationship system
  
  // Visual state only
  appearance: {
    visualState: string;    // "confident" | "troubled" | "focused"
    accessories: string[];  // ["research_badge", "worn_toolkit"]
    posture: string;       // "upright" | "hunched" | "alert"
  };
  
  // Current context
  currentScene?: string;   // scene ID they're in
  currentProps?: string[]; // prop IDs they're using
  lastActivity?: string;   // simple activity state
}

export interface Scene {
  id: string;
  name: string;
  sceneType: string;      // defined in story system
  
  // Simple state
  currentCharacters: string[];  // character IDs present
  availableProps: string[];     // prop IDs in this scene
  atmosphere: string;           // mood/lighting reference
  
  // Visual only
  layout: {
    backgroundImage?: string;
    characterPositions: Record<string, Position>;
    propPositions: Record<string, Position>;
  };
}

export interface Prop {
  id: string;
  name: string;
  mcpToolRef?: string;    // reference to actual MCP tool
  
  // Visual representation
  icon: string;
  appearance: string;     // "well-used" | "pristine" | "jerry-rigged"
  
  // Simple state
  currentUser?: string;   // character ID using it
  availability: "available" | "in_use" | "unavailable";
  
  // Story connection (minimal)
  associatedCharacter?: string;  // who has affinity with this prop
  storySignificance?: string;    // brief flavor text
}