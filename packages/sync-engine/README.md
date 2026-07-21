# Sync Engine - Cross-Device Synchronization

CRDT-based synchronization engine for seamless experience across cloud, VPS, Raspberry Pi, and personal devices. Implements Conflict-free Replicated Data Types with vector clocks, tombstones, and intelligent conflict resolution.

## Features

### Core Capabilities
- **CRDT Implementation**: Conflict-free replicated data types
- **Vector Clocks**: Causality tracking for distributed operations
- **Tombstones**: Efficient deletion marking
- **Conflict Resolution**: Multiple strategies (LWW, FWW, Merge, Priority-based)
- **Offline Support**: Full offline operation with automatic sync on reconnection

### Synchronization
- **Bidirectional Sync**: Push and pull changes
- **Partial Sync**: Sync specific data partitions
- **Batch Sync**: Efficient batch operations
- **Compression**: Optional message compression
- **Bandwidth Optimization**: Estimated bandwidth calculation

### Network
- **Retry Logic**: Exponential backoff with configurable limits
- **Message Queuing**: Queue messages for offline devices
- **Transport Abstraction**: Pluggable transport layer
- **Broadcast**: Send to all or selective devices

### Conflict Resolution Strategies
1. **Last Write Wins (LWW)**: Most recent write takes precedence
2. **First Write Wins (FWW)**: Earliest write takes precedence
3. **Merge**: Combine values for arrays/objects
4. **Priority-based**: Device type determines priority
5. **Manual**: Let application handle resolution

## Installation

```bash
npm install @wise2/sync-engine
```

## Usage

### Basic Setup

```typescript
import { createSyncManager, createSyncSystem, DeviceId } from '@wise2/sync-engine';
import { ChangeType, ConflictResolutionStrategy } from '@wise2/sync-engine';

// Create sync manager
const deviceId = 'device-1' as DeviceId;
const manager = createSyncManager(deviceId, ConflictResolutionStrategy.LastWrite);

// Or create full system
const system = createSyncSystem('device-1');
const { manager, resolver, protocol, vectorClock } = system;
```

### Creating Changes

```typescript
// Create a change
const change = manager.createChange(
  'entity-123' as EntityId,
  ChangeType.Update,
  { name: 'Alice', email: 'alice@example.com' }
);

// Create delete change
const deleteChange = manager.createChange(
  'entity-456' as EntityId,
  ChangeType.Delete,
  undefined
);
```

### Synchronization

```typescript
// Get pending changes
const pending = manager.getPendingChanges();

// Create sync message for another device
const message = manager.createSyncMessage('device-2' as DeviceId, true);

// Apply sync message
const result = await manager.applySyncMessage(incomingMessage);
console.log(`Applied: ${result.applied}, Conflicts: ${result.conflicts}`);

// Get current state of entity
const state = manager.getEntityState('entity-123' as EntityId);
```

### Offline Support

```typescript
// Buffer change when offline
manager.bufferOffline(change);

// Get offline buffer
const buffered = manager.getOfflineBuffer();

// Flush buffer when coming online
const flushed = await manager.flushOfflineBuffer();
console.log(`Flushed ${flushed} changes`);
```

### Conflict Handling

```typescript
// Get conflicts for an entity
const conflicts = manager.getConflictLog('entity-123' as EntityId);

// Each conflict has:
// - conflictingChanges: array of conflicting changes
// - resolution: how it was resolved
// - resolvedValue: the merged value
// - timestamp: when conflict was detected
```

### Network Protocol

```typescript
import { SyncProtocol, SyncTransport } from '@wise2/sync-engine';

const protocol = new SyncProtocol();

// Implement transport
class HttpTransport implements SyncTransport {
  async send(message: SyncMessage) {
    // Send via HTTP
  }

  async receive() {
    // Receive via HTTP
  }

  async disconnect() {
    // Cleanup
  }

  getStatus() {
    return SyncStatus.Online;
  }
}

// Register transport
const transport = new HttpTransport();
protocol.registerTransport('device-2' as DeviceId, transport);

// Send with retry
await protocol.sendWithRetry('device-2' as DeviceId, message);

// Broadcast to all
const { successful, failed } = await protocol.broadcast(message);

// Sync to specific devices
const results = await protocol.syncTo(['device-2', 'device-3'] as DeviceId[], message);
```

### Vector Clocks

```typescript
import { VectorClockManager } from '@wise2/sync-engine';

const vcm = new VectorClockManager('device-1' as DeviceId);

// Increment on local change
const updated = vcm.increment();

// Update with received clock
const merged = vcm.update(remoteVectorClock);

// Check ordering
if (VectorClockManager.happenedBefore(clock1, clock2)) {
  console.log('Clock1 happened before clock2');
}

// Check concurrency
if (VectorClockManager.concurrent(clock1, clock2)) {
  console.log('Clocks are concurrent (conflict)');
}
```

### Conflict Resolution

```typescript
import { ConflictResolver, ConflictResolutionStrategy } from '@wise2/sync-engine';

// Create resolver with strategy
const resolver = new ConflictResolver(ConflictResolutionStrategy.Merge);

// Resolve conflicts
const resolution = resolver.resolve([change1, change2, change3], 'entity-123' as EntityId);

// Apply tombstone for deletion
const tombstoned = ConflictResolver.applyTombstone(change);

// Check if change is tombstone
if (ConflictResolver.isTombstone(change)) {
  // This is a deletion marker
}

// Compact changes (remove obsolete ones)
const compacted = ConflictResolver.compact(allChanges);
```

### Change Callbacks

```typescript
// Register callback for changes
manager.onchange((change: Change) => {
  console.log(`Change: ${change.entityId} - ${change.type}`);
  // Update UI or trigger other actions
});
```

### Sync Status

```typescript
const status = manager.getSyncState();
console.log({
  devices: status.devices,
  totalChanges: status.totalChanges,
  queuedChanges: status.queuedChanges,
  offlineChanges: status.offlineChanges,
  conflicts: status.conflicts
});
```

## Architecture

### Vector Clock System
- Tracks causal ordering of events
- Enables detection of concurrent changes
- Basis for CRDT implementation
- Hash-based for efficient comparison

### CRDT Algorithm
```
Change {
  id: unique change ID
  deviceId: originating device
  entityId: affected entity
  type: create|update|delete
  timestamp: wall-clock time
  vectorClock: causal history
  data: the change payload
  tombstone: deletion marker
}
```

### Conflict Resolution Flow
1. Receive change from remote device
2. Check for conflicts with local changes
3. Apply resolution strategy:
   - LWW: Compare timestamps and device ID
   - FWW: Take earliest change
   - Merge: Combine object/array values
   - Priority: Use device type priority
   - Manual: Let app decide
4. Record conflict in log
5. Apply resolved value

### Offline Support
```
Online Mode:
  Local Change -> Sync Queue -> Protocol -> Remote Device

Offline Mode:
  Local Change -> Offline Buffer (on disk)
  
Back Online:
  Offline Buffer -> Sync Queue -> Protocol -> Remote Device
```

## Performance

- Vector clocks: O(n) where n = number of devices
- Conflict detection: O(m) where m = number of changes
- Change application: O(1) amortized
- Memory overhead: ~500 bytes per change
- Compression: ~30-50% reduction

## Testing Scenarios

### Test 1: Offline Operation
```typescript
// Create changes while offline
manager.bufferOffline(change1);
manager.bufferOffline(change2);

// Flush when online
await manager.flushOfflineBuffer();

// Verify changes applied
assert(manager.getPendingChanges().length === 0);
```

### Test 2: Concurrent Edits
```typescript
// Device 1 creates change
const change1 = device1.createChange(...);

// Device 2 creates conflicting change
const change2 = device2.createChange(...);

// Sync message from device 1 to device 2
await device2.applySyncMessage(device1.createSyncMessage(device2Id));

// Conflict should be detected and resolved
const conflicts = device2.getConflictLog(entityId);
assert(conflicts.length > 0);
```

### Test 3: Network Failure
```typescript
// Register device with failing transport
protocol.registerTransport(failingDevice, failingTransport);

// Send message - should retry and queue
const sent = await protocol.sendWithRetry(failingDevice, message);
assert(!sent); // Failed

// Message queued for retry
const queued = protocol.getQueuedMessages(failingDevice);
assert(queued.length === 1);
```

## API Reference

### SyncManager
- `createChange(entityId, type, data)` - Create change
- `getPendingChanges()` - Get queue
- `createSyncMessage(toDevice, changesOnly)` - Create message
- `applySyncMessage(message)` - Apply message
- `bufferOffline(change)` - Buffer for offline
- `flushOfflineBuffer()` - Flush when online
- `getEntityState(entityId)` - Get current value
- `getSyncState()` - Get status

### VectorClockManager
- `increment()` - Increment for local change
- `update(remoteClock)` - Update with remote
- `getClock()` - Get current clock
- `static happenedBefore(a, b)` - Check ordering
- `static concurrent(a, b)` - Check concurrency

### ConflictResolver
- `resolve(changes, entityId)` - Resolve conflicts
- `static isTombstone(change)` - Check deletion
- `static compact(changes)` - Remove obsolete

### SyncProtocol
- `registerTransport(deviceId, transport)` - Register device
- `sendWithRetry(deviceId, message)` - Send with retry
- `broadcast(message)` - Send to all
- `syncTo(devices, message)` - Send to specific

## License

MIT
