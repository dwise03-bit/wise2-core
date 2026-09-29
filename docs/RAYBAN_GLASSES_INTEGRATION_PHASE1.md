# WISE² Ray-Ban Meta Glasses Integration — Phase 1: Capture & Upload

**Phase**: 1 of 3  
**Status**: Design & Implementation  
**Timeline**: 2-3 days to production  
**Target Users**: Field technicians with Ray-Ban Meta glasses

---

## Phase 1 Overview: Photo/Video Capture & Auto-Upload

Technicians capture job site documentation through Ray-Ban Meta glasses. Photos and videos automatically upload to WISE² with metadata (timestamp, location, job ID, technician ID).

### What Technicians Can Do
1. **Hands-free capture** — Tap glasses frame or use voice to capture
2. **Live documentation** — Photos/video stream to job record in real-time
3. **Automatic metadata** — Timestamp, geolocation, job context
4. **Dashboard review** — Supervisors see captured media in job details
5. **Evidence trail** — Timestamped documentation for compliance

### System Architecture

```
Ray-Ban Meta Glasses
    ↓ (WiFi/LTE)
Ray-Ban Companion App (iOS/Android)
    ↓ (Queues captures locally)
WISE² Backend API
    ↓ (POST /jobs/:jobId/media)
PostgreSQL (stores metadata)
S3/Storage (stores files)
    ↓ (CDN delivery)
Dashboard (view media)
FieldTech App (on-site access)
```

---

## Phase 1 Implementation Plan

### Step 1: Backend API Endpoints (NestJS)

Create new module: `packages/api/src/jobs/job-media.controller.ts`

**Endpoints**:

```typescript
// Upload photo or video to job
POST /api/jobs/:jobId/media
  Body: {
    file: File (multipart/form-data),
    mediaType: "photo" | "video",
    timestamp: ISO8601,
    latitude?: number,
    longitude?: number,
    caption?: string,
    glasses_device_id?: string
  }
  Response: {
    mediaId: string,
    jobId: string,
    url: string,
    uploadedAt: timestamp
  }

// List all media for a job
GET /api/jobs/:jobId/media
  Response: {
    media: [
      {
        id: string,
        type: "photo" | "video",
        url: string,
        thumbnail?: string,
        uploadedAt: timestamp,
        caption?: string,
        location?: { lat, lng }
      }
    ]
  }

// Delete media from job
DELETE /api/jobs/:jobId/media/:mediaId
  Response: { success: true }

// Stream live video (WebRTC setup)
POST /api/jobs/:jobId/stream/start
  Response: {
    streamId: string,
    rtcServer: "wss://...",
    iceServers: [...]
  }

POST /api/jobs/:jobId/stream/stop
  Response: { success: true }
```

### Step 2: Database Schema

**New tables**:

```sql
-- Job Media
CREATE TABLE job_media (
  id UUID PRIMARY KEY,
  job_id UUID NOT NULL REFERENCES jobs(id),
  technician_id UUID NOT NULL,
  media_type ENUM('photo', 'video'),
  file_url TEXT NOT NULL,
  thumbnail_url TEXT,
  file_size_bytes INT,
  duration_seconds INT,  -- for videos
  caption TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  glasses_device_id VARCHAR(255),  -- Ray-Ban device serial
  uploaded_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP  -- soft delete
);

CREATE INDEX idx_job_media_job_id ON job_media(job_id);
CREATE INDEX idx_job_media_technician_id ON job_media(technician_id);
CREATE INDEX idx_job_media_uploaded_at ON job_media(uploaded_at);

-- Media Storage Config
CREATE TABLE media_storage_config (
  id UUID PRIMARY KEY,
  job_id UUID NOT NULL,
  storage_provider ENUM('s3', 'local', 'azure'),
  s3_bucket VARCHAR(255),
  access_level ENUM('private', 'team', 'public'),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Step 3: Storage Integration

**Support multiple backends**:

```typescript
// packages/api/src/storage/media-storage.service.ts

interface MediaStorageConfig {
  provider: 's3' | 'local' | 'azure';
  bucket: string;
  region?: string;
  accessLevel: 'private' | 'team' | 'public';
}

class MediaStorageService {
  // Upload file with retry logic
  async uploadMedia(
    jobId: string,
    file: Express.Multer.File,
    metadata: MediaMetadata
  ): Promise<{ url: string; thumbnailUrl?: string }> {
    // Implementation varies by provider
  }

  // Generate secure URL with expiration
  async getMediaUrl(
    mediaId: string,
    expiresIn?: number
  ): Promise<string> {
    // Returns signed URL (S3) or direct URL (local)
  }

  // Generate thumbnail for video
  async generateThumbnail(
    videoPath: string
  ): Promise<string> {
    // Uses ffmpeg
  }

  // Delete file
  async deleteMedia(mediaId: string): Promise<void> {}
}
```

### Step 4: Ray-Ban Glasses Companion App

**Platform**: iOS (native Swift) / Android (native Kotlin)

**Technology**: Meta Glasses SDK

**Core Features**:

```swift
// iOS Example (Swift)

class RayBanGlassesManager {
  // Connect to glasses
  func connectToGlasses() async throws {
    let connection = try await RayBanConnection.shared.connect()
    self.glassesDevice = connection
  }

  // Listen for photo captures
  func startListeningForCaptures(jobId: String) {
    glassesDevice?.onPhotoCaptured { image, metadata in
      self.queueForUpload(image, jobId: jobId, metadata: metadata)
    }
  }

  // Listen for video captures
  func startListeningForVideoCaptures(jobId: String) {
    glassesDevice?.onVideoRecording { videoPath, metadata in
      self.queueForUpload(videoPath, jobId: jobId, metadata: metadata)
    }
  }

  // Queue media for upload (handles offline)
  func queueForUpload(
    _ media: Any,
    jobId: String,
    metadata: CaptureMetadata
  ) {
    let uploadTask = MediaUploadTask(
      media: media,
      jobId: jobId,
      timestamp: metadata.timestamp,
      location: metadata.location,
      deviceId: metadata.glassesDeviceId
    )
    uploadQueue.append(uploadTask)
    
    // Try upload immediately if online
    if isConnected {
      uploadMedia(uploadTask)
    }
  }

  // Upload with retry & progress
  @MainActor
  func uploadMedia(_ task: MediaUploadTask) async {
    let progress = Progress()
    
    do {
      let response = try await api.uploadJobMedia(
        jobId: task.jobId,
        file: task.media,
        metadata: task.toDTO(),
        progress: progress
      )
      
      // Mark as uploaded
      uploadQueue.removeAll { $0.id == task.id }
      NotificationCenter.default.post(
        name: NSNotification.Name("MediaUploaded"),
        object: response
      )
    } catch {
      // Retry with exponential backoff
      task.retryCount += 1
      if task.retryCount < 5 {
        DispatchQueue.main.asyncAfter(
          deadline: .now() + pow(2, Double(task.retryCount))
        ) {
          Task { await self.uploadMedia(task) }
        }
      }
    }
  }
}
```

### Step 5: FieldTech iOS App Integration

**New UI Component**: `MediaCaptureView`

```swift
struct MediaCaptureView: View {
  @StateObject private var glassesManager = RayBanGlassesManager()
  @State private var capturedMedia: [JobMedia] = []
  @State private var isUploading = false

  var body: some View {
    VStack {
      // Glasses status
      HStack {
        Circle()
          .fill(glassesManager.isConnected ? .green : .gray)
          .frame(width: 12, height: 12)
        Text(glassesManager.isConnected ? 
          "Glasses Connected" : "Glasses Disconnected")
      }
      .padding()

      // Captured media grid
      ScrollView {
        LazyVGrid(
          columns: [GridItem(.adaptive(minimum: 150))],
          spacing: 12
        ) {
          ForEach(capturedMedia) { media in
            MediaThumbnail(media: media)
              .contextMenu {
                Button("Delete") {
                  delete(media)
                }
                Button("Add Caption") {
                  addCaption(media)
                }
              }
          }
        }
        .padding()
      }

      // Upload status
      if isUploading {
        ProgressView()
          .padding()
      }

      // Start capture button
      Button(action: { glassesManager.startListeningForCaptures(jobId: jobId) }) {
        Label("Start Capturing", systemImage: "video.circle")
          .frame(maxWidth: .infinity)
          .padding()
          .background(Color.blue)
          .foregroundColor(.white)
          .cornerRadius(8)
      }
      .padding()
    }
  }

  func delete(_ media: JobMedia) {
    Task {
      try await api.deleteJobMedia(jobId: jobId, mediaId: media.id)
      capturedMedia.removeAll { $0.id == media.id }
    }
  }

  func addCaption(_ media: JobMedia) {
    // Sheet for caption input
  }
}
```

### Step 6: Dashboard Integration

**Job Detail View Enhancement**:

```typescript
// apps/dashboard/app/components/jobs/JobMediaGallery.tsx

export function JobMediaGallery({ jobId }: { jobId: string }) {
  const [media, setMedia] = useState<JobMedia[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchJobMedia();
  }, [jobId]);

  async function fetchJobMedia() {
    const response = await fetch(`/api/jobs/${jobId}/media`);
    const data = await response.json();
    setMedia(data.media);
    setIsLoading(false);
  }

  if (isLoading) {
    return <MediaGallerySkeleton />;
  }

  return (
    <div className="grid grid-cols-4 gap-4">
      {media.map((item) => (
        <MediaCard
          key={item.id}
          item={item}
          onDelete={() => handleDelete(item.id)}
        />
      ))}
    </div>
  );
}

interface MediaCard {
  type: 'photo' | 'video';
  url: string;
  thumbnail: string;
  uploadedAt: string;
  caption?: string;
  location?: { lat: number; lng: number };
  // Click to view full size
  // Hover to show caption
  // Context menu for delete/share
}
```

### Step 7: Real-Time Notifications

**Discord Integration**:

```typescript
// When media is uploaded to a job

async function notifyMediaUpload(media: JobMedia) {
  const embed = {
    title: `📸 New ${media.mediaType} captured on Job #${media.jobId}`,
    description: media.caption || 'No caption',
    image: {
      url: media.thumbnailUrl || media.url
    },
    fields: [
      { name: 'Technician', value: media.technicianName, inline: true },
      { name: 'Time', value: formatTime(media.uploadedAt), inline: true },
      ...(media.location ? [
        { name: 'Location', value: `${media.location.lat.toFixed(4)}, ${media.location.lng.toFixed(4)}` }
      ] : [])
    ],
    footer: { text: 'Ray-Ban Meta Glasses Capture' },
    color: 0x3498db
  };

  await discordService.sendWebhook('JOB_MEDIA_WEBHOOK', embed);
}
```

---

## Implementation Checklist

### Backend (3-4 hours)
- [ ] Create `job-media.controller.ts` with 4 endpoints
- [ ] Create `job-media.service.ts` with upload logic
- [ ] Create `media-storage.service.ts` for S3/local
- [ ] Add database migrations
- [ ] Add tests (20+ test cases)
- [ ] Integrate with Discord webhooks
- [ ] Deploy to production

### Mobile App (4-6 hours)
- [ ] Set up Meta Glasses SDK
- [ ] Create `RayBanGlassesManager` class
- [ ] Implement photo/video capture listeners
- [ ] Implement upload queue with retry logic
- [ ] Add to FieldTech iOS app
- [ ] Test on physical Ray-Ban glasses
- [ ] Handle offline scenarios

### Dashboard (2-3 hours)
- [ ] Create `JobMediaGallery` component
- [ ] Add to job detail view
- [ ] Implement delete/caption UI
- [ ] Add location map display
- [ ] Implement image lightbox viewer
- [ ] Test responsive design

### Testing (2 hours)
- [ ] Unit tests (services)
- [ ] Integration tests (API)
- [ ] End-to-end test (glasses → upload → dashboard)
- [ ] Load testing (multiple technicians)
- [ ] Offline/retry scenarios

### Deployment (1 hour)
- [ ] Database migrations
- [ ] Storage backend setup
- [ ] API deployment
- [ ] Dashboard rebuild
- [ ] Mobile app build & deploy
- [ ] Production smoke tests

---

## Technical Details

### Ray-Ban Meta Glasses SDK

**Features**:
- Photo capture (`capturePhoto()`)
- Video recording (`startRecording()`)
- Location data (GPS)
- Device serial/ID
- Battery level
- WiFi/network status

**Integration Points**:
```typescript
import RayBanGlasses from '@meta/rayban-sdk';

const glasses = new RayBanGlasses();

// Photo
glasses.onPhotoCaptured((image: ArrayBuffer, metadata: Metadata) => {
  // Handle photo
});

// Video
glasses.onVideoRecording((chunk: ArrayBuffer, metadata: Metadata) => {
  // Handle streaming video
});

// Location
glasses.getLocation().then(({ lat, lng }) => {
  // Handle location
});
```

### Storage Options

| Provider | Cost | Speed | Pros | Cons |
|----------|------|-------|------|------|
| **S3** | $0.023/GB/month | Fastest | Scalable, CDN | Setup complexity |
| **Local** | Disk only | Medium | Simple, free | Limited scalability |
| **Azure** | $0.02/GB/month | Fast | Enterprise | Compliance heavy |

**Recommendation**: Start with S3, fallback to local for testing

### File Size Handling

- **Photos**: 2-8 MB (JPEG compressed)
- **Videos**: 50-200 MB (depends on resolution)
- **Streaming**: Real-time chunks (1-5 MB chunks)

**Optimization**:
- Client-side compression before upload
- Thumbnail generation on server
- Video transcoding for bandwidth efficiency

---

## Rollout Strategy

### Week 1: Internal Testing
- Deploy to staging
- Test with 2-3 technicians
- Capture feedback
- Fix bugs

### Week 2: Beta Release
- Roll out to 10% of technicians
- Monitor performance
- Collect usage data
- Optimize uploads

### Week 3: Production Release
- Full rollout to all technicians
- Training & documentation
- Monitor performance
- Phase 2 planning

---

## Phase 2 Preview (Not in Phase 1)

- **Live streaming** to dashboard
- **AR annotations** on field site
- **Real-time collaboration** with remote experts
- **Automated damage detection** using CV
- **Voice commands** for hands-free operation

---

## Success Metrics

- ✅ 95%+ upload success rate
- ✅ Average upload time < 30 seconds
- ✅ Offline queue handles 100+ captures
- ✅ Dashboard loads gallery in < 2 seconds
- ✅ Zero data loss (even with network interruptions)
- ✅ Technician adoption > 80% in month 1

---

**Phase 1 Status**: Ready for implementation  
**Estimated Timeline**: 5-7 working days to production  
**Dependencies**: Meta Glasses SDK access, S3 setup  
**Next Phase**: Live streaming integration
