import SwiftUI
import PhotosUI

struct CameraView: View {
  @StateObject private var mediaManager = MediaManager()
  @State private var showPhotoPicker = false
  @State private var showCamera = false
  @State private var uploadStatus = ""

  var body: some View {
    VStack(spacing: 16) {
      Text("Media Upload")
        .font(.system(size: 20, weight: .bold))
        .foregroundColor(.wise2Primary)
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(16)

      ScrollView {
        VStack(spacing: 12) {
          // Photo Preview
          if let image = mediaManager.selectedImage {
            Image(uiImage: image)
              .resizable()
              .scaledToFit()
              .frame(maxHeight: 300)
              .clipShape(RoundedRectangle(cornerRadius: 12))
              .padding(16)
          }

          // Upload Progress
          if mediaManager.uploadProgress > 0 && mediaManager.uploadProgress < 1 {
            VStack(spacing: 8) {
              ProgressView(value: mediaManager.uploadProgress)
                .tint(.wise2Primary)

              Text("\(Int(mediaManager.uploadProgress * 100))%")
                .font(.system(size: 12))
                .foregroundColor(.wise2TextMuted)
            }
            .padding(16)
          }

          // Status Message
          if !uploadStatus.isEmpty {
            HStack(spacing: 8) {
              Image(systemName: uploadStatus.contains("✅") ? "checkmark.circle.fill" : "exclamationmark.circle.fill")
                .foregroundColor(uploadStatus.contains("✅") ? .wise2Success : .wise2Danger)

              Text(uploadStatus)
                .font(.system(size: 12))
                .foregroundColor(.wise2TextSecondary)
            }
            .padding(12)
            .frame(maxWidth: .infinity)
            .background(Color.wise2Surface)
            .cornerRadius(8)
            .padding(16)
          }

          Spacer()
        }
      }

      // Action Buttons
      VStack(spacing: 12) {
        Button(action: { showPhotoPicker = true }) {
          HStack(spacing: 8) {
            Image(systemName: "photo.on.rectangle.angled")
            Text("Choose Photo")
          }
          .frame(maxWidth: .infinity)
          .padding(12)
          .background(Color.wise2Primary)
          .foregroundColor(.wise2TextPrimary)
          .cornerRadius(8)
        }

        if mediaManager.selectedImage != nil {
          Button(action: {
            Task {
              await uploadPhoto()
            }
          }) {
            HStack(spacing: 8) {
              Image(systemName: "arrow.up.circle.fill")
              Text("Upload Photo")
            }
            .frame(maxWidth: .infinity)
            .padding(12)
            .background(Color.wise2Success)
            .foregroundColor(.wise2TextPrimary)
            .cornerRadius(8)
          }
        }
      }
      .padding(16)
    }
    .background(Color.wise2Background)
    .photosPicker(isPresented: $showPhotoPicker, selection: $mediaManager.selectedImage, matching: .images)
  }

  private func uploadPhoto() async {
    guard let image = mediaManager.selectedImage else { return }

    uploadStatus = "⏳ Uploading..."

    do {
      try await mediaManager.uploadMedia(image)
      uploadStatus = "✅ Upload complete!"
      try await Task.sleep(nanoseconds: 2_000_000_000)
      mediaManager.selectedImage = nil
      uploadStatus = ""
    } catch {
      uploadStatus = "❌ Upload failed: \(error.localizedDescription)"
    }
  }
}

#Preview {
  CameraView()
    .preferredColorScheme(.dark)
}
