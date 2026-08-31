import Foundation

@MainActor
final class SettingsStore: ObservableObject {
  @Published private(set) var apiBaseURL: String = ""
  @Published private(set) var isOperatorPreview = false

  func refreshEnvironment() async {
    apiBaseURL = await APIClient.shared.baseURLString
    isOperatorPreview = await APIClient.shared.isOperatorPreviewMode
  }
}
