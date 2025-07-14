import React, { useState } from 'react';
import { Character, Scene, Prop } from '../types/character';
import SceneView from './SceneView';

const CharacterShowcase: React.FC = () => {
  const [selectedScene, setSelectedScene] = useState<string>('research_lab');

  // Sample characters with simplified data
  const characters: Character[] = [
    {
      id: 'chen-001',
      name: 'Dr. Chen',
      attributeValues: { 
        intellect: 85, 
        empathy: 70, 
        courage: 45 
      },
      currentTraits: ['analytical', 'cautious', 'growing_confident'],
      relationshipIds: ['mentor-nova', 'colleague-torres'],
      appearance: {
        visualState: 'focused',
        accessories: ['research_badge', 'data_pad'],
        posture: 'upright'
      },
      currentScene: 'research_lab',
      currentProps: ['quantum_scanner'],
      lastActivity: 'analyzing sensor data'
    },
    {
      id: 'nova-001', 
      name: 'Commander Nova',
      attributeValues: {
        leadership: 90,
        courage: 85,
        intellect: 75
      },
      currentTraits: ['decisive', 'protective', 'diplomatic'],
      relationshipIds: ['mentee-chen', 'reports-torres'],
      appearance: {
        visualState: 'confident',
        accessories: ['command_badge', 'communicator'],
        posture: 'alert'
      },
      currentScene: 'research_lab',
      currentProps: ['tactical_display'],
      lastActivity: 'coordinating mission'
    },
    {
      id: 'torres-001',
      name: 'Torres',
      attributeValues: {
        intuition: 80,
        courage: 65,
        empathy: 75
      },
      currentTraits: ['perceptive', 'steady', 'practical'],
      relationshipIds: ['colleague-chen', 'supervisor-nova'],
      appearance: {
        visualState: 'alert',
        accessories: ['toolkit', 'scanner'],
        posture: 'upright'
      },
      currentScene: 'research_lab',
      currentProps: ['navigation_console'],
      lastActivity: 'monitoring systems'
    }
  ];

  // Sample scenes
  const scenes: Scene[] = [
    {
      id: 'research_lab',
      name: 'Research Laboratory',
      sceneType: 'collaborative_workspace',
      currentCharacters: ['chen-001', 'nova-001', 'torres-001'],
      availableProps: ['quantum_scanner', 'tactical_display', 'navigation_console', 'data_archive'],
      atmosphere: 'collaborative',
      layout: {
        characterPositions: {
          'chen-001': { x: 1, y: 1 },
          'nova-001': { x: 2, y: 1 },
          'torres-001': { x: 3, y: 1 }
        },
        propPositions: {
          'quantum_scanner': { x: 1, y: 2 },
          'tactical_display': { x: 2, y: 2 },
          'navigation_console': { x: 3, y: 2 }
        }
      }
    },
    {
      id: 'command_center',
      name: 'Command Center',
      sceneType: 'crisis_response',
      currentCharacters: ['nova-001'],
      availableProps: ['main_display', 'communication_array'],
      atmosphere: 'tense',
      layout: {
        characterPositions: {
          'nova-001': { x: 2, y: 1 }
        },
        propPositions: {
          'main_display': { x: 2, y: 2 },
          'communication_array': { x: 1, y: 2 }
        }
      }
    }
  ];

  // Sample props  
  const props: Prop[] = [
    {
      id: 'quantum_scanner',
      name: 'Quantum Scanner',
      mcpToolRef: 'sensor_analysis',
      icon: '🔬',
      appearance: 'well-used',
      availability: 'in_use',
      currentUser: 'chen-001',
      associatedCharacter: 'chen-001',
      storySignificance: 'Dr. Chen\'s trusted research tool'
    },
    {
      id: 'tactical_display',
      name: 'Tactical Display',
      mcpToolRef: 'strategic_analysis',
      icon: '📊',
      appearance: 'pristine',
      availability: 'in_use',
      currentUser: 'nova-001',
      associatedCharacter: 'nova-001',
      storySignificance: 'Command interface for mission coordination'
    },
    {
      id: 'navigation_console',
      name: 'Navigation Console',
      mcpToolRef: 'navigation_control',
      icon: '🗺️',
      appearance: 'well-used',
      availability: 'in_use',
      currentUser: 'torres-001',
      associatedCharacter: 'torres-001',
      storySignificance: 'Primary navigation and monitoring station'
    },
    {
      id: 'data_archive',
      name: 'Data Archive',
      mcpToolRef: 'knowledge_search',
      icon: '💾',
      appearance: 'pristine',
      availability: 'available',
      storySignificance: 'Repository of mission data and research'
    },
    {
      id: 'main_display',
      name: 'Main Display',
      mcpToolRef: 'system_overview',
      icon: '🖥️',
      appearance: 'pristine',
      availability: 'available',
      storySignificance: 'Central command visualization'
    },
    {
      id: 'communication_array',
      name: 'Communication Array',
      mcpToolRef: 'external_comms',
      icon: '📡',
      appearance: 'well-used',
      availability: 'available',
      storySignificance: 'Long-range communication system'
    }
  ];

  const currentScene = scenes.find(scene => scene.id === selectedScene) || scenes[0];

  const handleCharacterClick = (character: Character) => {
    console.log('Character clicked:', character.name);
    // Could show character details, switch to character's scene, etc.
  };

  const handlePropClick = (prop: Prop) => {
    console.log('Prop clicked:', prop.name);
    // Could show prop details, trigger MCP tool, etc.
  };

  const handleSceneChange = (sceneId: string) => {
    setSelectedScene(sceneId);
  };

  return (
    <div className="character-showcase">
      <style>{`
        .character-showcase {
          display: flex;
          flex-direction: column;
          height: 100%;
          background: #000000;
          color: #FFCC99;
          font-family: 'Arial Narrow', 'Helvetica Condensed', sans-serif;
          font-weight: bold;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .showcase-header {
          padding: 16px 20px;
          background: #CC6699;
          border-bottom: none;
          position: relative;
        }
        
        .showcase-header::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 8px;
          background: #FFCC99;
          border-radius: 0 0 20px 20px;
        }
        
        .showcase-title {
          font-size: 20px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 8px;
          color: #000000;
        }
        
        .showcase-subtitle {
          font-size: 12px;
          color: #000000;
          margin-bottom: 16px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .scene-selector {
          display: flex;
          gap: 8px;
        }
        
        .scene-button {
          background: transparent;
          border: 1px solid #FFCC99;
          border-radius: 20px;
          color: #FFCC99;
          font-size: 11px;
          font-weight: bold;
          padding: 6px 12px;
          cursor: pointer;
          transition: all 0.2s ease;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-family: 'Arial Narrow', 'Helvetica Condensed', sans-serif;
        }
        
        .scene-button:hover {
          background: rgba(255, 204, 153, 0.2);
          border-color: #FFCC99;
        }
        
        .scene-button.active {
          background: #FFCC99;
          border-color: #FFCC99;
          color: #000000;
          font-weight: bold;
        }
        
        .showcase-content {
          flex: 1;
          padding: 20px;
          overflow: hidden;
          background: #000000;
        }
        
        .showcase-info {
          margin-top: 16px;
          padding: 12px;
          background: #333366;
          border-radius: 20px;
          font-size: 11px;
          color: #FFCC99;
          text-align: center;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-weight: bold;
        }
      `}</style>

      <div className="showcase-header">
        <div className="showcase-title">Roster</div>
        <div className="showcase-subtitle">
          Active crew members in their operational contexts
        </div>
        
        <div className="scene-selector">
          {scenes.map(scene => (
            <button
              key={scene.id}
              className={`scene-button ${selectedScene === scene.id ? 'active' : ''}`}
              onClick={() => handleSceneChange(scene.id)}
            >
              {scene.name}
            </button>
          ))}
        </div>
      </div>

      <div className="showcase-content">
        <SceneView
          scene={currentScene}
          characters={characters}
          props={props}
          onCharacterClick={handleCharacterClick}
          onPropClick={handlePropClick}
        />
        
        <div className="showcase-info">
          Click crew members to view profiles • Equipment shows tool capabilities • 
          Skills and relationships tracked through external systems
        </div>
      </div>
    </div>
  );
};

export default CharacterShowcase;