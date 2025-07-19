# View Mockups - Agentopia Bridge Interface States

## Overview

This document outlines the various interface states and views that represent different phases of the user journey through **Awakening → Resonance → Emergence**. Each mockup represents both the visual design and the underlying system state.

## Act I: Awakening Views

### 1. Stasis Mode - Initial Landing
```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                    ░░░ USS AGENTOPIA ░░░                        │
│                                                                 │
│                         ⚡ STASIS MODE                          │
│                                                                 │
│                    [●●●] Emergency Power                        │
│                                                                 │
│                                                                 │
│              ┌─────────────────────────────────┐                │
│              │                                 │                │
│              │        🔴 INITIALIZE           │                │
│              │        SHIP SYSTEMS            │                │
│              │           [PULSE]              │                │
│              │                                 │                │
│              └─────────────────────────────────┘                │
│                                                                 │
│                                                                 │
│                    Status: Systems Dormant                     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Key Elements:**
- Minimal interface, mostly dark
- Single prominent action button with subtle pulse animation
- Emergency lighting effects only
- Status indicator showing dormant state

### 2. Awakening Sequence - Systems Coming Online
```
┌─────────────────────────────────────────────────────────────────┐
│ USS AGENTOPIA BRIDGE                           ⚡ AWAKENING     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  🟢 PRIMARY SYSTEMS    [████████░░] 80%                  │  │
│  │  🟡 LIFE SUPPORT       [██████████] 100%                 │  │
│  │  🟡 COMMUNICATIONS     [██████░░░░] 60%                   │  │
│  │  🔴 NAVIGATION         [███░░░░░░░] 30%                   │  │
│  │  🔴 TACTICAL SYSTEMS   [█░░░░░░░░░] 10%                   │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│           ┌─────────────────────────────────────┐               │
│           │          🤖 ARIA Online            │               │
│           │                                     │               │
│           │   "Good morning, Commander.         │               │
│           │    I'm your ship's AI assistant.   │               │
│           │    How would you like to work       │               │
│           │    together?"                       │               │
│           │                                     │               │
│           │   [Formal] [Casual] [Technical]    │               │
│           └─────────────────────────────────────┘               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Key Elements:**
- Progressive system activation with animated progress bars
- AI introduction dialog with personality options
- Gradual interface illumination
- Status transitions from red → yellow → green

### 3. Diagnostic Overview - Understanding Your Domain
```
┌─────────────────────────────────────────────────────────────────┐
│ USS AGENTOPIA BRIDGE                        🟢 DIAGNOSTIC       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────┐  ┌─────────────────────────────────────┐  │
│  │    BRIDGE GRID      │  │        SHIP STATUS              │  │
│  │  ╔═══╦═══╦═══╦═══╗  │  │  ┌─────────────────────────────┐ │  │
│  │  ║ 🛠️ ║   ║ 🔬 ║   ║  │  │  🛠️ Engineering    🟢 100%  │ │  │
│  │  ╠═══╬═══╬═══╬═══╣  │  │  │  🔬 Science Lab    🟡  75%  │ │  │
│  │  ║   ║ 👨‍💼 ║   ║ 📊 ║  │  │  📊 Data Center    🟢  95%  │ │  │
│  │  ╠═══╬═══╬═══╬═══╣  │  │  │  🚀 Navigation     🟡  60%  │ │  │
│  │  ║ 📡 ║   ║   ║   ║  │  │  │  📡 Communications 🟢  90%  │ │  │
│  │  ╚═══╩═══╩═══╩═══╝  │  │  └─────────────────────────────┘ │  │
│  └─────────────────────┘  └─────────────────────────────────────┘  │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │                   AVAILABLE CREW                           │  │
│  │  👨‍💼 Agent Smith    🛠️ Engineering   [ASSIGN]               │  │
│  │  👩‍🔬 Dr. Chen       🔬 Research      [ASSIGN]               │  │
│  │  🤖 Data-7         📊 Analysis       [ASSIGN]               │  │
│  │  👨‍🚀 Pilot Torres   🚀 Navigation    [ASSIGN]               │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Key Elements:**
- Grid-based bridge layout showing stations
- System status with health indicators
- Available crew with specializations
- Interactive assignment interface

## Act II: Resonance Views

### 4. Voice Discovery - Finding Your Command Style
```
┌─────────────────────────────────────────────────────────────────┐
│ COMMAND VOICE DISCOVERY                    🎵 RESONANCE         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │              SCENARIO: Resource Allocation Crisis          │  │
│  │                                                             │  │
│  │  Two departments need the same critical resource            │  │
│  │  immediately. Engineering says it's for life support.      │  │
│  │  Science says it's for a breakthrough discovery.           │  │
│  │                                                             │  │
│  │  How do you respond?                                        │  │
│  │                                                             │  │
│  │  [A] "Engineering gets priority. Safety first."            │  │
│  │       → Direct, Risk-averse                                │  │
│  │                                                             │  │
│  │  [B] "Let's get both teams together to find                │  │
│  │       a solution that works for everyone."                 │  │
│  │       → Collaborative, Problem-solving                     │  │
│  │                                                             │  │
│  │  [C] "I need more data. Show me both use                   │  │
│  │       cases and projected outcomes."                       │  │
│  │       → Analytical, Strategic                              │  │
│  │                                                             │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                 │
│  Progress: ████████░░ 80%  │  Voice Profile: Emerging...        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 5. System Tuning - Adapting to Your Frequency
```
┌─────────────────────────────────────────────────────────────────┐
│ SYSTEM TUNING                              🎵 RESONANCE         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────┐  ┌─────────────────────────────────────┐  │
│  │   COMMAND VOICE     │  │         SYSTEM ADAPTATION          │  │
│  │                     │  │                                     │  │
│  │  📊 Collaborative   │  │  Update Frequency:  ●─────○─────○  │  │
│  │     Guide 85%       │  │  [Hourly] [Real-time] [On-demand]  │  │
│  │                     │  │                                     │  │
│  │  🎯 Directness: 60% │  │  Alert Priority:    ○─────●─────○  │  │
│  │  🤝 Patience:  85%  │  │  [Critical] [Important] [All]      │  │
│  │  🧠 Analysis: 75%   │  │                                     │  │
│  │  ⚡ Speed:    45%   │  │  Decision Speed:    ○─────○─────●  │  │
│  │                     │  │  [Quick] [Balanced] [Deliberate]   │  │
│  └─────────────────────┘  └─────────────────────────────────────┘  │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │                    PREVIEW CHANGES                         │  │
│  │                                                             │  │
│  │  🤖 "I'll provide detailed briefings every hour and        │  │
│  │      flag important decisions for your review.             │  │
│  │      My reports will include context and multiple          │  │
│  │      options for your consideration."                      │  │
│  │                                                             │  │
│  │                  [APPLY TUNING] [ADJUST MORE]              │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 6. First Synchronized Mission - Resonance in Action
```
┌─────────────────────────────────────────────────────────────────┐
│ MISSION: System Optimization                🎵 RESONANCE        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────┐  ┌─────────────────────────────────────┐  │
│  │   MISSION BRIEF     │  │         TEAM SYNC STATUS            │  │
│  │                     │  │                                     │  │
│  │  🎯 Objective:      │  │  👨‍💼 Smith     🟢 In Sync           │  │
│  │     Optimize power  │  │  📊 Data-7    🟢 In Sync           │  │
│  │     distribution    │  │  🤖 ARIA      🟢 Harmonized        │  │
│  │                     │  │                                     │  │
│  │  ⏱️ Timeline:       │  │  🎵 Team Resonance: 92%            │  │
│  │     2 hours         │  │  📈 Efficiency Boost: +15%         │  │
│  │                     │  │                                     │  │
│  │  📋 Status:         │  │  💫 Flow State: ACTIVE             │  │
│  │     In Progress     │  │                                     │  │
│  └─────────────────────┘  └─────────────────────────────────────┘  │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │                     LIVE UPDATES                           │  │
│  │                                                             │  │
│  │  15:32  🤖 "Power grid analysis 60% complete"              │  │
│  │  15:30  👨‍💼 "Found bottleneck in Sector 7"                 │  │
│  │  15:28  📊 "Efficiency patterns identified"                │  │
│  │  15:25  🎯 Mission started with synchronized team          │  │
│  │                                                             │  │
│  │                      [INTERVENE] [MONITOR]                 │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Act III: Emergence Views

### 7. System Expansion - New Possibilities Unlocked
```
┌─────────────────────────────────────────────────────────────────┐
│ SYSTEM EXPANSION                           🌱 EMERGENCE         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │                    AVAILABLE EXPANSIONS                    │  │
│  │                                                             │  │
│  │  🚀 Additional Ships     [3 Available] 💎 Unlocked         │  │
│  │     › USS Explorer (Science Focus)                         │  │
│  │     › USS Guardian (Defense Focus)                         │  │
│  │     › USS Pioneer (Resource Focus)                         │  │
│  │                                                             │  │
│  │  🧠 Advanced AI Cores   [2 Available] 💎 Unlocked         │  │
│  │     › Strategic Planning Module                            │  │
│  │     › Predictive Analytics Core                            │  │
│  │                                                             │  │
│  │  🌐 Network Operations  [1 Available] ⏳ Requirements:     │  │
│  │     › Multi-Ship Coordination         ➤ 5+ Successful     │  │
│  │                                         Missions (3/5)    │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌─────────────────────┐  ┌─────────────────────────────────────┐  │
│  │    FLEET STATUS     │  │         NEW CAPABILITIES            │  │
│  │                     │  │                                     │  │
│  │  🎯 Primary Ship    │  │  📊 Cross-ship resource sharing    │  │
│  │     USS Agentopia   │  │  🤝 Collaborative mission planning │  │
│  │     [Active]        │  │  ⚡ Parallel operation management  │  │
│  │                     │  │  🎭 Specialized team compositions  │  │
│  │  🔧 USS Explorer    │  │  📈 Advanced performance metrics   │  │
│  │     [Standby]       │  │                                     │  │
│  └─────────────────────┘  └─────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 8. Multi-Ship Coordination - Orchestrating Complexity
```
┌─────────────────────────────────────────────────────────────────┐
│ FLEET OPERATIONS CENTER                    🌱 EMERGENCE         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌───────────────────────────────┐ ┌───────────────────────────┐  │
│  │        USS AGENTOPIA          │ │       USS EXPLORER        │  │
│  │                               │ │                           │  │
│  │  Mission: Resource Mining     │ │  Mission: Scientific      │  │
│  │  Status: 🟢 Operational       │ │          Research         │  │
│  │  Crew: 4/6 Active            │ │  Status: 🟡 Investigating │  │
│  │  Efficiency: 95%              │ │  Crew: 3/4 Active        │  │
│  │                               │ │  Discovery: 67%           │  │
│  │  [🛠️][📊][🔬][🚀]            │ │  [🔬][📡][🤖]           │  │
│  └───────────────────────────────┘ └───────────────────────────┘  │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │                  COORDINATION MATRIX                       │  │
│  │                                                             │  │
│  │  📊 Resource Flow:    Agentopia → Explorer (Data Sharing)  │  │
│  │  🤝 Team Exchange:    Dr. Chen → Explorer (Expertise)      │  │
│  │  ⚡ Priority Queue:   Mining → Research → Logistics        │  │
│  │  🎯 Joint Objective: Establish sustainable research base   │  │
│  │                                                             │  │
│  │  🌊 Flow Efficiency: 89%  |  🎵 Fleet Resonance: 94%      │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │                    STRATEGIC OVERVIEW                      │  │
│  │                                                             │  │
│  │  "Commander, the fleet is operating in perfect harmony.    │  │
│  │   Cross-ship collaboration is exceeding projections.      │  │
│  │   New operational patterns are emerging that could        │  │
│  │   revolutionize our efficiency. Recommend exploring       │  │
│  │   autonomous fleet coordination protocols."               │  │
│  │                                                             │  │
│  │           [EXPLORE PROTOCOLS] [MAINTAIN CURRENT]          │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 9. Autonomous Operations - Transcendent Capabilities
```
┌─────────────────────────────────────────────────────────────────┐
│ AUTONOMOUS OPERATIONS                      🌱 EMERGENCE         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │                  EXECUTIVE DASHBOARD                       │  │
│  │                                                             │  │
│  │  🎯 Active Operations: 7        📈 Efficiency: 156%        │  │
│  │  🤖 Autonomous Level: 89%       🧠 AI Confidence: 98%      │  │
│  │  ⚡ Fleet Coordination: Perfect 🌟 New Patterns: 3         │  │
│  │                                                             │  │
│  │  ┌─────────────────┐ ┌─────────────────┐ ┌───────────────┐ │  │
│  │  │   Strategic     │ │   Operational   │ │   Tactical    │ │  │
│  │  │   Planning      │ │   Excellence    │ │   Innovation  │ │  │
│  │  │      🧠         │ │       ⚡        │ │      🎯       │ │  │
│  │  │   AI-Driven     │ │   Human-Guided  │ │  Emergent     │ │  │
│  │  └─────────────────┘ └─────────────────┘ └───────────────┘ │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │                    EMERGENCE ALERTS                        │  │
│  │                                                             │  │
│  │  🌟 NEW: Cross-ship AI collaboration patterns detected     │  │
│  │      "AIs are developing novel communication protocols"    │  │
│  │                                               [INVESTIGATE] │  │
│  │                                                             │  │
│  │  🌟 NEW: Predictive mission planning capability unlocked   │  │
│  │      "System can now forecast optimal mission sequences"   │  │
│  │                                               [ACTIVATE]    │  │
│  │                                                             │  │
│  │  🌟 NEW: Resource optimization breakthrough achieved        │  │
│  │      "Fleet efficiency exceeds all known benchmarks"       │  │
│  │                                               [ANALYZE]     │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │                   MASTERY ACHIEVED                         │  │
│  │                                                             │  │
│  │  🏆 Executive Agency: Complete                              │  │
│  │  🚀 Fleet Command: Transcendent                            │  │
│  │  🌟 Innovation Catalyst: Recognized                        │  │
│  │                                                             │  │
│  │  "You have achieved mastery of multi-agent coordination.   │  │
│  │   New frontiers await your exploration."                   │  │
│  │                                                             │  │
│  │              [EXPLORE FRONTIERS] [MENTOR OTHERS]           │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Mobile Responsive Views

### Mobile - Stasis Mode
```
┌─────────────────────┐
│   USS AGENTOPIA     │
├─────────────────────┤
│                     │
│     ⚡ STASIS       │
│                     │
│   [●●●] Emergency   │
│                     │
│                     │
│   ┌───────────────┐ │
│   │       🔴      │ │
│   │  INITIALIZE   │ │
│   │    SYSTEMS    │ │
│   │   [PULSE]     │ │
│   └───────────────┘ │
│                     │
│                     │
│  Status: Dormant    │
│                     │
└─────────────────────┘
```

### Mobile - Mission Monitoring
```
┌─────────────────────┐
│ 🎵 MISSION ACTIVE   │
├─────────────────────┤
│                     │
│ System Optimization │
│ ████████░░ 80%      │
│                     │
│ ┌─────────────────┐ │
│ │ Team Status     │ │
│ │ 👨‍💼 Smith  🟢   │ │
│ │ 📊 Data-7 🟢   │ │
│ │ 🤖 ARIA   🟢   │ │
│ └─────────────────┘ │
│                     │
│ ┌─────────────────┐ │
│ │ Latest Update   │ │
│ │ 15:32 🤖       │ │
│ │ "60% complete"  │ │
│ └─────────────────┘ │
│                     │
│ [DETAILS] [CONTROL] │
│                     │
└─────────────────────┘
```

These mockups provide a comprehensive view of how the interface evolves through the user's journey, maintaining the spacey aesthetic while progressively revealing more sophisticated capabilities as users demonstrate mastery.

---

*Next: Frontend stub architecture and component hierarchy mapping.*