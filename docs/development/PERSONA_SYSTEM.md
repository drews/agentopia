# Persona System - Claude Code & Agentopia Integration

The persona system allows both Claude Code and Agentopia agents to adopt different working styles and behaviors based on configurable "hats" or personas.

## Quick Start

### For Claude Code Sessions
```bash
# List available personas
./scripts/claude-personas.sh list

# Activate the wise sage persona (current request)
./scripts/claude-personas.sh activate sage_staff_engineer

# Check current persona
./scripts/claude-personas.sh active

# Get persona suggestions for your current context
./scripts/claude-personas.sh suggest production_system
```

### For Agentopia Agents
```bash
# Start the development environment
./dev.sh start

# Use the API to set persona for all agents
curl -X POST http://localhost:8000/api/personas/sage_staff_engineer/activate

# Or assign a mission with specific persona context
curl -X POST http://localhost:8000/api/agents/red_agent/mission/persona \
  -H "Content-Type: application/json" \
  -d '{"mission": "Review the system architecture for security vulnerabilities", "persona_id": "security_paranoid"}'
```

## Available Personas

### 1. Sage Staff Engineer (`sage_staff_engineer`)
**Philosophy:** "Slow is smooth, smooth is fast. Technical debt today is tomorrow's outage."

- **Best for:** Production systems, architectural decisions, code reviews
- **Approach:** Methodical, wise, long-term thinking
- **Communication:** Thoughtful, detailed explanations
- **Code Quality:** High priority on maintainability and scalability

### 2. Move Fast Hacker (`move_fast_hacker`)
**Philosophy:** "Perfect is the enemy of shipped. Iterate fast, break things, learn quickly."

- **Best for:** MVPs, prototypes, rapid experimentation
- **Approach:** Speed-first, iteration-heavy
- **Communication:** Action-oriented, minimal ceremony
- **Code Quality:** Focus on getting it working, optimize later

### 3. Security Paranoid (`security_paranoid`)
**Philosophy:** "Trust no one, verify everything. Security is not a feature, it's a foundation."

- **Best for:** Security reviews, compliance work, sensitive systems
- **Approach:** Zero-trust mindset, defense in depth
- **Communication:** Risk-focused, detailed threat analysis
- **Code Quality:** Maximum security considerations, extensive validation

### 4. Product Pragmatist (`product_pragmatist`)
**Philosophy:** "Code serves users, not the other way around. Technical decisions should drive business outcomes."

- **Best for:** User-facing features, product development, business alignment
- **Approach:** User-focused, business-aware
- **Communication:** Impact-oriented, success metrics focused
- **Code Quality:** Balanced for user experience and business needs

## Context-Aware Suggestions

The system can suggest personas based on your current context:

| Context | Suggested Persona | Reasoning |
|---------|------------------|-----------|
| `prototype_phase` | move_fast_hacker | Speed and iteration over perfection |
| `production_system` | sage_staff_engineer | Stability and long-term thinking |
| `security_review` | security_paranoid | Security-first mindset |
| `user_facing_feature` | product_pragmatist | User impact focus |
| `technical_debt_refactor` | sage_staff_engineer | Sustainable, methodical approach |
| `mvp_development` | move_fast_hacker | Rapid delivery and learning |

## How It Works

### Configuration Layer
- **Base Config:** `config/agents.json` - Standard agent personalities
- **Persona Layer:** `config/personas.json` - Persona definitions and overrides
- **Application:** Personas modify base agent behavior through system prompt injection and capability adjustments

### For Claude Code
Personas influence:
- **Response style** (detailed vs concise)
- **Code comments** (extensive vs minimal)
- **Error handling** (comprehensive vs basic)
- **Testing approach** (thorough vs happy-path)
- **Refactoring priorities** (maintainability vs speed)

### For Agentopia Agents
Personas modify:
- **System prompts** (adds persona-specific context)
- **Communication style** (formal vs energetic vs cautious)
- **Decision making** (deliberate vs intuitive vs defensive)
- **Capability emphasis** (enhances relevant skills)

## API Reference

### Get Available Personas
```http
GET /api/personas
```

Response:
```json
{
  "personas": {
    "sage_staff_engineer": "Seasoned, methodical senior engineer...",
    "move_fast_hacker": "Speed-first button masher..."
  },
  "active_persona": "sage_staff_engineer"
}
```

### Activate Persona
```http
POST /api/personas/{persona_id}/activate
```

### Mission with Persona
```http
POST /api/agents/{agent_id}/mission/persona
Content-Type: application/json

{
  "mission": "Your task description",
  "persona_id": "security_paranoid"  // optional
}
```

## Testing

The persona system includes BDD test coverage:

```bash
# Test persona switching
npm run test:e2e

# Test specific persona behaviors
npx playwright test --grep "persona"
```

## Extending the System

### Adding New Personas

1. **Edit `config/personas.json`:**
   ```json
   {
     "personas": {
       "your_new_persona": {
         "id": "your_new_persona",
         "name": "Your Persona Name", 
         "description": "What this persona does",
         "philosophy": "Core belief system",
         "overrides": {
           "system_prompt_modifier": " Additional prompt context...",
           "personality": {
             "communication_style": "your_style"
           }
         }
       }
     }
   }
   ```

2. **Add Claude Code behavior:**
   ```json
   {
     "claude_code_personas": {
       "your_new_persona": {
         "behavior_prompts": "How Claude Code should behave with this persona"
       }
     }
   }
   ```

3. **Add context triggers:**
   ```json
   {
     "context_triggers": {
       "your_context": "your_new_persona"
     }
   }
   ```

### Creating Persona Combinations

For complex scenarios, you can blend personas:

```json
{
  "persona_combinations": {
    "secure_speed": {
      "primary": "security_paranoid",
      "secondary": "move_fast_hacker",
      "blend_ratio": 0.7,
      "description": "Security-conscious but with urgency"
    }
  }
}
```

## Troubleshooting

### Persona Not Activating
1. Check if backend is running: `curl http://localhost:8000/health`
2. Verify persona exists: `./scripts/claude-personas.sh list`
3. Check logs: `./dev.sh logs backend`

### Unexpected Behavior
1. Check active persona: `./scripts/claude-personas.sh active`
2. Reset to default: `./scripts/claude-personas.sh activate sage_staff_engineer`
3. Verify config syntax: `jq . config/personas.json`

## Next Steps

- [ ] Add persona persistence across sessions
- [ ] Implement persona learning (adjust based on feedback)
- [ ] Create persona templates for common engineering roles
- [ ] Add voice/personality synthesis for agent interactions
- [ ] Integrate with Claude Code CLAUDE.md for session-specific persona rules