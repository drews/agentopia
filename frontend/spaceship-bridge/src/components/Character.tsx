import React from 'react';

// Stagecraft-inspired Character component
// Characters are the AI performers in our digital theater
export interface CharacterData {
  id: string;
  name: string;
  role: 'lead' | 'supporting' | 'ensemble' | 'understudy';
  specialty: 'director' | 'scientist' | 'technician' | 'navigator' | 'communicator' | 'medic' | 'guardian' | 'coordinator';
  mood: {
    state: 'waiting' | 'rehearsing' | 'performing' | 'moving' | 'improvising' | 'struggling' | 'offstage';
    energy?: number;
    focus?: number;
  };
  attributes: Record<string, number>; // performance attributes
  traits: string[]; // acting qualities
  costume: {
    appearance: string;
    accessories: string[];
    posture: string;
  };
  lastPerformance?: string;
}

interface CharacterProps {
  character: CharacterData;
  onSelect?: (character: CharacterData) => void;
  size?: 'compact' | 'standard' | 'featured';
  showDetails?: boolean;
  lighting?: 'bright' | 'dim' | 'spotlight' | 'ambient';
}

// Stage lighting affects character appearance
const lightingStyles = {
  bright: { filter: 'brightness(1.2)', boxShadow: '0 0 10px rgba(255,255,255,0.3)' },
  dim: { filter: 'brightness(0.7)', opacity: 0.8 },
  spotlight: { filter: 'brightness(1.4)', boxShadow: '0 0 20px rgba(255,255,100,0.5)' },
  ambient: { filter: 'none' }
};

// Character mood affects visual presentation
const getMoodEmoji = (state: string) => {
  const moodMap: Record<string, string> = {
    waiting: '🎭',      // ready to perform
    rehearsing: '📝',   // practicing/learning
    performing: '⭐',   // actively engaged
    moving: '🚶',       // transitioning
    improvising: '🎨',  // creative problem-solving
    struggling: '😰',   // having difficulties
    offstage: '👻'      // not currently visible/active
  };
  return moodMap[state] || '🎭';
};

// Role determines visual prominence
const getRoleStyle = (role: string, size: string) => {
  const baseSize = size === 'compact' ? 80 : size === 'featured' ? 160 : 120;
  const prominence = {
    lead: { scale: 1.1, fontWeight: 700, border: '2px solid gold' },
    supporting: { scale: 1.0, fontWeight: 600, border: '2px solid silver' },
    ensemble: { scale: 0.95, fontWeight: 500, border: '1px solid #666' },
    understudy: { scale: 0.9, fontWeight: 400, border: '1px dashed #999' }
  };
  
  return {
    ...prominence[role as keyof typeof prominence],
    minWidth: `${baseSize}px`,
    fontSize: size === 'compact' ? '12px' : size === 'featured' ? '16px' : '14px'
  };
};

// Specialty determines color theme (like costume colors)
const getSpecialtyColor = (specialty: string) => {
  const colorMap: Record<string, string> = {
    director: '#FF9933',      // command orange
    scientist: '#3366CC',     // science blue  
    technician: '#66FF99',    // engineering green
    navigator: '#9966FF',     // navigation purple
    communicator: '#FF6699',  // communications pink
    medic: '#99FF66',         // medical green
    guardian: '#FF3366',      // security red
    coordinator: '#FFAA33'    // operations yellow
  };
  return colorMap[specialty] || '#CCCCCC';
};

const Character: React.FC<CharacterProps> = ({
  character,
  onSelect,
  size = 'standard',
  showDetails = false,
  lighting = 'ambient'
}) => {
  const [isSpotlit, setIsSpotlit] = React.useState(false);
  
  const handleClick = () => {
    onSelect?.(character);
  };

  const roleStyle = getRoleStyle(character.role, size);
  const specialtyColor = getSpecialtyColor(character.specialty);
  const lightingEffect = lightingStyles[lighting];

  return (
    <div 
      style={{
        ...roleStyle,
        ...lightingEffect,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '12px',
        background: `linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(${specialtyColor.slice(1)}, 0.1) 100%)`,
        borderRadius: '8px',
        cursor: onSelect ? 'pointer' : 'default',
        transition: 'all 0.3s ease',
        transform: isSpotlit ? 'scale(1.05)' : 'scale(1)',
        borderColor: specialtyColor
      }}
      onClick={handleClick}
      onMouseEnter={() => setIsSpotlit(true)}
      onMouseLeave={() => setIsSpotlit(false)}
      role={onSelect ? 'button' : 'img'}
      aria-label={`${character.name}, ${character.role} ${character.specialty}, currently ${character.mood.state}`}
    >
      {/* Character "headshot" - mood emoji */}
      <div style={{ 
        fontSize: size === 'compact' ? '24px' : size === 'featured' ? '36px' : '30px',
        marginBottom: '8px',
        filter: character.mood.state === 'struggling' ? 'hue-rotate(180deg)' : 'none'
      }}>
        {getMoodEmoji(character.mood.state)}
      </div>
      
      {/* Name (like name on dressing room door) */}
      <div style={{
        fontWeight: roleStyle.fontWeight,
        color: '#e0e6ed',
        textAlign: 'center',
        marginBottom: '4px',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        textShadow: character.role === 'lead' ? '0 0 5px gold' : 'none'
      }}>
        {character.name}
      </div>
      
      {/* Role & Specialty (like program credits) */}
      <div style={{
        fontSize: '0.8em',
        color: specialtyColor,
        marginBottom: '6px',
        textTransform: 'capitalize',
        fontStyle: 'italic'
      }}>
        {character.role} {character.specialty}
      </div>

      {/* Current mood/state */}
      <div style={{
        fontSize: '0.7em',
        color: '#78909c',
        marginBottom: '8px',
        textTransform: 'capitalize',
        padding: '2px 6px',
        background: 'rgba(255,255,255,0.1)',
        borderRadius: '12px'
      }}>
        {character.mood.state}
      </div>

      {/* Performance traits (like character notes) */}
      {character.traits.length > 0 && (
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '2px',
          justifyContent: 'center',
          marginBottom: '6px'
        }}>
          {character.traits.slice(0, 3).map(trait => (
            <span key={trait} style={{
              background: 'rgba(255, 255, 255, 0.1)',
              color: '#a0aec0',
              fontSize: '0.6em',
              padding: '1px 4px',
              borderRadius: '2px',
              textTransform: 'lowercase',
              letterSpacing: '0.2px'
            }}>
              {trait.replace('_', ' ')}
            </span>
          ))}
        </div>
      )}

      {/* Costume accessories */}
      {character.costume.accessories.length > 0 && (
        <div style={{ display: 'flex', gap: '4px', marginBottom: '8px' }}>
          {character.costume.accessories.slice(0, 3).map((accessory, index) => (
            <span key={index} title={accessory} style={{
              fontSize: '0.8em',
              opacity: 0.7
            }}>
              🎭
            </span>
          ))}
        </div>
      )}

      {/* Energy and focus meters (like performance indicators) */}
      {(character.mood.energy !== undefined || character.mood.focus !== undefined) && (
        <div style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '8px',
          fontSize: '0.6em',
          color: '#78909c'
        }}>
          {character.mood.energy !== undefined && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
              <span>⚡</span>
              <div style={{
                width: '20px',
                height: '3px',
                background: 'rgba(255,255,255,0.2)',
                borderRadius: '2px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${character.mood.energy}%`,
                  height: '100%',
                  background: character.mood.energy > 70 ? '#66FF99' : character.mood.energy > 30 ? '#FFAA00' : '#FF6666',
                  transition: 'width 0.3s ease'
                }} />
              </div>
            </div>
          )}
          {character.mood.focus !== undefined && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
              <span>🎯</span>
              <div style={{
                width: '20px',
                height: '3px',
                background: 'rgba(255,255,255,0.2)',
                borderRadius: '2px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${character.mood.focus}%`,
                  height: '100%',
                  background: character.mood.focus > 70 ? '#3366CC' : character.mood.focus > 30 ? '#9966FF' : '#FF6666',
                  transition: 'width 0.3s ease'
                }} />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Extended details (like character bio in program) */}
      {showDetails && (
        <div style={{
          marginTop: '8px',
          paddingTop: '8px',
          borderTop: `1px solid ${specialtyColor}`,
          width: '100%',
          textAlign: 'left'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '4px',
            fontSize: '0.6em',
            color: '#78909c'
          }}>
            {Object.entries(character.attributes).slice(0, 4).map(([attr, value]) => (
              <div key={attr} style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>{attr}</span>
                <span>{value}</span>
              </div>
            ))}
          </div>
          
          {character.lastPerformance && (
            <div style={{
              marginTop: '6px',
              fontSize: '0.6em',
              color: specialtyColor,
              textAlign: 'center',
              fontStyle: 'italic'
            }}>
              Last scene: {character.lastPerformance}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Character;