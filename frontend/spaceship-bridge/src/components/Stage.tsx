import React from 'react';
import Performer, { Performer as PerformerType } from './Performer';

// Stagecraft-inspired Stage component
// The Stage is where all performances happen - our digital theater
interface Set {
  id: string;
  name: string;
  position: { x: number; y: number };
  dimensions: { width: number; height: number };
  purpose: 'workstation' | 'meeting' | 'storage' | 'display' | 'transition';
  icon: string;
  color: string;
  lighting: 'bright' | 'ambient' | 'dramatic';
}

interface StageState {
  production_id: string;
  currentAct: string;
  currentScene: string;
  status: 'rehearsal' | 'performance' | 'intermission' | 'finale';
  cast: PerformerType[];
  sets: Set[];
  stageLayout: { width: number; height: number };
  lighting: {
    mood: 'bright' | 'dim' | 'dramatic' | 'warm' | 'cool' | 'emergency';
    intensity: number;
    primaryColor: string;
  };
}

interface StageProps {
  stageState: StageState;
  connectionStatus: string;
  onPerformerCue?: (performer: PerformerType) => void;
  onSetInteraction?: (set: Set) => void;
}

const Stage: React.FC<StageProps> = ({ 
  stageState, 
  connectionStatus,
  onPerformerCue,
  onSetInteraction
}) => {
  // Determine overall production status color
  const getProductionStatusColor = (status: string) => {
    const statusColors = {
      rehearsal: '#FFAA00',    // yellow for practice
      performance: '#66FF99',  // green for active show
      intermission: '#9966FF', // purple for break
      finale: '#FF6699'        // pink for ending
    };
    return statusColors[status as keyof typeof statusColors] || '#CCCCCC';
  };

  // Get lighting effect for the entire stage
  const getStageLighting = () => {
    const { mood, intensity, primaryColor } = stageState.lighting;
    
    const baseFilter = `brightness(${intensity / 100})`;
    const moodEffects = {
      bright: 'contrast(1.1)',
      dim: 'contrast(0.8) sepia(0.1)',
      dramatic: 'contrast(1.3) saturate(1.2)',
      warm: 'sepia(0.2) hue-rotate(15deg)',
      cool: 'sepia(0.1) hue-rotate(-15deg)',
      emergency: 'hue-rotate(0deg) saturate(1.5)'
    };
    
    return {
      filter: `${baseFilter} ${moodEffects[mood]}`,
      background: `radial-gradient(ellipse at center, rgba(${primaryColor.slice(1)}, 0.1) 0%, #0a0f1a 70%)`,
      transition: 'all 0.5s ease'
    };
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Stage Manager's Console (Header) */}
      <header style={{
        background: 'linear-gradient(135deg, #1a2332 0%, #2a3442 100%)',
        padding: '16px 24px',
        borderBottom: '2px solid #333',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 2px 10px rgba(0,0,0,0.3)'
      }}>
        {/* Production Info */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <h1 style={{ 
            color: '#e0e6ed', 
            margin: '0 0 4px 0', 
            fontSize: '28px',
            textTransform: 'uppercase',
            letterSpacing: '2px',
            textShadow: '0 0 10px rgba(255,255,255,0.3)'
          }}>
            🎭 {stageState.production_id.toUpperCase()} STAGE
          </h1>
          <div style={{ 
            color: '#78909c',
            fontSize: '12px',
            fontStyle: 'italic'
          }}>
            {stageState.currentAct} • {stageState.currentScene}
          </div>
        </div>
        
        {/* Status Indicators */}
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '10px', color: '#78909c', marginBottom: '2px' }}>
              PRODUCTION STATUS
            </div>
            <span style={{
              color: getProductionStatusColor(stageState.status),
              fontWeight: 'bold',
              textTransform: 'uppercase',
              fontSize: '14px',
              textShadow: `0 0 5px ${getProductionStatusColor(stageState.status)}`
            }}>
              {stageState.status}
            </span>
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '10px', color: '#78909c', marginBottom: '2px' }}>
              TECHNICAL FEED
            </div>
            <span style={{
              color: connectionStatus === 'Connected' ? '#66FF99' : '#FF6666',
              fontSize: '12px',
              textTransform: 'uppercase',
              fontWeight: 'bold'
            }}>
              {connectionStatus}
            </span>
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '10px', color: '#78909c', marginBottom: '2px' }}>
              LIGHTING
            </div>
            <span style={{
              color: stageState.lighting.primaryColor,
              fontSize: '12px',
              textTransform: 'uppercase',
              fontWeight: 'bold'
            }}>
              {stageState.lighting.mood}
            </span>
          </div>
        </div>
      </header>

      <main style={{ 
        flex: 1, 
        display: 'flex', 
        overflow: 'hidden',
        ...getStageLighting()
      }}>
        {/* Main Stage Area */}
        <div style={{ 
          flex: 1, 
          padding: '24px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative'
        }}>
          {/* Stage Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${stageState.stageLayout.width}, 60px)`,
              gridTemplateRows: `repeat(${stageState.stageLayout.height}, 60px)`,
              gap: '3px',
              background: 'rgba(255, 255, 255, 0.03)',
              padding: '24px',
              borderRadius: '15px',
              border: '2px solid rgba(255,255,255,0.1)',
              position: 'relative',
              boxShadow: '0 0 30px rgba(0,0,0,0.5)'
            }}
          >
            {/* Render sets (stage furniture/workstations) */}
            {stageState.sets.map(set => (
              <div
                key={set.id}
                style={{
                  gridColumnStart: set.position.x + 1,
                  gridColumnEnd: set.position.x + set.dimensions.width + 1,
                  gridRowStart: set.position.y + 1,
                  gridRowEnd: set.position.y + set.dimensions.height + 1,
                  backgroundColor: set.color,
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                  color: '#000',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  border: '3px solid rgba(255,255,255,0.4)',
                  cursor: onSetInteraction ? 'pointer' : 'default',
                  transition: 'all 0.3s ease',
                  filter: set.lighting === 'dramatic' ? 'brightness(1.3) contrast(1.2)' :
                          set.lighting === 'bright' ? 'brightness(1.1)' : 'brightness(0.9)',
                  boxShadow: set.lighting === 'dramatic' ? `0 0 15px ${set.color}` : 'none'
                }}
                onClick={() => onSetInteraction?.(set)}
                title={`${set.name} - ${set.purpose}`}
              >
                <span style={{ fontSize: '18px', marginBottom: '3px' }}>{set.icon}</span>
                <span style={{ fontSize: '9px', textAlign: 'center', lineHeight: '1.1' }}>
                  {set.name}
                </span>
              </div>
            ))}
            
            {/* Render performers */}
            {stageState.cast.map(performer => (
              <div
                key={performer.id}
                style={{
                  gridColumn: performer.position.x + 1,
                  gridRow: performer.position.y + 1,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
              >
                <Performer 
                  performer={performer} 
                  size={{ width: 54, height: 54 }}
                  visualStyle="theatrical"
                  onStage={performer.performance.state !== 'offstage'}
                  onCue={onPerformerCue}
                  lighting={stageState.lighting.mood === 'bright' ? 'house' : 
                           stageState.lighting.mood === 'dramatic' ? 'spot' : 'work'}
                />
              </div>
            ))}
            
            {/* Stage center marker */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '4px',
              height: '4px',
              backgroundColor: 'rgba(255,255,255,0.2)',
              borderRadius: '50%',
              pointerEvents: 'none'
            }} />
          </div>
        </div>
        
        {/* Stage Manager's Panel (Sidebar) */}
        <aside style={{
          width: '320px',
          background: 'linear-gradient(180deg, #1a2332 0%, #0f1419 100%)',
          padding: '24px',
          borderLeft: '2px solid #333',
          overflow: 'auto',
          boxShadow: 'inset 5px 0 15px rgba(0,0,0,0.3)'
        }}>
          {/* Cast Status Panel */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.08)',
            borderRadius: '12px',
            padding: '18px',
            marginBottom: '24px',
            border: '1px solid rgba(255,153,51,0.3)',
            boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
          }}>
            <h3 style={{ 
              color: '#FF9933', 
              margin: '0 0 16px 0',
              fontSize: '16px',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              🎭 Cast Status
            </h3>
            {stageState.cast.map(performer => (
              <div key={performer.id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px 0',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                transition: 'all 0.2s ease'
              }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ 
                    color: '#e0e6ed',
                    fontSize: '13px',
                    fontWeight: 'bold'
                  }}>
                    {performer.name}
                  </span>
                  <span style={{
                    color: '#78909c',
                    fontSize: '10px',
                    textTransform: 'capitalize'
                  }}>
                    {performer.characterRole}
                  </span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{
                    color: performer.performance.state === 'struggling' ? '#FF6666' : 
                          performer.performance.state === 'performing' ? '#66FF99' :
                          performer.performance.state === 'rehearsing' ? '#FFAA00' : 
                          performer.performance.state === 'offstage' ? '#666666' : '#CCCCCC',
                    fontSize: '11px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    fontWeight: 'bold'
                  }}>
                    {performer.performance.state}
                  </span>
                  {performer.performance.energy !== undefined && (
                    <div style={{
                      fontSize: '9px',
                      color: '#78909c',
                      marginTop: '2px'
                    }}>
                      Energy: {performer.performance.energy}%
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {/* Set/Props Panel */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.08)',
            borderRadius: '12px',
            padding: '18px',
            border: '1px solid rgba(51,102,204,0.3)',
            boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
          }}>
            <h3 style={{ 
              color: '#3366CC', 
              margin: '0 0 16px 0',
              fontSize: '16px',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              🏗️ Stage Elements
            </h3>
            {stageState.sets.map(set => (
              <div key={set.id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px 0',
                borderBottom: '1px solid rgba(255,255,255,0.1)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '14px' }}>{set.icon}</span>
                  <div>
                    <span style={{ 
                      color: '#e0e6ed',
                      fontSize: '13px',
                      fontWeight: 'bold'
                    }}>
                      {set.name}
                    </span>
                    <div style={{
                      color: '#78909c',
                      fontSize: '10px',
                      textTransform: 'capitalize'
                    }}>
                      {set.purpose}
                    </div>
                  </div>
                </div>
                <span style={{
                  color: '#66FF99',
                  fontSize: '10px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  fontWeight: 'bold'
                }}>
                  {set.lighting.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        </aside>
      </main>
    </div>
  );
};

export default Stage;