import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { LiveSessionService } from './live-session.service';
import { LiveRoomsService } from './live-rooms.service';
import { PresenceService } from './presence.service';

/**
 * WebSocket Gateway for Live Rooms
 * Handles real-time presence, chat streaming, reactions, polls
 * Connection requires valid JWT from handshake headers
 */

@WebSocketGateway({
  namespace: '/api/live/socket.io',
  cors: {
    origin: true,
    credentials: true,
  },
})
export class LiveWebSocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  constructor(
    private sessionService: LiveSessionService,
    private roomsService: LiveRoomsService,
    private presenceService: PresenceService
  ) {}

  afterInit(server: Server) {
    console.log('[Live] WebSocket gateway initialized');
  }

  /**
   * Handle new connection
   * Validates JWT and joins user to room namespace
   */
  async handleConnection(client: Socket) {
    try {
      // Extract and validate JWT from handshake headers
      const token = this.extractToken(client.handshake.headers.authorization);
      if (!token) {
        client.disconnect();
        return;
      }

      const session = await this.sessionService.validateToken(
        `Bearer ${token}`
      );

      // Attach session to client socket for later use
      (client as any).liveSession = session;

      console.log(`[Live] User ${session.userId} connected`);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error('[Live] Connection auth failed:', msg);
      client.disconnect();
    }
  }

  /**
   * Handle disconnection
   * Remove from presence, mark room member as left
   */
  async handleDisconnect(client: Socket) {
    const session = (client as any).liveSession;
    if (!session) return;

    const roomId = client.data.roomId;
    if (roomId) {
      // Mark as left in database (with 30s grace period for reconnect)
      this.presenceService.markDisconnected(roomId, session.userId);

      // Broadcast presence update
      this.server
        .to(`room:${roomId}`)
        .emit('presence.left', { userId: session.userId });

      console.log(`[Live] User ${session.userId} disconnected from ${roomId}`);
    }
  }

  /**
   * JOIN_ROOM: User joins a live room
   * Subscribes to room namespace and broadcasts presence
   */
  @SubscribeMessage('presence.join')
  async onPresenceJoin(
    client: Socket,
    payload: { roomId: string; name?: string }
  ): Promise<{ success?: boolean; presence?: any; error?: string }> {
    const session = (client as any).liveSession;
    if (!session) {
      return { error: 'Unauthorized' };
    }

    const { roomId, name } = payload;

    try {
      // Validate room exists
      const room = await this.roomsService.getRoom(roomId);
      if (!room) {
        return { error: 'Room not found' };
      }

      // Join Socket.io room
      client.join(`room:${roomId}`);
      client.data.roomId = roomId;

      // Track presence
      this.presenceService.addPresence(roomId, {
        userId: session.userId,
        userName: name || session.email,
        isSpeaking: false,
        isMuted: false,
        joinedAt: Date.now(),
      });

      // Get current presence list
      const presence = this.presenceService.getPresence(roomId);

      // Broadcast to room
      this.server.to(`room:${roomId}`).emit('presence.joined', {
        userId: session.userId,
        userName: name || session.email,
        isSpeaking: false,
        isMuted: false,
      });

      // Send current presence to newly joined user
      client.emit('presence.sync', presence);

      return { success: true, presence };
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error('[Live] Join failed:', msg);
      return { error: msg };
    }
  }

  /**
   * PRESENCE_UPDATE: User updates speaking/muted state
   * Broadcasts to room
   */
  @SubscribeMessage('presence.update')
  onPresenceUpdate(
    client: Socket,
    payload: { roomId: string; isSpeaking?: boolean; isMuted?: boolean }
  ) {
    const session = (client as any).liveSession;
    if (!session) return { error: 'Unauthorized' };

    const { roomId, isSpeaking, isMuted } = payload;

    // Update presence
    this.presenceService.updatePresence(roomId, session.userId, {
      isSpeaking,
      isMuted,
    });

    // Broadcast update to room
    this.server.to(`room:${roomId}`).emit('presence.updated', {
      userId: session.userId,
      isSpeaking,
      isMuted,
    });

    return { success: true };
  }

  /**
   * CHAT_MESSAGE: Stream chat message to room
   * Also persists to database (done via REST endpoint)
   */
  @SubscribeMessage('chat.message')
  async onChatMessage(
    client: Socket,
    payload: { roomId: string; message: string }
  ) {
    const session = (client as any).liveSession;
    if (!session) return { error: 'Unauthorized' };

    const { roomId, message } = payload;

    try {
      // Persist to database
      const dbMsg = await this.roomsService.sendChatMessage(
        roomId,
        session.userId,
        message
      );

      // Broadcast to room with full message object
      this.server.to(`room:${roomId}`).emit('chat.message', {
        id: dbMsg.id,
        userId: session.userId,
        message: dbMsg.message,
        createdAt: dbMsg.createdAt,
      });

      return { success: true };
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error('[Live] Chat failed:', msg);
      return { error: msg };
    }
  }

  /**
   * CROWD_REACT: User sends emoji reaction
   * Aggregated and broadcast every 500ms
   */
  @SubscribeMessage('crowd.react')
  onCrowdReact(
    client: Socket,
    payload: { roomId: string; emoji: string }
  ) {
    const session = (client as any).liveSession;
    if (!session) return;

    const { roomId, emoji } = payload;

    // Accumulate reaction
    this.presenceService.addReaction(roomId, emoji);

    // Broadcast aggregated reactions every 500ms (debounced)
    // This is handled by a timer in PresenceService
  }

  /**
   * POLL_VOTE: Stream poll vote
   * Also persists to database
   */
  @SubscribeMessage('poll.vote')
  async onPollVote(
    client: Socket,
    payload: { roomId: string; optionId: string }
  ) {
    const session = (client as any).liveSession;
    if (!session) return { error: 'Unauthorized' };

    const { roomId, optionId } = payload;

    try {
      const updated = await this.roomsService.votePoll(
        optionId,
        session.userId
      );

      // Broadcast updated vote counts to room
      this.server.to(`room:${roomId}`).emit('poll.voted', {
        optionId,
        votes: updated.votes,
      });

      return { success: true };
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      return { error: msg };
    }
  }

  /**
   * SUGGESTION_VOTE: Stream suggestion upvote
   */
  @SubscribeMessage('suggestion.vote')
  async onSuggestionVote(
    client: Socket,
    payload: { roomId: string; suggestionId: string }
  ) {
    const session = (client as any).liveSession;
    if (!session) return { error: 'Unauthorized' };

    const { roomId, suggestionId } = payload;

    try {
      const updated = await this.roomsService.voteSuggestion(suggestionId);

      // Broadcast updated vote count to room
      this.server.to(`room:${roomId}`).emit('suggestion.voted', {
        suggestionId,
        votes: updated.votes,
      });

      return { success: true };
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      return { error: msg };
    }
  }

  /**
   * Extract JWT from "Bearer <token>" header
   */
  private extractToken(authHeader?: string): string | null {
    if (!authHeader) return null;
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') return null;
    return parts[1];
  }
}
