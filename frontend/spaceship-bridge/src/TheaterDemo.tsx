import React, { useState, useEffect } from 'react';
import Character from './components/Character';
import Performer from './components/Performer';
import Stage from './components/Stage';
// Using local interfaces for the demo since types.ts has different structure
interface CharacterType {
  id: string;
  name: string;
  role: 'lead' | 'supporting' | 'ensemble' | 'understudy';
  specialty: 'director' | 'scientist' | 'technician' | 'navigator' | 'communicator' | 'medic' | 'guardian' | 'coordinator';
  mood: {
    state: 'waiting' | 'rehearsing' | 'performing' | 'moving' | 'improvising' | 'struggling' | 'offstage';
    energy?: number;
    focus?: number;
  };
  attributes: Record<string, number>;
  traits: string[];
  costume: {
    appearance: string;
    accessories: string[];
    posture: string;
  };
  lastPerformance?: string;
}

interface PerformerType {
  id: string;
  name: string;
  characterRole: 'director' | 'scientist' | 'technician' | 'navigator' | 'communicator' | 'medic' | 'guardian' | 'coordinator';
  position: { x: number; y: number };
  performance: {
    state: 'waiting' | 'rehearsing' | 'performing' | 'moving' | 'improvising' | 'struggling' | 'offstage';
    energy?: number;
    intensity?: number;
  };
}

// Live Theater Demo - Shows the stagecraft system in action
const TheaterDemo: React.FC = () => {
  const [currentView, setCurrentView] = useState<'cast' | 'rehearsal' | 'performance'>('cast');
  const [currentLighting, setCurrentLighting] = useState<'bright' | 'dim' | 'dramatic' | 'warm'>('bright');
  const [isLive, setIsLive] = useState(false);

  // Sample cast of characters
  const [characters, setCharacters] = useState<CharacterType[]>([
    {
      id: 'char-1',
      name: 'Dr. Sarah Chen',
      role: 'lead',
      specialty: 'scientist',
      mood: {
        state: 'performing',
        energy: 85,
        focus: 92
      },
      attributes: { confidence: 78, creativity: 85, collaboration: 70 },
      traits: ['analytical', 'intuitive', 'persistent'],
      costume: {
        appearance: 'focused',
        accessories: ['data_tablet', 'research_badge'],
        posture: 'upright'
      },
      lastPerformance: 'Analyzing quantum resonance patterns'
    },
    {
      id: 'char-2', 
      name: 'Commander Torres',
      role: 'lead',
      specialty: 'director',
      mood: {
        state: 'improvising',
        energy: 95,
        focus: 88
      },
      attributes: { leadership: 92, decisiveness: 88, empathy: 75 },
      traits: ['strategic', 'inspiring', 'adaptive'],
      costume: {
        appearance: 'confident',
        accessories: ['command_badge', 'tactical_display'],
        posture: 'alert'
      },
      lastPerformance: 'Coordinating emergency response protocols'
    },
    {
      id: 'char-3',
      name: 'Engineer Patel',
      role: 'supporting',
      specialty: 'technician', 
      mood: {
        state: 'struggling',
        energy: 45,
        focus: 60
      },
      attributes: { technical: 90, patience: 65, innovation: 80 },
      traits: ['methodical', 'perfectionist', 'determined'],
      costume: {
        appearance: 'uncertain',
        accessories: ['toolkit', 'diagnostic_scanner'],
        posture: 'hunched'
      },
      lastPerformance: 'Troubleshooting power grid anomalies'
    }
  ]);

  // Active performers (characters currently on stage)
  const [performers, setPerformers] = useState<PerformerType[]>([
    {
      id: 'perf-1',
      name: 'Dr. Sarah Chen',
      characterRole: 'scientist',
      position: { x: 2, y: 1 },
      performance: {
        state: 'performing',
        energy: 85,
        intensity: 75
      }
    },
    {
      id: 'perf-2',
      name: 'Commander Torres', 
      characterRole: 'director',
      position: { x: 4, y: 2 },
      performance: {
        state: 'improvising',
        energy: 95,
        intensity: 90
      }
    },
    {
      id: 'perf-3',
      name: 'Engineer Patel',
      characterRole: 'technician',
      position: { x: 1, y: 3 },
      performance: {
        state: 'struggling',
        energy: 45,
        intensity: 85
      }
    }
  ]);

  // Stage configuration
  const stageState = {
    production_id: 'Operation Stardust',
    currentAct: 'Act 2: Discovery',
    currentScene: 'Scene 3: Crisis Response',
    status: (isLive ? 'performance' : 'rehearsal') as 'performance' | 'rehearsal',
    cast: performers,
    sets: [
      {
        id: 'set-1',
        name: 'Science Station',
        position: { x: 1, y: 0 },
        dimensions: { width: 2, height: 2 },
        purpose: 'workstation' as const,
        icon: '🔬',
        color: '#3366CC',
        lighting: 'bright' as const
      },
      {
        id: 'set-2', 
        name: 'Command Center',
        position: { x: 4, y: 1 },
        dimensions: { width: 2, height: 2 },
        purpose: 'meeting' as const,
        icon: '⭐',
        color: '#FF9933',
        lighting: 'dramatic' as const
      },
      {
        id: 'set-3',
        name: 'Engineering Bay',
        position: { x: 0, y: 3 },
        dimensions: { width: 3, height: 1 },
        purpose: 'workstation' as const,
        icon: '🔧',
        color: '#66FF99',
        lighting: 'ambient' as const
      }
    ],
    stageLayout: { width: 6, height: 5 },
    lighting: {
      mood: currentLighting,
      intensity: currentLighting === 'dramatic' ? 120 : currentLighting === 'dim' ? 60 : 100,
      primaryColor: currentLighting === 'dramatic' ? '#FF6699' : 
                   currentLighting === 'warm' ? '#FFAA33' : '#FFFFFF'
    }
  };

  // Simulate live performance changes
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      // Randomly update character moods and performer states
      setCharacters(prev => prev.map(char => {
        const energyChange = (Math.random() - 0.5) * 10;
        const newEnergy = Math.max(20, Math.min(100, (char.mood.energy || 50) + energyChange));
        
        // Change states based on energy levels
        let newState = char.mood.state;
        if (newEnergy < 40 && Math.random() < 0.3) newState = 'struggling';
        else if (newEnergy > 80 && Math.random() < 0.4) newState = 'performing';
        else if (Math.random() < 0.2) newState = 'improvising';
        
        return {
          ...char,
          mood: {
            ...char.mood,
            state: newState,
            energy: newEnergy,
            focus: Math.max(30, Math.min(100, (char.mood.focus || 50) + (Math.random() - 0.5) * 8))
          }
        };
      }));

      // Update performers to match characters
      setPerformers(prev => prev.map(perf => {
        const matchingChar = characters.find(c => c.name === perf.name);
        if (matchingChar) {
          return {
            ...perf,
            performance: {
              ...perf.performance,
              state: matchingChar.mood.state,
              energy: matchingChar.mood.energy,
              intensity: (perf.performance.intensity ?? 50) + (Math.random() - 0.5) * 15
            }
          };
        }
        return perf;
      }));

      // Occasionally change lighting for drama
      if (Math.random() < 0.1) {
        const lightingOptions: ('bright' | 'dim' | 'dramatic' | 'warm')[] = ['bright', 'dim', 'dramatic', 'warm'];
        setCurrentLighting(lightingOptions[Math.floor(Math.random() * lightingOptions.length)]);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [isLive, characters]);

  // Event handlers
  const handleCharacterSelect = (character: CharacterType) => {
    console.log(`Selected character: ${character.name} (${character.specialty})`);
    // Could open character details, adjust their mood, etc.
  };

  const handlePerformerCue = (performer: PerformerType) => {
    console.log(`Giving cue to performer: ${performer.name}`);
    // Could trigger specific actions, scene changes, etc.
  };

  const handleLightingChange = (mood: 'bright' | 'dim' | 'dramatic' | 'warm') => {
    setCurrentLighting(mood);
    console.log(`Lighting changed to: ${mood}`);
  };

  return (
    <div style={{ 
      background: 'linear-gradient(135deg, #0a0f1a 0%, #1a0f2a 50%, #0f1a0a 100%)',
      minHeight: '100vh',
      fontFamily: "'Cinzel', 'Times New Roman', serif"
    }}>
      {/* Theater Controls */}
      <div style={{
        background: 'rgba(0,0,0,0.8)',
        padding: '16px 24px',
        borderBottom: '2px solid #333',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', gap: '12px' }}>
          {['cast', 'rehearsal', 'performance'].map(view => (
            <button
              key={view}
              onClick={() => setCurrentView(view as any)}
              style={{
                padding: '8px 16px',
                background: currentView === view ? '#FF9933' : 'transparent',
                border: `2px solid ${currentView === view ? '#FF9933' : '#666'}`,
                borderRadius: '6px',
                color: currentView === view ? '#000' : '#e0e6ed',
                cursor: 'pointer',
                textTransform: 'uppercase',
                fontWeight: 'bold',
                fontSize: '12px',
                letterSpacing: '1px',
                transition: 'all 0.2s ease'
              }}
            >
              {view === 'cast' ? '🎭 Cast' : view === 'rehearsal' ? '📝 Rehearsal' : '⭐ Performance'}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            {['bright', 'dim', 'dramatic', 'warm'].map(lighting => (
              <button
                key={lighting}
                onClick={() => handleLightingChange(lighting as any)}
                style={{
                  padding: '6px 12px',
                  background: currentLighting === lighting ? '#3366CC' : 'transparent',
                  border: `1px solid ${currentLighting === lighting ? '#3366CC' : '#666'}`,
                  borderRadius: '4px',
                  color: currentLighting === lighting ? '#fff' : '#ccc',
                  cursor: 'pointer',
                  fontSize: '10px',
                  textTransform: 'uppercase'
                }}
              >
                💡 {lighting}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsLive(!isLive)}
            style={{
              padding: '8px 16px',
              background: isLive ? '#FF6666' : '#66FF99',
              border: 'none',
              borderRadius: '6px',
              color: '#000',
              cursor: 'pointer',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              fontSize: '12px'
            }}
          >
            {isLive ? '⏸️ Stop Live Demo' : '▶️ Start Live Demo'}
          </button>
        </div>
      </div>

      {/* Cast Directory */}
      {currentView === 'cast' && (
        <div style={{ 
          padding: '40px',
          display: 'flex',
          gap: '24px',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <h2 style={{
            width: '100%',
            textAlign: 'center',
            color: '#FF9933',
            fontSize: '28px',
            marginBottom: '24px',
            textTransform: 'uppercase',
            letterSpacing: '2px'
          }}>
            🎭 Character Roster
          </h2>
          {characters.map(character => (
            <Character
              key={character.id}
              character={character}
              onSelect={handleCharacterSelect}
              size="featured"
              showDetails={true}
              lighting={currentLighting === 'dramatic' ? 'spotlight' : 'ambient'}
            />
          ))}
        </div>
      )}

      {/* Rehearsal View */}
      {currentView === 'rehearsal' && (
        <div style={{ 
          padding: '40px',
          display: 'flex',
          gap: '24px',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <h2 style={{
            width: '100%',
            textAlign: 'center',
            color: '#FFAA00',
            fontSize: '28px',
            marginBottom: '24px',
            textTransform: 'uppercase',
            letterSpacing: '2px'
          }}>
            📝 Rehearsal Space
          </h2>
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {performers.map(performer => (
              <div key={performer.id} style={{ textAlign: 'center' }}>
                <Performer
                  performer={performer}
                  size={{ width: 180, height: 220 }}
                  visualStyle="theatrical"
                  onStage={true}
                  onCue={handlePerformerCue}
                  lighting="work"
                />
                <div style={{
                  marginTop: '8px',
                  color: '#ccc',
                  fontSize: '12px',
                  fontStyle: 'italic'
                }}>
                  {performer.characterRole} • {performer.performance.state}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Live Performance */}
      {currentView === 'performance' && (
        <Stage
          stageState={stageState}
          connectionStatus={isLive ? 'Connected' : 'Standby'}
          onPerformerCue={handlePerformerCue}
          onSetInteraction={(set) => console.log(`Interacted with set: ${set.name}`)}
        />
      )}

      {/* Live Demo Indicator */}
      {isLive && (
        <div style={{
          position: 'fixed',
          top: '80px',
          right: '20px',
          background: 'rgba(255, 102, 102, 0.9)',
          color: '#fff',
          padding: '8px 16px',
          borderRadius: '20px',
          fontSize: '12px',
          fontWeight: 'bold',
          textTransform: 'uppercase',
          animation: 'pulse 2s infinite',
          zIndex: 1000
        }}>
          🔴 LIVE PERFORMANCE
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
};

export default TheaterDemo;