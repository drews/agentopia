interface BridgeProps {
  agents?: Agent[]
  activities?: Activity[]
}

interface Agent {
  id: string
  name: string
  role: string
  status: 'active' | 'idle' | 'processing' | 'offline'
  position?: { x: number; y: number }
}

interface Activity {
  id: string
  agentId: string
  type: string
  description: string
  intensity: number
}

export function Bridge({ agents: _agents = [], activities: _activities = [] }: BridgeProps) {
  const mockAgents: Agent[] = [
    { id: '1', name: 'Commander', role: 'Executive', status: 'active', position: { x: 25, y: 30 } },
    { id: '2', name: 'Scientist', role: 'Research', status: 'processing', position: { x: 60, y: 45 } },
    { id: '3', name: 'Engineer', role: 'Operations', status: 'idle', position: { x: 40, y: 70 } }
  ]

  const mockActivities: Activity[] = [
    { id: '1', agentId: '1', type: 'planning', description: 'Strategic analysis', intensity: 3 },
    { id: '2', agentId: '2', type: 'research', description: 'Data processing', intensity: 5 },
    { id: '3', agentId: '3', type: 'maintenance', description: 'System check', intensity: 2 }
  ]

  return (
    <div className="relative h-full bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg overflow-hidden">
      {/* Background ambient field */}
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-grid-small">
        {mockActivities.map(activity => (
          <div 
            key={activity.id}
            className={`absolute w-2 h-2 rounded-full animate-pulse ${
              activity.intensity > 4 ? 'bg-red-400' : 
              activity.intensity > 2 ? 'bg-yellow-400' : 'bg-blue-400'
            }`}
            style={{
              left: `${Math.random() * 80 + 10}%`,
              top: `${Math.random() * 80 + 10}%`,
              animationDelay: `${Math.random() * 2}s`
            }}
          />
        ))}
      </div>
      
      {/* Agent constellation */}
      <div className="relative h-full p-8">
        {mockAgents.map(agent => (
          <div 
            key={agent.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2"
            style={{
              left: `${agent.position?.x}%`,
              top: `${agent.position?.y}%`
            }}
          >
            <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white font-semibold shadow-lg ${
              agent.status === 'active' ? 'bg-green-500 animate-pulse' :
              agent.status === 'processing' ? 'bg-yellow-500 animate-spin' :
              'bg-slate-500'
            }`}>
              {agent.name[0]}
            </div>
            <div className="mt-2 text-center">
              <div className="text-sm font-medium text-white">{agent.name}</div>
              <div className="text-xs text-slate-300">{agent.role}</div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Status overlay */}
      <div className="absolute bottom-4 left-4 right-4 flex justify-between">
        <div className="bg-black/20 backdrop-blur-sm rounded-lg px-4 py-2 text-white">
          <div className="text-sm font-medium">Active Processes</div>
          <div className="text-2xl font-bold">{mockActivities.length}</div>
        </div>
        <div className="bg-black/20 backdrop-blur-sm rounded-lg px-4 py-2 text-white">
          <div className="text-sm font-medium">Agents Online</div>
          <div className="text-2xl font-bold">
            {mockAgents.filter(a => a.status !== 'offline').length}
          </div>
        </div>
      </div>
    </div>
  )
}