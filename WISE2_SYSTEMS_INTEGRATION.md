# WISE² Complete Systems Integration Guide

## Overview

WISE² Enterprise now includes three integrated systems enabling semantic knowledge management and cross-device synchronization:

1. **Knowledge Graph Service** (`services/knowledge-graph`) - Semantic relationships and entity management
2. **Sync Engine** (`packages/sync-engine`) - CRDT-based cross-device synchronization  
3. **Memory Engine** (`services/memory-engine`) - Unified memory across devices

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Application Layer                         │
│              (Dashboards, APIs, Automations)                │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                   Memory Engine                              │
│  (Unified Memory + Cross-Device Sync Orchestration)         │
│  - User preferences, session state, cache                   │
│  - Automatic TTL management                                 │
│  - Offline buffering & automatic flush                      │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    Sync Engine (CRDT)                        │
│  (Vector Clocks + Conflict Resolution)                      │
│  - Change tracking with causality                           │
│  - Automatic conflict detection & resolution                │
│  - Offline support with retry logic                         │
│  - Network protocol abstraction                             │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                Knowledge Graph Service                       │
│  (Entities + Relationships + Reasoning)                     │
│  - 12 entity types (Person, Project, Service, etc.)        │
│  - 15+ relationship types                                   │
│  - Semantic search & path finding                           │
│  - Inference & recommendations                              │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│         Persistence Layer (PostgreSQL + Redis)              │
│  - Persistent entity/relationship storage                   │
│  - Cache layer for frequently accessed data                 │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. Local Change → Global Sync

```typescript
// User makes change on Device A
const change = memory.set('user:preferences', { theme: 'dark' });

// Sync Engine tracks with vector clock
const syncChange = syncManager.createChange(entityId, ChangeType.Update, data);

// Memory Engine queues for sync
memorySync.performSync();

// Sync Protocol sends to other devices
protocol.broadcast(message);

// Devices apply with conflict resolution
await device2Sync.applySyncMessage(message);
await device2Memory.set(...); // Apply to remote cache
```

### 2. Offline Operation

```
┌─────────────────────┐
│ Device Goes Offline │
└──────────┬──────────┘
           ↓
┌─────────────────────────────────────────┐
│ Changes Buffer in Offline Queue         │
│ - Vector clock still increments         │
│ - Timestamps recorded locally           │
└──────────┬──────────────────────────────┘
           ↓
┌─────────────────────────────────────────┐
│ Device Comes Online                     │
│ - Offline buffer flushed                │
│ - Sync protocol retries queued messages │
└──────────┬──────────────────────────────┘
           ↓
┌─────────────────────────────────────────┐
│ Changes Replicated to All Devices       │
│ - Conflict resolution applied           │
│ - Consistent state achieved             │
└─────────────────────────────────────────┘
```

### 3. Conflict Resolution

```
Device A: memory.set('counter', 5)  @ 10:00:00 (VT: {A:1, B:0})
Device B: memory.set('counter', 7)  @ 10:00:01 (VT: {A:0, B:1})

// Concurrent changes detected
VectorClockManager.concurrent(clockA, clockB) === true

// Conflict resolver applies LWW strategy
// 10:00:01 > 10:00:00, so Device B's value wins
// All devices eventually converge to value: 7
```

## Integration Points

### 1. Knowledge Graph + Memory Engine

```typescript
// Store entity in knowledge graph
const person = new Person('Alice', { email: 'alice@example.com' });
graph.addEntity(person);

// Sync entity to memory cache for quick access
await memory.set(`entity:person:${person.id}`, person.toJSON(), 'entities');

// When entity changes in graph, update memory cache
graph.onChange((entity) => {
  memory.set(`entity:${entity.type}:${entity.id}`, entity.toJSON());
});
```

### 2. Relationship Queries + Sync

```typescript
// Query relationships across devices
const projects = await queryEngine.findProjectsOwnedBy(personId);

// Results cached locally for performance
await memory.set(`query:projects:owned:${personId}`, projects, 'queries', 300); // 5-min TTL

// When relationship changes, invalidate cache
syncManager.onChange((change) => {
  if (change.type === ChangeType.Update && isRelationship(change)) {
    memory.delete(`query:projects:owned:*`);
  }
});
```

### 3. Semantic Search Caching

```typescript
// Semantic search with cache
let results = await memory.get(`search:${query}`, 'search-cache');

if (!results) {
  // Cache miss - perform search
  results = await semanticSearch.search(query, 10);
  
  // Cache results for 10 minutes
  await memory.set(`search:${query}`, results, 'search-cache', 600);
}
```

### 4. Reasoning Recommendations

```typescript
// Get recommendations (expensive operation)
let recs = await memory.get(`recommendations:${personId}`, 'recommendations');

if (!recs) {
  // Cache miss - perform reasoning
  recs = await graphReasoning.inferRelationships(personId);
  
  // Cache for 1 hour
  await memory.set(
    `recommendations:${personId}`, 
    recs, 
    'recommendations', 
    3600
  );
}
```

## Deployment Topology

### Cloud Deployment
```
┌─────────────────────┐
│  API Gateway        │
└──────────┬──────────┘
           ↓
┌──────────────────────────────────────────────┐
│  Cloud Server (Primary)                      │
│  - Knowledge Graph Service                   │
│  - Memory Engine                             │
│  - Sync Engine                               │
│  - PostgreSQL (authoritative)                │
│  - Redis (hot cache)                         │
└──────────┬───────────────────────────────────┘
           ↓
    Network Bridge
    ↙         ↘
   ↙           ↘
┌──────────────┐  ┌──────────────┐
│  VPS Server  │  │ Raspberry Pi  │
├──────────────┤  ├──────────────┤
│ Memory Cache │  │ Edge Cache   │
│ Sync Engine  │  │ Sync Engine  │
└──────────────┘  └──────────────┘
```

### Device Connectivity

```
Cloud (Primary)
  ↓ HTTPS + Retry logic
VPS (Secondary Cache)
  ↓ WebSocket + exponential backoff
Raspberry Pi (Edge)
  ↓ HTTP Poll
Desktop / Mobile
  ↓ WebSocket + offline buffer
Local Network (P2P when available)
```

## Cross-Device Sync Strategies

### Strategy 1: Cloud-First (Default)
- Cloud is source of truth
- All devices sync through cloud
- Cloud resolves conflicts
- Works well with LWW (Last Write Wins)

### Strategy 2: Local-First
- Each device maintains local state
- Devices sync P2P when on same network
- Cloud is backup only
- Works well with Merge strategy

### Strategy 3: Hybrid
- Critical data (user settings) cloud-first
- Ephemeral data (cache) local-first
- Device-specific partitions

## Configuration Guide

### Environment Variables

```bash
# Knowledge Graph Service
GRAPH_PORT=3005
GRAPH_CACHE_TTL=3600
GRAPH_MAX_DEPTH=5
GRAPH_BATCH_SIZE=100

# Memory Engine
MEMORY_SYNC_INTERVAL=30000
MEMORY_CACHE_TTL=3600
MEMORY_DEVICE_TYPE=desktop  # or: cloud, vps, raspberry-pi, mobile, web

# Sync Engine
SYNC_STRATEGY=last_write    # or: first_write, merge, priority, manual
SYNC_RETRY_MAX=3
SYNC_RETRY_DELAY=1000
SYNC_COMPRESSION=true

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=wise2
DB_PASSWORD=...
DB_NAME=wise2_production

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=...
```

### Device Registration

```typescript
// Register current device
const deviceInfo: DeviceInfo = {
  id: 'device-1' as DeviceId,
  name: 'MacBook Pro',
  type: 'desktop',
  lastSeen: new Date(),
  status: SyncStatus.Online,
  vectorClock: { 'device-1': 0 }
};

syncManager.registerDevice(deviceInfo);

// Set device-specific memory limits
memory.createPartition('cache', 512 * 1024 * 1024); // 512MB for desktop
// vs
memory.createPartition('cache', 64 * 1024 * 1024);  // 64MB for Raspberry Pi
```

## Performance Tuning

### For Cloud Server
```typescript
// Large cache, aggressive compression
const graph = new GraphDB(7200);  // 2-hour cache
syncProtocol.setCompressionEnabled(true);
memory.createPartition('cache', 2 * 1024 * 1024 * 1024); // 2GB
```

### For Edge Device (Raspberry Pi)
```typescript
// Small cache, frequent sync
const graph = new GraphDB(600);  // 10-min cache
syncProtocol.setCompressionEnabled(true);
memory.createPartition('cache', 64 * 1024 * 1024); // 64MB
memorySync.scheduleSync('frequent', { 
  interval: 15000,  // 15 seconds
  priority: 'high' 
});
```

### For Mobile Device
```typescript
// Minimal cache, selective sync
const graph = new GraphDB(300);  // 5-min cache
memory.createPartition('cache', 32 * 1024 * 1024); // 32MB
memorySync.scheduleSync('mobile', {
  interval: 60000,  // 1 minute
  priority: 'normal'
});
```

## Monitoring & Debugging

### Health Checks

```typescript
// Knowledge Graph health
const graphStats = graph.getStats();
console.log(`Entities: ${graphStats.entityCount}, Relationships: ${graphStats.relationshipCount}`);

// Sync health
const syncState = syncManager.getSyncState();
console.log(`Devices: ${syncState.devices}, Conflicts: ${syncState.conflicts}`);

// Memory health
const memStats = memory.getStats();
console.log(`Memory entries: ${memStats.localEntries + memStats.remoteEntries}`);
```

### Conflict Logs

```typescript
// View conflicts
const conflicts = syncManager.getConflictLog('entity-123' as EntityId);
for (const conflict of conflicts) {
  console.log(`Conflict on ${conflict.timestamp}:`);
  console.log(`  Resolution: ${conflict.resolution}`);
  console.log(`  Resolved to: ${JSON.stringify(conflict.resolvedValue)}`);
}
```

### Network Diagnostics

```typescript
// Check device status
const status = syncProtocol.getAllTransportStatus();
for (const [deviceId, state] of Object.entries(status)) {
  console.log(`${deviceId}: ${state}`);
}

// Estimate bandwidth
const bandwidth = SyncProtocol.estimateBandwidth(messages, 1000);
console.log(`Bandwidth: ${bandwidth} bytes/sec`);
```

## Best Practices

### 1. Entity Lifecycle

```typescript
// Create entity in graph
const entity = new Person('Alice', { email: 'alice@example.com' });
graph.addEntity(entity);

// Queue for sync
const change = syncManager.createChange(entity.id as EntityId, ChangeType.Create, entity.toJSON());

// Cache in memory
await memory.set(`entity:${entity.id}`, entity.toJSON(), 'entities');

// Sync to other devices
await memorySync.performSync();
```

### 2. Relationship Management

```typescript
// Create relationship
const rel = new Relationship(personId, projectId, RelationType.WorksOn);
graph.addRelationship(rel);

// Invalidate related queries
await memory.delete(`query:projects:owned:${personId}`);
await memory.delete(`query:people:on:${projectId}`);

// Sync change
syncManager.createChange(rel.id as EntityId, ChangeType.Create, rel.toJSON());
```

### 3. Cache Invalidation

```typescript
// TTL-based (automatic)
await memory.set('cache:expensive-query', result, 'cache', 300); // 5 min

// Event-based
graph.onChange((entity) => {
  // Invalidate related caches
  memory.delete(`query:*:${entity.id}`);
  memory.delete(`recommendations:*`);
});

// Manual
await memory.clearPartition('cache');
```

### 4. Conflict Resolution

```typescript
// For user-facing data, use FirstWrite
syncManager = createSyncManager(deviceId, ConflictResolutionStrategy.FirstWrite);

// For system data, use LastWrite
syncManager = createSyncManager(deviceId, ConflictResolutionStrategy.LastWrite);

// For complex data, use Merge
syncManager = createSyncManager(deviceId, ConflictResolutionStrategy.Merge);
```

## Troubleshooting

### Issue: Conflicts Keep Increasing

**Symptom**: `syncState.conflicts` grows over time

**Cause**: Multiple devices making concurrent changes

**Solution**:
1. Switch to `FirstWrite` strategy to deterministically pick earliest
2. Or implement device-priority resolution
3. Or batch writes on primary device

### Issue: Memory Growing Unbounded

**Symptom**: Memory usage increases until OOM

**Cause**: TTL not set, cache not clearing

**Solution**:
1. Set TTL on all partition creations
2. Implement cache invalidation on updates
3. Monitor with `memory.getStats()`

### Issue: Sync Never Completes

**Symptom**: `pendingChanges` never reaches zero

**Cause**: Network issue or receiver not applying

**Solution**:
1. Check `protocol.getTransportStatus()`
2. Check conflict log for blocked changes
3. Verify receiver sync is running

## References

- **Knowledge Graph**: `services/knowledge-graph/README.md`
- **Sync Engine**: `packages/sync-engine/README.md`
- **Memory Engine**: `services/memory-engine/README.md`
- **CRDT Paper**: "A comprehensive study of CRDT" (https://arxiv.org/abs/1805.06358)
- **Vector Clocks**: Lamport timestamps and vector clocks for causality

## Support & Contribution

For issues, questions, or contributions:
1. Check troubleshooting guide above
2. Review relevant README files
3. Check git logs for similar issues
4. Submit issue with reproduction steps

---

**Last Updated**: 2026-07-21  
**Status**: Production Ready  
**Version**: 1.0.0
