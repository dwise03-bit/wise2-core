import SwiftUI
import MapKit

struct MediaCaptureView: View {
  @StateObject private var glassesManager: RayBanGlassesManager
  @State private var isConnecting = false
  @State private var connectionError: String?
  @State private var showCaptionSheet = false
  @State private var selectedMedia: CapturedMediaItem?
  @State private var captionText = ""
  @State private var jobId: String = ""

  var body: some View {
    VStack(spacing: 0) {
      // Header with glasses status
      headerView

      // Glasses status banner
      if isConnecting {
        statusBanner(
          icon: "radiowaves.circle",
          title: "Connecting to Glasses...",
          color: .blue
        )
      } else if glassesManager.isConnected {
        statusBanner(
          icon: "checkmark.circle.fill",
          title: "Glasses Connected • Battery \(glassesManager.batteryLevel)%",
          color: .green
        )
      } else if let error = connectionError {
        statusBanner(icon: "exclamationmark.circle.fill", title: error, color: .red)
      } else {
        statusBanner(
          icon: "exclamationmark.circle",
          title: "Glasses Not Connected",
          color: .gray
        )
      }

      // Upload queue status
      if !glassesManager.uploadQueue.isEmpty {
        uploadQueueBanner
      }

      // Media grid
      ScrollView {
        if glassesManager.capturedMedia.isEmpty {
          emptyStateView
        } else {
          mediaGridView
        }
      }

      // Action buttons
      Spacer()
      actionButtonsView
    }
    .sheet(isPresented: $showCaptionSheet) {
      captionSheetView
    }
    .onAppear {
      Task {
        await connectGlasses()
      }
    }
    .onDisappear {
      glassesManager.disconnectGlasses()
    }
  }

  // MARK: - Subviews

  private var headerView: some View {
    HStack {
      VStack(alignment: .leading, spacing: 4) {
        Text("Media Capture")
          .font(.title2)
          .fontWeight(.bold)

        if let deviceId = glassesManager.glassesDeviceId {
          Text("Device: \(deviceId)")
            .font(.caption)
            .foregroundColor(.secondary)
        }
      }

      Spacer()

      VStack(alignment: .trailing, spacing: 4) {
        Text("\(glassesManager.capturedMedia.count) Captured")
          .fontWeight(.semibold)

        Text("\(glassesManager.uploadQueue.count) Pending")
          .font(.caption)
          .foregroundColor(.secondary)
      }
    }
    .padding()
    .background(Color(.systemGray6))
  }

  private func statusBanner(icon: String, title: String, color: Color) -> some View {
    HStack(spacing: 12) {
      Image(systemName: icon)
        .foregroundColor(color)
        .font(.headline)

      Text(title)
        .font(.subheadline)
        .foregroundColor(color)

      Spacer()
    }
    .padding(.vertical, 12)
    .padding(.horizontal)
    .background(color.opacity(0.1))
  }

  private var uploadQueueBanner: some View {
    VStack(spacing: 8) {
      HStack {
        Image(systemName: "arrow.up.circle")
          .foregroundColor(.blue)

        Text("Uploading \(glassesManager.uploadQueue.count) item\(glassesManager.uploadQueue.count == 1 ? "" : "s")...")
          .font(.subheadline)

        Spacer()

        ProgressView(value: glassesManager.getUploadProgress())
          .frame(width: 60)
      }
      .padding()
      .background(Color.blue.opacity(0.1))
      .cornerRadius(8)
      .padding()
    }
  }

  private var emptyStateView: some View {
    VStack(spacing: 20) {
      Spacer()

      Image(systemName: glassesManager.isConnected ? "camera.circle" : "antenna.radiowaves.off")
        .font(.system(size: 64))
        .foregroundColor(.gray)

      VStack(spacing: 8) {
        Text(glassesManager.isConnected ? "Ready to Capture" : "Connect Glasses to Start")
          .font(.headline)

        Text(glassesManager.isConnected
          ? "Capture photos and videos from your Ray-Ban glasses"
          : "Turn on your Ray-Ban Meta glasses to begin")
          .font(.subheadline)
          .foregroundColor(.secondary)
          .textAlignment(.center)
      }
      .padding(.horizontal)

      Spacer()
    }
    .frame(maxWidth: .infinity, maxHeight: .infinity)
  }

  private var mediaGridView: some View {
    LazyVGrid(columns: [GridItem(.adaptive(minimum: 150), spacing: 12)], spacing: 12) {
      ForEach(glassesManager.capturedMedia) { media in
        MediaThumbnailCard(
          media: media,
          onTap: { selectedMedia = media },
          onDelete: {
            Task {
              try? await glassesManager.deleteMedia(media)
            }
          },
          onCaption: {
            selectedMedia = media
            captionText = media.caption ?? ""
            showCaptionSheet = true
          }
        )
      }
    }
    .padding()
  }

  private var actionButtonsView: some View {
    VStack(spacing: 12) {
      if glassesManager.isConnected {
        Button(action: {
          glassesManager.disconnectGlasses()
        }) {
          Label("Disconnect Glasses", systemImage: "antenna.radiowaves.off")
            .frame(maxWidth: .infinity)
        }
        .buttonStyle(.bordered)
      } else {
        Button(action: {
          Task {
            await connectGlasses()
          }
        }) {
          Label("Connect Glasses", systemImage: "antenna.radiowaves")
            .frame(maxWidth: .infinity)
        }
        .buttonStyle(.borderedProminent)
      }

      if !glassesManager.capturedMedia.isEmpty {
        Button(action: {}) {
          Label(
            "Upload All",
            systemImage: "arrow.up.circle"
          )
          .frame(maxWidth: .infinity)
        }
        .buttonStyle(.borderedProminent)
        .tint(.blue)
      }
    }
    .padding()
  }

  private var captionSheetView: some View {
    NavigationStack {
      VStack {
        if let media = selectedMedia {
          // Media preview
          if let image = media.image {
            Image(uiImage: image)
              .resizable()
              .scaledToFit()
              .frame(maxHeight: 200)
              .cornerRadius(8)
          }

          // Caption input
          VStack(alignment: .leading, spacing: 8) {
            Text("Add Caption")
              .font(.headline)

            TextEditor(text: $captionText)
              .frame(height: 100)
              .border(Color.gray)
              .cornerRadius(4)

            HStack {
              Button("Cancel") {
                showCaptionSheet = false
              }
              .buttonStyle(.bordered)

              Button("Save") {
                Task {
                  try? await glassesManager.updateCaption(media, caption: captionText)
                  showCaptionSheet = false
                }
              }
              .buttonStyle(.borderedProminent)
            }
          }
          .padding()

          Spacer()
        }
      }
      .navigationTitle("Edit Caption")
      .navigationBarTitleDisplayMode(.inline)
    }
  }

  // MARK: - Methods

  private func connectGlasses() async {
    isConnecting = true
    connectionError = nil

    do {
      try await glassesManager.connectToGlasses()
      isConnecting = false
    } catch let error as GlassesError {
      connectionError = error.localizedDescription
      isConnecting = false
    } catch {
      connectionError = "Unknown error: \(error.localizedDescription)"
      isConnecting = false
    }
  }
}

// MARK: - Media Thumbnail Card

struct MediaThumbnailCard: View {
  let media: CapturedMediaItem
  let onTap: () -> Void
  let onDelete: () -> Void
  let onCaption: () -> Void

  var body: some View {
    ZStack(alignment: .topTrailing) {
      // Thumbnail
      Group {
        if let image = media.image {
          Image(uiImage: image)
            .resizable()
            .scaledToFill()
        } else {
          VStack {
            Image(systemName: "film.circle")
              .font(.system(size: 40))
              .foregroundColor(.gray)
          }
          .frame(maxWidth: .infinity, maxHeight: .infinity)
          .background(Color.gray.opacity(0.1))
        }
      }
      .frame(height: 150)
      .clipped()
      .overlay(
        RoundedRectangle(cornerRadius: 8)
          .stroke(Color.blue.opacity(0.5), lineWidth: 2)
      )

      // Status indicator
      statusIndicator

      // Delete button
      Menu {
        Button("Delete", action: onDelete)
        Button("Add Caption", action: onCaption)
        if media.location != nil {
          Button("View Location", action: {})
        }
      } label: {
        Image(systemName: "ellipsis.circle.fill")
          .foregroundColor(.white)
          .font(.title3)
          .padding(8)
          .background(Color.black.opacity(0.5))
          .cornerRadius(6)
          .padding(8)
      }
    }
    .frame(height: 150)
    .cornerRadius(8)
    .onTapGesture(perform: onTap)
    .contextMenu {
      Button("View", action: onTap)
      Button("Caption", action: onCaption)
      Button("Delete", action: onDelete)
    }
  }

  @ViewBuilder
  private var statusIndicator: some View {
    switch media.uploadStatus {
    case .pending:
      HStack(spacing: 4) {
        Image(systemName: "circle")
          .font(.caption2)
        Text("Pending")
          .font(.caption2)
      }
      .padding(6)
      .background(Color.yellow.opacity(0.8))
      .foregroundColor(.white)
      .cornerRadius(4)
      .padding(8)

    case .uploading(let progress):
      ZStack(alignment: .center) {
        Circle()
          .trim(from: 0, to: progress)
          .stroke(Color.blue, lineWidth: 2)
          .rotationEffect(.degrees(-90))

        Text("\(Int(progress * 100))%")
          .font(.caption2)
          .foregroundColor(.blue)
      }
      .frame(width: 32, height: 32)
      .padding(8)

    case .completed:
      HStack(spacing: 4) {
        Image(systemName: "checkmark.circle.fill")
          .font(.caption2)
        Text("Done")
          .font(.caption2)
      }
      .padding(6)
      .background(Color.green.opacity(0.8))
      .foregroundColor(.white)
      .cornerRadius(4)
      .padding(8)

    case .failed(let error):
      VStack(spacing: 2) {
        Image(systemName: "exclamationmark.circle.fill")
          .font(.caption2)
        Text("Failed")
          .font(.caption2)
      }
      .padding(6)
      .background(Color.red.opacity(0.8))
      .foregroundColor(.white)
      .cornerRadius(4)
      .padding(8)
      .tooltip(error)
    }
  }
}

// MARK: - Preview

#Preview {
  MediaCaptureView(
    glassesManager: RayBanGlassesManager(apiClient: .preview)
  )
}
