import Foundation

@MainActor
class OTAUpdateManager: ObservableObject {
  @Published var updateAvailable = false
  @Published var updateVersion: String?
  @Published var releaseNotes: String?
  @Published var isChecking = false

  private let manifestURL = URL(string: "http://173.208.147.165:3000/apps/wise2-ios/ota-manifest.plist")!

  private var currentVersion: String {
    if let version = Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String {
      return version
    }
    return "1.0.0"
  }

  func checkForUpdates() async {
    DispatchQueue.main.async { self.isChecking = true }
    defer { DispatchQueue.main.async { self.isChecking = false } }

    do {
      let (data, _) = try await URLSession.shared.data(from: manifestURL)
      let plist = try PropertyListDecoder().decode([String: [[String: AnyHashable]]].self, from: data)

      guard let items = plist["items"],
            let firstItem = items.first,
            let metadata = firstItem["metadata"] as? [String: AnyHashable] else {
        print("❌ Invalid OTA manifest")
        return
      }

      if let bundleVersion = metadata["bundle-version"] as? String,
         bundleVersion != currentVersion {
        DispatchQueue.main.async {
          self.updateVersion = bundleVersion
          self.releaseNotes = metadata["release-notes"] as? String
          self.updateAvailable = true
          print("✅ Update available: v\(bundleVersion)")
        }
      } else {
        DispatchQueue.main.async {
          self.updateAvailable = false
        }
      }
    } catch {
      print("⚠️ Failed to check for updates: \(error)")
    }
  }

  func installUpdate() {
    guard let updateVersion = updateVersion else { return }
    let manifestURL = "http://173.208.147.165:3000/apps/wise2-ios/ota-manifest.plist"
    let bundleID = Bundle.main.bundleIdentifier ?? "com.wise2.commandcenter.ios"

    if let url = URL(string: "itms-services://?action=purchaseIntent&bundleId=\(bundleID)&url=\(manifestURL.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed)!)") {
      UIApplication.shared.open(url) { success in
        print(success ? "✅ OTA install initiated" : "❌ Failed to open install link")
      }
    }
  }
}
