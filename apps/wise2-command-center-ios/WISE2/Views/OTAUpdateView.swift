import SwiftUI

struct OTAUpdateView: View {
  @StateObject private var updateManager = OTAUpdateManager()
  @State private var showUpdatePrompt = false

  var body: some View {
    ZStack {
      if showUpdatePrompt && updateManager.updateAvailable {
        VStack(spacing: 20) {
          VStack(spacing: 12) {
            Image(systemName: "arrow.down.circle.fill")
              .font(.system(size: 48))
              .foregroundColor(.wise2Primary)

            Text("Update Available")
              .font(.headline)
              .foregroundColor(.wise2TextPrimary)

            Text("v\(updateManager.updateVersion ?? "?.?.?")")
              .font(.caption)
              .foregroundColor(.wise2TextSecondary)
          }

          if let notes = updateManager.releaseNotes {
            Text(notes)
              .font(.caption)
              .foregroundColor(.wise2TextMuted)
              .lineLimit(5)
          }

          HStack(spacing: 12) {
            Button(action: { showUpdatePrompt = false }) {
              Text("Later")
                .frame(maxWidth: .infinity)
                .padding(12)
                .background(Color.wise2Surface)
                .foregroundColor(.wise2TextPrimary)
            }

            Button(action: {
              updateManager.installUpdate()
              showUpdatePrompt = false
            }) {
              Text("Update Now")
                .frame(maxWidth: .infinity)
                .padding(12)
                .background(Color.wise2Primary)
                .foregroundColor(.wise2TextPrimary)
            }
          }
        }
        .padding(24)
        .background(Color.wise2SurfaceSecondary)
        .cornerRadius(12)
        .padding(24)
        .transition(.scale.combined(with: .opacity))
      }
    }
    .onAppear {
      Task {
        await updateManager.checkForUpdates()
        if updateManager.updateAvailable {
          try? await Task.sleep(for: .seconds(2))
          withAnimation { showUpdatePrompt = true }
        }
      }
    }
  }
}

#Preview {
  OTAUpdateView()
}
