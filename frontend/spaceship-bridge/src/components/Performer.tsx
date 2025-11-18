import React, { useState } from 'react';

// Stagecraft-inspired Performer component
// Performers are the AI entities actively performing characters on stage
export interface Performer {
  id: string;
  name: string;
  characterRole: 'director' | 'scientist' | 'technician' | 'navigator' | 'communicator' | 'medic' | 'guardian' | 'coordinator';
  position: { x: number; y: number };
  performance: {
    state: 'waiting' | 'rehearsing' | 'performing' | 'moving' | 'improvising' | 'struggling' | 'offstage';
    energy?: number; // 0-100 performance energy
    intensity?: number; // 0-100 how engaged they are
  };
}

interface PerformerProps {
  performer: Performer;
  size?: { width: number; height: number };
  visualStyle?: 'theatrical' | 'technical' | 'minimal';
  onStage?: boolean;
  onCue?: (performer: Performer) => void;
  onSpotlight?: (performer: Performer) => void;
  lighting?: 'house' | 'work' | 'spot' | 'blackout';
}

// Stage lighting themes
const lightingDesigns = {
  theatrical: {
    colors: {
      primary: '#FF9933',        // warm stage lights
      secondary: '#3366CC',      // cool backlighting
      background: '#1a0d00',     // theater darkness
      text: '#FFCC99',          // warm text
      performance: {
        waiting: '#CCCCCC',      // neutral standby
        rehearsing: '#FFFF66',   // working lights
        performing: '#66FF99',   // active performance
        moving: '#9966FF',       // transition lighting
        improvising: '#FF6699',  // creative spotlight
        struggling: '#FF6666',   // warning lights
        offstage: '#444444'      // backstage dim
      }
    },
    frame: '15px 0 15px 0',  // theatrical angular frame
    typeface: "'Cinzel', 'Times New Roman', serif"  // dramatic serif
  },
  technical: {
    colors: {
      primary: '#00AA44',        // technical green
      secondary: '#0088CC',      // system blue
      background: '#000000',     // tech black
      text: '#00FF88',          // matrix green
      performance: {
        waiting: '#666666',
        rehearsing: '#FFAA00',
        performing: '#00FF44',
        moving: '#0088FF',
        improvising: '#AA00FF',
        struggling: '#FF4444',
        offstage: '#333333'
      }
    },
    frame: '4px',  // clean technical corners
    typeface: "'Roboto Mono', 'Courier New', monospace"  // technical monospace
  },
  minimal: {
    colors: {
      primary: '#555555',        // subtle gray
      secondary: '#777777',      // slightly lighter
      background: '#FFFFFF',     // clean white
      text: '#222222',          // dark text
      performance: {
        waiting: '#AAAAAA',
        rehearsing: '#888800',
        performing: '#008800',
        moving: '#000088',
        improvising: '#880088',
        struggling: '#880000',
        offstage: '#CCCCCC'
      }
    },
    frame: '2px',  // minimal border
    typeface: "'Inter', 'Arial', sans-serif"  // clean sans-serif
  }
};

// Character role determines costume/visual identity
const getCharacterIcon = (role: string) => {
  const iconMap: Record<string, string> = {
    director: '🎬',      // command/direction
    scientist: '🔬',     // research/analysis
    technician: '🔧',    // engineering/repair
    navigator: '🧭',     // pathfinding/exploration
    communicator: '📡',  // communication/liaison
    medic: '⚕️',        // health/support
    guardian: '🛡️',     // security/protection
    coordinator: '⚙️'    // operations/logistics
  };
  return iconMap[role] || '🎭';
};

// Performance state symbols (what they're currently doing)
const getPerformanceSymbol = (state: string) => {
  const symbolMap: Record<string, string> = {
    waiting: '⏸️',        // standby/ready
    rehearsing: '📝',     // practicing/learning
    performing: '⭐',     // active performance
    moving: '🚶',         // transitioning/relocating
    improvising: '🎨',    // creative problem-solving
    struggling: '😰',     // having difficulties
    offstage: '👻'        // not visible/inactive
  };
  return symbolMap[state] || '🎭';
};

const Performer: React.FC<PerformerProps> = ({
  performer,
  size = { width: 120, height: 160 },
  visualStyle = 'theatrical',
  onStage = true,
  onCue,
  onSpotlight,
  lighting = 'house'
}) => {
  const [inSpotlight, setInSpotlight] = useState(false);
  const design = lightingDesigns[visualStyle];
  const performanceColor = design.colors.performance[performer.performance.state];

  const handleClick = () => {
    if (onCue) {
      onCue(performer);
    }
  };

  const handleMouseEnter = () => {
    if (onStage) {
      setInSpotlight(true);
      onSpotlight?.(performer);
    }
  };

  const handleMouseLeave = () => {
    if (onStage) {
      setInSpotlight(false);
    }
  };

  // Determine if performer needs director's attention
  const needsDirection = performer.performance.state === 'struggling' || 
                        performer.performance.state === 'offstage' ||
                        (performer.performance.energy && performer.performance.energy < 40);

  // Apply lighting effects based on current lighting state
  const getLightingEffect = () => {
    switch (lighting) {
      case 'spot':
        return { filter: 'brightness(1.4)', boxShadow: `0 0 20px ${performanceColor}` };
      case 'work':
        return { filter: 'brightness(1.1)', opacity: 0.9 };
      case 'blackout':
        return { filter: 'brightness(0.3)', opacity: 0.5 };
      case 'house':
      default:
        return { filter: 'brightness(1.0)' };
    }
  };

  return (
    <div
      style={{
        width: `${size.width}px`,
        height: `${size.height}px`,
        backgroundColor: design.colors.background,
        border: `2px solid ${needsDirection ? performanceColor : design.colors.primary}`,
        borderRadius: design.frame,
        position: 'relative',
        cursor: onCue ? 'pointer' : 'default',
        fontFamily: design.typeface,
        fontWeight: 'bold',
        fontSize: '12px',
        textTransform: 'uppercase',
        color: design.colors.text,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px',
        transform: inSpotlight && onStage ? 'scale(1.05)' : 'scale(1)',
        transition: 'all 0.3s ease',
        opacity: onStage ? 1.0 : 0.6,
        ...getLightingEffect(),
        boxShadow: needsDirection ? `0 0 8px ${performanceColor}` : 
                  inSpotlight ? `0 0 12px ${design.colors.primary}` : 'none'
      }}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      role={onCue ? 'button' : 'img'}
      aria-label={`${performer.name}, performing ${performer.characterRole}, currently ${performer.performance.state}`}
    >
      {/* Performance state indicator (top) */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '20px',
          backgroundColor: performanceColor,
          borderRadius: visualStyle === 'theatrical' ? '13px 0 0 0' : 
                        visualStyle === 'technical' ? '2px 2px 0 0' : '1px 1px 0 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '8px',
          color: visualStyle === 'minimal' ? '#ffffff' : design.colors.background,
          fontWeight: 'bold'
        }}
      >
        {performer.performance.state.toUpperCase()}
      </div>

      {/* Character role icon */}
      <div style={{ 
        fontSize: '24px', 
        color: design.colors.primary,
        marginTop: '20px',
        textShadow: inSpotlight ? `0 0 5px ${design.colors.primary}` : 'none'
      }}>
        {getCharacterIcon(performer.characterRole)}
      </div>

      {/* Performance activity symbol */}
      <div style={{ 
        fontSize: '16px',
        animation: ['rehearsing', 'performing', 'improvising'].includes(performer.performance.state) 
          ? 'pulse 1.5s infinite' : 'none',
        opacity: performer.performance.state === 'offstage' ? 0.3 : 1.0
      }}>
        {getPerformanceSymbol(performer.performance.state)}
      </div>

      {/* Energy/intensity meters */}
      {(performer.performance.energy !== undefined || performer.performance.intensity !== undefined) && (
        <div style={{ display: 'flex', gap: '1px', marginBottom: '8px' }}>
          {/* Energy meter */}
          {performer.performance.energy !== undefined && 
            Array.from({ length: 4 }, (_, i) => (
              <div
                key={`energy-${i}`}
                style={{
                  width: '3px',
                  height: i < Math.ceil((performer.performance.energy! / 100) * 4) ? '8px' : '3px',
                  backgroundColor: i < Math.ceil((performer.performance.energy! / 100) * 4) 
                    ? (performer.performance.energy! > 80 ? '#66FF99' : 
                       performer.performance.energy! > 50 ? '#FFAA00' : '#FF6666')
                    : 'rgba(255,255,255,0.3)',
                  borderRadius: '1px',
                  marginRight: '1px'
                }}
              />
            ))
          }
          {/* Intensity meter */}
          {performer.performance.intensity !== undefined && 
            <div style={{ marginLeft: '2px', display: 'flex', gap: '1px' }}>
              {Array.from({ length: 3 }, (_, i) => (
                <div
                  key={`intensity-${i}`}
                  style={{
                    width: '2px',
                    height: i < Math.ceil((performer.performance.intensity! / 100) * 3) ? '6px' : '2px',
                    backgroundColor: i < Math.ceil((performer.performance.intensity! / 100) * 3) 
                      ? design.colors.secondary : 'rgba(255,255,255,0.2)',
                    borderRadius: '1px'
                  }}
                />
              ))}
            </div>
          }
        </div>
      )}

      {/* Performer name (bottom nameplate) */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '20px',
          backgroundColor: design.colors.primary,
          borderRadius: visualStyle === 'theatrical' ? '0 0 13px 13px' : 
                        visualStyle === 'technical' ? '0 0 2px 2px' : '0 0 1px 1px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '8px',
          color: visualStyle === 'minimal' ? '#ffffff' : design.colors.background,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          fontWeight: 'bold'
        }}
      >
        {performer.name.toUpperCase()}
      </div>

      {/* Stage manager attention indicator */}
      <div
        style={{
          position: 'absolute',
          top: '0px',
          right: '0px',
          width: needsDirection ? '20px' : '12px',
          height: needsDirection ? '20px' : '12px',
          backgroundColor: needsDirection ? performanceColor : design.colors.secondary,
          borderRadius: visualStyle === 'theatrical' ? '0 13px 0 8px' : 
                        visualStyle === 'technical' ? '0 2px 0 2px' : '0 1px 0 1px',
          animation: needsDirection ? 'pulse 1s infinite' : 'none',
          opacity: performer.performance.state === 'offstage' ? 0.3 : 1.0
        }}
      />

      {/* CSS animations */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};

export default Performer;