# Documentation Index

## Documentation Guide: How to Retrieve and Calibrate Project Semantics

**Development Tasks:** `architecture/` → `development/CONTEXT_MANAGEMENT.md` → `../backend|frontend/BACKLOG.md`
**Feature Implementation:** `planning/ROADMAP.md` → `architecture/` → update `development/`  
**Integration Work:** `mcp/` → `development/` → document in `mcp/`
**Context Optimization:** Use `@docs/category/filename.md` references; prioritize `development/` + current phase in `planning/`

**Calibration Triggers:** Update docs when reality diverges from documentation:
- Setup instructions fail for new developers/AI assistants
- Architectural decisions contradict `architecture/` patterns  
- Development workflow differs from `development/CONTEXT_MANAGEMENT.md`
- Roadmap phases completed but `planning/ROADMAP.md` unchanged
- `/reflect` entries repeatedly mention "docs are outdated"

**File Pattern Triggers** (future automation hooks):
- `docker-compose*.yml` changes → update `mcp/MCP_DOCKER_ORCHESTRATION.md`
- `docker/*.Dockerfile` changes → update `development/` setup guides
- `*/requirements.txt`, `package.json` → update `development/` setup guides
- `backend/services/*.py` → review `architecture/ARCHITECTURE.md`
- `config/*.json` → update relevant `mcp/` and `architecture/` docs
- `scripts/*.sh` → document in `development/CONTEXT_MANAGEMENT.md`
- `*.md` in root → migrate to appropriate `docs/` category

### [Legacy](./legacy/)
Historical documentation and prototypes for reference
**Key:** Archived summaries, proposals, and prototypes from early development

---

## Documentation Categories

### [Architecture](./architecture/) 
System design, component relationships, technical patterns
**Key:** ARCHITECTURE.md

### [Development](./development/)
Environment setup, workflow automation, context management  
**Key:** OLLAMA_SETUP.md, CONTEXT_MANAGEMENT.md, PERSONAL_LOG.md, DOCKER_TESTING.md

### [Planning](./planning/)
Strategic roadmaps, feature prioritization, development milestones
**Key:** ROADMAP.md, SIMPLE_PLAN.md

### [MCP Integration](./mcp/)
Model Context Protocol setup, Docker orchestration, external tool integration
**Key:** MCP_DOCKER_ORCHESTRATION.md, MCP_DEVELOPMENT_STATUS.md, MCP_INTEGRATION_PLAN.md