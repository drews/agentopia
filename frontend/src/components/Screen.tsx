interface ScreenProps {
  data?: any
  selectedNode?: string
  onNodeSelect?: (nodeId: string) => void
}

interface DataNode {
  id: string
  label: string
  type: 'concept' | 'decision' | 'insight' | 'question'
  connections: string[]
  depth: number
  explored: boolean
}

export function Screen({ data: _data, selectedNode, onNodeSelect }: ScreenProps) {
  const mockNodes: DataNode[] = [
    { id: '1', label: 'Current Task', type: 'concept', connections: ['2', '3'], depth: 0, explored: true },
    { id: '2', label: 'Approach A', type: 'decision', connections: ['4'], depth: 1, explored: false },
    { id: '3', label: 'Approach B', type: 'decision', connections: ['5'], depth: 1, explored: false },
    { id: '4', label: 'Implementation Details', type: 'insight', connections: [], depth: 2, explored: false },
    { id: '5', label: 'Alternative Path', type: 'question', connections: [], depth: 2, explored: false }
  ]

  return (
    <div className="screen-display">
      <div className="data-visualization">
        <div className="decision-tree">
          {mockNodes.map(node => (
            <div 
              key={node.id}
              className={`data-node ${node.type} ${node.explored ? 'explored' : 'unexplored'} ${selectedNode === node.id ? 'selected' : ''}`}
              style={{
                left: `${20 + (node.depth * 200)}px`,
                top: `${50 + (parseInt(node.id) * 80)}px`
              }}
              onClick={() => onNodeSelect?.(node.id)}
            >
              <div className="node-content">
                <span className="node-label">{node.label}</span>
                <span className="node-type">{node.type}</span>
              </div>
              <div className="node-connections">
                {node.connections.map(connId => (
                  <div key={connId} className="connection-line" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="screen-controls">
        <button className="control-btn">Expand Branch</button>
        <button className="control-btn">Prune Path</button>
        <button className="control-btn">New Insight</button>
      </div>
      
      <div className="detail-panel">
        {selectedNode && (
          <div className="node-details">
            <h3>Node Analysis</h3>
            <p>Exploring decision space for selected concept...</p>
            <div className="exploration-metrics">
              <span>Certainty: 67%</span>
              <span>Complexity: Medium</span>
              <span>Dependencies: 3</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}