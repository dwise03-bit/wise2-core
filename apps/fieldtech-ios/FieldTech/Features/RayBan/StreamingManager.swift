import Foundation
import WebRTC
import AVFoundation

@MainActor
class StreamingManager: NSObject, ObservableObject, RTCPeerConnectionDelegate {
  @Published var isStreaming = false
  @Published var streamStats: StreamStatistics?
  @Published var connectionState: RTCPeerConnectionState = .new
  @Published var iceConnectionState: RTCIceConnectionState = .new
  @Published var error: String?

  private var peerConnection: RTCPeerConnection?
  private var videoTrack: RTCVideoTrack?
  private var audioTrack: RTCAudioTrack?
  private var videoCapturer: RTCCameraVideoCapturer?
  private var statsTimer: Timer?

  private let apiClient: APIClient
  private let jobId: String
  private let factory = RTCPeerConnectionFactory()

  nonisolated init(apiClient: APIClient, jobId: String) {
    self.apiClient = apiClient
    self.jobId = jobId
    super.init()
  }

  // MARK: - Public Methods

  func startStream(completion: @escaping (Result<String, Error>) -> Void) {
    Task {
      do {
        // Initialize WebRTC
        try setupPeerConnection()

        // Get RTP parameters from server
        let offer = try await peerConnection!.offer(for: RTCMediaConstraints())
        peerConnection!.setLocalDescription(offer) { [weak self] error in
          if let error = error {
            completion(.failure(error))
            return
          }

          // Send offer to server
          Task {
            do {
              let response = try await self?.apiClient.post(
                "/jobs/\(self?.jobId ?? "")/stream/start",
                body: ["rtpParameters": self?.peerConnection?.localDescription?.sdp ?? ""]
              ) as? [String: Any]

              if let sessionId = response?["sessionId"] as? String {
                self?.isStreaming = true
                self?.startStatsMonitoring()
                completion(.success(sessionId))
              }
            } catch {
              completion(.failure(error))
            }
          }
        }
      } catch {
        completion(.failure(error))
      }
    }
  }

  func stopStream() {
    isStreaming = false
    statsTimer?.invalidate()
    peerConnection?.close()
    peerConnection = nil
  }

  func addAnnotation(_ annotation: AnnotationData) async throws {
    try await apiClient.post(
      "/jobs/\(jobId)/stream/annotate",
      body: annotation
    )
  }

  func sendAudioGuidance(_ audioData: Data) async throws {
    var request = URLRequest(url: URL(string: "https://api.wise2.net/jobs/\(jobId)/stream/audio/send")!)
    request.httpMethod = "POST"

    let boundary = UUID().uuidString
    var body = Data()

    body.append("--\(boundary)\r\n".data(using: .utf8)!)
    body.append("Content-Disposition: form-data; name=\"audio\"; filename=\"guidance.wav\"\r\n".data(using: .utf8)!)
    body.append("Content-Type: audio/wav\r\n\r\n".data(using: .utf8)!)
    body.append(audioData)
    body.append("\r\n--\(boundary)--\r\n".data(using: .utf8)!)

    request.setValue("multipart/form-data; boundary=\(boundary)", forHTTPHeaderField: "Content-Type")

    let (_, response) = try await URLSession.shared.data(for: request)

    guard (response as? HTTPURLResponse)?.statusCode == 200 else {
      throw NSError(domain: "StreamingManager", code: -1, userInfo: [NSLocalizedDescriptionKey: "Failed to send audio"])
    }
  }

  // MARK: - Private Methods

  private func setupPeerConnection() throws {
    let config = RTCConfiguration()
    config.iceServers = [
      RTCIceServer(urlStrings: ["stun:stun.l.google.com:19302"]),
      RTCIceServer(urlStrings: ["stun:stun1.l.google.com:19302"]),
    ]

    let mediaConstraints = RTCMediaConstraints(
      mandatoryConstraints: [
        "OfferToReceiveAudio": "false",
        "OfferToReceiveVideo": "false",
      ],
      optionalConstraints: nil
    )

    peerConnection = factory.peerConnection(with: config, constraints: mediaConstraints, delegate: self)

    // Add video track
    setupVideoTrack()

    // Add audio track
    setupAudioTrack()
  }

  private func setupVideoTrack() {
    let videoSource = factory.videoSource()
    let videoCapturer = RTCCameraVideoCapturer(delegate: videoSource)
    self.videoCapturer = videoCapturer

    videoTrack = factory.videoTrack(with: videoSource, trackId: "video0")

    if let videoTrack = videoTrack {
      peerConnection?.add(videoTrack, streamIds: ["stream0"])
    }

    // Start capturing from camera
    if let capturer = videoCapturer {
      let settings = AVCaptureDevice.availableVideoSettings(forVideoCodec: .h264)
      if let format = settings.first {
        capturer.startCapture(with: AVCaptureDevice.default(.builtInWideAngleCamera, for: .video, position: .front)!,
                             format: format,
                             fps: 30)
      }
    }
  }

  private func setupAudioTrack() {
    let audioSource = factory.audioSource(with: RTCMediaConstraints())
    audioTrack = factory.audioTrack(with: audioSource, trackId: "audio0")

    if let audioTrack = audioTrack {
      peerConnection?.add(audioTrack, streamIds: ["stream0"])
    }
  }

  private func startStatsMonitoring() {
    statsTimer = Timer.scheduledTimer(withTimeInterval: 1.0, repeats: true) { [weak self] _ in
      self?.collectStats()
    }
  }

  private func collectStats() {
    guard let pc = peerConnection else { return }

    pc.statistics { [weak self] report in
      Task { @MainActor in
        var bitrate: Double = 0
        var fps: Int = 0
        var resolution = "0x0"
        var latency: Double = 0
        var jitter: Double = 0
        var packetLoss: Double = 0

        for stat in report.statistics.values {
          if stat.type == "inbound-rtp", let values = stat.values as? [String: NSNumber] {
            if let bytes = values["bytesReceived"], let packets = values["packetsReceived"] {
              bitrate = Double(bytes.doubleValue) * 8 / 1_000_000
              fps = Int(values["framesPerSecond"]?.doubleValue ?? 0)
              if let width = values["frameWidth"], let height = values["frameHeight"] {
                resolution = "\(Int(width.doubleValue))x\(Int(height.doubleValue))"
              }
            }
          } else if stat.type == "candidate-pair", let values = stat.values as? [String: NSNumber] {
            if let rtt = values["currentRoundTripTime"] {
              latency = rtt.doubleValue * 1000
            }
            if let jitterVal = values["jitter"] {
              jitter = jitterVal.doubleValue * 1000
            }
            if let loss = values["packetsLost"] {
              packetLoss = loss.doubleValue
            }
          }
        }

        self?.streamStats = StreamStatistics(
          videoBitrate: Int(bitrate),
          fps: fps,
          resolution: resolution,
          latency: Int(latency),
          jitter: Int(jitter),
          packetLoss: Int(packetLoss)
        )
      }
    }
  }

  // MARK: - RTCPeerConnectionDelegate

  func peerConnection(_ peerConnection: RTCPeerConnection, didChange stateChanged: RTCSignalingState) {}

  func peerConnection(_ peerConnection: RTCPeerConnection, didAdd stream: RTCMediaStream) {}

  func peerConnection(_ peerConnection: RTCPeerConnection, didRemove stream: RTCMediaStream) {}

  func peerConnectionShouldNegotiate(_ peerConnection: RTCPeerConnection) {}

  func peerConnection(_ peerConnection: RTCPeerConnection, didChange newState: RTCIceConnectionState) {
    Task { @MainActor in
      self.iceConnectionState = newState
      if newState == .failed || newState == .closed {
        self.error = "Connection failed"
      }
    }
  }

  func peerConnection(_ peerConnection: RTCPeerConnection, didChange newState: RTCIceGatheringState) {}

  func peerConnection(_ peerConnection: RTCPeerConnection, didGenerate candidate: RTCIceCandidate) {
    Task {
      do {
        try await apiClient.post(
          "/jobs/\(jobId)/stream/ice-candidate",
          body: ["candidate": candidate.sdp]
        )
      } catch {
        print("Failed to send ICE candidate: \(error)")
      }
    }
  }

  func peerConnection(_ peerConnection: RTCPeerConnection, didRemove candidates: [RTCIceCandidate]) {}

  func peerConnection(_ peerConnection: RTCPeerConnection, didOpen dataChannel: RTCDataChannel) {}
}

// MARK: - Models

struct StreamStatistics {
  let videoBitrate: Int
  let fps: Int
  let resolution: String
  let latency: Int
  let jitter: Int
  let packetLoss: Int
}

struct AnnotationData: Codable {
  let type: String // circle, arrow, rectangle, text, freehand
  let x: Int
  let y: Int
  let x2: Int?
  let y2: Int?
  let color: String
  let text: String?
}
