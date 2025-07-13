import React, { useState } from 'react';
import { Scene, Character, Prop } from '../types/character';
import CharacterCard from './CharacterCard';

interface SceneViewProps {
  scene: Scene;
  characters: Character[];
  props: Prop[];
  onCharacterClick?: (character: Character) => void;
  onPropClick?: (prop: Prop) => void;
}

const SceneView: React.FC<SceneViewProps> = ({
  scene,
  characters,
  props,
  onCharacterClick,
  onPropClick
}) => {
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(null);

  const handleCharacterClick = (character: Character) => {
    setSelectedCharacter(selectedCharacter === character.id ? null : character.id);
    onCharacterClick?.(character);
  };

  const getAtmosphereStyle = (atmosphere: string) => {
    switch (atmosphere) {
      case 'tense':
        return {
          background: 'linear-gradient(135deg, #1a0f0f 0%, #2d1a1a 100%)',
          borderColor: '#ff6b6b'
        };
      case 'collaborative':
        return {
          background: 'linear-gradient(135deg, #0f1a1a 0%, #1a2d2d 100%)',
          borderColor: '#66bb6a'
        };
      case 'intimate':
        return {
          background: 'linear-gradient(135deg, #1a1a0f 0%, #2d2d1a 100%)',
          borderColor: '#ffa726'
        };
      case 'formal':
        return {
          background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2d 100%)',
          borderColor: '#42a5f5'
        };
      default:
        return {
          background: 'linear-gradient(135deg, #0f1419 0%, #1a2332 100%)',
          borderColor: '#333'
        };
    }
  };

  const charactersInScene = characters.filter(char => 
    scene.currentCharacters.includes(char.id)
  );

  const propsInScene = props.filter(prop => 
    scene.availableProps.includes(prop.id)
  );

  const sceneStyle = getAtmosphereStyle(scene.atmosphere);

  return (
    <div className="scene-view" style={sceneStyle}>
      <style>{`
        .scene-view {
          position: relative;
          display: flex;
          flex-direction: column;
          height: 100%;
          border: 2px solid;
          border-radius: 8px;
          padding: 16px;
          transition: all 0.3s ease;
        }
        
        .scene-header {
          margin-bottom: 16px;
          text-align: center;
        }
        
        .scene-name {
          font-size: 18px;
          font-weight: 700;
          color: #e0e6ed;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 4px;
        }
        
        .scene-type {
          font-size: 12px;
          color: #78909c;
          text-transform: capitalize;
        }
        
        .scene-content {
          flex: 1;
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 16px;
        }
        
        .scene-main {
          position: relative;
          min-height: 200px;
          background: rgba(255, 255, 255, 0.02);
          border-radius: 6px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 16px;
        }
        
        .characters-area {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 12px;
          align-items: start;
        }
        
        .scene-sidebar {
          width: 200px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        
        .props-section {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid #333;
          border-radius: 6px;
          padding: 12px;
        }
        
        .section-title {
          font-size: 12px;
          font-weight: 600;
          color: #a0aec0;
          text-transform: uppercase;
          letter-spacing: 0.3px;
          margin-bottom: 8px;
        }
        
        .props-list {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        
        .prop-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 8px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .prop-item:hover {
          background: rgba(255, 255, 255, 0.1);
        }
        
        .prop-item.in-use {
          border-left: 3px solid #42a5f5;
        }
        
        .prop-icon {
          font-size: 16px;
        }
        
        .prop-info {
          flex: 1;
        }
        
        .prop-name {
          font-size: 11px;
          font-weight: 500;
          color: #e0e6ed;
          margin-bottom: 2px;
        }
        
        .prop-status {
          font-size: 9px;
          color: #78909c;
          text-transform: capitalize;
        }
        
        .scene-atmosphere {
          margin-top: auto;
          text-align: center;
          font-size: 10px;
          color: #78909c;
          padding: 8px;
          background: rgba(0, 0, 0, 0.2);
          border-radius: 4px;
        }
        
        @media (max-width: 768px) {
          .scene-content {
            grid-template-columns: 1fr;
          }
          
          .scene-sidebar {
            width: auto;
            flex-direction: row;
            overflow-x: auto;
          }
          
          .characters-area {
            grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
          }
        }
      `}</style>

      <div className="scene-header">
        <div className="scene-name">{scene.name}</div>
        <div className="scene-type">{scene.sceneType.replace('_', ' ')}</div>
      </div>

      <div className="scene-content">
        <div className="scene-main">
          <div className="characters-area">
            {charactersInScene.map(character => (
              <CharacterCard
                key={character.id}
                character={character}
                onClick={handleCharacterClick}
                size="medium"
                showDetails={selectedCharacter === character.id}
              />
            ))}
          </div>
        </div>

        <div className="scene-sidebar">
          {propsInScene.length > 0 && (
            <div className="props-section">
              <div className="section-title">Available Tools</div>
              <div className="props-list">
                {propsInScene.map(prop => (
                  <div
                    key={prop.id}
                    className={`prop-item ${prop.availability === 'in_use' ? 'in-use' : ''}`}
                    onClick={() => onPropClick?.(prop)}
                  >
                    <div className="prop-icon">{prop.icon}</div>
                    <div className="prop-info">
                      <div className="prop-name">{prop.name}</div>
                      <div className="prop-status">{prop.availability.replace('_', ' ')}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="scene-atmosphere">
            Atmosphere: {scene.atmosphere}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SceneView;