# PromptOS: Modular Prompt System & Agent Framework
## WISE² Agentic OS Kernel

PromptOS is a production-grade system for building, composing, and managing AI agent prompts across 16+ specialized agents. It enables:

- **Modular prompt composition** (base → modules → specialized agent)
- **Type-safe agent framework** (TypeScript, strict mode)
- **Agent orchestration** (routing, delegation, handoff)
- **Persistent memory & decision logging** (knowledge graph integration)
- **Cross-device sync** (edge devices, mobile, web)

---

## Directory Structure

```
promptos/
├── core/
│   ├── base-system-prompt.md      # Foundation layer (all agents inherit)
│   ├── types.ts                   # Type definitions
│   ├── prompt-registry.ts         # Load/cache prompts from filesystem
│   ├── module-system.ts           # Module inheritance engine
│   └── composition.ts             # Compose prompts from modules
│
├── modules/
│   ├── reasoning.md               # Decision-making framework
│   ├── tool-use.md                # How to use tools properly
│   ├── memory.md                  # Context management & persistence
│   ├── error-handling.md          # Failure recovery & resilience
│   └── integration.md             # System integration patterns
│
├── agents/                        # 16 specialized agent prompts
│   ├── executive.md               # Business reasoning, coordination
│   ├── developer.md               # Code, architecture, testing
│   ├── infrastructure.md          # Servers, networking, DevOps
│   ├── deployment.md              # CI/CD, releases, rollbacks
│   ├── raspberry-pi.md            # Edge devices, automation
│   ├── discord.md                 # Communication, notifications
│   ├── marketing.md               # Campaigns, content, messaging
│   ├── sales.md                   # Deals, customers, pipeline
│   ├── crm.md                     # Relationships, accounts
│   ├── finance.md                 # Budgets, forecasts, tracking
│   ├── research.md                # Analysis, data, competitive
│   ├── documentation.md           # Knowledge base, guides
│   ├── voice.md                   # Natural language, speech
│   ├── vision.md                  # Image analysis, visual tasks
│   ├── security.md                # Compliance, vulnerabilities
│   ├── qa.md                      # Testing, quality gates
│   └── automation.md              # Workflows, triggers, jobs
│
└── README.md                      # This file
```

---

## How PromptOS Works

### 1. Core Layer (Base System Prompt)
All agents start with `base-system-prompt.md`, which defines:
- Core principles (directness, business value, documentation)
- Context layers (request, user memory, business, technical, agent)
- Response format (Summary → Action → Result → Integration)
- Tool usage patterns
- Integration with WISE² services (knowledge graph, memory, discord, etc.)

### 2. Shared Modules
Agents inherit from shared modules based on their needs:
- **reasoning.md** — Decision-making framework (all agents that decide)
- **tool-use.md** — Safe tool execution patterns (developers, infrastructure)
- **memory.md** — Context management across sessions (all agents)
- **error-handling.md** — Graceful failure recovery (all agents)
- **integration.md** — Integration with WISE² services (all agents)

### 3. Specialized Agent Prompts
Each agent loads:
- Base system prompt
- Relevant modules (e.g., developer loads reasoning + tool-use + error-handling)
- Agent-specific prompt (e.g., developer.md)

Result: A complete, type-safe prompt optimized for that agent's role.

### 4. Prompt Composition
The `composition.ts` engine:
1. Loads base prompt
2. Loads and validates modules
3. Loads agent prompt
4. Combines all layers into one coherent prompt
5. Returns composition with metadata (tokens, sections, modules loaded)

---

## TypeScript Architecture

### Agent Framework (`packages/agent-framework/`)

**BaseAgent** — Abstract base class for all agents
- Conversation history management
- Tool execution coordination
- State management
- Memory persistence

**AgentRegistry** — Manage agent lifecycle
- Register/unregister agents
- Track active agents
- Get agent configuration

**AgentContext** — Shared execution context
- User ID, session ID, workspace
- User preferences and memory
- Business context passing

**AgentRouter** — Intent-based routing
- Keyword matching for each agent
- Score requests against all agents
- Select best agent (or suggest alternatives)

**AgentMemory** — Per-agent persistent state
- Tool execution history
- Checkpoints for recovery
- State snapshots

**AgentTools** — Tool registration & execution
- Register tool executors
- Execute tools safely
- Handle errors gracefully

### Executive Agent Service (`services/executive-agent/`)

**ExecutiveAgent** — COO of WISE²
- Strategic decision-making
- Goal decomposition
- Cross-agent orchestration
- Team coordination

**BusinessLogic** — Strategic reasoning
- Analyze requests
- Generate options
- Evaluate trade-offs
- Make decisions

**GoalPlanning** — Break down goals
- Decompose ambitious goals into agent tasks
- Estimate timelines
- Create execution plans

**AgentSelector** — Choose specialists
- Match goals to agents
- Estimate resource needs
- Coordinate assignments

**ExecutiveMemory** — Business context
- Team status
- Active projects
- Decisions log
- Strategic priorities

---

## Usage Examples

### 1. Compose a Prompt

```typescript
import { PromptRegistry } from './promptos/core/prompt-registry.js';
import { ModuleSystem } from './promptos/core/module-system.js';
import { PromptComposer } from './promptos/core/composition.js';

const registry = new PromptRegistry('./promptos');
const moduleSystem = new ModuleSystem(registry);
const composer = new PromptComposer(registry, moduleSystem);

// Compose prompt for developer agent
const composition = await composer.composePrompt('developer');

console.log(composition.fullPrompt);        // Complete prompt
console.log(composition.agent.id);          // 'developer'
console.log(composition.modules.length);    // How many modules loaded
console.log(composition.composed);          // Timestamp

// Get statistics
const stats = composer.getPromptStats(composition);
console.log(`${stats.totalTokens} tokens, ${stats.totalWords} words`);
```

### 2. Use an Agent

```typescript
import { ExecutiveAgent } from './services/executive-agent/src/ExecutiveAgent.js';

const executive = new ExecutiveAgent({
  id: 'executive',
  name: 'Executive Agent',
  promptPath: './promptos/agents/executive.md',
  tools: ['read', 'write', 'bash', 'git']
});

await executive.initialize();

// Process a request
const response = await executive.process('Should we build PromptOS or buy an alternative?');

console.log(response.content);  // Strategic analysis + recommendation
```

### 3. Route a Request

```typescript
import { AgentRegistry } from './packages/agent-framework/src/AgentRegistry.js';
import { AgentRouter } from './packages/agent-framework/src/AgentRouter.js';

const registry = new AgentRegistry();
const router = new AgentRouter(registry);

// Route to best agent
const agentId = router.route('Build a new feature for the dashboard');
console.log(agentId);  // 'developer'

// Get top 3 options
const options = router.routeTop('Deploy to production', 3);
options.forEach(o => console.log(`${o.agent}: score ${o.score}`));
// infrastructure: 2
// deployment: 3
// developer: 1
```

---

## Adding a New Agent

To add a new agent to the system:

### 1. Create the Agent Prompt

Create `promptos/agents/my-agent.md`:

```markdown
# PromptOS Agent: My Agent
## Role & Specialization

**Role**: What does this agent do?

**Specialization**: Deep expertise

---

## Inherited Modules
- PromptOS Core System
- Modules this agent needs (reasoning/modules/reasoning.md)

---

## Capabilities

### 1. Capability 1
- Details

### 2. Capability 2
- Details

---

**Load this agent when ...**
```

### 2. Update Agent Routing

Add keywords to `AgentRouter`:

```typescript
this.keywordMap.set('my-agent', [
  'keyword1', 'keyword2', 'keyword3'
]);
```

### 3. Implement Agent Logic

Extend `BaseAgent`:

```typescript
export class MyAgent extends BaseAgent {
  protected async generateResponse(message: string): Promise<AgentResponse> {
    // Your logic here
    return {
      content: 'Response',
      tokens: undefined
    };
  }
}
```

### 4. Register Agent

```typescript
const registry = new AgentRegistry();
registry.register({
  id: 'my-agent',
  name: 'My Agent',
  promptPath: './promptos/agents/my-agent.md',
  tools: ['read', 'write']  // What tools can this agent use?
});
```

---

## Integration with WISE² Services

PromptOS agents integrate seamlessly with WISE² infrastructure:

### Knowledge Graph
Query and update entity relationships:
```typescript
const projects = await kg.query({
  type: 'project',
  related_to: 'customer:acme'
});
```

### Memory Engine
Store user preferences and business context:
```typescript
const context = await memory.get('project:promptos', {
  scope: 'context',
  keys: ['phase', 'budget', 'team']
});
```

### Discord Bot
Notifications and team coordination:
```typescript
await discord.send({
  channel: '#engineering',
  message: '✅ PromptOS complete'
});
```

### Second Brain
Knowledge base and decision logs:
```typescript
await secondBrain.store({
  type: 'decision',
  title: 'File-based prompt registry',
  content: '...',
  tags: ['architecture', 'promptos']
});
```

---

## Deployment

### Development

```bash
cd promptos

# Build TypeScript
npm run build

# Watch for changes
npm run dev

# Run tests
npm run test
```

### Production

PromptOS is deployed as:
1. **Prompt files** — Checked into git (`promptos/`), versioned
2. **TypeScript packages** — Published to npm
   - `@wise2/agent-framework` (packages/agent-framework)
   - `@wise2/executive-agent` (services/executive-agent)
3. **Runtime** — Claude API (via API calls with composed prompts)

---

## Performance & Optimization

### Prompt Caching
- Registries cache loaded modules
- Compiled prompts cached by agent ID
- Clear cache on prompt update: `registry.clearCache('module-id')`

### Token Budget
Average composed prompt sizes:
- Base prompt: ~500 tokens
- Each module: 200-400 tokens
- Agent prompt: 300-500 tokens
- **Total per agent: ~1,500-2,000 tokens**

Monitor via:
```typescript
const stats = composer.getPromptStats(composition);
console.log(`Total tokens: ${stats.totalTokens}`);
```

### Scalability
- Supports 16+ specialized agents (currently)
- Add more agents by creating new prompt file + registering
- Module system scales horizontally (add modules without breaking existing)

---

## Testing

Test prompt composition:

```bash
npm test
```

Test agent routing:

```typescript
import { test } from 'vitest';

test('route to developer for code tasks', () => {
  const router = new AgentRouter(registry);
  const agent = router.route('Build a new API endpoint');
  expect(agent).toBe('developer');
});
```

---

## Troubleshooting

### Prompt not found
- Check path: `promptos/agents/<agent-id>.md`
- Ensure file exists and is readable

### Circular module dependencies
- Check `## Inherited Modules` section
- Ensure modules don't reference each other

### Token budget exceeded
- Reduce module inheritance
- Simplify agent prompts
- Use prompt compression

---

## Contributing

When updating prompts or adding features:

1. **Maintain CLAUDE.md** — Update instructions if routing changes
2. **Document decisions** — Log in `data/decisions/`
3. **Version prompts** — Commit to git with meaningful message
4. **Test routing** — Verify agents route correctly
5. **Update README** — Keep documentation current

---

## License

WISE² Internal Use Only

---

**PromptOS enables teams to build sophisticated multi-agent systems that are maintainable, scalable, and type-safe.**
