interface ShipProps {
  systemMetrics?: SystemMetrics
  contextLayers?: ContextLayer[]
}

interface SystemMetrics {
  cpu: number
  memory: number
  storage: number
  network: number
  temperature: number
  powerLevel: number
}

interface ContextLayer {
  id: string
  name: string
  type: 'session' | 'project' | 'global' | 'cache'
  size: number
  active: boolean
  depth: number
}

export function Ship({ systemMetrics: _systemMetrics, contextLayers: _contextLayers = [] }: ShipProps) {
  const mockMetrics: SystemMetrics = {
    cpu: 34,
    memory: 67,
    storage: 45,
    network: 12,
    temperature: 38,
    powerLevel: 94
  }

  const mockLayers: ContextLayer[] = [
    { id: '1', name: 'Active Session', type: 'session', size: 2.3, active: true, depth: 0 },
    { id: '2', name: 'Project Context', type: 'project', size: 15.7, active: true, depth: 1 },
    { id: '3', name: 'Global Knowledge', type: 'global', size: 234.5, active: true, depth: 2 },
    { id: '4', name: 'Memory Cache', type: 'cache', size: 8.9, active: false, depth: 3 }
  ]

  const getUtilizationColor = (value: number) => {
    if (value < 30) return 'low'
    if (value < 70) return 'medium'
    return 'high'
  }

  return (
    <div className="ship-cross-section">
      <div className="ship-hull">
        <div className="deck-level primary-systems">
          <h3>Primary Systems</h3>
          <div className="system-grid">
            <div className={`system-module cpu ${getUtilizationColor(mockMetrics.cpu)}`}>
              <div className="module-header">CPU</div>
              <div className="module-gauge">
                <div 
                  className="gauge-fill" 
                  style={{ height: `${mockMetrics.cpu}%` }}
                />
              </div>
              <div className="module-readout">{mockMetrics.cpu}%</div>
            </div>
            
            <div className={`system-module memory ${getUtilizationColor(mockMetrics.memory)}`}>
              <div className="module-header">Memory</div>
              <div className="module-gauge">
                <div 
                  className="gauge-fill" 
                  style={{ height: `${mockMetrics.memory}%` }}
                />
              </div>
              <div className="module-readout">{mockMetrics.memory}%</div>
            </div>
            
            <div className={`system-module storage ${getUtilizationColor(mockMetrics.storage)}`}>
              <div className="module-header">Storage</div>
              <div className="module-gauge">
                <div 
                  className="gauge-fill" 
                  style={{ height: `${mockMetrics.storage}%` }}
                />
              </div>
              <div className="module-readout">{mockMetrics.storage}%</div>
            </div>
          </div>
        </div>
        
        <div className="deck-level context-layers">
          <h3>Context Layers</h3>
          <div className="layer-stack">
            {mockLayers.map(layer => (
              <div 
                key={layer.id}
                className={`context-layer ${layer.type} ${layer.active ? 'active' : 'inactive'}`}
                style={{ 
                  height: `${Math.max(20, layer.size * 2)}px`,
                  zIndex: mockLayers.length - layer.depth
                }}
              >
                <div className="layer-info">
                  <span className="layer-name">{layer.name}</span>
                  <span className="layer-size">{layer.size} MB</span>
                </div>
                <div className="layer-activity">
                  {layer.active && <div className="activity-pulse" />}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="deck-level network-status">
          <h3>Network & I/O</h3>
          <div className="network-grid">
            <div className="network-module">
              <div className="module-header">Throughput</div>
              <div className="throughput-meter">
                <div className="throughput-bar">
                  <div 
                    className="throughput-fill" 
                    style={{ width: `${mockMetrics.network}%` }}
                  />
                </div>
                <span>{mockMetrics.network}%</span>
              </div>
            </div>
            
            <div className="network-module">
              <div className="module-header">Temperature</div>
              <div className="temp-display">
                <span className="temp-value">{mockMetrics.temperature}°C</span>
                <div className={`temp-indicator ${mockMetrics.temperature > 45 ? 'high' : 'normal'}`} />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="ship-status-bar">
        <div className="power-level">
          <span>Power: {mockMetrics.powerLevel}%</span>
          <div className="power-bar">
            <div 
              className="power-fill" 
              style={{ width: `${mockMetrics.powerLevel}%` }}
            />
          </div>
        </div>
        <div className="overall-status">
          <span className="status-indicator operational">Operational</span>
        </div>
      </div>
    </div>
  )
}