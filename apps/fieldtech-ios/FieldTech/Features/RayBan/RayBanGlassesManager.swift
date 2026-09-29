import Foundation
import Combine
import Photos

/// Manages Ray-Ban Meta Glasses integration for photo/video capture
class RayBanGlassesManager: NSObject, ObservableObject {
  @Published var isConnected = false
  @Published var capturedMedia: [CapturedMediaItem] = []
  @Published var isUploading = false
  @Published var uploadProgress: Double = 0
  @Published var glassesDeviceId: String?
  @Published var batteryLevel: Int = 0
  @Published var uploadQueue: [MediaUploadTask] = []

  private var cancellables = Set<AnyCancellable>()
  private let apiClient: APIClient
  private let photoLibrary = PHPhotoLibrary.shared()
  private var mediaUploadQueue: DispatchQueue = DispatchQueue(
    label: "com.wise2.media-upload",
    qos: .background
  )

  // Simulated Ray-Ban connection (real implementation would use Meta SDK)
  private var raybanConnection: RayBanConnection?

  init(apiClient: APIClient) {
    self.apiClient = apiClient
    super.init()
  }

  /// Connect to Ray-Ban Meta Glasses
  func connectToGlasses() async throws {
    do {
      // Request permission from user first
      let authStatus = PHPhotoLibrary.requestAuthorization(for: .addOnly)
      if authStatus != .authorized && authStatus != .limited {
        throw GlassesError.photoLibraryAccessDenied
      }

      // Attempt connection to glasses
      raybanConnection = try await RayBanConnection.connect()

      DispatchQueue.main.async {
        self.isConnected = true
        self.glassesDeviceId = self.raybanConnection?.deviceId
        self.batteryLevel = self.raybanConnection?.batteryLevel ?? 0
      }

      // Start listening for captures
      startListeningForCaptures()
      startListeningForVideoCaptures()
    } catch {
      throw GlassesError.connectionFailed(error.localizedDescription)
    }
  }

  /// Disconnect from Ray-Ban glasses
  func disconnectGlasses() {
    raybanConnection?.disconnect()
    DispatchQueue.main.async {
      self.isConnected = false
      self.raybanConnection = nil
    }
  }

  /// Start listening for photo captures from glasses
  private func startListeningForCaptures() {
    raybanConnection?.onPhotoCaptured { [weak self] image, metadata in
      self?.handlePhotoCaptured(image: image, metadata: metadata)
    }
  }

  /// Start listening for video captures from glasses
  private func startListeningForVideoCaptures() {
    raybanConnection?.onVideoRecording { [weak self] videoPath, metadata in
      self?.handleVideoCaptured(videoPath: videoPath, metadata: metadata)
    }
  }

  /// Handle photo capture from glasses
  private func handlePhotoCaptured(image: UIImage, metadata: CaptureMetadata) {
    let mediaItem = CapturedMediaItem(
      id: UUID().uuidString,
      type: .photo,
      image: image,
      timestamp: metadata.timestamp,
      location: metadata.location,
      glassesDeviceId: metadata.glassesDeviceId,
      uploadStatus: .pending
    )

    DispatchQueue.main.async {
      self.capturedMedia.append(mediaItem)
    }

    // Save to photo library for backup
    saveToPhotoLibrary(image: image)

    // Queue for upload
    queueForUpload(mediaItem)
  }

  /// Handle video capture from glasses
  private func handleVideoCaptured(videoPath: String, metadata: CaptureMetadata) {
    let mediaItem = CapturedMediaItem(
      id: UUID().uuidString,
      type: .video,
      videoPath: videoPath,
      timestamp: metadata.timestamp,
      location: metadata.location,
      glassesDeviceId: metadata.glassesDeviceId,
      uploadStatus: .pending
    )

    DispatchQueue.main.async {
      self.capturedMedia.append(mediaItem)
    }

    // Queue for upload
    queueForUpload(mediaItem)
  }

  /// Queue media for upload
  private func queueForUpload(_ mediaItem: CapturedMediaItem) {
    let uploadTask = MediaUploadTask(
      mediaItem: mediaItem,
      retryCount: 0,
      lastRetryTime: nil
    )

    DispatchQueue.main.async {
      self.uploadQueue.append(uploadTask)
    }

    // Try upload if online
    if isReachable() {
      uploadMedia(uploadTask)
    }
  }

  /// Upload media to WISE² backend
  private func uploadMedia(_ task: MediaUploadTask) {
    guard let jobId = task.mediaItem.jobId else {
      print("Job ID not set for media upload")
      return
    }

    mediaUploadQueue.async {
      do {
        let progress = Progress()

        // Get file data
        let fileData: Data
        let fileName: String
        let mediaType: String

        if task.mediaItem.type == .photo, let image = task.mediaItem.image {
          fileData = image.jpegData(compressionQuality: 0.85) ?? Data()
          fileName = "photo-\(task.mediaItem.id).jpg"
          mediaType = "photo"
        } else if let videoPath = task.mediaItem.videoPath {
          fileData = try Data(contentsOf: URL(fileURLWithPath: videoPath))
          fileName = "video-\(task.mediaItem.id).mp4"
          mediaType = "video"
        } else {
          throw GlassesError.noMediaData
        }

        // Prepare upload request
        let uploadRequest = MediaUploadRequest(
          jobId: jobId,
          fileName: fileName,
          fileData: fileData,
          mediaType: mediaType,
          timestamp: task.mediaItem.timestamp,
          latitude: task.mediaItem.location?.latitude,
          longitude: task.mediaItem.location?.longitude,
          glassesDeviceId: task.mediaItem.glassesDeviceId,
          progress: progress
        )

        // Upload to API
        let response = try await self.apiClient.uploadJobMedia(uploadRequest)

        // Update UI
        DispatchQueue.main.async {
          if let index = self.capturedMedia.firstIndex(where: { $0.id == task.mediaItem.id }) {
            self.capturedMedia[index].uploadStatus = .completed
          }
          self.uploadQueue.removeAll { $0.mediaItem.id == task.mediaItem.id }

          // Notify user
          NotificationCenter.default.post(
            name: NSNotification.Name("MediaUploadedSuccessfully"),
            object: response
          )
        }
      } catch {
        // Handle retry logic
        DispatchQueue.main.async {
          task.retryCount += 1
          task.lastRetryTime = Date()

          if task.retryCount < 5 {
            // Exponential backoff: 2^retryCount seconds
            let delay = pow(2.0, Double(task.retryCount))
            self.mediaUploadQueue.asyncAfter(deadline: .now() + delay) {
              self.uploadMedia(task)
            }
          } else {
            // Mark as failed after 5 retries
            if let index = self.capturedMedia.firstIndex(where: { $0.id == task.mediaItem.id }) {
              self.capturedMedia[index].uploadStatus = .failed(error.localizedDescription)
            }
          }
        }
      }
    }
  }

  /// Delete media item
  func deleteMedia(_ mediaItem: CapturedMediaItem) async throws {
    guard let jobId = mediaItem.jobId else { return }

    try await apiClient.deleteJobMedia(jobId: jobId, mediaId: mediaItem.id)

    DispatchQueue.main.async {
      self.capturedMedia.removeAll { $0.id == mediaItem.id }
    }
  }

  /// Update media caption
  func updateCaption(_ mediaItem: CapturedMediaItem, caption: String) async throws {
    guard let jobId = mediaItem.jobId else { return }

    try await apiClient.updateMediaCaption(jobId: jobId, mediaId: mediaItem.id, caption: caption)

    DispatchQueue.main.async {
      if let index = self.capturedMedia.firstIndex(where: { $0.id == mediaItem.id }) {
        self.capturedMedia[index].caption = caption
      }
    }
  }

  /// Save image to photo library
  private func saveToPhotoLibrary(image: UIImage) {
    PHPhotoLibrary.shared().performChanges {
      PHAssetChangeRequest.creationRequestForAsset(withImage: image)
    } completionHandler: { success, error in
      if let error = error {
        print("Failed to save image to photo library: \(error.localizedDescription)")
      }
    }
  }

  /// Check network reachability
  private func isReachable() -> Bool {
    // TODO: Implement proper network reachability check
    return true
  }

  /// Get upload progress
  func getUploadProgress() -> Double {
    guard !uploadQueue.isEmpty else { return 0 }
    let totalItems = uploadQueue.count
    let completedItems = capturedMedia.filter { $0.uploadStatus == .completed }.count
    return Double(completedItems) / Double(totalItems)
  }
}

// MARK: - Models

struct CapturedMediaItem: Identifiable {
  let id: String
  let type: MediaType
  var image: UIImage?
  var videoPath: String?
  let timestamp: Date
  let location: LocationData?
  let glassesDeviceId: String?
  var uploadStatus: UploadStatus
  var caption: String?
  var jobId: String?

  enum MediaType {
    case photo
    case video
  }

  enum UploadStatus: Equatable {
    case pending
    case uploading(Double)  // progress 0-1
    case completed
    case failed(String)  // error message
  }
}

struct LocationData {
  let latitude: Double
  let longitude: Double
  let accuracy: Double?
}

struct CaptureMetadata {
  let timestamp: Date
  let location: LocationData?
  let glassesDeviceId: String
}

struct MediaUploadTask {
  let mediaItem: CapturedMediaItem
  var retryCount: Int
  var lastRetryTime: Date?
}

struct MediaUploadRequest {
  let jobId: String
  let fileName: String
  let fileData: Data
  let mediaType: String
  let timestamp: Date
  let latitude: Double?
  let longitude: Double?
  let glassesDeviceId: String?
  let progress: Progress
}

// MARK: - Ray-Ban Connection (Simulated for now)

class RayBanConnection {
  let deviceId: String
  var batteryLevel: Int = 85
  private var captureHandlers: [(UIImage, CaptureMetadata) -> Void] = []
  private var videoHandlers: [(String, CaptureMetadata) -> Void] = []

  private init(deviceId: String) {
    self.deviceId = deviceId
  }

  static func connect() async throws -> RayBanConnection {
    // Simulated connection delay
    try await Task.sleep(nanoseconds: 1_000_000_000)
    return RayBanConnection(deviceId: "RB-\(UUID().uuidString.prefix(8))")
  }

  func disconnect() {}

  func onPhotoCaptured(_ handler: @escaping (UIImage, CaptureMetadata) -> Void) {
    captureHandlers.append(handler)
  }

  func onVideoRecording(_ handler: @escaping (String, CaptureMetadata) -> Void) {
    videoHandlers.append(handler)
  }
}

// MARK: - Errors

enum GlassesError: LocalizedError {
  case connectionFailed(String)
  case photoLibraryAccessDenied
  case noMediaData
  case uploadFailed(String)

  var errorDescription: String? {
    switch self {
    case .connectionFailed(let reason):
      return "Failed to connect to glasses: \(reason)"
    case .photoLibraryAccessDenied:
      return "Photo library access denied"
    case .noMediaData:
      return "No media data available"
    case .uploadFailed(let reason):
      return "Upload failed: \(reason)"
    }
  }
}

// MARK: - API Client Extension

extension APIClient {
  func uploadJobMedia(_ request: MediaUploadRequest) async throws -> MediaUploadResponse {
    let url = URL(string: "/jobs/\(request.jobId)/media", relativeTo: baseURL)!
    var urlRequest = URLRequest(url: url)
    urlRequest.httpMethod = "POST"

    // Create multipart form data
    let boundary = "----\(UUID().uuidString)"
    urlRequest.setValue("multipart/form-data; boundary=\(boundary)", forHTTPHeaderField: "Content-Type")

    var body = Data()

    // Add file
    body.append("--\(boundary)\r\n".data(using: .utf8)!)
    body.append(
      "Content-Disposition: form-data; name=\"file\"; filename=\"\(request.fileName)\"\r\n"
        .data(using: .utf8)!
    )
    body.append("Content-Type: application/octet-stream\r\n\r\n".data(using: .utf8)!)
    body.append(request.fileData)
    body.append("\r\n".data(using: .utf8)!)

    // Add metadata
    let metadata: [String: Any] = [
      "mediaType": request.mediaType,
      "timestamp": ISO8601DateFormatter().string(from: request.timestamp),
      "latitude": request.latitude ?? NSNull(),
      "longitude": request.longitude ?? NSNull(),
      "glasses_device_id": request.glassesDeviceId ?? NSNull(),
    ]

    for (key, value) in metadata {
      body.append("--\(boundary)\r\n".data(using: .utf8)!)
      body.append("Content-Disposition: form-data; name=\"\(key)\"\r\n\r\n".data(using: .utf8)!)
      if let jsonValue = try JSONSerialization.data(withJSONObject: value) {
        body.append(jsonValue)
      }
      body.append("\r\n".data(using: .utf8)!)
    }

    body.append("--\(boundary)--\r\n".data(using: .utf8)!)
    urlRequest.httpBody = body

    let (data, response) = try await URLSession.shared.data(for: urlRequest)

    guard let httpResponse = response as? HTTPURLResponse, httpResponse.statusCode == 200 else {
      throw APIError.serverError
    }

    return try JSONDecoder().decode(MediaUploadResponse.self, from: data)
  }

  func deleteJobMedia(jobId: String, mediaId: String) async throws {
    let url = URL(string: "/jobs/\(jobId)/media/\(mediaId)", relativeTo: baseURL)!
    var urlRequest = URLRequest(url: url)
    urlRequest.httpMethod = "DELETE"

    let (_, response) = try await URLSession.shared.data(for: urlRequest)

    guard let httpResponse = response as? HTTPURLResponse, httpResponse.statusCode == 200 else {
      throw APIError.serverError
    }
  }

  func updateMediaCaption(jobId: String, mediaId: String, caption: String) async throws {
    let url = URL(string: "/jobs/\(jobId)/media/\(mediaId)/caption", relativeTo: baseURL)!
    var urlRequest = URLRequest(url: url)
    urlRequest.httpMethod = "POST"
    urlRequest.setValue("application/json", forHTTPHeaderField: "Content-Type")
    urlRequest.httpBody = try JSONEncoder().encode(["caption": caption])

    let (data, response) = try await URLSession.shared.data(for: urlRequest)

    guard let httpResponse = response as? HTTPURLResponse, httpResponse.statusCode == 200 else {
      throw APIError.serverError
    }
  }
}

struct MediaUploadResponse: Codable {
  let id: String
  let jobId: String
  let url: String
  let uploadedAt: String
}
