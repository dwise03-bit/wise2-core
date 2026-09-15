# WISE² Ray-Ban Meta Glasses Integration — Phase 2: Live Streaming

**Phase**: 2 of 3  
**Status**: Design & Implementation  
**Timeline**: 4-5 days to production  
**Builds On**: Phase 1 (Photo/Video Capture)

---

## Phase 2 Overview: Live Streaming & Remote Guidance

Technicians stream live video from Ray-Ban glasses to WISE² dashboard. Supervisors can watch in real-time, annotate overlays, guide technicians remotely, and record sessions for training.

### What Supervisors Can Do
1. **Watch live video** — Real-time job site view
2. **Draw annotations** — Circle problem areas, point to solutions
3. **Voice guidance** — Talk technician through steps (2-way audio)
4. **Record session** — Auto-save for training/compliance
5. **Screenshot capture** — Save key moments for documentation
6. **Multi-viewer** — Up to 10 supervisors watching simultaneously
7. **Performance metrics** — Latency, bandwidth, stream quality

### System Architecture

```
Ray-Ban Glasses (Video Stream)
    ↓ (WebRTC via 4G/WiFi)
iOS App (FieldTech)
    ↓ (Signaling via HTTPS)
WISE² WebRTC Server (Janus/Mediasoup)
    ↓ (SFU - Selective Forwarding)
Dashboard (Multiple Supervisors)
    ↓ (Recording)
PostgreSQL + S3 (Video Archive)
```

---

## Phase 2 Implementation Plan

### Step 1: WebRTC Streaming Infrastructure

**Server**: Mediasoup (lightweight, low-latency SFU)

```typescript
// packages/api/src/streaming/mediasoup.service.ts

@Injectable()
export class MediasoupService {
  private worker: mediasoup.types.Worker;
  private routers: Map<string, mediasoup.types.Router> = new Map();
  private producers: Map<string, mediasoup.types.Producer> = new Map();
  private consumers: Map<string, mediasoup.types.Consumer> = new Map();

  async onModuleInit() {
    // Create worker with optimized settings
    this.worker = await mediasoup.createWorker({
      logLevel: 'warn',
      logTags: ['rtp', 'rtcp', 'srtp', 'bwe'],
      rtcMinPort: 40000,
      rtcMaxPort: 49999,
    });

    this.worker.on('died', () => {
      console.error('Mediasoup worker died');
      this.onModuleInit();  // Restart
    });
  }

  // Create router for job streaming session
  async createRouter(jobId: string): Promise<mediasoup.types.Router> {
    const mediaCodecs: mediasoup.types.RtpCodecCapability[] = [
      {
        kind: 'video',
        mimeType: 'video/VP9',
        clockRate: 90000,
        parameters: {
          'profile-id': 2,
        },
      },
      {
        kind: 'video',
        mimeType: 'video/H264',
        clockRate: 90000,
        parameters: {
          'profile-level-id': '42e01f',
        },
      },
      {
        kind: 'audio',
        mimeType: 'audio/opus',
        clockRate: 48000,
        channels: 2,
      },
    ];

    const router = await this.worker.createRouter({ mediaCodecs });
    this.routers.set(jobId, router);
    return router;
  }

  // Producer: Glasses stream incoming
  async createProducer(
    jobId: string,
    rtpParameters: mediasoup.types.RtpSendParameters
  ): Promise<mediasoup.types.Producer> {
    const router = this.routers.get(jobId);
    if (!router) throw new Error('Router not found');

    const producer = await router.createPlainRtpTransport({
      listenIp: { ip: '0.0.0.0', announcedIp: process.env.RTC_SERVER_IP },
      rtcpMux: true,
    }).then(transport => 
      transport.produce({
        kind: 'video',
        rtpParameters,
      })
    );

    this.producers.set(`${jobId}:producer`, producer);
    return producer;
  }

  // Consumer: Dashboard viewer consuming stream
  async createConsumer(
    jobId: string,
    supervisorId: string,
    dtlsParameters: mediasoup.types.DtlsParameters
  ): Promise<mediasoup.types.Consumer> {
    const router = this.routers.get(jobId);
    const producer = this.producers.get(`${jobId}:producer`);
    
    if (!router || !producer) throw new Error('Router or producer not found');

    const transport = await router.createWebRtcTransport({
      listenIps: [{ ip: '0.0.0.0', announcedIp: process.env.RTC_SERVER_IP }],
      enableUdp: true,
      enableTcp: true,
      preferUdp: true,
    });

    await transport.connect({ dtlsParameters });

    const consumer = await router.consume({
      producerId: producer.id,
      rtpCapabilities: {} as any,  // Simplified
      paused: false,
    });

    this.consumers.set(`${supervisorId}:${jobId}`, consumer);
    return consumer;
  }

  // Get stream stats (latency, bandwidth, quality)
  async getStreamStats(jobId: string): Promise<StreamStats> {
    const producer = this.producers.get(`${jobId}:producer`);
    if (!producer) throw new Error('Producer not found');

    const stats = await producer.getStats();
    
    return {
      videoBitrate: stats[0]?.bitrate || 0,
      framesPerSecond: stats[0]?.framesPerSecond || 0,
      resolution: stats[0]?.width && stats[0]?.height 
        ? `${stats[0].width}x${stats[0].height}`
        : '0x0',
      roundTripTime: stats[0]?.roundTripTime || 0,
      jitter: stats[0]?.jitter || 0,
    };
  }

  async closeStream(jobId: string) {
    const router = this.routers.get(jobId);
    if (router) {
      await router.close();
      this.routers.delete(jobId);
    }
  }
}

interface StreamStats {
  videoBitrate: number;
  framesPerSecond: number;
  resolution: string;
  roundTripTime: number;
  jitter: number;
}
```

### Step 2: Streaming API Endpoints

```typescript
// packages/api/src/streaming/streaming.controller.ts

@Controller('jobs/:jobId/stream')
@UseGuards(JwtAuthGuard)
export class StreamingController {
  constructor(
    private readonly streamingService: StreamingService,
    private readonly mediasoup: MediasoupService
  ) {}

  /**
   * Technician initiates stream
   * POST /api/jobs/:jobId/stream/start
   */
  @Post('start')
  async startStream(
    @Param('jobId') jobId: string,
    @Body('rtpParameters') rtpParameters: any,
    @Req() req: Request
  ): Promise<StreamSessionDto> {
    const technicianId = getTechnicianId(req);
    const session = await this.streamingService.createStreamSession(
      jobId,
      technicianId,
      rtpParameters
    );
    return session;
  }

  /**
   * Supervisor joins stream viewer
   * POST /api/jobs/:jobId/stream/subscribe
   */
  @Post('subscribe')
  async subscribeToStream(
    @Param('jobId') jobId: string,
    @Body('dtlsParameters') dtlsParameters: any,
    @Req() req: Request
  ): Promise<SubscriptionDto> {
    const supervisorId = getSupervisorId(req);
    const consumer = await this.streamingService.subscribeToStream(
      jobId,
      supervisorId,
      dtlsParameters
    );
    return { consumerId: consumer.id, params: consumer.rtpParameters };
  }

  /**
   * Supervisor sends annotation (drawing)
   * POST /api/jobs/:jobId/stream/annotate
   */
  @Post('annotate')
  async addAnnotation(
    @Param('jobId') jobId: string,
    @Body() annotation: AnnotationDto
  ): Promise<void> {
    await this.streamingService.broadcastAnnotation(jobId, annotation);
  }

  /**
   * Send voice audio from supervisor to technician
   * POST /api/jobs/:jobId/stream/audio/send
   */
  @Post('audio/send')
  @UseInterceptors(FileInterceptor('audio'))
  async sendAudio(
    @Param('jobId') jobId: string,
    @UploadedFile() audioFile: Express.Multer.File,
    @Req() req: Request
  ): Promise<void> {
    const supervisorId = getSupervisorId(req);
    await this.streamingService.sendAudioToTechnician(
      jobId,
      supervisorId,
      audioFile
    );
  }

  /**
   * Get current stream stats
   * GET /api/jobs/:jobId/stream/stats
   */
  @Get('stats')
  async getStreamStats(@Param('jobId') jobId: string): Promise<StreamStatsDto> {
    return this.streamingService.getStreamStats(jobId);
  }

  /**
   * Stop stream
   * POST /api/jobs/:jobId/stream/stop
   */
  @Post('stop')
  async stopStream(@Param('jobId') jobId: string): Promise<void> {
    await this.streamingService.stopStream(jobId);
  }
}

interface AnnotationDto {
  type: 'circle' | 'arrow' | 'rectangle' | 'text' | 'freehand';
  x: number;
  y: number;
  x2?: number;
  y2?: number;
  color: string;
  text?: string;
  timestamp: string;
}

interface StreamSessionDto {
  sessionId: string;
  producerId: string;
  rtcServer: string;
  iceServers: Array<{ urls: string[] }>;
  recordingUrl?: string;
}

interface SubscriptionDto {
  consumerId: string;
  params: any;
}

interface StreamStatsDto {
  videoBitrate: number;
  fps: number;
  resolution: string;
  latency: number;
  viewers: number;
}
```

### Step 3: Recording Infrastructure

```typescript
// packages/api/src/streaming/recording.service.ts

@Injectable()
export class RecordingService {
  private recordings: Map<string, RecordingSession> = new Map();

  async startRecording(jobId: string): Promise<string> {
    const recordingId = `rec_${uuidv4()}`;
    const timestamp = new Date().toISOString();
    const s3Key = `job-recordings/${jobId}/${recordingId}.webm`;

    const session: RecordingSession = {
      recordingId,
      jobId,
      startedAt: new Date(),
      s3Key,
      chunks: [],
      fileSize: 0,
    };

    this.recordings.set(recordingId, session);

    // Schedule upload after stream ends
    this.setupRecordingCleanup(recordingId);

    return recordingId;
  }

  async appendRecordingChunk(
    recordingId: string,
    chunk: Buffer
  ): Promise<void> {
    const session = this.recordings.get(recordingId);
    if (!session) throw new Error('Recording not found');

    session.chunks.push(chunk);
    session.fileSize += chunk.length;

    // Auto-flush if too large
    if (session.fileSize > 100 * 1024 * 1024) {  // 100MB
      await this.flushRecording(recordingId);
    }
  }

  async stopRecording(recordingId: string): Promise<RecordingMetadata> {
    const session = this.recordings.get(recordingId);
    if (!session) throw new Error('Recording not found');

    // Flush all chunks to S3
    await this.flushRecording(recordingId);

    const metadata: RecordingMetadata = {
      recordingId,
      jobId: session.jobId,
      url: `s3://${process.env.S3_BUCKET}/${session.s3Key}`,
      startedAt: session.startedAt,
      endedAt: new Date(),
      durationSeconds: Math.floor(
        (new Date().getTime() - session.startedAt.getTime()) / 1000
      ),
      fileSize: session.fileSize,
    };

    // Store metadata in database
    // await this.db.streamRecording.create({ data: metadata });

    this.recordings.delete(recordingId);
    return metadata;
  }

  private async flushRecording(recordingId: string): Promise<void> {
    const session = this.recordings.get(recordingId);
    if (!session || session.chunks.length === 0) return;

    const combinedBuffer = Buffer.concat(session.chunks);

    // Upload to S3
    // await this.s3.upload({
    //   Bucket: process.env.S3_BUCKET,
    //   Key: session.s3Key,
    //   Body: combinedBuffer,
    //   ContentType: 'video/webm'
    // }).promise();

    session.chunks = [];
  }

  private setupRecordingCleanup(recordingId: string): void {
    // Auto-cleanup after 24 hours
    setTimeout(
      () => this.recordings.delete(recordingId),
      24 * 60 * 60 * 1000
    );
  }
}

interface RecordingSession {
  recordingId: string;
  jobId: string;
  startedAt: Date;
  s3Key: string;
  chunks: Buffer[];
  fileSize: number;
}

interface RecordingMetadata {
  recordingId: string;
  jobId: string;
  url: string;
  startedAt: Date;
  endedAt: Date;
  durationSeconds: number;
  fileSize: number;
}
```

### Step 4: iOS Streaming Implementation

```swift
// apps/fieldtech-ios/FieldTech/Features/RayBan/StreamingManager.swift

class StreamingManager: NSObject, ObservableObject {
  @Published var isStreaming = false
  @Published var streamStats: StreamStats?
  @Published var isRecording = false

  private var peerConnection: RTCPeerConnection?
  private var webSocket: URLSessionWebSocketTask?
  private var videoCapturer: RTCVideoCapturer?
  private var videoSource: RTCVideoSource?
  private var audioSource: RTCAudioSource?

  private let apiClient: APIClient
  private let rtcFactory = RTCPeerConnectionFactory()

  init(apiClient: APIClient) {
    self.apiClient = apiClient
    super.init()
  }

  /// Start streaming from glasses to dashboard
  func startStream(jobId: String) async throws {
    let constraints = RTCMediaConstraints(
      mandatoryConstraints: ["OfferToReceiveVideo": "false"],
      optionalConstraints: nil
    )

    // Create peer connection
    peerConnection = try createPeerConnection(constraints: constraints)

    // Add video track (from glasses)
    let videoTrack = createVideoTrack()
    peerConnection?.add(videoTrack, streamIds: [jobId])

    // Add audio track (for supervisor voice guidance)
    let audioTrack = createAudioTrack()
    peerConnection?.add(audioTrack, streamIds: [jobId])

    // Create offer
    guard let offer = await createOffer() else {
      throw StreamingError.offerFailed
    }

    // Send to signaling server
    try await apiClient.initiateStream(jobId: jobId, offer: offer)

    DispatchQueue.main.async {
      self.isStreaming = true
    }

    // Start stats monitoring
    startStatsMonitoring(jobId: jobId)
  }

  /// Stop streaming
  func stopStream(jobId: String) async throws {
    isStreaming = false
    peerConnection?.close()
    peerConnection = nil
    
    try await apiClient.stopStream(jobId: jobId)
  }

  /// Start recording stream locally
  func startRecording() {
    isRecording = true
    // Implementation: use RTCFileLogger or similar
  }

  /// Stop recording
  func stopRecording(jobId: String) async throws -> URL {
    isRecording = false
    // Return local recording URL or upload to server
    return URL(fileURLWithPath: "")
  }

  /// Handle answer from signaling server
  func handleAnswer(_ answer: RTCSessionDescription) async throws {
    guard let peerConnection = peerConnection else { return }
    try await peerConnection.setRemoteDescription(answer)
  }

  /// Handle ICE candidate
  func handleICECandidate(_ candidate: RTCIceCandidate) {
    peerConnection?.add(candidate)
  }

  /// Receive audio from supervisor
  func receiveAudioFromSupervisor(audioData: Data) {
    // Play audio data through speaker
    // Implementation: use AVAudioPlayer or similar
  }

  /// Monitor stream quality
  private func startStatsMonitoring(jobId: String) {
    let statsTimer = Timer.scheduledTimer(withTimeInterval: 1.0, repeats: true) { [weak self] _ in
      guard let self = self, let pc = self.peerConnection else { return }

      pc.statistics { stats in
        var inboundRTPStats: RTCInboundRTPStreamStats?

        for stat in stats.statistics {
          if let inbound = stat as? RTCInboundRTPStreamStats {
            inboundRTPStats = inbound
            break
          }
        }

        if let inbound = inboundRTPStats {
          let stats = StreamStats(
            videoBitrate: Int(inbound.bytesReceived / 1_000_000),  // Mbps
            frameRate: Int(inbound.framesPerSecond),
            resolution: "\(Int(inbound.frameWidth))x\(Int(inbound.frameHeight))",
            latency: Int(inbound.jitter * 1000),  // ms
            packetsLost: inbound.packetsLost
          )

          DispatchQueue.main.async {
            self.streamStats = stats
          }
        }
      }
    }
  }

  private func createPeerConnection(
    constraints: RTCMediaConstraints
  ) throws -> RTCPeerConnection {
    let config = RTCConfiguration()
    config.iceServers = [
      RTCIceServer(urlStrings: ["stun:stun.l.google.com:19302"]),
    ]

    guard let pc = rtcFactory.peerConnection(
      with: config,
      constraints: constraints,
      delegate: self
    ) else {
      throw StreamingError.peerConnectionFailed
    }

    return pc
  }

  private func createVideoTrack() -> RTCVideoTrack {
    let videoSource = rtcFactory.videoSource()
    videoCapturer = RTCVideoCapturer(delegate: videoSource)
    
    let videoTrack = rtcFactory.videoTrack(with: videoSource, trackId: "video0")
    return videoTrack
  }

  private func createAudioTrack() -> RTCAudioTrack {
    let audioSource = rtcFactory.audioSource(with: RTCMediaConstraints())
    audioSource?.volume = 1.0

    let audioTrack = rtcFactory.audioTrack(with: audioSource, trackId: "audio0")
    return audioTrack
  }

  private func createOffer() async -> RTCSessionDescription? {
    guard let pc = peerConnection else { return nil }

    let constraints = RTCMediaConstraints(
      mandatoryConstraints: [
        "OfferToReceiveVideo": "false",
        "OfferToReceiveAudio": "true"
      ],
      optionalConstraints: nil
    )

    return await withCheckedContinuation { continuation in
      pc.offer(for: constraints) { sdp, error in
        guard let sdp = sdp else {
          continuation.resume(returning: nil)
          return
        }

        pc.setLocalDescription(sdp) { error in
          continuation.resume(returning: sdp)
        }
      }
    }
  }
}

extension StreamingManager: RTCPeerConnectionDelegate {
  func peerConnectionShouldNegotiate(_ peerConnection: RTCPeerConnection) {}

  func peerConnection(
    _ peerConnection: RTCPeerConnection,
    didChange stateChanged: RTCSignalingState
  ) {}

  func peerConnection(
    _ peerConnection: RTCPeerConnection,
    didChange connectionState: RTCIceConnectionState
  ) {
    print("Connection state: \(connectionState)")
  }

  func peerConnection(
    _ peerConnection: RTCPeerConnection,
    didChange iceConnectionState: RTCIceConnectionState
  ) {}

  func peerConnection(
    _ peerConnection: RTCPeerConnection,
    didGenerate candidate: RTCIceCandidate
  ) {
    // Send ICE candidate to signaling server
    Task {
      try? await apiClient.sendICECandidate(candidate: candidate)
    }
  }

  func peerConnection(
    _ peerConnection: RTCPeerConnection,
    didRemove candidates: [RTCIceCandidate]
  ) {}

  func peerConnection(
    _ peerConnection: RTCPeerConnection,
    didAdd stream: RTCMediaStream
  ) {
    print("Remote stream added")
  }

  func peerConnection(
    _ peerConnection: RTCPeerConnection,
    didRemove stream: RTCMediaStream
  ) {
    print("Remote stream removed")
  }

  func peerConnectionShouldNegotiate(_ peerConnection: RTCPeerConnection) {}
}

struct StreamStats {
  let videoBitrate: Int  // Mbps
  let frameRate: Int
  let resolution: String
  let latency: Int  // ms
  let packetsLost: Int
}

enum StreamingError: Error {
  case offerFailed
  case peerConnectionFailed
  case answerFailed
}
```

### Step 5: Dashboard Live Viewer Component

```typescript
// apps/dashboard/app/components/streaming/LiveStreamViewer.tsx

export function LiveStreamViewer({ jobId }: { jobId: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [stats, setStats] = useState<StreamStats | null>(null);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    subscribeToStream();
    return () => unsubscribeFromStream();
  }, [jobId]);

  async function subscribeToStream() {
    const offer = await createOffer();
    const { answer } = await fetch(
      `/api/jobs/${jobId}/stream/subscribe`,
      {
        method: 'POST',
        body: JSON.stringify({ offer }),
      }
    ).then(r => r.json());

    // Setup WebRTC peer connection...
    // Play video in videoRef.current
    setIsStreaming(true);
  }

  function handleAnnotation(annotation: Annotation) {
    setAnnotations(prev => [...prev, annotation]);
    
    // Send to API
    fetch(`/api/jobs/${jobId}/stream/annotate`, {
      method: 'POST',
      body: JSON.stringify(annotation),
    });

    // Draw on canvas
    drawAnnotation(annotation);
  }

  function drawAnnotation(annotation: Annotation) {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d')!;
    ctx.strokeStyle = annotation.color;
    ctx.lineWidth = 3;

    switch (annotation.type) {
      case 'circle':
        ctx.beginPath();
        ctx.arc(annotation.x, annotation.y, 30, 0, Math.PI * 2);
        ctx.stroke();
        break;
      case 'arrow':
        drawArrow(ctx, annotation.x, annotation.y, annotation.x2!, annotation.y2!);
        break;
      case 'text':
        ctx.font = '16px Arial';
        ctx.fillStyle = annotation.color;
        ctx.fillText(annotation.text || '', annotation.x, annotation.y);
        break;
    }
  }

  async function startRecording() {
    setIsRecording(true);
    await fetch(`/api/jobs/${jobId}/stream/record/start`, { method: 'POST' });
  }

  async function stopRecording() {
    setIsRecording(false);
    const { url } = await fetch(`/api/jobs/${jobId}/stream/record/stop`, {
      method: 'POST',
    }).then(r => r.json());

    // Video available at `url`
  }

  return (
    <div className="grid grid-cols-4 gap-4">
      {/* Video Player */}
      <div className="col-span-3">
        <div className="relative bg-black rounded-lg overflow-hidden">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-full"
          />
          
          {/* Annotation Canvas Overlay */}
          <canvas
            ref={canvasRef}
            className="absolute inset-0 cursor-crosshair"
            onMouseDown={() => setIsDrawing(true)}
            onMouseUp={() => setIsDrawing(false)}
            onMouseMove={(e) => {
              if (!isDrawing) return;
              // Handle drawing...
            }}
          />

          {/* Stream Stats */}
          <div className="absolute top-4 right-4 bg-black/80 text-white p-3 rounded text-sm space-y-1">
            <div>📊 {stats?.videoBitrate} Mbps</div>
            <div>🎬 {stats?.frameRate} fps</div>
            <div>⏱️ {stats?.latency} ms</div>
            <div>📐 {stats?.resolution}</div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-2 mt-4">
          <Button
            onClick={startRecording}
            disabled={isRecording}
            variant={isRecording ? 'destructive' : 'outline'}
          >
            {isRecording ? '🔴 Recording...' : '⭕ Record'}
          </Button>

          {/* Annotation Tools */}
          <AnnotationTools onAnnotate={handleAnnotation} />
        </div>
      </div>

      {/* Side Panel: Viewers & Info */}
      <div className="space-y-4">
        {/* Active Viewers */}
        <div className="bg-white rounded-lg p-4 border">
          <h3 className="font-semibold mb-2">👥 Viewers</h3>
          <div className="space-y-2 text-sm">
            {/* List of supervisors watching */}
          </div>
        </div>

        {/* Annotation History */}
        <div className="bg-white rounded-lg p-4 border">
          <h3 className="font-semibold mb-2">✏️ Annotations</h3>
          <div className="space-y-2 text-sm max-h-64 overflow-y-auto">
            {annotations.map((ann, i) => (
              <div key={i} className="p-2 bg-gray-50 rounded">
                <div>{ann.type} at ({ann.x}, {ann.y})</div>
                <div className="text-xs text-gray-500">{ann.timestamp}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Voice Chat */}
        <VoiceChatPanel jobId={jobId} />
      </div>
    </div>
  );
}

interface Annotation {
  type: 'circle' | 'arrow' | 'rectangle' | 'text' | 'freehand';
  x: number;
  y: number;
  x2?: number;
  y2?: number;
  color: string;
  text?: string;
  timestamp: string;
}

interface StreamStats {
  videoBitrate: number;
  frameRate: number;
  resolution: string;
  latency: number;
  viewers: number;
}
```

### Step 6: Database Schema Updates

```sql
-- packages/db/migrations/005_add_streaming_tables.sql

CREATE TABLE IF NOT EXISTS stream_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stream_id VARCHAR(255) UNIQUE NOT NULL,
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  technician_id UUID NOT NULL REFERENCES users(id),
  started_at TIMESTAMP NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMP,
  status VARCHAR(50) DEFAULT 'active',
  rtc_server_url TEXT,
  max_viewers INT DEFAULT 10,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS stream_recordings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stream_id UUID NOT NULL REFERENCES stream_sessions(id) ON DELETE CASCADE,
  job_id UUID NOT NULL,
  recording_id VARCHAR(255) UNIQUE NOT NULL,
  s3_url TEXT NOT NULL,
  file_size_bytes BIGINT,
  duration_seconds INT,
  started_at TIMESTAMP NOT NULL,
  ended_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS stream_viewers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stream_id UUID NOT NULL REFERENCES stream_sessions(id) ON DELETE CASCADE,
  supervisor_id UUID NOT NULL REFERENCES users(id),
  joined_at TIMESTAMP NOT NULL DEFAULT NOW(),
  left_at TIMESTAMP,
  annotations_count INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS stream_annotations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stream_id UUID NOT NULL REFERENCES stream_sessions(id) ON DELETE CASCADE,
  supervisor_id UUID NOT NULL,
  annotation_type VARCHAR(50) NOT NULL,
  x_pos INT,
  y_pos INT,
  x2_pos INT,
  y2_pos INT,
  color VARCHAR(7),
  text_content TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS stream_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stream_id UUID NOT NULL REFERENCES stream_sessions(id) ON DELETE CASCADE,
  bitrate_mbps INT,
  frames_per_second INT,
  resolution VARCHAR(20),
  latency_ms INT,
  packets_lost INT,
  recorded_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_stream_sessions_job_id ON stream_sessions(job_id);
CREATE INDEX idx_stream_sessions_technician_id ON stream_sessions(technician_id);
CREATE INDEX idx_stream_sessions_status ON stream_sessions(status);
CREATE INDEX idx_stream_recordings_job_id ON stream_recordings(job_id);
CREATE INDEX idx_stream_viewers_supervisor_id ON stream_viewers(supervisor_id);
CREATE INDEX idx_stream_annotations_stream_id ON stream_annotations(stream_id);
CREATE INDEX idx_stream_stats_stream_id ON stream_stats(stream_id);
```

---

## Phase 2 Features

### Real-Time Capabilities
- ✅ Live video streaming (< 500ms latency)
- ✅ Multi-supervisor viewing (up to 10 concurrent)
- ✅ Live annotations (circles, arrows, text)
- ✅ Two-way audio guidance
- ✅ Recording with playback
- ✅ Stream quality metrics

### Supervisor Controls
- ✅ Draw annotations on stream
- ✅ Speak to technician in real-time
- ✅ Record for training/compliance
- ✅ Take screenshots
- ✅ Monitor multiple streams
- ✅ Pause/resume stream

### Quality Monitoring
- ✅ Bitrate (Mbps)
- ✅ Frame rate (fps)
- ✅ Resolution
- ✅ Latency (ms)
- ✅ Packet loss

---

## Implementation Checklist

### Backend (6-8 hours)
- [ ] Setup Mediasoup SFU server
- [ ] Create streaming controller & service
- [ ] Implement recording pipeline
- [ ] Add database migrations
- [ ] Create WebSocket signaling
- [ ] Error handling & recovery

### iOS App (4-6 hours)
- [ ] RTCPeerConnection setup
- [ ] Video/audio capture configuration
- [ ] ICE candidate handling
- [ ] Stream stats monitoring
- [ ] Local recording
- [ ] Error handling

### Dashboard (4-5 hours)
- [ ] WebRTC consumer
- [ ] Video canvas rendering
- [ ] Annotation tools (draw, text, etc.)
- [ ] Voice chat UI
- [ ] Recording controls
- [ ] Viewer list

### Testing (3-4 hours)
- [ ] Connection tests (3G/4G/WiFi)
- [ ] Multi-viewer tests
- [ ] Recording verification
- [ ] Annotation delivery
- [ ] Error recovery
- [ ] Performance metrics

### Deployment (2 hours)
- [ ] Database migrations
- [ ] API deployment
- [ ] Dashboard deployment
- [ ] Mobile app deployment
- [ ] Production smoke tests

---

## Technical Specifications

### WebRTC Configuration
- **Codec**: VP9 (video), Opus (audio)
- **Bitrate**: 1-5 Mbps (adaptive)
- **Latency Target**: < 500ms
- **Max Bitrate**: 8 Mbps
- **Min Bitrate**: 500 Kbps

### Recording Format
- **Container**: WebM
- **Video Codec**: VP9
- **Audio Codec**: Opus
- **Resolution**: 1080p (if available)
- **Max Duration**: 4 hours per recording
- **Storage**: S3 (encrypted)

### Scaling Considerations
- Mediasoup instance per 50-100 concurrent streams
- Load balancer with SIP signaling
- Redis for session state
- CDN for recording playback

---

## Success Metrics

✅ **Connectivity**: 99%+ uptime  
✅ **Latency**: < 500ms median  
✅ **Quality**: 720p @ 30fps minimum  
✅ **Recording**: 100% capture success  
✅ **Throughput**: 10+ concurrent streams per server  

---

## Next Phase (Phase 3)

- **AR Annotations** — Real-time AR overlays on job site
- **Automated Analysis** — ML-powered issue detection
- **Voice Commands** — Hands-free control
- **Multi-site Support** — Stream between locations

---

**Phase 2 Status**: Ready for implementation  
**Estimated Duration**: 4-5 working days  
**Dependencies**: Mediasoup installation, WebRTC understanding  
**Builds Upon**: Phase 1 (Photo/Video Capture)

