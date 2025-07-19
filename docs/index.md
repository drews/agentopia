# Documentation Index

## Documentation Guide: How to Retrieve and Calibrate Project Semantics

**Development Tasks:** `architecture/` → `development/CONTEXT_MANAGEMENT.md` → `../backend|frontend/BACKLOG.md`
**Feature Implementation:** `planning/ROADMAP.md` → `architecture/` → update `development/`  
**Integration Work:** `mcp/` → `development/` → document in `mcp/`
**Narrative & Design:** `design/` → `development/` → update user experience
**Context Optimization:** Use `@docs/category/filename.md` references; prioritize `development/` + current phase in `planning/`

**Calibration Triggers:** Update docs when reality diverges from documentation:
- Setup instructions fail for new developers/AI assistants
- Architectural decisions contradict `architecture/` patterns  
- Development workflow differs from `development/CONTEXT_MANAGEMENT.md`
- Roadmap phases completed but `planning/ROADMAP.md` unchanged
- Character interactions differ from `design/NARRATIVE_ROLES.md`
- `/reflect` entries repeatedly mention "docs are outdated"

**File Pattern Triggers** (future automation hooks):
- `docker-compose*.yml` changes → update `mcp/MCP_DOCKER_ORCHESTRATION.md`
- `docker/*.Dockerfile` changes → update `development/` setup guides
- `*/requirements.txt`, `package.json` → update `development/` setup guides
- `backend/services/*.py` → review `architecture/ARCHITECTURE.md`
- `config/*.json` → update relevant `mcp/` and `architecture/` docs
- `scripts/*.sh` → document in `development/CONTEXT_MANAGEMENT.md`
- `frontend/*/character*.ts` → update `design/NARRATIVE_ROLES.md`
- `*.md` in root → migrate to appropriate `docs/` category

### [Legacy](./legacy/)
Historical documentation and prototypes for reference
**Key:** Archived summaries, proposals, and prototypes from early development

---

## Documentation Categories

### [Architecture](./architecture/) 
System design, component relationships, technical patterns
**Key:** ARCHITECTURE.md, DECOUPLED_PERSISTENCE_ARCHITECTURE.md

### [Development](./development/)
Environment setup, workflow automation, context management, contributing guidelines
**Key:** CONTRIBUTING.md, CONTEXT_MANAGEMENT.md, DOCKER_TESTING.md, OLLAMA_SETUP.md

### [Design](./design/)
Narrative roles, game mechanics, user experience, adaptive systems
**Key:** NARRATIVE_ROLES.md, GAME_MECHANICS.md, ONBOARDING_ARC.md, UX_GUIDELINES.md

### [Planning](./planning/)
Strategic roadmaps, feature prioritization, development milestones
**Key:** ROADMAP.md, SIMPLE_PLAN.md

### [MCP Integration](./mcp/)
Model Context Protocol setup, Docker orchestration, external tool integration
**Key:** MCP_INTEGRATION_PLAN.md, MCP_DOCKER_ORCHESTRATION.md, MCP_DEVELOPMENT_STATUS.md

### [Legacy](./legacy/)
Historical documentation and prototypes for reference
**Key:** Archived design documents, proposals, and prototypes from early development