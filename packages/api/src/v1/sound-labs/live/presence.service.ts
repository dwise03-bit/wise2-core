import { Injectable } from '@nestjs/common';

/**
 * Presence Service
 * Tracks user presence in live rooms (who's online, speaking, muted)
 * Handles reconnect recovery and reaction aggregation
 * In production, this would use Redis
 */

export interface UserPresence {
  userId: string;
  userName: string;
  isSpeaking: boolean;
  isMuted: boolean;
  joinedAt: number;
}

interface RoomPresence {
  [userId: string]: UserPresence;
}

interface ReactionState {
  [emoji: string]: number;
}

@Injectable()
export class PresenceService {
  // In-memory store (Redis in production)
  private roomPresence: { [roomId: string]: RoomPresence } = {};
  private reactionBuffer: { [roomId: string]: ReactionState } = {};
  private disconnectGrace: { [key: string]: NodeJS.Timeout } = {};

  /**
   * Add user to presence (user joined room)
   */
  addPresence(roomId: string, presence: UserPresence): void {
    if (!this.roomPresence[roomId]) {
      this.roomPresence[roomId] = {};
    }

    this.roomPresence[roomId][presence.userId] = presence;

    // Clear any pending disconnect timeout
    const key = `${roomId}:${presence.userId}`;
    if (this.disconnectGrace[key]) {
      clearTimeout(this.disconnectGrace[key]);
      delete this.disconnectGrace[key];
    }
  }

  /**
   * Update user presence state (speaking, muted)
   */
  updatePresence(
    roomId: string,
    userId: string,
    updates: Partial<UserPresence>
  ): void {
    if (this.roomPresence[roomId] && this.roomPresence[roomId][userId]) {
      this.roomPresence[roomId][userId] = {
        ...this.roomPresence[roomId][userId],
        ...updates,
      };
    }
  }

  /**
   * Mark user as disconnected
   * Start grace period for reconnect (30 seconds)
   * If reconnect doesn't happen, remove from presence
   */
  markDisconnected(roomId: string, userId: string): void {
    const key = `${roomId}:${userId}`;

    // Set grace period timer
    this.disconnectGrace[key] = setTimeout(() => {
      this.removePresence(roomId, userId);
      delete this.disconnectGrace[key];
    }, 30000); // 30 second grace period
  }

  /**
   * Remove user from presence
   */
  removePresence(roomId: string, userId: string): void {
    if (this.roomPresence[roomId]) {
      delete this.roomPresence[roomId][userId];

      // Clean up empty rooms
      if (Object.keys(this.roomPresence[roomId]).length === 0) {
        delete this.roomPresence[roomId];
        delete this.reactionBuffer[roomId];
      }
    }
  }

  /**
   * Get current presence for room
   * Used for sync on join or after reconnect
   */
  getPresence(roomId: string): UserPresence[] {
    if (!this.roomPresence[roomId]) {
      return [];
    }

    return Object.values(this.roomPresence[roomId]);
  }

  /**
   * Get presence for specific user
   */
  getUserPresence(roomId: string, userId: string): UserPresence | null {
    return this.roomPresence[roomId]?.[userId] || null;
  }

  /**
   * Add emoji reaction to buffer
   * Reactions are aggregated and broadcast every 500ms
   */
  addReaction(roomId: string, emoji: string): void {
    if (!this.reactionBuffer[roomId]) {
      this.reactionBuffer[roomId] = {};
    }

    this.reactionBuffer[roomId][emoji] =
      (this.reactionBuffer[roomId][emoji] || 0) + 1;
  }

  /**
   * Get aggregated reactions and reset buffer
   */
  getAndResetReactions(roomId: string): ReactionState {
    const reactions = this.reactionBuffer[roomId] || {};
    this.reactionBuffer[roomId] = {};
    return reactions;
  }

  /**
   * Get member count for room
   */
  getMemberCount(roomId: string): number {
    return Object.keys(this.roomPresence[roomId] || {}).length;
  }

  /**
   * Get all members currently speaking
   */
  getSpeakingMembers(roomId: string): UserPresence[] {
    return this.getPresence(roomId).filter((p) => p.isSpeaking);
  }

  /**
   * Clear all presence for room (on stream end)
   */
  clearRoomPresence(roomId: string): void {
    delete this.roomPresence[roomId];
    delete this.reactionBuffer[roomId];

    // Clear any pending timeouts for this room
    Object.keys(this.disconnectGrace).forEach((key) => {
      if (key.startsWith(`${roomId}:`)) {
        clearTimeout(this.disconnectGrace[key]);
        delete this.disconnectGrace[key];
      }
    });
  }

  /**
   * Get all state (for debugging)
   */
  getAllPresence(): { [roomId: string]: RoomPresence } {
    return JSON.parse(JSON.stringify(this.roomPresence));
  }
}
