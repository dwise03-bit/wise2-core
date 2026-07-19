# Real-Time Collaboration - Quick Reference

## 🚀 Basic Setup

```typescript
import { useCollaboration } from '@/hooks/useCollaboration';

function MyComponent() {
  const collab = useCollaboration({
    projectId: 'project-123',
    userId: 'user-456',
    role: 'OWNER',
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

## 🔧 Common Operations

### Track Changes
```typescript
// Update volume
collab.updateTrack('track-1', { volume: 0.75 });

// Toggle mute
collab.updateTrack('track-1', { muted: true });

// Change track name
collab.updateTrack('track-1', { name: 'Vocals' });
```

### Mixer Updates
```typescript
// Change master volume
collab.updateMixer({ masterVolume: 0.8 });

// Change BPM
collab.updateMixer({ bpm: 120 });

// Change playback position
collab.updateMixer({ playbackPosition: 45.5 });
```

### Gallery
```typescript
// Add image
collab.addGalleryImage('img-1', 'https://...', 'cover.jpg');

// Remove image
collab.removeGalleryImage('img-1');
```

### Comments
```typescript
// Add comment
await collab.addComment({
  projectId: 'project-123',
  content: 'Great drums!',
  timestamp: 45.5,
  trackId: 'track-2',
  mentions: ['user-789'],
});

// Get unresolved comments
const active = collab.unresolvedComments;
```

### Collaborators
```typescript
// Add collaborator
await collab.addCollaborator('colleague@example.com', 'EDITOR');

// Remove collaborator
collab.removeCollaborator('collaborator-123');

// Get active users
const online = collab.activeCollaborators;
```

### Presence
```typescript
// Update your presence
collab.updatePresence({
  status: 'online',
  editingTrackId: 'track-1',
  cursorPosition: { x: 100, y: 50, track: 'track-1', time: 10 },
});
```

### Versions
```typescript
// Create version
collab.createVersion('Final Mix v2', 'Added reverb to vocals');

// Get versions
collab.versions.forEach(v => console.log(v.label));
```

### Activity
```typescript
// Log activity
collab.logActivity('track_added', 'track', 'track-1', {
  trackName: 'Vocals',
  volume: 0.8,
});

// View activity
collab.activityLog.forEach(entry => {
  console.log(`${entry.user?.name} ${entry.action}`);
});
```

## 🔐 Permissions

### Check Permissions
```typescript
// Single permission
if (collab.hasPermission('edit_audio')) {
  // Can edit audio
}

// Multiple permissions
const perms = collab.checkPermissions();
if (perms.canInvite && perms.canDeleteProject) {
  // Can manage project
}
```

### Permission List
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
```

## 📡 Connection Status

```typescript
// Check connection
if (collab.isConnected) {
  console.log('Connected');
}

// Manual connect/disconnect
collab.connect();
collab.disconnect();

// Listen to connection events
useEffect(() => {
  if (!collab.isConnected) {
    console.log('Disconnected, reconnecting...');
  }
}, [collab.isConnected]);
```

## 🔔 Notifications

```typescript
// Listen to notifications
useEffect(() => {
  collab.notifications.forEach((notif) => {
    showToast({
      title: notif.title,
      message: notif.message,
      type: notif.type,
    });
  });
}, [collab.notifications]);

// Notification types
type NotificationType =
  | 'user_joined'
  | 'user_left'
  | 'comment_mentioned'
  | 'permission_changed'
  | 'conflict_alert'
  | 'version_created';
```

## 🎨 Components

### PresenceIndicator
```typescript
<PresenceIndicator 
  presence={collab.presence}
  maxVisible={5}
  showTooltips={true}
/>

// Compact version
<PresenceIndicatorCompact 
  presence={collab.presence}
  maxVisible={3}
/>
```

### CollaboratorsList
```typescript
<CollaboratorsList
  collaborators={collab.collaborators}
  currentUserId={userId}
  onRemove={(id) => collab.removeCollaborator(id)}
  onChangeRole={(id, role) => {/* ... */}}
  canManagePermissions={perms.canManagePermissions}
/>
```

### CommentThread
```typescript
<CommentThread
  comments={collab.comments}
  onAddReaction={(payload) => {/* ... */}}
  onResolve={(id, resolved) => {/* ... */}}
  canDelete={perms.canDeleteProject}
  onDelete={(id) => {/* ... */}}
/>
```

### ActivityStream
```typescript
<ActivityStream
  activities={collab.activityLog}
  maxVisible={20}
  filterByUser={userId}
  filterByAction="track_added"
/>

// Compact version
<ActivityStreamCompact activities={collab.activityLog} />
```

### InviteModal
```typescript
const [showInvite, setShowInvite] = useState(false);

<InviteModal
  isOpen={showInvite}
  projectId={projectId}
  onClose={() => setShowInvite(false)}
  onInvite={(email, role) => collab.addCollaborator(email, role)}
  onCopyLink={(link) => console.log('Copied:', link)}
/>
```

## 📊 Real-Time Data

```typescript
// Active collaborators
collab.presence.filter(p => p.status === 'online')

// Who's editing what
collab.presence.forEach(p => {
  if (p.editingTrackId) {
    console.log(`${p.user?.name} is editing ${p.editingTrackId}`);
  }
});

// Unresolved discussions
collab.comments.filter(c => !c.resolved)

// Recent activity
collab.activityLog.slice(0, 10)

// Project snapshots
collab.versions.map(v => ({ label: v.label, date: v.createdAt }))
```

## 🧹 Cleanup

```typescript
// Component cleanup
useEffect(() => {
  return () => {
    collab.disconnect();
  };
}, []);
```

## ❌ Error Handling

```typescript
useEffect(() => {
  if (!collab.isConnected) {
    // Handle disconnection
    console.error('Lost connection to collaboration server');
  }
}, [collab.isConnected]);

// Check state
console.log(collab.state.pendingChanges.length); // Messages waiting to send
```

## 🎯 Role-Based Features

### OWNER
- ✅ Edit audio, mixer, gallery
- ✅ Invite collaborators
- ✅ Manage permissions
- ✅ Delete project
- ✅ Create versions
- ✅ Comment

### EDITOR
- ✅ Edit audio, mixer, gallery
- ✅ Create versions
- ✅ Comment
- ❌ Invite (use OWNER)
- ❌ Delete (use OWNER)

### VIEWER
- ✅ View project
- ✅ Comment
- ❌ Edit anything
- ❌ Invite
- ❌ Delete

## 📈 State Structure

```typescript
interface CollaborationState {
  projectId: string;
  userId: string;
  role: CollaboratorRole;
  permissions: Permission[];
  
  // Real-time data
  collaborators: Collaborator[];
  presence: UserPresence[];
  comments: ProjectComment[];
  activityLog: ActivityLogEntry[];
  versions: VersionHistoryEntry[];
  conflicts: ConflictDialog[];
  
  // Connection
  isConnected: boolean;
  lastSyncTime: number;
  pendingChanges: CollaborationMessage[];
}
```

## 🧬 Message Types

```typescript
'presence_update'    // User status/cursor changed
'track_update'       // Track volume/mute/solo
'mixer_update'       // Master volume/BPM
'gallery_update'     // Image added/removed
'comment_added'      // New comment
'comment_resolved'   // Comment marked done
'reaction_added'     // Emoji reaction
'user_joined'        // Collaborator joined
'user_left'          // Collaborator left
'permission_changed' // Role/permission changed
'state_sync'         // Full sync request
```

## 🛠️ Debugging

```typescript
// Check connection state
const state = collab.state;
console.log('Connected:', state.isConnected);
console.log('Pending:', state.pendingChanges.length);
console.log('Last sync:', new Date(state.lastSyncTime));

// Check permissions
console.log('Your permissions:', collab.permissions);
console.log('Can edit?', collab.hasPermission('edit_audio'));

// Check activity
console.log('Recent activity:', collab.activityLog.slice(0, 5));
```

## 📚 Related Hooks

```typescript
// Also use alongside:
const audio = useAudioEngine();        // For audio playback
const cloud = useCloudPersistence();   // For saving
const auth = useAuth();                // For user data
```

## 🔗 Integration Points

- **Audio**: `updateTrack()` → `useAudioEngine`
- **Storage**: `createVersion()` → `useCloudPersistence`
- **UI**: `notifications` → Toast component
- **Auth**: `userId` from `AuthContext`
- **Gallery**: `addGalleryImage()` → Gallery component

---

**Version**: 1.0.0  
**For Questions**: See COLLABORATION_SYSTEM_GUIDE.md
