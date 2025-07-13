import React from 'react';
import { Character } from '../types/character';

interface CharacterCardProps {
  character: Character;
  onClick?: (character: Character) => void;
  size?: 'small' | 'medium' | 'large';
  showDetails?: boolean;
}

const CharacterCard: React.FC<CharacterCardProps> = ({
  character,
  onClick,
  size = 'medium',
  showDetails = false
}) => {
  const handleClick = () => {
    onClick?.(character);
  };

  const getVisualStateEmoji = (state: string) => {
    switch (state) {
      case 'confident': return '💪';
      case 'troubled': return '😟';
      case 'focused': return '🎯';
      case 'alert': return '⚡';
      case 'calm': return '😌';
      default: return '🤖';
    }
  };

  const getPostureStyle = (posture: string) => {
    switch (posture) {
      case 'upright': return { transform: 'none' };
      case 'hunched': return { transform: 'scale(0.95) translateY(2px)' };
      case 'alert': return { transform: 'scale(1.05)' };
      default: return { transform: 'none' };
    }
  };

  const sizeClasses = {
    small: 'character-card--small',
    medium: 'character-card--medium', 
    large: 'character-card--large'
  };

  return (
    <div 
      className={`character-card ${sizeClasses[size]} ${onClick ? 'character-card--interactive' : ''}`}
      onClick={handleClick}
      style={getPostureStyle(character.appearance.posture)}
    >
      <style>{`
        .character-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 8px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid #333;
          border-radius: 6px;
          transition: all 0.2s ease;
          cursor: default;
        }
        
        .character-card--interactive {
          cursor: pointer;
        }
        
        .character-card--interactive:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: #555;
          transform: translateY(-1px);
        }
        
        .character-card--small {
          min-width: 80px;
          font-size: 12px;
        }
        
        .character-card--medium {
          min-width: 120px;
          font-size: 14px;
        }
        
        .character-card--large {
          min-width: 160px;
          font-size: 16px;
        }
        
        .character-avatar {
          font-size: 2em;
          margin-bottom: 4px;
          transition: transform 0.2s ease;
        }
        
        .character-card--small .character-avatar {
          font-size: 1.5em;
        }
        
        .character-card--large .character-avatar {
          font-size: 2.5em;
        }
        
        .character-name {
          font-weight: 600;
          color: #e0e6ed;
          text-align: center;
          margin-bottom: 4px;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }
        
        .character-state {
          font-size: 0.8em;
          color: #78909c;
          margin-bottom: 6px;
          text-transform: capitalize;
        }
        
        .character-traits {
          display: flex;
          flex-wrap: wrap;
          gap: 2px;
          justify-content: center;
          margin-bottom: 6px;
        }
        
        .character-trait {
          background: rgba(255, 255, 255, 0.1);
          color: #a0aec0;
          font-size: 0.7em;
          padding: 1px 4px;
          border-radius: 2px;
          text-transform: lowercase;
          letter-spacing: 0.2px;
        }
        
        .character-accessories {
          display: flex;
          gap: 4px;
          margin-top: 4px;
        }
        
        .character-accessory {
          font-size: 0.8em;
          opacity: 0.7;
        }
        
        .character-details {
          margin-top: 8px;
          padding-top: 8px;
          border-top: 1px solid #444;
          width: 100%;
          text-align: left;
        }
        
        .character-attributes {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 4px;
          font-size: 0.7em;
          color: #78909c;
        }
        
        .character-attribute {
          display: flex;
          justify-content: space-between;
        }
        
        .character-activity {
          margin-top: 6px;
          font-size: 0.7em;
          color: #42a5f5;
          text-align: center;
          font-style: italic;
        }
      `}</style>

      <div className="character-avatar">
        {getVisualStateEmoji(character.appearance.visualState)}
      </div>
      
      <div className="character-name">
        {character.name}
      </div>
      
      <div className="character-state">
        {character.appearance.visualState}
      </div>

      {character.currentTraits.length > 0 && (
        <div className="character-traits">
          {character.currentTraits.slice(0, 3).map(trait => (
            <span key={trait} className="character-trait">
              {trait.replace('_', ' ')}
            </span>
          ))}
        </div>
      )}

      {character.appearance.accessories.length > 0 && (
        <div className="character-accessories">
          {character.appearance.accessories.slice(0, 3).map(accessory => (
            <span key={accessory} className="character-accessory">
              🔧
            </span>
          ))}
        </div>
      )}

      {showDetails && (
        <div className="character-details">
          <div className="character-attributes">
            {Object.entries(character.attributeValues).slice(0, 4).map(([attr, value]) => (
              <div key={attr} className="character-attribute">
                <span>{attr}</span>
                <span>{value}</span>
              </div>
            ))}
          </div>
          
          {character.lastActivity && (
            <div className="character-activity">
              {character.lastActivity}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CharacterCard;