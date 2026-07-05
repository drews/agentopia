import React, { useState, useEffect } from 'react';
import AgentComponent from './agents/AgentComponent';
import { Agent, AgentType, AgentStatus } from './agents/types';
import './agents/AgentAnimations.css';

const AgentShowcase: React.FC = () => {
  const [selectedTheme, setSelectedTheme] = useState('lcars');
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [animationSpeed, setAnimationSpeed] = useState(1);

  // Sample agents for showcase
  const sampleAgents: Agent[] = [
    {
      id: 'cmd-001',
      name: 'Commander Nova',
      type: AgentType.COMMANDER,
      position: { x: 0, y: 0 },
      status: {
        state: 'idle',
        lastActivity: new Date(),
        efficiency: 95
      },
      capabilities: {
        primary: 'leadership',
        secondary: ['strategy', 'diplomacy'],
        level: 'master'
      },
      personality: {
        communication_style: 'formal',
        decision_speed: 'deliberate',
        risk_tolerance: 'moderate',
        collaboration: 'team_leader'
      }
    },
    {
      id: 'sci-001',
      name: 'Dr. Chen',
      type: AgentType.SCIENTIST,
      position: { x: 1, y: 0 },
      status: {
        state: 'thinking',
        lastActivity: new Date(Date.now() - 30000),
        efficiency: 88
      },
      capabilities: {
        primary: 'research',
        secondary: ['analysis', 'experimentation'],
        level: 'expert'
      }
    },
    {
      id: 'eng-001',
      name: 'Chief O\'Brien',
      type: AgentType.ENGINEER,
      position: { x: 2, y: 0 },
      status: {
        state: 'working',
        progress: 67,
        lastActivity: new Date(Date.now() - 5000),
        efficiency: 92
      },
      capabilities: {
        primary: 'engineering',
        secondary: ['repair', 'maintenance'],
        level: 'expert'
      }
    },
    {
      id: 'nav-001',
      name: 'Lt. Torres',
      type: AgentType.NAVIGATOR,
      position: { x: 0, y: 1 },
      status: {
        state: 'moving',
        lastActivity: new Date(Date.now() - 10000),
        efficiency: 85
      },
      capabilities: {
        primary: 'navigation',
        secondary: ['piloting', 'spatial_analysis'],
        level: 'competent'
      }
    },
    {
      id: 'com-001',
      name: 'Uhura-9',
      type: AgentType.COMMUNICATIONS,
      position: { x: 1, y: 1 },
      status: {
        state: 'communicating',
        lastActivity: new Date(),
        efficiency: 94
      },
      capabilities: {
        primary: 'communications',
        secondary: ['translation', 'cryptography'],
        level: 'expert'
      }
    },
    {
      id: 'sec-001',
      name: 'Agent Smith',
      type: AgentType.SECURITY,
      position: { x: 2, y: 1 },
      status: {
        state: 'error',
        lastActivity: new Date(Date.now() - 120000),
        efficiency: 45
      },
      capabilities: {
        primary: 'security',
        secondary: ['threat_assessment', 'protection'],
        level: 'competent'
      }
    },
    {
      id: 'med-001',
      name: 'Dr. Crusher',
      type: AgentType.MEDICAL,
      position: { x: 0, y: 2 },
      status: {
        state: 'offline',
        lastActivity: new Date(Date.now() - 300000),
        efficiency: 0
      },
      capabilities: {
        primary: 'medical',
        secondary: ['diagnosis', 'treatment'],
        level: 'master'
      }
    },
    {
      id: 'ops-001',
      name: 'Data-7',
      type: AgentType.OPERATIONS,
      position: { x: 1, y: 2 },
      status: {
        state: 'working',
        progress: 23,
        lastActivity: new Date(Date.now() - 2000),
        efficiency: 97
      },
      capabilities: {
        primary: 'operations',
        secondary: ['logistics', 'coordination'],
        level: 'expert'
      }
    }
  ];

  const themes = ['retro', 'modern', 'minimal', 'lcars'];

  // Cycle through status states for demonstration
  useEffect(() => {
    const interval = setInterval(() => {
      // This would normally be updated by the backend
      // For demo purposes, we'll just trigger re-renders
    }, 2000 / animationSpeed);

    return () => clearInterval(interval);
  }, [animationSpeed]);

  const handleAgentClick = (agent: Agent) => {
    setSelectedAgent(selectedAgent === agent.id ? null : agent.id);
  };

  const handleThemeChange = (theme: string) => {
    setSelectedTheme(theme);
  };

  const getStatusCounts = () => {
    const counts = sampleAgents.reduce((acc, agent) => {
      acc[agent.status.state] = (acc[agent.status.state] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return counts;
  };

  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: selectedTheme === 'lcars' ? "'Arial Narrow', 'Helvetica Condensed', sans-serif" : 'system-ui, sans-serif',
      backgroundColor: selectedTheme === 'retro' ? '#0a0f0a' : selectedTheme === 'lcars' ? '#000000' : '#f8fafc',
      color: selectedTheme === 'retro' ? '#00ff41' : selectedTheme === 'lcars' ? '#FFCC99' : '#1e293b',
      minHeight: '100vh',
      textTransform: selectedTheme === 'lcars' ? 'uppercase' : 'none',
      letterSpacing: selectedTheme === 'lcars' ? '0.5px' : 'normal',
      fontWeight: selectedTheme === 'lcars' ? 'bold' : 'normal'
    }}>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ marginBottom: '10px' }}>🚀 Agent Representation Showcase</h1>
        <p style={{ opacity: 0.8, marginBottom: '20px' }}>
          Interactive demonstration of themable agent representations using the Strategy pattern
        </p>
        
        {/* Theme Selector */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ marginRight: '10px', fontWeight: 'bold' }}>Theme:</label>
          {themes.map(theme => (
            <button
              key={theme}
              onClick={() => handleThemeChange(theme)}
              style={{
                margin: '0 5px',
                padding: '8px 16px',
                border: selectedTheme === theme ? '2px solid currentColor' : '1px solid',
                borderRadius: selectedTheme === 'lcars' ? '20px' : '6px',
                backgroundColor: selectedTheme === theme ? 'currentColor' : 'transparent',
                color: selectedTheme === theme ? (selectedTheme === 'retro' ? '#0a0f0a' : selectedTheme === 'lcars' ? '#000000' : '#ffffff') : 'currentColor',
                cursor: 'pointer',
                textTransform: selectedTheme === 'lcars' ? 'uppercase' : 'capitalize',
                fontWeight: selectedTheme === theme ? 'bold' : 'normal',
                letterSpacing: selectedTheme === 'lcars' ? '0.5px' : 'normal',
                fontFamily: selectedTheme === 'lcars' ? "'Arial Narrow', 'Helvetica Condensed', sans-serif" : 'inherit'
              }}
            >
              {theme}
            </button>
          ))}
        </div>

        {/* Animation Speed */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ marginRight: '10px', fontWeight: 'bold' }}>Animation Speed:</label>
          <input
            type="range"
            min="0.5"
            max="3"
            step="0.5"
            value={animationSpeed}
            onChange={(e) => setAnimationSpeed(parseFloat(e.target.value))}
            style={{ marginRight: '10px' }}
          />
          <span>{animationSpeed}x</span>
        </div>

        {/* Status Summary */}
        <div style={{ marginBottom: '20px' }}>
          <h3>Fleet Status Summary:</h3>
          <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
            {Object.entries(getStatusCounts()).map(([status, count]) => (
              <div key={status} style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '5px',
                padding: '5px 10px',
                border: '1px solid',
                borderRadius: '4px',
                fontSize: '14px'
              }}>
                <span style={{ textTransform: 'capitalize' }}>{status}:</span>
                <strong>{count}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Agent Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: '20px',
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        {sampleAgents.map((agent) => (
          <div key={agent.id} style={{ textAlign: 'center' }}>
            <AgentComponent
              agent={agent}
              theme={selectedTheme}
              interactive={true}
              size={{ width: 120, height: 160 }}
              onInteraction={{
                onClick: handleAgentClick,
                onHover: (agent) => console.log('Hovered:', agent.name)
              }}
              preferences={{
                showTooltips: true,
                animationsEnabled: true,
                showStatus: true,
                showCapabilities: true
              }}
              className={selectedAgent === agent.id ? 'selected' : ''}
            />
            
            {/* Agent Details */}
            {selectedAgent === agent.id && (
              <div style={{
                marginTop: '10px',
                padding: '10px',
                border: '1px solid',
                borderRadius: '6px',
                fontSize: '12px',
                textAlign: 'left'
              }}>
                <div><strong>ID:</strong> {agent.id}</div>
                <div><strong>Type:</strong> {agent.type}</div>
                <div><strong>Status:</strong> {agent.status.state}</div>
                <div><strong>Efficiency:</strong> {agent.status.efficiency}%</div>
                <div><strong>Level:</strong> {agent.capabilities.level}</div>
                <div><strong>Primary:</strong> {agent.capabilities.primary}</div>
                {agent.capabilities.secondary && (
                  <div><strong>Secondary:</strong> {agent.capabilities.secondary.join(', ')}</div>
                )}
                {agent.status.progress !== undefined && (
                  <div><strong>Progress:</strong> {agent.status.progress}%</div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Theme Comparison */}
      <div style={{ marginTop: '40px' }}>
        <h2>Theme Comparison</h2>
        <p style={{ marginBottom: '20px', opacity: 0.8 }}>
          Same agent (Commander Nova) rendered in all three themes:
        </p>
        <div style={{ 
          display: 'flex', 
          gap: '30px', 
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          {themes.map(theme => (
            <div key={theme} style={{ textAlign: 'center' }}>
              <h4 style={{ marginBottom: '10px', textTransform: 'capitalize' }}>
                {theme} Theme
              </h4>
              <AgentComponent
                agent={sampleAgents[0]}
                theme={theme}
                interactive={false}
                size={{ width: 120, height: 160 }}
                preferences={{
                  showTooltips: false,
                  animationsEnabled: true
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Status States Demonstration */}
      <div style={{ marginTop: '40px' }}>
        <h2>Status States</h2>
        <p style={{ marginBottom: '20px', opacity: 0.8 }}>
          Different status states using the {selectedTheme} theme:
        </p>
        <div style={{ 
          display: 'flex', 
          gap: '20px', 
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          {['idle', 'thinking', 'working', 'moving', 'communicating', 'error', 'offline'].map(status => {
            const statusAgent: Agent = {
              ...sampleAgents[0],
              id: `demo-${status}`,
              name: `Agent ${status}`,
              status: {
                state: status as AgentStatus['state'],
                progress: status === 'working' ? 75 : undefined,
                lastActivity: new Date(),
                efficiency: status === 'offline' ? 0 : status === 'error' ? 30 : 85
              }
            };

            return (
              <div key={status} style={{ textAlign: 'center' }}>
                <h5 style={{ 
                  marginBottom: '10px', 
                  textTransform: 'capitalize',
                  fontSize: '12px'
                }}>
                  {status}
                </h5>
                <AgentComponent
                  agent={statusAgent}
                  theme={selectedTheme}
                  interactive={false}
                  size={{ width: 100, height: 130 }}
                  preferences={{
                    showTooltips: false,
                    animationsEnabled: true,
                    compactMode: true
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Implementation Notes */}
      <div style={{ 
        marginTop: '40px', 
        padding: '20px', 
        border: '1px solid', 
        borderRadius: '8px',
        backgroundColor: selectedTheme === 'retro' ? '#0f1a0f' : selectedTheme === 'lcars' ? '#333366' : '#f1f5f9'
      }}>
        <h3>Implementation Features</h3>
        <ul style={{ lineHeight: '1.6' }}>
          <li><strong>Strategy Pattern:</strong> Pluggable rendering strategies for different themes</li>
          <li><strong>Responsive Design:</strong> Adapts to different screen sizes and compact modes</li>
          <li><strong>Accessibility:</strong> Full keyboard navigation, screen reader support, reduced motion respect</li>
          <li><strong>Interactive States:</strong> Hover, selection, focus, and context menu support</li>
          <li><strong>Status Animations:</strong> Visual feedback for different operational states</li>
          <li><strong>Theme Consistency:</strong> Color schemes, typography, and spacing maintained across themes</li>
          <li><strong>Performance:</strong> Efficient rendering with minimal re-renders</li>
          <li><strong>Extensible:</strong> Easy to add new themes and agent types</li>
        </ul>
      </div>
    </div>
  );
};

export default AgentShowcase;