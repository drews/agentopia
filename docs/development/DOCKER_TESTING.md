# Docker Testing Patterns for Agentopia

## Core Philosophy
🐳 **All testing is containerized for consistency and isolation**

## Quick Commands
```bash
# Recommended daily testing
npm run docker:smoke

# Full test suite (slower)
npm run docker:test

# E2E tests (requires services running)
npm run test:e2e

# Clean up after tests
npm run docker:test:clean
```

## Testing Infrastructure

### Health Check Pattern
```bash
# Verify all services are healthy
npm run docker:smoke

# Check specific service health
docker-compose -f docker-compose.test.yml ps
```

### Service Dependencies
- **Backend**: FastAPI + SQLite database
- **Frontend**: React development server
- **MCP Servers**: Docker-orchestrated external services
- **Test Runner**: Playwright in container

## Testing Antipatterns (Avoid These)

### ❌ Don't Do
```bash
# Local testing bypasses containerization
pytest backend/tests/
python -m pytest tests/
npm test (in local environment)
```

### ✅ Do Instead
```bash
# Always use Docker orchestration
npm run docker:smoke
npm run docker:test
```

## Performance Optimization

### Fast Feedback Loop
1. **Smoke tests first**: `npm run docker:smoke` (30 seconds)
2. **Targeted testing**: Run specific test suites  
3. **Full suite**: `npm run docker:test` only when needed
4. **Clean up**: `npm run docker:test:clean` to free resources

## MCP Testing Integration

### MCP Server Testing
```bash
# Test MCP connectivity
npm run mcp:test

# Combined MCP + application testing
npm run test:mcp
```