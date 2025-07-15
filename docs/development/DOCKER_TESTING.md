# Containerized Testing Guide

This project supports both hermetic (isolated service) and end-to-end (full stack) testing using Docker containers.

## Quick Start

```bash
# Run all tests (hermetic + e2e)
npm run docker:test:all

# Run only hermetic tests (FE-only and BE-only)
npm run docker:test:hermetic

# Run only e2e tests (FE + BE integration)
npm run docker:test:e2e

# Start development environment
npm run docker:dev
```

## Testing Strategies

### 🔬 Hermetic Testing (Isolated Services)

Hermetic tests run each service in isolation without external dependencies:

**Frontend Unit Tests:**
```bash
# Run React component and unit tests
docker-compose -f docker-compose.test.yml run --rm frontend-unit-test
```

**Backend Unit Tests:**
```bash
# Run Python unit tests with pytest
docker-compose -f docker-compose.test.yml run --rm backend-unit-test
```

### 🚀 End-to-End Testing (Full Stack)

E2E tests run against the complete system with frontend + backend + database:

```bash
# Full stack integration tests
docker-compose -f docker-compose.test.yml run --rm e2e-test
```

## Architecture

```
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│ Frontend Tests  │  │ Backend Tests   │  │ E2E Tests       │
│ (Hermetic)      │  │ (Hermetic)      │  │ (Integration)   │
├─────────────────┤  ├─────────────────┤  ├─────────────────┤
│ • React tests   │  │ • Python pytest │  │ • Playwright    │
│ • Jest coverage │  │ • No external   │  │ • Full stack    │
│ • No backend    │  │   dependencies  │  │ • Real browser  │
│ • No database   │  │ • SQLite memory │  │ • API + UI      │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

## Service Ports

### Development (`docker-compose.yml`)
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:8000

### Testing (`docker-compose.test.yml`)
- **Frontend**: http://localhost:3001
- **Backend**: http://localhost:8001

## Development Workflow

### 1. Local Development
```bash
# Start all services for development
npm run docker:dev

# View logs
npm run docker:dev:logs

# Stop services
docker-compose down
```

### 2. Testing Before Commit
```bash
# Quick hermetic tests (faster)
npm run docker:test:hermetic

# Full test suite before push
npm run docker:test:all
```

### 3. Debugging Failed Tests
```bash
# Run tests with verbose output
docker-compose -f docker-compose.test.yml run --rm frontend-unit-test npm test -- --verbose

# Check service health
docker-compose -f docker-compose.test.yml ps

# View service logs
docker-compose -f docker-compose.test.yml logs backend-test
docker-compose -f docker-compose.test.yml logs frontend-test
```

## File Structure

```
/
├── docker-compose.yml          # Development environment
├── docker-compose.test.yml     # Testing environment
├── backend/
│   ├── Dockerfile             # Development backend
│   └── Dockerfile.test        # Testing backend
├── frontend/spaceship-bridge/
│   ├── Dockerfile             # Development frontend
│   └── Dockerfile.test        # Testing frontend (production build)
└── Dockerfile.e2e             # E2E test runner
```

## Benefits

### ✅ Hermetic Testing
- **Fast**: No external dependencies
- **Reliable**: Isolated from network/database issues  
- **Parallel**: Frontend and backend tests run independently
- **Coverage**: Precise unit test coverage

### ✅ E2E Testing
- **Realistic**: Tests real user workflows
- **Integration**: Validates service communication
- **Browser**: Tests actual UI interactions
- **API**: Validates backend contracts

### ✅ Containerized Benefits
- **Consistent**: Same environment across machines
- **Isolated**: No conflicts with local dependencies
- **Portable**: Works on any Docker-enabled system
- **CI/CD Ready**: Easy integration with build pipelines

## Troubleshooting

### Container Issues
```bash
# Clean up containers and volumes
docker-compose -f docker-compose.test.yml down -v
docker system prune -f

# Rebuild containers
docker-compose -f docker-compose.test.yml build --no-cache
```

### Port Conflicts
```bash
# Check what's using ports 3000/8000
lsof -i :3000
lsof -i :8000

# Kill processes if needed
kill -9 <PID>
```

### Health Check Failures
```bash
# Check service logs
docker-compose -f docker-compose.test.yml logs frontend-test
docker-compose -f docker-compose.test.yml logs backend-test

# Test health endpoints manually
curl http://localhost:3001  # Frontend
curl http://localhost:8001/health  # Backend
```