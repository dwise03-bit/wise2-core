import Foundation
import UIKit

private struct OTAManifest: Decodable { let items: [OTAItem] }
private struct OTAItem: Decodable { let metadata: OTAMetadata }
private struct OTAMetadata: Decodable {
  let bundleVersion: String?
  let releaseNotes: String?
  enum CodingKeys: String, CodingKey { case bundleVersion = "bundle-version", releaseNotes = "release-notes" }
}

@MainActor
class OTAUpdateManager: ObservableObject {
  @Published var updateAvailable = false
  @Published var updateVersion: String?
  @Published var releaseNotes: String?
  @Published var isChecking = false

  private let manifestURL = URL(string: "https://wise2.net/downloads/apps/wise2-ios/ota-manifest.plist")!

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
      let plist = try PropertyListDecoder().decode(OTAManifest.self, from: data)

      guard let metadata = plist.items.first?.metadata else {
        print("❌ Invalid OTA manifest")
        return
      }

      if let bundleVersion = metadata.bundleVersion,
         bundleVersion.compare(currentVersion, options: .numeric) == .orderedDescending {
        DispatchQueue.main.async {
          self.updateVersion = bundleVersion
          self.releaseNotes = metadata.releaseNotes
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
    let manifestURL = self.manifestURL.absoluteString
    let bundleID = Bundle.main.bundleIdentifier ?? "com.wise2.commandcenter.ios"

    if let url = URL(string: "itms-services://?action=download-manifest&bundleId=\(bundleID)&url=\(manifestURL.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed)!)") {
      UIApplication.shared.open(url) { success in
        print(success ? "✅ OTA install initiated" : "❌ Failed to open install link")
      }
    }
  }
}
