import SwiftUI

struct SettingsView: View {
  @State private var apiURL = UserDefaults.standard.string(forKey: "API_BASE_URL") ?? "http://173.208.147.165:3010/v1"
  @State private var showSaved = false
  @StateObject private var updateManager = OTAUpdateManager()
  @State private var checkingUpdates = false

  var appVersion: String {
    if let version = Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String {
      return version
    }
    return "Unknown"
  }

  var body: some View {
    NavigationStack {
      Form {
        Section("App Information") {
          HStack {
            Text("Version")
            Spacer()
            Text(appVersion)
              .foregroundColor(.wise2TextSecondary)
              .fontWeight(.semibold)
          }

          Button(action: checkForUpdates) {
            HStack {
              if checkingUpdates {
                ProgressView()
                  .scaleEffect(0.8, anchor: .center)
              } else {
                Image(systemName: "arrow.down.circle")
              }
              Text("Check for Updates")
              Spacer()
              if updateManager.updateAvailable {
                Text("Update available")
                  .font(.caption)
                  .foregroundColor(.green)
              }
            }
            .foregroundColor(.wise2Primary)
          }
          .disabled(checkingUpdates)
        }

        Section("API Configuration") {
          TextField("API Base URL", text: $apiURL)
            .textContentType(.URL)
            .autocorrectionDisabled()
            .textInputAutocapitalization(.never)

          Button(action: saveAndRestart) {
            Text("Save & Restart App")
              .frame(maxWidth: .infinity)
              .foregroundColor(.white)
          }
          .buttonStyle(.borderedProminent)
          .tint(.wise2Primary)
        }

        Section("Current Configuration") {
          Text(apiURL)
            .font(.caption)
            .foregroundColor(.wise2TextMuted)
            .textSelection(.enabled)
        }

        Section("Presets") {
          Button(action: { setVPS() }) {
            HStack {
              Text("VPS Production")
              Spacer()
              Text("173.208.147.165:3010")
                .font(.caption)
                .foregroundColor(.wise2TextSecondary)
            }
          }
          .foregroundColor(.wise2TextPrimary)

          Button(action: { setLocal() }) {
            HStack {
              Text("Local Development")
              Spacer()
              Text("192.168.8.137:3005")
                .font(.caption)
                .foregroundColor(.wise2TextSecondary)
            }
          }
          .foregroundColor(.wise2TextPrimary)
        }
      }
      .navigationTitle("Settings")
      .alert("Saved", isPresented: $showSaved) {
        Button("OK") {
          // Restart app
          exit(0)
        }
      } message: {
        Text("API endpoint updated. App will restart.")
      }
    }
  }

  func setVPS() {
    apiURL = "http://173.208.147.165:3010/v1"
  }

  func setLocal() {
    apiURL = "http://192.168.8.137:3005/v1"
  }

  func saveAndRestart() {
    UserDefaults.standard.set(apiURL, forKey: "API_BASE_URL")
    showSaved = true
  }

  func checkForUpdates() {
    checkingUpdates = true
    Task {
      await updateManager.checkForUpdates()
      checkingUpdates = false
    }
  }
}

#Preview {
  SettingsView()
}
