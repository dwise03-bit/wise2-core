import SafariServices
import SwiftUI

struct CompanionSafariView: UIViewControllerRepresentable {
  let url: URL

  func makeUIViewController(context: Context) -> SFSafariViewController {
    let config = SFSafariViewController.Configuration()
    config.entersReaderIfAvailable = false
    let controller = SFSafariViewController(url: url, configuration: config)
    controller.preferredControlTintColor = UIColor(Color.wise2Gold)
    return controller
  }

  func updateUIViewController(_ uiViewController: SFSafariViewController, context: Context) {}
}
