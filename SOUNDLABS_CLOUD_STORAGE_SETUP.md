# SoundLabs Cloud Storage - Quick Setup Guide

## What Was Implemented

Cloud storage for SoundLabs projects using PostgreSQL and Amazon S3:

1. **Backend API Endpoints** - CRUD operations for projects and recordings
2. **S3 Integration** - Upload/download audio recordings from S3
3. **Database Schema** - New tables for SoundLabsProject and SoundLabsRecording
4. **Frontend Client** - TypeScript API client for backend communication
5. **React Hook** - `useCloudPersistence` for managing cloud sync in components
6. **Authentication** - JWT-based access control with user ownership validation

## Files Created/Modified

### Backend

**Created:**
- `/packages/api/src/storage/s3.service.ts` - AWS S3 service
- `/packages/db/prisma/migrations/soundlabs_cloud_storage/migration.sql` - Database migration

**Modified:**
- `/packages/api/src/projects/projects.service.ts` - Added cloud methods (was using mock storage)
- `/packages/api/src/projects/projects.controller.ts` - Added SoundLabs endpoints
- `/packages/api/src/projects/projects.module.ts` - Added S3Service
- `/packages/api/package.json` - Added aws-sdk dependency

### Frontend

**Created:**
- `/apps/studio/lib/project-api.ts` - API client
- `/apps/studio/hooks/useCloudPersistence.ts` - React hook for cloud sync

### Configuration

**Modified:**
- `.env.example` - Added AWS configuration template
- `.env.production` - Added AWS S3 configuration

### Documentation

**Created:**
- `/SOUNDLABS_CLOUD_STORAGE.md` - Comprehensive implementation guide
- `/SOUNDLABS_CLOUD_STORAGE_SETUP.md` - This file

## Step 1: Environment Configuration

### Local Development

Update `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api

# Use MinIO for local S3 testing (optional)
AWS_S3_ENDPOINT=http://localhost:9000
AWS_ACCESS_KEY_ID=minioadmin
AWS_SECRET_ACCESS_KEY=minioadmin
AWS_REGION=us-east-1
AWS_S3_BUCKET=soundlabs-recordings
```

### Production

Update `.env.production`:
```env
AWS_ACCESS_KEY_ID=<your-aws-access-key>
AWS_SECRET_ACCESS_KEY=<your-aws-secret>
AWS_REGION=us-east-1
AWS_S3_BUCKET=soundlabs-recordings
NEXT_PUBLIC_API_URL=https://api.wise2.net
```

## Step 2: Install Dependencies

```bash
# Install aws-sdk in API package
cd packages/api
npm install aws-sdk@^2.1500.0
npm install

# Install in studio if needed
cd ../../apps/studio
npm install
```

## Step 3: Database Migration

```bash
# Navigate to db package
cd packages/db

# Run migration to create new tables
npx prisma migrate deploy

# Or create and apply migration
npx prisma migrate dev --name soundlabs_cloud_storage

# Generate Prisma Client
npx prisma generate
```

Verify migration:
```bash
# Check that tables were created
npx prisma db push --skip-generate
```

## Step 4: AWS S3 Setup (Production)

### Create S3 Bucket

```bash
# Using AWS CLI
aws s3 mb s3://soundlabs-recordings --region us-east-1
```

### Create IAM User

```bash
# Create user
aws iam create-user --user-name soundlabs-app

# Create access key
aws iam create-access-key --user-name soundlabs-app

# Attach policy
aws iam put-user-policy --user-name soundlabs-app \
  --policy-name SoundLabsS3Access \
  --policy-document '{
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
  }'
```

### Configure CORS

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST"],
    "AllowedOrigins": ["https://studio.wise2.net", "https://wise2.net"],
    "ExposeHeaders": ["ETag", "x-amz-meta-custom-header"],
    "MaxAgeSeconds": 3000
  }
]
```

## Step 5: Local Development with MinIO (Optional)

For testing without AWS credentials:

```bash
# Add to docker-compose.yml or docker-compose.dev.yml
minio:
  image: minio/minio:latest
  ports:
    - "9000:9000"
    - "9001:9001"
  environment:
    MINIO_ROOT_USER: minioadmin
    MINIO_ROOT_PASSWORD: minioadmin
  command: server /data --console-address ":9001"
  volumes:
    - minio_data:/data

volumes:
  minio_data:
```

Then start MinIO:
```bash
docker-compose up -d minio

# Access at http://localhost:9001
# Username: minioadmin
# Password: minioadmin
```

## Step 6: Test the Implementation

### Test Project Creation

```bash
curl -X POST http://localhost:3001/api/v1/projects/soundlabs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-jwt-token>" \
  -d '{
    "name": "My Test Project",
    "description": "Test project",
    "mixerState": {
      "tracks": [],
      "masterVolume": 0.8,
      "bpm": 120
    }
  }'
```

### Test Save Mixer State

```bash
curl -X PATCH http://localhost:3001/api/v1/projects/soundlabs/<project-id> \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-jwt-token>" \
  -d '{
    "mixerState": {
      "tracks": [
        {
          "id": "track-1",
          "name": "Drums",
          "volume": 0.9,
          "pan": 0,
          "isMuted": false,
          "isSolo": false
        }
      ],
      "masterVolume": 0.8,
      "bpm": 120
    }
  }'
```

### Test Recording Upload

```bash
curl -X POST http://localhost:3001/api/v1/projects/soundlabs/<project-id>/recordings \
  -H "Authorization: Bearer <your-jwt-token>" \
  -F "file=@recording.wav" \
  -F "name=Test Recording" \
  -F "description=Test description"
```

## Step 7: Integrate with Studio Components

### Usage in Studio Page

```typescript
import { useCloudPersistence } from '@/hooks/useCloudPersistence';
import { useAudioEngine } from '@/hooks/useAudioEngine';

export function StudioPage() {
  const { state: audioState, tracks, mixer, playback, masterVolume, bpm } = useAudioEngine();
  const { 
    state: cloudState,
    initializeProject,
    debouncedSaveProject,
    uploadRecording,
    listProjects
  } = useCloudPersistence();

  // Initialize project on mount
  useEffect(() => {
    const projectId = router.query.projectId as string;
    if (projectId) {
      initializeProject(projectId, 'My Project');
    }
  }, []);

  // Auto-save mixer state
  useEffect(() => {
    if (tracks.length > 0) {
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
  }, [tracks, masterVolume, bpm]);

  // Save recording
  async function saveRecording(wavBuffer: ArrayBuffer) {
    const recording = await uploadRecording(
      projectId,
      wavBuffer,
      'Recording 1'
    );
    if (recording) {
      console.log('Saved to S3:', recording.s3Url);
    }
  }

  return (
    <div>
      {cloudState.isSaving && <div>Saving...</div>}
      {cloudState.error && <div>Error: {cloudState.error}</div>}
      {cloudState.isUploading && (
        <div>Uploading {cloudState.uploadProgress}%</div>
      )}
    </div>
  );
}
```

## Step 8: TypeScript Types

Types are automatically generated from Prisma schema:

```bash
cd packages/db
npx prisma generate
```

The generated types are available in `@prisma/client`:

```typescript
import type {
  SoundLabsProject,
  SoundLabsRecording,
  UploadStatus
} from '@prisma/client';

interface ProjectWithRecordings extends SoundLabsProject {
  recordings: SoundLabsRecording[];
}
```

## Step 9: Build and Deploy

### Build Backend

```bash
cd packages/api
npm run build
npm start
```

### Build Frontend

```bash
cd apps/studio
npm run build
npm start
```

### Build with Docker

```bash
# Backend
docker build -f packages/api/Dockerfile -t wise2-api:latest packages/api/

# Frontend
docker build -f apps/studio/Dockerfile -t wise2-studio:latest apps/studio/
```

## Verification Checklist

- [ ] Environment variables configured (AWS credentials or MinIO endpoint)
- [ ] Database migration applied (`npx prisma migrate deploy`)
- [ ] Backend API server running (`npm run dev` in packages/api)
- [ ] Frontend dev server running (`npm run dev` in apps/studio)
- [ ] S3/MinIO bucket created and accessible
- [ ] Project creation endpoint responds successfully
- [ ] Mixer state saves to database
- [ ] Recording upload to S3 succeeds
- [ ] Recording retrieval works (can fetch via s3Url)
- [ ] Authorization checks working (user can't access others' projects)

## Common Issues

### "No AWS credentials found"
- Check AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY in .env
- For MinIO, use AWS_S3_ENDPOINT

### Database migration fails
- Ensure PostgreSQL is running
- Check DATABASE_URL connection string
- Run `npx prisma db push` if schema is out of sync

### S3 upload fails
- Check bucket name and region
- Verify CORS configuration
- Check IAM permissions
- Look at CloudWatch logs in AWS console

### Files created but can't download
- Verify S3 bucket is publicly readable (check policy)
- Check CloudFront distribution if using CDN
- Try presigned URL: `await s3Service.getPresignedDownloadUrl(key)`

## Next Steps

1. **Test with real audio data**: Record WAV files and upload to S3
2. **Add versioning**: Store project snapshots for undo/redo
3. **Implement sharing**: Generate presigned URLs for sharing recordings
4. **Monitor performance**: Track save/upload times and optimize
5. **Add analytics**: Log project creation, recording uploads, etc.

## Support

For detailed implementation info, see:
- `/SOUNDLABS_CLOUD_STORAGE.md` - Complete architecture and API docs
- `/packages/api/src/projects/` - Backend implementation
- `/apps/studio/lib/project-api.ts` - Frontend API client
- `/apps/studio/hooks/useCloudPersistence.ts` - React hook implementation

## Files Reference

| File | Purpose |
|------|---------|
| `packages/api/src/storage/s3.service.ts` | AWS S3 integration |
| `packages/api/src/projects/projects.service.ts` | Project business logic |
| `packages/api/src/projects/projects.controller.ts` | REST endpoints |
| `apps/studio/lib/project-api.ts` | Frontend API client |
| `apps/studio/hooks/useCloudPersistence.ts` | Cloud sync React hook |
| `packages/db/prisma/schema.prisma` | Database schema |
| `SOUNDLABS_CLOUD_STORAGE.md` | Full documentation |
