# Frontend Development Guide

Welcome to the Agentopia frontend development environment! This guide will get you up and running with our fresh Vite + React + TypeScript stack.

## 🚀 Quick Start

### Prerequisites
- Docker (for containerized development)
- Node.js 18+ (for local development)

### Start Development Server

**Option 1: Docker (Recommended)**
```bash
# Start just the frontend service
just frontend

# Or start everything
just start
```

**Option 2: Local Development**
```bash
cd frontend
npm install
npm run dev
```

## 📁 Project Structure

```
frontend/
├── src/
│   ├── App.tsx          # Main application component
│   ├── main.tsx         # Application entry point
│   ├── assets/          # Static assets (images, etc.)
│   └── ...
├── public/              # Public static files
├── package.json         # Dependencies and scripts
├── vite.config.ts       # Vite configuration
├── tsconfig.json        # TypeScript configuration
└── eslint.config.js     # ESLint configuration
```

## 🛠️ Available Scripts

```bash
# Development server with hot reload
npm run dev

# Build for production
npm run build

# Lint code
npm run lint

# Preview production build
npm run preview
```

## 🔧 Tech Stack

- **React 19.1** - UI framework
- **TypeScript 5.8** - Type safety
- **Vite 7.0** - Build tool and dev server
- **ESLint** - Code linting
- **React Hooks** - State management

## 🎯 Development Workflow

1. **Make changes** to React components in `src/`
2. **Hot reload** automatically updates the browser
3. **Lint code** with `npm run lint`
4. **Build** with `npm run build` to test production
5. **Commit** changes following conventional commits

## 📚 Key Resources

### React & TypeScript
- [React 19 Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)

### Vite
- [Vite Documentation](https://vite.dev/)
- [Vite React Plugin](https://github.com/vitejs/vite-plugin-react)

### Project Context
- **Architecture**: `@docs/architecture/ARCHITECTURE.md`
- **Contributing**: `@docs/development/CONTRIBUTING.md`
- **Game Mechanics**: `@docs/design/GAME_MECHANICS.md`

## 🔗 Integration Points

### Backend Communication
- Backend runs on different port/container
- Use environment variables for API endpoints
- Consider adding API client utilities in `src/api/`

### MCP Integration
- MCP servers handle agent communication
- Frontend will consume agent data via APIs
- See `@docs/mcp/MCP_INTEGRATION_PLAN.md` for details

## 🎨 UI Development Tips

### Component Organization
```bash
src/
├── components/          # Reusable UI components
├── pages/              # Page-level components
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
├── types/              # TypeScript type definitions
└── styles/             # Styling (CSS/styled-components)
```

### State Management
- Start with React built-in state (useState, useContext)
- Consider Zustand or Redux Toolkit for complex state
- Keep state close to where it's used

### Styling Options
- CSS Modules (built into Vite)
- Styled Components
- Tailwind CSS (needs setup)
- Plain CSS/SCSS

## 🧪 Testing

Currently no testing framework is configured. Consider adding:
- **Vitest** (Vite-native testing)
- **React Testing Library** (component testing)
- **Playwright** (E2E testing - already in project root)

## 🐛 Troubleshooting

### Common Issues
- **Port conflicts**: Vite dev server runs on port 5173 by default
- **Node version**: Ensure Node.js 18+ is installed
- **Dependencies**: Run `npm install` after pulling changes

### Getting Help
- Check existing documentation in `docs/`
- Review project CLAUDE.md for context loading
- Use `just smoke` to verify overall project health

## 🎭 Agent UI Development

This frontend will eventually interface with AI agents. Consider:
- **Real-time updates** (WebSockets/SSE)
- **Agent status displays** (active, idle, processing)
- **Task visualization** (progress, queues, results)
- **Interactive controls** (start/stop agents, assign tasks)

---

💡 **Pro Tip**: This is a fresh start! The previous spaceship-bridge frontend was completely replaced with this clean Vite template. Build whatever makes sense for the Agentopia vision.