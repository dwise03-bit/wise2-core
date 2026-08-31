import { Test, TestingModule } from '@nestjs/testing';
import { VersionStackService } from '../version-stack.service';

describe('Version Stack Service', () => {
  let service: VersionStackService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VersionStackService],
    }).compile();

    service = module.get<VersionStackService>(VersionStackService);
  });

  describe('Version Tracking', () => {
    it('should set and get versioned state', () => {
      const result = service.set('room-1:presence', { users: ['alice'] }, 0);

      expect(result.success).toBe(true);
      expect(result.version).toBe(1);
      expect(result.data).toEqual({ users: ['alice'] });

      const state = service.get('room-1:presence');
      expect(state?.version).toBe(1);
      expect(state?.data).toEqual({ users: ['alice'] });
    });

    it('should increment version on each update', () => {
      service.set('key', { value: 1 });
      service.set('key', { value: 2 });
      service.set('key', { value: 3 });

      const state = service.get('key');
      expect(state?.version).toBe(3);
    });
  });

  describe('Conflict Detection', () => {
    it('should detect version conflict', () => {
      service.set('key', { value: 1 }, 0);

      // Try to update with wrong version
      const result = service.set('key', { value: 2 }, 99);

      expect(result.success).toBe(false);
      expect(result.version).toBe(1); // Server version
    });

    it('should allow update with correct version', () => {
      service.set('key', { value: 1 }, 0);

      const result = service.set('key', { value: 2 }, 1);

      expect(result.success).toBe(true);
      expect(result.version).toBe(2);
    });
  });

  describe('State Merging', () => {
    it('should merge states with conflict resolution', () => {
      const localState = {
        version: 1,
        timestamp: Date.now(),
        data: { value: 'local' },
      };

      const remoteState = {
        version: 2,
        timestamp: Date.now() - 1000, // Older
        data: { value: 'remote' },
      };

      service.set('key', localState.data, 0);
      const result = service.merge('key', remoteState);

      // Local is newer, should keep local
      expect(result.data).toEqual(localState.data);
    });

    it('should prefer newer remote state', () => {
      const now = Date.now();

      // Set old local state
      const oldTime = now - 1000;
      service.set('key', { value: 'old' }, 0);

      // Manually manipulate timestamp to simulate old state
      const state = service.get('key');
      if (state) {
        state.timestamp = oldTime;
      }

      // Merge with newer remote state
      const newState = {
        version: 3,
        timestamp: now,
        data: { value: 'new' },
      };

      const result = service.merge('key', newState);
      expect(result.data).toEqual(newState.data);
    });
  });

  describe('Cleanup', () => {
    it('should clear state for a key', () => {
      service.set('key', { value: 1 });
      expect(service.get('key')).not.toBeNull();

      service.clear('key');
      expect(service.get('key')).toBeNull();
    });

    it('should prune old state', () => {
      service.set('key1', { value: 1 });

      // Simulate old state by manipulating internal state
      const all = service.getAll();
      all['old-key'] = {
        version: 1,
        timestamp: Date.now() - 4000000, // 4+ hours ago
        data: {},
      };

      service.prune(3600000); // 1 hour TTL

      expect(service.get('key1')).not.toBeNull();
      expect(service.get('old-key')).toBeNull();
    });
  });
});
