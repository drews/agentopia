# Context Management Strategy

**Agentopia Development Workflow Optimization**

## Overview

This document outlines how to leverage our custom commands, organized documentation structure, and roadmap-driven development to maintain optimal context management while making measurable progress on capabilities.

## Current Context Management Tools

### 1. Custom Slash Commands

**`/reflect`** - Development retrospective system
- **Purpose**: Capture session progress, architectural decisions, and lessons learned
- **Target**: `@PERSONAL_LOG.md` 
- **Usage**: End-of-session reflection to maintain development continuity
- **Context Value**: Preserves decision-making rationale and technical insights

**`/commit`** - Pre-flight commit checklist
- **Purpose**: Comprehensive quality assurance before committing changes
- **Features**: Code quality checks, atomic commit suggestions, staging guidance
- **Context Value**: Maintains clean git history and prevents context-breaking commits

### 2. Structured Documentation Hierarchy

```
docs/
├── index.md                    # Navigation hub
├── architecture/               # System design decisions
├── mcp/                       # MCP integration guides
├── development/               # Setup guides and workflows
└── planning/                  # Roadmaps and strategic direction
```

**Context Benefits:**
- **Hierarchical Organization**: Easy navigation between related concepts
- **Separation of Concerns**: Development vs. planning vs. architecture
- **Reference Linking**: `@docs/planning/ROADMAP.md` style references

### 3. Active Development Tracking

**`@backend/BACKLOG.md`** - Backend sprint priorities
**`@frontend/BACKLOG.md`** - Frontend sprint priorities
**`@PERSONAL_LOG.md`** - Development narrative and insights

## Roadmap-Driven Development Strategy

### Phase 2: Core Agent Intelligence (Current Focus)

Based on `@docs/planning/ROADMAP.md`, our immediate priorities are:

#### 2.1 LLM Integration Enhancement
**Current State**: Mock responses → **Target**: Intelligent agent behavior

**Context Management Approach:**
1. **Before Starting**: Use `/reflect` to capture current architecture understanding
2. **During Development**: Reference `@backend/BACKLOG.md` for atomic task tracking
3. **After Implementation**: Update both PERSONAL_LOG.md and technical docs

**Key Tasks:**
- [ ] Replace mock agent responses with actual LLM calls
- [ ] Implement agent memory/context management  
- [ ] Add conversation history persistence
- [ ] Create agent personality consistency

#### 2.2 Agent Behavior System  
**Focus**: Goal-oriented planning and task decomposition

#### 2.3 MCP Integration Foundation
**Note**: We've already made significant progress here (see PERSONAL_LOG.md Entry 5)

## Context Preservation Techniques

### 1. Session Continuity Patterns

**Start of Session:**
```bash
# Quick context reconstruction
git log --oneline -5
git status
cat @backend/BACKLOG.md
cat @frontend/BACKLOG.md
```

**During Development:**
- Reference `@docs/architecture/` for design decisions
- Update backlogs with completed tasks
- Use `@config/agents.json` for agent behavior understanding

**End of Session:**
```bash
/reflect  # Capture insights and progress
/commit   # Quality-checked commits
```

### 2. Documentation Update Workflows

**When Adding Features:**
1. Update relevant `@docs/` files
2. Mark backlog items complete
3. Add architectural notes if needed
4. Reflect on integration challenges

**When Refactoring:**
1. Document architectural changes in `@docs/architecture/`
2. Update PERSONAL_LOG.md with decision rationale
3. Clean up outdated documentation

### 3. Progressive Context Building

**Week 1**: Focus on LLM integration (Phase 2.1)
**Week 2**: Agent behavior system (Phase 2.2)  
**Week 3**: MCP integration refinement (Phase 2.3)

Each week builds on the previous while maintaining context through:
- Consistent documentation updates
- Regular reflection entries
- Backlog progression tracking

## Context Window Optimization

### Current Allocation Strategy
- **Working Memory**: ~30-40% current code context
- **Retrieved Plans**: ~20-30% roadmap and backlog references
- **Conversation History**: ~20-30% task tracking and decisions
- **Buffer**: ~10-20% tool outputs and exploration

### Reference Patterns

**High-Value References:**
- `@docs/planning/ROADMAP.md` - Strategic direction
- `@backend/BACKLOG.md` - Current sprint tasks
- `@PERSONAL_LOG.md` - Technical insights and decisions
- `@config/agents.json` - Agent behavior understanding

**Context-Efficient Commands:**
- Use file references (`@filename`) instead of full file reads
- Leverage structured documentation hierarchy
- Employ targeted searches rather than broad exploration

## Iterative Improvement Process

### Weekly Cycles

**Monday**: Review roadmap progress, update backlogs
**Wednesday**: Mid-week reflection on technical challenges  
**Friday**: `/reflect` session with architectural insights

### Monthly Reviews

1. **Roadmap Alignment**: Are we progressing on Phase 2 objectives?
2. **Documentation Quality**: Are docs supporting development velocity?
3. **Command Effectiveness**: Are custom commands providing value?
4. **Context Management**: Is our approach maintaining development continuity?

## Success Metrics for Context Management

### Immediate (2-4 weeks)
- [ ] Consistent use of `/reflect` and `/commit` commands
- [ ] Regular backlog updates showing measurable progress
- [ ] Documentation stays current with implementation
- [ ] Session-to-session continuity improves

### Medium-term (1-3 months)  
- [ ] Phase 2.1 LLM integration completed with good documentation
- [ ] Architecture decisions are well-documented and retrievable
- [ ] Development velocity increases due to better context preservation
- [ ] New team members can onboard using documentation alone

### Long-term (3-6 months)
- [ ] Full Phase 2 completion with comprehensive documentation
- [ ] Context management patterns become standard development practice
- [ ] Documentation structure supports Phase 3 planning
- [ ] Open source contributors can understand and extend the system

## Next Steps

1. **Immediate**: Begin Phase 2.1 LLM integration using this context management approach
2. **This Week**: Update backlogs with atomic LLM integration tasks
3. **This Month**: Iterate on documentation structure based on development needs
4. **Next Quarter**: Refine context management based on Phase 2 completion

---

*Created: July 13, 2025*  
*Next Review: Weekly during Phase 2 development*