# Collaboration System - Quick Reference Guide

**For Frontend Developers**

---

## WebSocket Connection

```typescript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3001/collaboration', {
  auth: {
    token: 'your-jwt-token'
  },
  query: {
    projectId: 'proj-123'
  },
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5
});

socket.on('connection:confirmed', (data) => {
  console.log('Connected!', data);
});

socket.on('error', (error) => {
  console.error('Error:', error.errorId, error.message);
});
```

---

## Presence Events

### Listen for users joining/leaving

```typescript
// User joined
socket.on('presence:join', (data) => {
  console.log('User joined:', data.userName);
  console.log('Active users:', data.activeUsers);
  // Update UI with active users list
});

// User left
socket.on('presence:leave', (data) => {
  console.log('User left');
  console.log('Remaining users:', data.activeUsers);
  // Update UI
});

// See cursor moving
socket.on('cursor:move', (cursor) => {
  console.log(cursor.userName, 'at', cursor.x, cursor.y);
  // Draw cursor on canvas
});
```

### Send your cursor position

```typescript
// Send cursor every 100ms when moving
document.addEventListener('mousemove', (e) => {
  socket.emit('cursor:move', {
    userId: currentUserId,
    x: e.clientX,
    y: e.clientY,
    userName: currentUserName,
    userColor: '#FF5733'
  });
});
```

---

## Track Editing

### Listen for edits

```typescript
socket.on('track:edit', (edit) => {
  console.log(`Track ${edit.trackId} field ${edit.field} = ${edit.value}`);
  
  if (edit.conflicts) {
    console.warn('Conflict detected:', edit.conflicts);
    // Show conflict warning to user
  }
  
  // Update UI state
  updateTrackInUI(edit.trackId, edit.field, edit.value);
});
```

### Send an edit

```typescript
function updateTrackVolume(trackId, newVolume) {
  socket.emit('track:edit', {
    trackId,
    field: 'volume',
    value: newVolume,
    timestamp: Date.now(),
    conflictResolution: 'last-write-wins'
  });
}
```

---

## Comments

### Listen for comments

```typescript
socket.on('comment:add', (comment) => {
  console.log('New comment:', comment.content);
  // Add to comments list in UI
  addCommentToUI(comment);
});
```

### Add a comment

```typescript
// Via WebSocket (real-time)
socket.emit('comment:add', {
  content: 'This section needs work',
  timestamp: currentTime,
  trackId: 'track-1',
  mentions: ['user-456']
});

// Or via REST API
const response = await fetch('/api/projects/proj-123/comments', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    content: 'Comment text',
    timestamp: 45.5,
    trackId: 'track-1'
  })
});
```

### Get all comments for a project

```typescript
const response = await fetch('/api/projects/proj-123/comments', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const comments = await response.json();
```

---

## Versions

### Create a version snapshot

```typescript
socket.emit('version:snapshot', {
  snapshot: {
    tracks: projectState.tracks,
    mixer: projectState.mixer,
    gallery: projectState.gallery
  },
  label: 'Final Mix v1',
  changeLog: 'Added drums, adjusted EQ'
});

// Listen for confirmation
socket.on('version:snapshot', (version) => {
  console.log('Version saved:', version.label);
});
```

### Get version history

```typescript
const response = await fetch('/api/projects/proj-123/versions', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const versions = await response.json();
// Display in version dropdown
```

### Rollback to a version

```typescript
const response = await fetch('/api/projects/proj-123/rollback/version-1', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` }
});
// UI updates will come via WebSocket
```

---

## REST API Quick Reference

### Get Active Users

```bash
curl http://localhost:3001/api/projects/proj-123/active-users \
  -H "Authorization: Bearer $TOKEN"
```

### Get Collaborators

```bash
curl http://localhost:3001/api/projects/proj-123/collaborators \
  -H "Authorization: Bearer $TOKEN"
```

### Invite Collaborator

```bash
curl -X POST http://localhost:3001/api/projects/proj-123/invite \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "invitedEmail": "user@example.com",
    "role": "EDITOR"
  }'
```

### Update Permissions

```bash
curl -X PUT http://localhost:3001/api/projects/proj-123/permissions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "collaboratorId": "collab-123",
    "role": "VIEWER"
  }'
```

### Get Activity History

```bash
curl http://localhost:3001/api/projects/proj-123/activity \
  -H "Authorization: Bearer $TOKEN"
```

---

## Error Handling

### Handle WebSocket Errors

```typescript
socket.on('error', (error) => {
  const errorId = error.errorId; // Save for support
  const message = error.message; // Show to user
  
  if (message.includes('Rate limit')) {
    // Slow down edits
    console.warn('Too many edits, please wait');
  } else if (message.includes('Permission')) {
    // Show permission error
    showAlert('You do not have permission for this action');
  } else {
    // Generic error
    showAlert(`Error (ID: ${errorId}): ${message}`);
  }
});
```

### Common Errors

```
"User not authenticated" 
→ Check JWT token is valid and not expired

"Permission denied: edit_track"
→ User role doesn't allow editing (VIEWER role)

"Rate limit exceeded"
→ Sending too many edits too quickly (> 10 per 500ms)

"Project not found"
→ Wrong projectId or project doesn't exist
```

---

## Heartbeat / Keep-Alive

```typescript
// Server sends heartbeat:ping every 30 seconds
socket.on('heartbeat:ping', () => {
  socket.emit('heartbeat'); // Respond
});

// Listen for acknowledgement
socket.on('heartbeat:ack', (data) => {
  console.log('Connection healthy');
});
```

---

## Permission Levels

### What each role can do:

**OWNER** (all 9)
- ✅ Edit tracks, mixer, gallery, metadata
- ✅ Manage collaborators
- ✅ Create/rollback versions
- ✅ Export project
- ✅ Delete project
- ✅ Share project (invite)

**EDITOR** (7 of 9)
- ✅ Edit tracks, mixer, gallery, metadata
- ✅ Create/rollback versions
- ✅ Export project
- ✅ Share project (invite)
- ❌ Manage collaborators
- ❌ Delete project

**VIEWER** (read-only)
- ✅ View everything
- ✅ View comments
- ❌ Edit nothing
- ❌ Manage anything

---

## Complete Example: Real-time Collaboration

```typescript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3001/collaboration', {
  auth: { token: 'jwt-token' },
  query: { projectId: 'proj-123' }
});

// User connects
socket.on('connection:confirmed', () => {
  console.log('Connected to project');
});

// See other users join
socket.on('presence:join', (data) => {
  updateActiveUsersList(data.activeUsers);
});

// See real-time edits
socket.on('track:edit', (edit) => {
  updateTrackVolume(edit.trackId, edit.value);
  showNotification(`${edit.userId} changed track volume`);
});

// See comments appear
socket.on('comment:add', (comment) => {
  addCommentToTimeline(comment);
});

// Share cursor position
document.addEventListener('mousemove', (e) => {
  socket.emit('cursor:move', {
    userId: currentUser.id,
    x: e.clientX,
    y: e.clientY,
    userName: currentUser.name,
    userColor: getUserColor(currentUser.id)
  });
});

// Edit a track
function setTrackVolume(trackId, volume) {
  socket.emit('track:edit', {
    trackId,
    field: 'volume',
    value: volume,
    timestamp: Date.now()
  });
}

// Add comment
function addComment(text, timestamp, trackId) {
  socket.emit('comment:add', {
    content: text,
    timestamp,
    trackId
  });
}

// Create version
function saveVersion(label) {
  socket.emit('version:snapshot', {
    snapshot: getCurrentProjectState(),
    label: label,
    changeLog: 'Manual save'
  });
}

// Handle errors
socket.on('error', (error) => {
  console.error(`[${error.errorId}] ${error.message}`);
  showAlert(error.message);
});

// Clean disconnect
window.addEventListener('beforeunload', () => {
  socket.disconnect();
});
```

---

## Development Checklist

- [ ] Connect to WebSocket namespace
- [ ] Handle connection:confirmed event
- [ ] Listen for presence:join/leave
- [ ] Display active users list
- [ ] Listen for cursor:move events
- [ ] Draw cursors on canvas
- [ ] Listen for track:edit events
- [ ] Update UI when tracks change
- [ ] Handle conflicts gracefully
- [ ] Listen for comments
- [ ] Display comment thread
- [ ] Listen for version:snapshot
- [ ] Show version history
- [ ] Handle errors with errorId
- [ ] Test reconnection behavior
- [ ] Rate limiting (don't send > 10 edits/500ms)

---

## Testing WebSocket Locally

```bash
# Install wscat
npm install -g wscat

# Connect to WebSocket namespace
wscat -c 'ws://localhost:3001/collaboration?projectId=proj-123' \
  --auth 'Bearer your-jwt-token'

# Send event
> {"event":"track:edit","trackId":"track-1","field":"volume","value":0.8,"timestamp":1689000000}

# Receive events
< {"event":"presence:join","userId":"user-123",...}
```

---

## Troubleshooting

### Connection refused
- Check API is running on port 3001
- Verify JWT token is valid
- Check projectId is provided

### Edits not syncing
- Check permission error in console
- Verify rate limit (max 10 edits/500ms)
- Check network tab for errors

### Comments not appearing
- Check presence:join event received first
- Verify permission to edit_track
- Check console for error events

### Version rollback not working
- Only owner/editor can rollback
- Check manage_versions permission
- Verify versionId exists

---

## Performance Tips

1. **Batch Edits**: Combine multiple changes into single message
2. **Debounce Cursor**: Don't send cursor every pixel, batch updates
3. **Lazy Load Comments**: Fetch on demand, not all at once
4. **Compress Payloads**: For large project states, use compression
5. **Memory**: Limit number of displayed active users to 10

---

## Support

For issues:
1. Check console for error ID (e.g., `ERR_1689000000_abc123`)
2. Reference error ID in bug reports
3. Check `COLLABORATION_API.md` for endpoint details
4. Review `SETUP_GUIDE.md` for troubleshooting

---

**Last Updated:** 2026-07-19
