interface ManifestProps {
  personnel?: PersonnelRecord[]
  resources?: ResourceRecord[]
  missions?: MissionRecord[]
}

interface PersonnelRecord {
  id: string
  name: string
  role: string
  status: 'active' | 'standby' | 'maintenance'
  specializations: string[]
  currentAssignment?: string
}

interface ResourceRecord {
  id: string
  type: 'compute' | 'storage' | 'network' | 'memory'
  name: string
  capacity: number
  utilization: number
  status: 'online' | 'degraded' | 'offline'
}

interface MissionRecord {
  id: string
  title: string
  priority: 'critical' | 'high' | 'medium' | 'low'
  status: 'active' | 'queued' | 'completed' | 'failed'
  assignedPersonnel: string[]
  estimatedDuration: string
}

export function Manifest({ personnel: _personnel = [], resources: _resources = [], missions: _missions = [] }: ManifestProps) {
  const mockPersonnel: PersonnelRecord[] = [
    { id: '1', name: 'Commander', role: 'Executive Officer', status: 'active', specializations: ['Strategy', 'Leadership'], currentAssignment: 'Mission Planning' },
    { id: '2', name: 'Scientist', role: 'Science Officer', status: 'active', specializations: ['Research', 'Analysis'], currentAssignment: 'Data Processing' },
    { id: '3', name: 'Engineer', role: 'Operations Officer', status: 'standby', specializations: ['Systems', 'Automation'] }
  ]

  const mockResources: ResourceRecord[] = [
    { id: '1', type: 'compute', name: 'Primary CPU Cluster', capacity: 100, utilization: 23, status: 'online' },
    { id: '2', type: 'memory', name: 'Working Memory Bank', capacity: 100, utilization: 67, status: 'online' },
    { id: '3', type: 'storage', name: 'Long-term Storage', capacity: 100, utilization: 45, status: 'online' }
  ]

  const mockMissions: MissionRecord[] = [
    { id: '1', title: 'Frontend Component Development', priority: 'high', status: 'active', assignedPersonnel: ['1', '3'], estimatedDuration: '2h' },
    { id: '2', title: 'System Health Monitoring', priority: 'medium', status: 'queued', assignedPersonnel: ['2'], estimatedDuration: '30m' }
  ]

  return (
    <div className="manifest-display">
      <div className="manifest-section">
        <h3>Personnel Roster</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Role</th>
              <th>Status</th>
              <th>Current Assignment</th>
              <th>Specializations</th>
            </tr>
          </thead>
          <tbody>
            {mockPersonnel.map(person => (
              <tr key={person.id} className={`status-${person.status}`}>
                <td>{person.name}</td>
                <td>{person.role}</td>
                <td><span className={`status-badge ${person.status}`}>{person.status}</span></td>
                <td>{person.currentAssignment || 'Unassigned'}</td>
                <td>{person.specializations.join(', ')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="manifest-section">
        <h3>Resource Allocation</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>Resource</th>
              <th>Type</th>
              <th>Utilization</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {mockResources.map(resource => (
              <tr key={resource.id} className={`status-${resource.status}`}>
                <td>{resource.name}</td>
                <td>{resource.type}</td>
                <td>
                  <div className="utilization-bar">
                    <div 
                      className="utilization-fill" 
                      style={{ width: `${resource.utilization}%` }}
                    />
                    <span className="utilization-text">{resource.utilization}%</span>
                  </div>
                </td>
                <td><span className={`status-badge ${resource.status}`}>{resource.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="manifest-section">
        <h3>Active Missions</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>Mission</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Personnel</th>
              <th>ETA</th>
            </tr>
          </thead>
          <tbody>
            {mockMissions.map(mission => (
              <tr key={mission.id} className={`priority-${mission.priority}`}>
                <td>{mission.title}</td>
                <td><span className={`priority-badge ${mission.priority}`}>{mission.priority}</span></td>
                <td><span className={`status-badge ${mission.status}`}>{mission.status}</span></td>
                <td>{mission.assignedPersonnel.length} assigned</td>
                <td>{mission.estimatedDuration}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}