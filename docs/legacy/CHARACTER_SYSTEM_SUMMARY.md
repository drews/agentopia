# Character-Driven Interface System Summary

## Overview
Agentopia has evolved from a complex dashboard interface to a character-driven narrative system focused on storytelling and environmental context.

## Key Components

### Character Interface (`/types/character.ts`)
```typescript
interface Character {
  id: string;
  name: string;
  attributeValues: Record<string, number>;    // External system provides values
  currentTraits: string[];                    // ["analytical", "cautious", "growing_confident"]
  appearance: {
    visualState: string;                      // "confident" | "troubled" | "focused"
    accessories: string[];                    // ["research_badge", "data_pad"]
    posture: string;                         // "upright" | "hunched" | "alert"
  };
  currentScene?: string;                      // Scene ID they're in
  currentProps?: string[];                    // Prop IDs they're using
}
```

### Scene Context (`SceneView.tsx`)
Environmental storytelling through:
- **Scene Types**: `research_lab`, `command_center`, `crisis_response`
- **Atmosphere**: `collaborative`, `tense`, `formal`
- **Character Positioning**: Spatial relationships within scenes
- **Available Props**: Tools and capabilities in each environment

### Props as Story Elements
```typescript
interface Prop {
  id: string;
  name: string;
  mcpToolRef?: string;                       // Reference to actual MCP tool
  icon: string;
  appearance: string;                        // "well-used" | "pristine" | "jerry-rigged"
  associatedCharacter?: string;              // Character with affinity
  storySignificance?: string;                // Brief narrative context
}
```

## Design Philosophy

### Reference, Don't Define
- Character development mechanics live in external systems
- Frontend displays character state, doesn't own progression logic
- MCP tools referenced through props, not directly managed
- Story events and relationships handled externally

### Visual Storytelling
- Character appearance reflects current state and growth
- Environmental context provides narrative backdrop
- Props show character-tool relationships and affinities
- Simplified interactions focus on character connections

## Current Implementation

### Character Examples
- **Dr. Chen**: Analytical scientist, growing in confidence (intellect: 85, courage: 45)
- **Commander Nova**: Decisive leader, protective mentor (leadership: 90, courage: 85)
- **Torres**: Perceptive navigator, steady presence (intuition: 80, empathy: 75)

### Scene Examples
- **Research Laboratory**: Collaborative atmosphere, all characters present
- **Command Center**: Tense atmosphere, crisis response mode

### Prop Examples
- **Quantum Scanner**: Dr. Chen's research tool → MCP `sensor_analysis`
- **Tactical Display**: Nova's command interface → MCP `strategic_analysis`
- **Navigation Console**: Torres' monitoring station → MCP `navigation_control`

## Technical Architecture

### Component Hierarchy
```
App
├── AgentShowcase (legacy system)
├── CharacterShowcase (new system)
│   ├── Scene Selection
│   └── SceneView
│       ├── CharacterCard[]
│       └── Props Sidebar
└── Bridge View (original spaceship interface)
```

### Integration Points
- **Character System**: External service provides attribute values and development
- **Story Engine**: External service provides narrative events and scene context
- **MCP Layer**: Tool integration through prop references
- **Visual System**: LCARS theme integration for consistent styling

## Development Continuity

### Available Baselines
- **Complex System** (commit 312d016): Full pane layout with overwhelming features
- **Simple System** (commit f6d7f50): Current character-focused interface

### Key Files
- `/types/character.ts` - Core interfaces
- `/components/CharacterCard.tsx` - Individual character display
- `/components/SceneView.tsx` - Environmental context
- `/components/CharacterShowcase.tsx` - Main interface

### Success Metrics
- ✅ Reduced bundle size: 71KB vs 76KB (5KB reduction)
- ✅ Calm interface: No overwhelming animations or competing elements
- ✅ Character focus: People-centered rather than system-centered design
- 🎯 Next: Story engagement, MCP integration, narrative coherence

## Future Development

### Immediate Priorities
1. **Agent Showcase Integration**: Merge with existing LCARS agent strategies
2. **Character Growth Visualization**: Show attribute development over time
3. **Enhanced MCP Integration**: Live tool connections through props
4. **Relationship Mapping**: Visual connections between characters

### Long-term Vision
- Multiple narrative environments beyond lab and command center
- Time-based character development through story events
- Interactive choices that affect character growth
- Collaborative storytelling with multiple users

---

*Created: 2025-07-13 - After character system implementation*
*For development continuity and onboarding*