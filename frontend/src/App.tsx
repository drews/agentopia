import { useState } from 'react'
import { Bridge } from './components/Bridge'
import { Screen } from './components/Screen'
import { Manifest } from './components/Manifest'
import { Ship } from './components/Ship'
import { Button } from './components/ui/Button'

type ViewType = 'bridge' | 'screen' | 'manifest' | 'ship'

function App() {
  const [activeView, setActiveView] = useState<ViewType>('bridge')
  const [selectedNode, setSelectedNode] = useState<string>()

  const renderView = () => {
    switch (activeView) {
      case 'bridge':
        return <Bridge />
      case 'screen':
        return <Screen selectedNode={selectedNode} onNodeSelect={setSelectedNode} />
      case 'manifest':
        return <Manifest />
      case 'ship':
        return <Ship />
      default:
        return <Bridge />
    }
  }

  return (
    <div className="h-screen bg-background">
      {/* Top bar - horizontal part of the L */}
      <header className="h-16 flex items-center gap-4 px-6 border-b bg-card/50 backdrop-blur-sm">
        <h1 className="text-2xl font-bold text-foreground">Agentopia</h1>
        <span className="text-sm text-muted-foreground">Mind-Ship Bridge</span>
      </header>
      
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Left sidebar - vertical part of the L */}
        <nav className="w-64 border-r bg-card/20 backdrop-blur-sm">
          <div className="p-4 space-y-2">
            <Button 
              variant={activeView === 'bridge' ? 'default' : 'ghost'}
              className="w-full justify-start text-left"
              onClick={() => setActiveView('bridge')}
            >
              🌉 Bridge
            </Button>
            <Button 
              variant={activeView === 'screen' ? 'default' : 'ghost'}
              className="w-full justify-start text-left"
              onClick={() => setActiveView('screen')}
            >
              📺 Screen
            </Button>
            <Button 
              variant={activeView === 'manifest' ? 'default' : 'ghost'}
              className="w-full justify-start text-left"
              onClick={() => setActiveView('manifest')}
            >
              📋 Manifest
            </Button>
            <Button 
              variant={activeView === 'ship' ? 'default' : 'ghost'}
              className="w-full justify-start text-left"
              onClick={() => setActiveView('ship')}
            >
              🚀 Ship
            </Button>
          </div>
        </nav>
        
        {/* Main content area - nestled in the L armpit */}
        <main className="flex-1 p-8 overflow-auto bg-gradient-to-br from-background to-muted/5">
          <div className="h-full bg-card/30 backdrop-blur-sm rounded-xl border shadow-lg p-6">
            {renderView()}
          </div>
        </main>
      </div>
    </div>
  )
}

export default App
