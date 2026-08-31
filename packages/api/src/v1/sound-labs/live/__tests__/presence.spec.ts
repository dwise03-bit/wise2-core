import { Test, TestingModule } from '@nestjs/testing';
import { PresenceService } from '../presence.service';

describe('Presence Service', () => {
  let service: PresenceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PresenceService],
    }).compile();

    service = module.get<PresenceService>(PresenceService);
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  describe('Presence Tracking', () => {
    it('should add user to room presence', () => {
      const roomId = 'room-1';
      const presence = {
        userId: 'user-1',
        userName: 'Alice',
        isSpeaking: false,
        isMuted: false,
        joinedAt: Date.now(),
      };

      service.addPresence(roomId, presence);

      const members = service.getPresence(roomId);
      expect(members).toHaveLength(1);
      expect(members[0].userId).toBe('user-1');
    });

    it('should add multiple users to room', () => {
      const roomId = 'room-1';

      service.addPresence(roomId, {
        userId: 'user-1',
        userName: 'Alice',
        isSpeaking: false,
        isMuted: false,
        joinedAt: Date.now(),
      });

      service.addPresence(roomId, {
        userId: 'user-2',
        userName: 'Bob',
        isSpeaking: true,
        isMuted: false,
        joinedAt: Date.now(),
      });

      const members = service.getPresence(roomId);
      expect(members).toHaveLength(2);
    });

    it('should update user presence state', () => {
      const roomId = 'room-1';

      service.addPresence(roomId, {
        userId: 'user-1',
        userName: 'Alice',
        isSpeaking: false,
        isMuted: false,
        joinedAt: Date.now(),
      });

      service.updatePresence(roomId, 'user-1', {
        isSpeaking: true,
        isMuted: true,
      });

      const user = service.getUserPresence(roomId, 'user-1');
      expect(user).not.toBeNull();
      expect(user!.isSpeaking).toBe(true);
      expect(user!.isMuted).toBe(true);
    });

    it('should get member count', () => {
      const roomId = 'room-1';

      service.addPresence(roomId, {
        userId: 'user-1',
        userName: 'Alice',
        isSpeaking: false,
        isMuted: false,
        joinedAt: Date.now(),
      });

      service.addPresence(roomId, {
        userId: 'user-2',
        userName: 'Bob',
        isSpeaking: false,
        isMuted: false,
        joinedAt: Date.now(),
      });

      expect(service.getMemberCount(roomId)).toBe(2);
    });

    it('should get speaking members', () => {
      const roomId = 'room-1';

      service.addPresence(roomId, {
        userId: 'user-1',
        userName: 'Alice',
        isSpeaking: true,
        isMuted: false,
        joinedAt: Date.now(),
      });

      service.addPresence(roomId, {
        userId: 'user-2',
        userName: 'Bob',
        isSpeaking: false,
        isMuted: false,
        joinedAt: Date.now(),
      });

      const speakers = service.getSpeakingMembers(roomId);
      expect(speakers).toHaveLength(1);
      expect(speakers[0].userId).toBe('user-1');
    });
  });

  describe('Disconnect & Reconnect Grace Period', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should keep user in presence during grace period', () => {
      const roomId = 'room-1';

      service.addPresence(roomId, {
        userId: 'user-1',
        userName: 'Alice',
        isSpeaking: false,
        isMuted: false,
        joinedAt: Date.now(),
      });

      service.markDisconnected(roomId, 'user-1');

      // Within grace period, user should still be present
      const members = service.getPresence(roomId);
      expect(members).toHaveLength(1);
    });

    it('should remove user after grace period expires', () => {
      jest.useFakeTimers();
      const roomId = 'room-1';

      service.addPresence(roomId, {
        userId: 'user-1',
        userName: 'Alice',
        isSpeaking: false,
        isMuted: false,
        joinedAt: Date.now(),
      });

      service.markDisconnected(roomId, 'user-1');

      // Advance time past grace period (30 seconds)
      jest.advanceTimersByTime(31000);

      // User should be removed
      const members = service.getPresence(roomId);
      expect(members).toHaveLength(0);

      jest.useRealTimers();
    });

    it('should cancel grace period on reconnect', () => {
      jest.useFakeTimers();
      const roomId = 'room-1';

      service.addPresence(roomId, {
        userId: 'user-1',
        userName: 'Alice',
        isSpeaking: false,
        isMuted: false,
        joinedAt: Date.now(),
      });

      service.markDisconnected(roomId, 'user-1');

      // Advance time but not past grace period
      jest.advanceTimersByTime(15000);

      // Reconnect
      service.addPresence(roomId, {
        userId: 'user-1',
        userName: 'Alice',
        isSpeaking: false,
        isMuted: false,
        joinedAt: Date.now(),
      });

      // Advance time past grace period
      jest.advanceTimersByTime(31000);

      // User should still be present (grace was cancelled)
      const members = service.getPresence(roomId);
      expect(members).toHaveLength(1);

      jest.useRealTimers();
    });
  });

  describe('Reactions Aggregation', () => {
    it('should aggregate emoji reactions', () => {
      const roomId = 'room-1';

      service.addReaction(roomId, '👍');
      service.addReaction(roomId, '👍');
      service.addReaction(roomId, '❤️');

      const reactions = service.getAndResetReactions(roomId);

      expect(reactions['👍']).toBe(2);
      expect(reactions['❤️']).toBe(1);
    });

    it('should reset reactions after retrieval', () => {
      const roomId = 'room-1';

      service.addReaction(roomId, '👍');
      service.getAndResetReactions(roomId);

      const reactions = service.getAndResetReactions(roomId);
      expect(Object.keys(reactions)).toHaveLength(0);
    });
  });

  describe('Room Cleanup', () => {
    it('should clear all presence on room end', () => {
      const roomId = 'room-1';

      service.addPresence(roomId, {
        userId: 'user-1',
        userName: 'Alice',
        isSpeaking: false,
        isMuted: false,
        joinedAt: Date.now(),
      });

      service.addReaction(roomId, '👍');

      service.clearRoomPresence(roomId);

      expect(service.getPresence(roomId)).toHaveLength(0);
      expect(service.getAndResetReactions(roomId)).toEqual({});
    });

    it('should remove user from presence', () => {
      const roomId = 'room-1';

      service.addPresence(roomId, {
        userId: 'user-1',
        userName: 'Alice',
        isSpeaking: false,
        isMuted: false,
        joinedAt: Date.now(),
      });

      service.addPresence(roomId, {
        userId: 'user-2',
        userName: 'Bob',
        isSpeaking: false,
        isMuted: false,
        joinedAt: Date.now(),
      });

      service.removePresence(roomId, 'user-1');

      const members = service.getPresence(roomId);
      expect(members).toHaveLength(1);
      expect(members[0].userId).toBe('user-2');
    });
  });

  describe('Multiple Rooms', () => {
    it('should isolate presence by room', () => {
      service.addPresence('room-1', {
        userId: 'user-1',
        userName: 'Alice',
        isSpeaking: false,
        isMuted: false,
        joinedAt: Date.now(),
      });

      service.addPresence('room-2', {
        userId: 'user-2',
        userName: 'Bob',
        isSpeaking: false,
        isMuted: false,
        joinedAt: Date.now(),
      });

      const room1Members = service.getPresence('room-1');
      const room2Members = service.getPresence('room-2');

      expect(room1Members).toHaveLength(1);
      expect(room1Members[0].userId).toBe('user-1');

      expect(room2Members).toHaveLength(1);
      expect(room2Members[0].userId).toBe('user-2');
    });
  });
});
