# Knowledge Graph Service

Semantic relationships and entity management for WISE² - a comprehensive graph database service for managing interconnected entities, relationships, and intelligent reasoning.

## Features

### Core Capabilities
- **12 Entity Types**: Person, Organization, Project, Repository, Service, Server, Document, Meeting, Task, Deployment, Prompt, Automation
- **15+ Relationship Types**: owns, manages, works_on, depends_on, deploys_to, runs_on, related_to, mentions, assigned_to, scheduled_for, triggers, and more
- **Graph Database**: In-memory graph with persistence support
- **Vector Clocking**: Causality tracking for distributed operations
- **Caching**: Intelligent caching with TTL support

### Query Capabilities
- **Semantic Search**: Vector-based similarity search
- **Path Finding**: BFS-based path discovery between entities
- **Relationship Queries**: Find all entities with specific relationship types
- **Filtering**: Advanced filtering with multiple operators (eq, ne, lt, gt, contains, in)
- **Full-Text Search**: Text-based entity search with ranking

### Reasoning & Inference
- **Transitive Inference**: Infer relationships through chains (A->B->C)
- **Bottleneck Detection**: Find highly connected entities that could be bottlenecks
- **Importance Ranking**: PageRank-like algorithm for entity importance
- **Conflict Detection**: Identify disconnected entities
- **Collaboration Recommendations**: Suggest entities for group collaboration

### Synchronization
- **Vault Sync**: Synchronize with Second Brain vault
- **Change Tracking**: Queue-based change management
- **Checkpoints**: Periodic sync checkpoints for recovery
- **Pull/Push**: Bidirectional sync with vault

## Installation

```bash
npm install @wise2/knowledge-graph
```

## Usage

### Basic Setup

```typescript
import { createGraphDB, GraphDB } from '@wise2/knowledge-graph';
import { GraphQuery } from '@wise2/knowledge-graph';
import { SemanticSearch } from '@wise2/knowledge-graph';
import { GraphReasoning } from '@wise2/knowledge-graph';

// Create graph
const graph = new GraphDB(3600); // 1 hour cache TTL

// Create query engine
const queryEngine = new GraphQuery(graph);

// Create search engine
const search = new SemanticSearch(graph, 1536);

// Create reasoning engine
const reasoning = new GraphReasoning(graph);
```

### Creating Entities

```typescript
import { Person, Organization, Project } from '@wise2/knowledge-graph';

// Create person entity
const person = new Person('Alice Johnson', {
  email: 'alice@example.com',
  role: 'engineer',
  department: 'Platform'
});

graph.addEntity(person);

// Create organization
const org = new Organization('WISE²', {
  industry: 'AI/ML',
  size: 'startup',
  employees: 50
});

graph.addEntity(org);

// Create project
const project = new Project('Knowledge Graph', {
  status: 'active',
  priority: 'high',
  budget: 100000
});

graph.addEntity(project);
```

### Creating Relationships

```typescript
import { Relationship, RelationType } from '@wise2/knowledge-graph';

// Person manages person
const manages = new Relationship(person.id, otherPerson.id, RelationType.Manages);
graph.addRelationship(manages);

// Person works on project
const worksOn = new Relationship(person.id, project.id, RelationType.WorksOn);
graph.addRelationship(worksOn);

// Organization owns project
const owns = new Relationship(org.id, project.id, RelationType.Owns);
graph.addRelationship(owns);

// Service depends on service
const dependsOn = new Relationship(service1.id, service2.id, RelationType.DependsOn);
graph.addRelationship(dependsOn);
```

### Querying

```typescript
// Find all projects owned by a person
const projects = await queryEngine.findProjectsOwnedBy(personId);

// Find all services dependent on a service
const dependents = await queryEngine.findDependentServices(serviceId);

// Find all entities mentioning something
const mentions = await queryEngine.findMentions(targetId);

// Generic filtering
const results = await queryEngine.query(
  [{ type: EntityType.Task, attribute: 'status', operator: 'eq', value: 'open' }],
  { limit: 10, offset: 0, sort: [{ field: 'priority', direction: 'desc' }] }
);
```

### Semantic Search

```typescript
// Search by similarity
const results = await search.search('AI platform development', 10);

// Full-text search
const ftResults = await search.fullTextSearch('knowledge graph', 20);

// Find similar entities
const similar = await search.findSimilar(entityId, 5);
```

### Reasoning & Inference

```typescript
// Infer relationships
const recommendations = await reasoning.inferRelationships(personId);

// Find bottlenecks
const bottlenecks = await reasoning.findBottlenecks();

// Rank by importance
const ranked = await reasoning.rankEntitiesByImportance(10);

// Find orphaned entities
const orphaned = await reasoning.findOrphanedEntities();

// Recommend for group
const forGroup = await reasoning.recommendForGroup([person1Id, person2Id]);
```

### Path Finding

```typescript
// Find paths between entities
const paths = graph.findPaths(sourceId, targetId, 5);

// Get connected entities
const connected = graph.getConnectedEntities(entityId, true); // true for outgoing
```

### Synchronization

```typescript
import { GraphSync } from '@wise2/knowledge-graph';

const sync = new GraphSync(graph, '~/.second_brain');

// Sync with vault
const syncResult = await sync.syncWithVault();

// Pull from vault
const pullResult = await sync.pullFromVault();

// Full sync
const fullResult = await sync.fullSync();

// Get status
const status = sync.getSyncStatus();
```

## API Endpoints

### Entities
- `POST /api/graph/entities` - Create entity
- `GET /api/graph/entities/:id` - Get entity
- `PATCH /api/graph/entities/:id` - Update entity
- `DELETE /api/graph/entities/:id` - Delete entity
- `GET /api/graph/entities-by-type/:type` - Get entities by type

### Relationships
- `POST /api/graph/relationships` - Create relationship
- `GET /api/graph/relationships/:id` - Get relationship
- `DELETE /api/graph/relationships/:id` - Delete relationship

### Querying
- `GET /api/graph/query` - Generic query
- `GET /api/graph/entities/:id/connected` - Get connected entities
- `GET /api/graph/paths/:sourceId/:targetId` - Find paths

### Search
- `GET /api/graph/search?q=...` - Semantic search

### Reasoning
- `GET /api/graph/infer/:entityId` - Infer relationships
- `GET /api/graph/analyze/bottlenecks` - Find bottlenecks
- `GET /api/graph/rank` - Rank entities

### Sync
- `POST /api/sync` - Sync with vault
- `POST /api/pull` - Pull from vault
- `POST /api/full-sync` - Full sync
- `GET /api/sync-status` - Get sync status

## Performance Considerations

- In-memory graph suitable for up to 100K entities
- For larger datasets, integrate with PostgreSQL + graph extensions
- Semantic search uses simple embeddings; integrate with OpenAI/Cohere for production
- Cache TTL configurable per deployment
- Relationship traversal depth configurable (default: 5 levels)

## Architecture

```
GraphDB (Core)
├── Entities (12 types)
├── Relationships (15+ types)
├── Indexing (Type, Relationship, Adjacency)
└── Caching

GraphQuery (Queries)
├── Type filtering
├── Attribute filtering
├── Sorting & Pagination
└── Path finding

SemanticSearch (Search)
├── Vector embeddings
├── Cosine similarity
├── Full-text search
└── Similarity ranking

GraphReasoning (Inference)
├── Transitive inference
├── Bottleneck detection
├── PageRank importance
└── Recommendations

GraphSync (Persistence)
├── Change tracking
├── Vault sync
├── Checkpoints
└── Recovery
```

## Testing

```bash
npm run test
npm run test:watch
npm run test:cov
```

## Development

```bash
npm run dev      # Start with hot reload
npm run build    # Build TypeScript
npm run lint     # Lint code
npm run format   # Format code
```

## License

MIT
