# 🎭 Stagecraft System Demo

## How to See the Theater in Action

### 1. **Run the Demo**
```bash
cd frontend/spaceship-bridge
npm install
npm start
```

Then replace the import in `src/index.tsx`:
```typescript
// Change this line:
import App from './App';
// To this:
import App from './TheaterDemo';
```

### 2. **What You'll See**

#### 🎭 **Cast View** - Character Roster
- **3 AI Characters** with distinct personalities:
  - **Dr. Sarah Chen** (Lead Scientist) - Focused, analytical, currently performing
  - **Commander Torres** (Lead Director) - Strategic leader, improvising solutions  
  - **Engineer Patel** (Supporting Technician) - Struggling with technical challenges

- **Interactive Elements**:
  - Click characters to select them
  - **Lighting effects** change character appearance
  - **Role-based styling** (leads get gold borders, supporting get silver)
  - **Specialty colors** (scientists=blue, directors=orange, technicians=green)
  - **Energy/focus meters** show performance levels

#### 📝 **Rehearsal View** - Practice Space
- **Performer Components** showing the same characters as active performers
- **Real-time state updates** - characters change moods and energy levels
- **Visual themes**: Theatrical styling with dramatic lighting
- **Interactive cues** - click performers to give them direction

#### ⭐ **Performance View** - Live Stage
- **Full Stage Interface** with:
  - **Stage Manager Console** showing production status
  - **Grid-based Stage** with performers positioned in 3D space
  - **Sets/Workstations**: Science Station, Command Center, Engineering Bay
  - **Cast Status Panel** with real-time performance metrics
  - **Lighting Controls** that affect the entire stage atmosphere

### 3. **Interactive Demo Features**

#### 🎨 **Lighting System**
- **4 Lighting Moods**: Bright, Dim, Dramatic, Warm
- Click lighting buttons to see **real-time visual changes**:
  - **Dramatic**: High contrast, colored shadows, spotlight effects
  - **Warm**: Sepia toning, golden highlights
  - **Dim**: Reduced brightness, atmospheric shadows
  - **Bright**: Full illumination, crisp details

#### 🔴 **Live Performance Mode**
- Click "**Start Live Demo**" to activate:
  - **Characters automatically change moods** (performing → struggling → improvising)
  - **Energy levels fluctuate** based on performance challenges
  - **Lighting randomly shifts** for dramatic effect
  - **Real-time updates** every 2 seconds
  - **Performance metrics** update in the stage manager panel

#### 🎯 **Interactive Elements**
- **Character Selection**: Click any character to see console output
- **Performer Cues**: Click performers to "give them direction"
- **Set Interaction**: Click stage elements (Science Station, Command Center, etc.)
- **Responsive Lighting**: Characters react to lighting changes with visual filters

### 4. **What Makes This Special**

#### 🎭 **Theater Metaphor in Action**
- **Characters** have distinct personalities and specialties
- **Performers** are the active manifestation of characters
- **Stage** provides the performance space with proper lighting
- **Sets** are interactive workstations where action happens
- **Lighting Design** affects mood and atmosphere
- **Live Performance** shows how AI agents could behave in real-time

#### 🎨 **Visual Design Features**
- **Role-based prominence**: Lead characters get gold highlighting
- **Specialty color coding**: Each role has signature colors
- **Mood-responsive emojis**: Visual state changes based on character mood
- **Energy visualization**: Performance bars show character vitality
- **Lighting effects**: Real CSS filters for atmospheric lighting
- **Smooth animations**: All state changes are animated

#### 🔧 **Technical Architecture**
- **Single file components** - no complex inheritance
- **Stagecraft terminology** throughout the codebase
- **Real-time state management** with React hooks
- **Performance optimization** with minimal re-renders
- **Accessibility features** - keyboard navigation, ARIA labels

### 5. **Key Stagecraft Concepts Demonstrated**

#### **Characters vs Performers**
- **Characters** are the AI personalities (like actors' headshots)
- **Performers** are those characters actively on stage
- You can have many characters but only some performing at once

#### **Stage Management**
- **Production status** (rehearsal vs performance vs intermission)
- **Cast tracking** with individual performance metrics
- **Set management** with different lighting per workspace
- **Technical feeds** showing connection status

#### **Lighting Design**
- **Mood lighting** affects the entire production
- **Dramatic lighting** can highlight struggling performers
- **Work lighting** for rehearsal/development mode
- **House lighting** for normal operations

#### **Real-time Performance**
- Characters' **energy levels** affect their visual presentation
- **Performance states** change based on workload and challenges
- **Improvisation mode** when characters solve unexpected problems
- **Struggling state** when characters need assistance

### 6. **Development Benefits**

#### **Intuitive Mental Model**
- Developers think in terms of **theater production**
- **Characters** have clear roles and personalities
- **Stage** provides spatial organization
- **Lighting** sets mood and focus
- **Performance** tracks AI engagement levels

#### **Extensible Architecture**
- Easy to add new **character types** and **specialties**
- **Lighting effects** can be extended for different moods
- **Set pieces** can be added for new functionality
- **Acts and scenes** provide workflow organization

#### **Debugging & Monitoring**
- **Stage manager view** shows all system status at once
- **Character mood tracking** helps identify AI issues
- **Performance metrics** show engagement levels
- **Visual state representation** makes debugging intuitive

---

**This demo shows how AI agent management becomes intuitive when framed as theatrical performance management - making complex systems feel natural and creative!**