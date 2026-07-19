# SoundLabs Cloud Storage Implementation Guide

## Overview

This document describes the cloud storage implementation for SoundLabs projects, enabling persistent storage of mixer state and audio recordings using PostgreSQL and Amazon S3.

## Architecture

### Database Schema

Three new Prisma models were added:

1. **SoundLabsProject** - Stores project metadata and mixer state
   - `id`: Unique project identifier
   - `userId`: Foreign key to User model
   - `name`: Project name
   - `description`: Optional project description
   - `mixerState`: JSON field containing complete mixer configuration
   - `projectSize`: Calculated size of the project in bytes
   - `createdAt`, `updatedAt`: Timestamps

2. **SoundLabsRecording** - Stores audio recording metadata
   - `id`: Unique recording identifier
   - `projectId`: Foreign key to SoundLabsProject
   - `name`: Recording name
   - `description`: Optional recording description
   - `s3Url`: Full S3 URL for the recording file
   - `s3Key`: S3 object key path
   - `fileSize`: Size in bytes
   - `duration`: Optional recording duration in seconds
   - `uploadStatus`: Status (PENDING, UPLOADING, COMPLETED, FAILED)
   - `uploadProgress`: Progress percentage (0-100)
   - `uploadError`: Optional error message if upload failed
   - `createdAt`, `updatedAt`: Timestamps

### API Endpoints

All endpoints require JWT authentication.

#### Project Management

**Create Project**
```
POST /api/v1/projects/soundlabs
Body: { name: string, description?: string, mixerState?: object }
Returns: SoundLabsProject
```

**List Projects**
```
GET /api/v1/projects/soundlabs
Returns: SoundLabsProject[]
```

**Get Project**
```
GET /api/v1/projects/soundlabs/:id
Returns: SoundLabsProject
```

**Update Project (Save Mixer State)**
```
PATCH /api/v1/projects/soundlabs/:id
Body: { name?: string, description?: string, mixerState?: object }
Returns: SoundLabsProject
```

**Delete Project**
```
DELETE /api/v1/projects/soundlabs/:id
Returns: { success: true, message: string }
```

#### Recording Management

**Upload Recording**
```
POST /api/v1/projects/soundlabs/:id/recordings
Headers: Content-Type: multipart/form-data
Body: 
  - file: WAV audio file
  - name?: string
  - description?: string
Returns: SoundLabsRecording
```

**List Recordings**
```
GET /api/v1/projects/soundlabs/:id/recordings
Returns: SoundLabsRecording[]
```

**Delete Recording**
```
DELETE /api/v1/projects/soundlabs/:id/recordings/:recordingId
Returns: { success: true, message: string }
```

## Backend Implementation

### S3Service (`packages/api/src/storage/s3.service.ts`)

Provides AWS S3 integration:

**Methods:**
- `uploadFile(key, buffer, options)` - Upload file from buffer
- `uploadStream(key, stream, contentType, onProgress)` - Upload from stream with progress
- `deleteFile(key)` - Delete file from S3
- `getPresignedDownloadUrl(key, expiresIn)` - Generate download link
- `getPresignedUploadUrl(key, contentType, expiresIn)` - Generate upload link
- `fileExists(key)` - Check if file exists
- `getFileMetadata(key)` - Get file metadata

**Features:**
- Automatic retry on upload failure
- Server-side encryption (AES256)
- Presigned URLs for direct upload/download
- Progress tracking for streams
- Error handling and logging

### ProjectsService (`packages/api/src/projects/projects.service.ts`)

Handles project persistence:

**SoundLabs Methods:**
- `createSoundLabsProject()` - Create new project
- `getSoundLabsProject()` - Get project with recordings
- `listSoundLabsProjects()` - List user's projects
- `updateSoundLabsProject()` - Update mixer state
- `deleteSoundLabsProject()` - Delete project and associated S3 files
- `createRecording()` - Create recording and upload to S3
- `listRecordings()` - List project recordings
- `deleteRecording()` - Delete recording from S3 and database

**Features:**
- User ownership validation (authorization checks)
- Automatic project size calculation
- Transactional deletion (removes both DB and S3 files)
- Error recovery and logging

### ProjectsController (`packages/api/src/projects/projects.controller.ts`)

REST endpoints with Swagger documentation:

**Features:**
- JWT authentication via `req.user.sub`
- File upload handling with NestJS `FileInterceptor`
- Input validation
- Error responses with appropriate HTTP status codes

## Frontend Implementation

### ProjectAPI Client (`apps/studio/lib/project-api.ts`)

TypeScript API client for backend communication:

**Methods:**
- `createProject()` - Create new project
- `getProject()` - Load project from cloud
- `listProjects()` - Get all projects
- `updateProject()` - Save mixer state
- `deleteProject()` - Delete project
- `uploadRecording()` - Upload audio with progress tracking
- `listRecordings()` - Get project recordings
- `deleteRecording()` - Delete recording

**Features:**
- Automatic JWT token management
- Error handling with typed responses
- XMLHttpRequest for upload progress tracking
- Configurable API base URL via env variable

### useCloudPersistence Hook (`apps/studio/hooks/useCloudPersistence.ts`)

React hook for cloud persistence management:

**State:**
- `isSaving` - Currently saving project
- `isLoading` - Currently loading project
- `isUploading` - Currently uploading recording
- `lastSynced` - Last successful sync timestamp
- `error` - Latest error message
- `uploadProgress` - Recording upload progress (0-100)
- `isOnline` - Network connectivity status

**Methods:**
- `initializeProject()` - Load or create project
- `saveProject()` - Save mixer state
- `debouncedSaveProject()` - Debounced save (3 seconds)
- `loadProject()` - Load project from cloud
- `uploadRecording()` - Upload audio recording
- `listProjects()` - Get all projects
- `deleteProject()` - Delete project
- `syncOfflineQueue()` - Process offline queue

**Features:**
- Automatic debouncing (3 second delay)
- Offline queue support (stores actions for sync when online)
- Network status detection (online/offline events)
- Automatic retry on failure (3 attempts with exponential backoff)
- State change detection (only saves if changed)
- Comprehensive error handling

## Environment Setup

### Backend Configuration

Update `.env` or `.env.production`:

```env
# AWS S3 Configuration
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=soundlabs-recordings
```

### Frontend Configuration

Update `.env.local` or `.env.production.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
# or for production:
# NEXT_PUBLIC_API_URL=https://api.wise2.net
```

## Database Migrations

Apply the migration to create new tables:

```bash
cd packages/db
npx prisma migrate deploy
# or for new migration:
npx prisma migrate dev --name soundlabs_cloud_storage
```

## S3 Setup

### AWS Console Configuration

1. Create S3 bucket:
   ```
   Bucket name: soundlabs-recordings
   Region: us-east-1
   ```

2. Configure CORS:
   ```json
   [
     {
       "AllowedHeaders": ["*"],
       "AllowedMethods": ["GET", "PUT", "POST"],
       "AllowedOrigins": ["https://studio.wise2.net"],
       "ExposeHeaders": ["ETag"],
       "MaxAgeSeconds": 3000
     }
   ]
   ```

3. Enable server-side encryption (AES256)

4. Set lifecycle policy for old files (optional):
   ```
   Transition to Glacier after 90 days
   Delete after 365 days
   ```

5. Create IAM user with S3 permissions:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Action": [
           "s3:GetObject",
           "s3:PutObject",
           "s3:DeleteObject",
           "s3:HeadObject"
         ],
         "Resource": "arn:aws:s3:::soundlabs-recordings/*"
       },
       {
         "Effect": "Allow",
         "Action": "s3:ListBucket",
         "Resource": "arn:aws:s3:::soundlabs-recordings"
       }
     ]
   }
   ```

### Alternative: MinIO for Development

For local development without AWS:

```yaml
# docker-compose.yml
minio:
  image: minio/minio
  ports:
    - "9000:9000"
    - "9001:9001"
  environment:
    MINIO_ROOT_USER: minioadmin
    MINIO_ROOT_PASSWORD: minioadmin
  command: server /data --console-address ":9001"
```

Configure S3Service to use MinIO:
```env
AWS_S3_ENDPOINT=http://localhost:9000
AWS_ACCESS_KEY_ID=minioadmin
AWS_SECRET_ACCESS_KEY=minioadmin
AWS_REGION=us-east-1
AWS_S3_BUCKET=soundlabs-recordings
```

## Integration with Studio App

### Using Cloud Persistence in Components

```typescript
import { useCloudPersistence } from '@/hooks/useCloudPersistence';
import { useAudioEngine } from '@/hooks/useAudioEngine';

export function StudioPage() {
  const { state: audioState, tracks, mixer, playback, masterVolume, bpm } = useAudioEngine();
  const { 
    state: cloudState,
    debouncedSaveProject,
    uploadRecording,
    listProjects
  } = useCloudPersistence();

  // Auto-save on state changes
  useEffect(() => {
    if (projectId && tracks.length > 0) {
      debouncedSaveProject(
        projectId,
        projectName,
        tracks,
        mixer,
        playback,
        masterVolume,
        bpm
      );
    }
  }, [tracks, mixer, masterVolume, bpm]);

  // Load project on mount
  useEffect(() => {
    const loadProject = async () => {
      await initializeProject(projectId, projectName);
    };
    loadProject();
  }, [projectId]);

  return (
    <div>
      {cloudState.isSaving && <Spinner />}
      {cloudState.error && <ErrorAlert message={cloudState.error} />}
      {cloudState.isUploading && (
        <ProgressBar value={cloudState.uploadProgress} />
      )}
    </div>
  );
}
```

### Recording Upload UI

```typescript
async function handleRecordingExport(wavBuffer: ArrayBuffer, name: string) {
  const recording = await uploadRecording(
    projectId,
    wavBuffer,
    name,
    `Recorded at ${new Date().toLocaleString()}`
  );

  if (recording) {
    console.log('Recording saved:', recording.s3Url);
    setRecordings([...recordings, recording]);
  }
}
```

## Security Considerations

1. **Authentication**: All endpoints require JWT token
2. **Authorization**: User ownership validated before access
3. **S3 Encryption**: Server-side encryption enabled
4. **CORS**: Restricted to specific origins
5. **File Validation**: Content-type checked on upload
6. **Size Limits**: Request size limits configured in NestJS
7. **Error Messages**: Sensitive info not exposed in responses

## Performance Optimization

1. **Debounced Saves**: 3-second debounce reduces API calls
2. **Change Detection**: Only saves if mixer state changed
3. **Retry Logic**: 3 attempts with exponential backoff
4. **Progress Tracking**: Real-time upload progress for UX
5. **Offline Support**: Queue system for offline operation
6. **Database Indexes**: Created on userId and projectId

## Testing

### Backend Tests

```bash
cd packages/api
npm test -- projects

# Test project creation
POST /api/v1/projects/soundlabs
Authorization: Bearer <token>
Body: { "name": "Test Project" }

# Test mixer state save
PATCH /api/v1/projects/soundlabs/<id>
Authorization: Bearer <token>
Body: { "mixerState": { "tracks": [...], "bpm": 120 } }

# Test recording upload
POST /api/v1/projects/soundlabs/<id>/recordings
Authorization: Bearer <token>
Content-Type: multipart/form-data
Body: { "file": <audio file>, "name": "Recording 1" }
```

### Frontend Tests

```bash
cd apps/studio
npm test -- useCloudPersistence

# Test project creation
const { result } = renderHook(() => useCloudPersistence());
await act(async () => {
  await result.current.initializeProject('project-1', 'My Project');
});

# Test save
await act(async () => {
  const success = await result.current.saveProject(
    'project-1',
    'My Project',
    tracks,
    mixer,
    playback,
    0.8,
    120
  );
});
```

## Troubleshooting

### S3 Upload Fails
1. Check AWS credentials in `.env`
2. Verify bucket name and region
3. Ensure bucket CORS policy allows the origin
4. Check IAM permissions
5. Verify S3 service is running (if using MinIO)

### Database Connection Issues
1. Ensure PostgreSQL is running
2. Check DATABASE_URL in `.env`
3. Run migrations: `npx prisma migrate deploy`
4. Check Prisma logs: `DEBUG=* npm run dev`

### Auth Token Issues
1. Verify JWT_SECRET is set
2. Check token is stored in localStorage
3. Ensure Authorization header is sent
4. Verify token hasn't expired

### Upload Progress Not Showing
1. Check XMLHttpRequest.upload events
2. Verify Content-Length header is set
3. Ensure backend is responding to upload progress
4. Check browser console for errors

## Migration from LocalStorage

For existing users with localStorage projects:

```typescript
async function migrateLocalStorageProjects() {
  const localProjects = getLocalStorageProjects();
  
  for (const localProject of localProjects) {
    // Create in cloud
    const cloudProject = await ProjectAPI.createProject(
      localProject.name,
      localProject.description,
      localProject.mixerState
    );
    
    // Upload recordings
    for (const recording of localProject.recordings || []) {
      await ProjectAPI.uploadRecording(
        cloudProject.id,
        recording.buffer,
        recording.name
      );
    }
    
    // Delete from localStorage
    localStorage.removeItem(localProject.id);
  }
}
```

## Maintenance

### Regular Tasks

1. **Monitor S3 Usage**: Check billing and storage
2. **Cleanup Old Files**: Use S3 lifecycle policies
3. **Database Backups**: Daily backups of PostgreSQL
4. **Log Analysis**: Monitor API errors
5. **Performance**: Track save/upload times

### Scaling Considerations

1. **S3 Partitioning**: Use prefixes for organization
2. **Database Indexes**: Add on frequent queries
3. **Caching**: Redis for project metadata
4. **CDN**: CloudFront for recording downloads
5. **Replication**: Multi-region S3 buckets

## Future Enhancements

1. **Collaboration**: Multiple users per project
2. **Version Control**: Project history/snapshots
3. **Compression**: GZIP mixer state before storage
4. **Analytics**: Track project creation/usage
5. **Sharing**: Presigned URLs for sharing recordings
6. **Archival**: Move old projects to Glacier
7. **Real-time Sync**: WebSocket for live updates
8. **Conflict Resolution**: Merge mixer state changes

## Support

For issues or questions:
1. Check CloudWatch logs
2. Review Prisma query logs
3. Test endpoints with curl/Postman
4. Check network tab in browser devtools
5. Review implementation in SOUNDLABS_CLOUD_STORAGE.md
