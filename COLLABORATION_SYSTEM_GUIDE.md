# Real-Time Collaboration System - Implementation Guide

## Overview

The WISE² Studio collaboration system enables multiple users to edit projects simultaneously with real-time synchronization, presence tracking, commenting, and version control.

## Architecture

### Core Components

```
CollaborationSync (lib/CollaborationSync.ts)
  └─ WebSocket connection manager
  └─ Message routing & event handling
  └─ Automatic reconnection with exponential backoff
  └─ Conflict resolution

useCollaboration Hook (hooks/useCollaboration.ts)
  └─ State management
  └─ Permission checking
  └─ API wrapper methods
  └─ Notification management

UI Components
  ├─ PresenceIndicator.tsx - Show active users
  ├─ CollaboratorsList.tsx - Manage collaborators
  ├─ CommentThread.tsx - Comments & reactions
  ├─ ActivityStream.tsx - Activity log
  ├─ InviteModal.tsx - Share project
  └─ CollaborationPanel.tsx - Main panel
```

## Database Schema

### New Tables (Prisma Models)

1. **ProjectCollaborator** - Track collaborators and roles
   - `id`, `projectId`, `userId`, `role`, `permissions`
   - Unique constraint on (projectId, userId)

2. **ProjectInvite** - Shareable invitations
   - `id`, `projectId`, `invitedBy`, `invitedEmail`, `token`
   - `role`, `expiresAt`, `acceptedAt`, `acceptedBy`

3. **ProjectComment** - Comments & annotations
   - `id`, `projectId`, `userId`, `content`, `timestamp`
   - `trackId`, `threadId`, `mentions`, `reactions`, `resolved`

4. **ActivityLog** - Comprehensive audit trail
   - `id`, `projectId`, `userId`, `action`, `entityType`
   - `entityId`, `details`, `createdAt`

5. **VersionHistory** - Project snapshots
   - `id`, `projectId`, `userId`, `snapshot`, `label`
   - `changeLog`, `createdAt`

6. **UserPresence** - Real-time presence tracking
   - `id`, `projectId`, `userId`, `status`
   - `cursorPosition`, `editingTrackId`, `lastHeartbeat`, `socketId`

### Schema Migration

Run Prisma migration:
```bash
npx prisma migrate dev --name add_collaboration_system
```

## Getting Started

### 1. Initialize Collaboration

```typescript
import { useCollaboration } from '@/hooks/useCollaboration';

export function MyProject() {
  const collab = useCollaboration({
    projectId: 'project-123',
    userId: 'user-456',
    role: 'OWNER',
    apiUrl: 'https://api.wise2.app',
    autoConnect: true,
  });

  return (
    <>
      <PresenceIndicator presence={collab.presence} />
      <CollaboratorsList collaborators={collab.collaborators} />
    </>
  );
}
```

### 2. Track Changes

```typescript
// Update track volume
collab.updateTrack('track-1', { volume: 0.75 });

// Update mixer settings
collab.updateMixer({ masterVolume: 0.8, bpm: 120 });

// Add to gallery
collab.addGalleryImage('img-1', 'https://...', 'image.jpg');

// Add comment
await collab.addComment({
  projectId: 'project-123',
  content: 'Great drums!',
  timestamp: 45.5,
  trackId: 'track-2',
});
```

### 3. Monitor Presence

```typescript
// Update your presence
collab.updatePresence({
  status: 'online',
  editingTrackId: 'track-1',
  cursorPosition: { x: 100, y: 50, track: 'track-1', time: 10 },
});

// Get active users
const activeUsers = collab.activeCollaborators;
```

### 4. Manage Permissions

```typescript
// Check permission
if (collab.hasPermission('edit_audio')) {
  // Can edit audio
}

// Check multiple permissions
const perms = collab.checkPermissions();
console.log(perms.canInvite, perms.canComment, perms.canDeleteProject);

// Add collaborator
await collab.addCollaborator('colleague@example.com', 'EDITOR');

// Remove collaborator
collab.removeCollaborator('collaborator-123');
```

### 5. Access Activity & History

```typescript
// Log activity
collab.logActivity('track_added', 'track', 'track-1', {
  trackName: 'Vocals',
  volume: 0.8,
});

// View activity log
collab.activityLog.forEach(entry => {
  console.log(`${entry.user?.name} ${entry.action}`);
});

// Create version
collab.createVersion('Final Mix v2', 'Added reverb to vocals');

// View versions
collab.versions.forEach(version => {
  console.log(version.label, version.createdAt);
});
```

## Types

All collaboration types are in `types/collaboration.ts`:

```typescript
type CollaboratorRole = 'OWNER' | 'EDITOR' | 'VIEWER';

interface Collaborator {
  id: string;
  userId: string;
  projectId: string;
  role: CollaboratorRole;
  permissions: Permission[];
  joinedAt: string;
  lastActiveAt: string;
  status: 'active' | 'inactive';
  user?: { id: string; name: string; email: string; avatar?: string };
}

interface UserPresence {
  id: string;
  userId: string;
  projectId: string;
  status: 'online' | 'away' | 'idle' | 'offline';
  cursorPosition?: CursorPosition;
  editingTrackId?: string;
  lastHeartbeat: string;
}

interface ProjectComment {
  id: string;
  projectId: string;
  userId: string;
  content: string;
  timestamp?: number;
  trackId?: string;
  threadId?: string;
  mentions: string[];
  reactions: Record<string, Reaction>;
  resolved: boolean;
  createdAt: string;
}

interface ActivityLogEntry {
  id: string;
  projectId: string;
  userId: string;
  action: ActivityAction;
  entityType: string;
  entityId?: string;
  details: Record<string, any>;
  createdAt: string;
}
```

## Permission System

### Roles & Permissions

**OWNER**
- All permissions including delete project, manage permissions

**EDITOR**
- View, edit audio, edit mixer, upload gallery, comment, create version

**VIEWER**
- View project, comment only

### Permission Checks

```typescript
type Permission =
  | 'view_project'
  | 'edit_audio'
  | 'edit_mixer'
  | 'upload_gallery'
  | 'comment'
  | 'invite_collaborators'
  | 'manage_permissions'
  | 'delete_project'
  | 'create_version';

// Check single permission
if (collab.hasPermission('edit_mixer')) { /* ... */ }

// Check multiple
const perms = collab.checkPermissions();
```

## WebSocket Messages

The CollaborationSync class handles these message types:

```typescript
type MessageType =
  | 'presence_update' - User status/cursor changed
  | 'track_update' - Track volume/mute/solo changed
  | 'mixer_update' - Master volume/BPM changed
  | 'gallery_update' - Image added/removed
  | 'comment_added' - New comment
  | 'comment_resolved' - Comment marked resolved
  | 'reaction_added' - Emoji reaction
  | 'user_joined' - Collaborator joined
  | 'user_left' - Collaborator left
  | 'permission_changed' - Role/permission updated
  | 'state_sync' - Full state synchronization;
```

## Backend Implementation (NestJS)

### WebSocket Gateway

Create `packages/api/src/collaboration/collaboration.gateway.ts`:

```typescript
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { CollaborationService } from './collaboration.service';

@WebSocketGateway({
  namespace: 'ws/collaboration',
  cors: { origin: '*' },
})
export class CollaborationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(private collaborationService: CollaborationService) {}

  handleConnection(client: Socket) {
    const projectId = client.handshake.query.projectId as string;
    const userId = client.handshake.query.userId as string;

    // Join project room
    client.join(`project:${projectId}`);

    // Broadcast user joined
    this.server.to(`project:${projectId}`).emit('user_joined', {
      userId,
      timestamp: Date.now(),
    });
  }

  handleDisconnect(client: Socket) {
    const projectId = client.handshake.query.projectId as string;
    const userId = client.handshake.query.userId as string;

    // Broadcast user left
    this.server.to(`project:${projectId}`).emit('user_left', {
      userId,
      timestamp: Date.now(),
    });
  }

  @SubscribeMessage('track_update')
  handleTrackUpdate(
    @MessageBody() data: any,
    @ConnectedSocket() client: Socket,
  ) {
    const projectId = client.handshake.query.projectId;
    
    // Save to database
    this.collaborationService.logActivity(projectId, data);

    // Broadcast to other users
    client.to(`project:${projectId}`).emit('track_update', data);
  }

  @SubscribeMessage('comment_added')
  async handleCommentAdded(
    @MessageBody() data: any,
    @ConnectedSocket() client: Socket,
  ) {
    const projectId = client.handshake.query.projectId;
    const comment = await this.collaborationService.addComment(
      projectId,
      data,
    );

    // Broadcast to all users
    this.server.to(`project:${projectId}`).emit('comment_added', comment);
  }
}
```

### Collaboration Service

Create `packages/api/src/collaboration/collaboration.service.ts`:

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { CollaboratorRole } from '@shared/types';

@Injectable()
export class CollaborationService {
  constructor(private prisma: PrismaService) {}

  async addCollaborator(
    projectId: string,
    userId: string,
    role: CollaboratorRole,
  ) {
    return this.prisma.projectCollaborator.create({
      data: { projectId, userId, role },
      include: { user: true },
    });
  }

  async addComment(projectId: string, data: any) {
    return this.prisma.projectComment.create({
      data: {
        projectId,
        userId: data.userId,
        content: data.content,
        timestamp: data.timestamp,
        trackId: data.trackId,
      },
      include: { user: true },
    });
  }

  async logActivity(projectId: string, data: any) {
    return this.prisma.activityLog.create({
      data: {
        projectId,
        userId: data.userId,
        action: data.action,
        entityType: data.entityType,
        entityId: data.entityId,
        details: data.details,
      },
    });
  }

  async createVersion(projectId: string, userId: string, snapshot: any) {
    return this.prisma.versionHistory.create({
      data: { projectId, userId, snapshot },
    });
  }
}
```

## Frontend Integration

### Add to Workspace Page

```typescript
// apps/studio/app/workspace/page.tsx
import { useCollaboration } from '@/hooks/useCollaboration';
import { CollaborationPanel } from '@/components/CollaborationPanel';
import { PresenceIndicator } from '@/components/PresenceIndicator';

export default function WorkspacePage() {
  const collab = useCollaboration({
    projectId: projectId,
    userId: userId,
    autoConnect: true,
  });

  return (
    <div className="flex h-screen">
      {/* Main editor */}
      <div className="flex-1">
        {/* Header with presence indicator */}
        <div className="h-16 border-b border-gray-700 flex items-center justify-between px-6">
          <h1>Project: {projectName}</h1>
          <PresenceIndicator presence={collab.presence} />
        </div>

        {/* Your editor content */}
      </div>

      {/* Collaboration panel */}
      <CollaborationPanel collab={collab} />
    </div>
  );
}
```

## Conflict Resolution

The system uses **Last-Write-Wins (LWW)** by default:

1. Client sends message with timestamp
2. Server receives and logs timestamp
3. If two edits conflict, latest timestamp wins
4. Both changes are in activity log

For critical edits, implement UI lock:

```typescript
// Lock track from editing
const [lockedBy, setLockedBy] = useState<string | null>(null);

const handleEditStart = () => {
  // Broadcast lock
  collab.updatePresence({ editingTrackId: 'track-1' });
  setLockedBy(userId);
};

const handleEditEnd = () => {
  // Release lock
  collab.updatePresence({ editingTrackId: undefined });
  setLockedBy(null);
};
```

## Notifications

The system emits notifications for key events:

```typescript
// Listen to notifications
useEffect(() => {
  collab.notifications.forEach((notif) => {
    console.log(notif.title, notif.message);
    
    // Show toast or alert
    showNotification(notif);
  });
}, [collab.notifications]);
```

## Performance Optimization

### Message Throttling

```typescript
import { throttle } from 'lodash';

const updatePresenceThrottled = throttle((update) => {
  collab.updatePresence(update);
}, 1000); // Max once per second
```

### Lazy Load Activity

```typescript
const [activityPage, setActivityPage] = useState(0);
const activities = useMemo(() => {
  return collab.activityLog.slice(
    activityPage * 20,
    (activityPage + 1) * 20,
  );
}, [collab.activityLog, activityPage]);
```

## Testing

```typescript
// Mock collaboration for tests
vi.mock('@/hooks/useCollaboration', () => ({
  useCollaboration: vi.fn(() => ({
    isConnected: true,
    collaborators: mockCollaborators,
    presence: mockPresence,
    hasPermission: (perm: string) => true,
    updateTrack: vi.fn(),
    addComment: vi.fn(),
  })),
}));

// Test presence indicator
test('renders presence indicators', () => {
  render(
    <PresenceIndicator
      presence={[{ userId: '1', status: 'online' }]}
    />,
  );
  expect(screen.getByText('1 online')).toBeInTheDocument();
});
```

## Security Considerations

1. **Authentication**: Verify user identity before WebSocket connection
2. **Authorization**: Check permissions on every message
3. **Rate Limiting**: Throttle messages per user/project
4. **Input Validation**: Sanitize all user inputs
5. **HTTPS/WSS**: Use secure protocols in production
6. **CORS**: Restrict origins in WebSocket server

## Roadmap

- [ ] Real-time cursor indicators
- [ ] Collaborative text editing (OT/CRDT)
- [ ] More emoji reactions
- [ ] Notification preferences
- [ ] Invite link expiration
- [ ] Bulk operations (select multiple, delete)
- [ ] Comment threads with replies
- [ ] Dark mode emoji support
- [ ] Mobile app presence
- [ ] Offline queue & sync

## Troubleshooting

### WebSocket Connection Issues

```typescript
// Check connection state
console.log(collab.state.isConnected);
console.log(collab.state.pendingChanges.length);

// Manual reconnect
collab.connect();
```

### Missing Permissions

```typescript
// Check what permissions are available
const perms = collab.checkPermissions();
console.log(perms);

// If permissions don't match expectations, refresh from server
```

### Stale Comments

```typescript
// Refresh comments from server
const fresh = await fetch(`/api/projects/${projectId}/comments`);
```

## Support

For issues or questions:
1. Check console for error messages
2. Review `CollaborationSync` debug logs
3. Verify WebSocket connection in DevTools
4. Check database for data consistency
5. Review server logs for sync errors

---

**Version**: 1.0.0  
**Last Updated**: 2026-07-19
