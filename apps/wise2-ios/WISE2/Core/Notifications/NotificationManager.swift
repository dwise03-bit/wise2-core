import Foundation
import UserNotifications
import Combine

@MainActor
class NotificationManager: NSObject, ObservableObject, UNUserNotificationCenterDelegate {
  static let shared = NotificationManager()

  @Published var notificationPermissionGranted = false
  @Published var pendingNotifications: [LocalNotification] = []

  override init() {
    super.init()
    UNUserNotificationCenter.current().delegate = self
    Task {
      await checkNotificationPermission()
    }
  }

  func requestPermission() async {
    do {
      let granted = try await UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .sound, .badge])
      await MainActor.run {
        notificationPermissionGranted = granted
      }
      print("✅ Notifications \(granted ? "enabled" : "denied")")
    } catch {
      print("❌ Notification request error: \(error)")
    }
  }

  private func checkNotificationPermission() async {
    let settings = await UNUserNotificationCenter.current().notificationSettings()
    await MainActor.run {
      notificationPermissionGranted = settings.authorizationStatus == .authorized
    }
  }

  func scheduleNotification(title: String, body: String, delay: TimeInterval = 5) {
    let content = UNMutableNotificationContent()
    content.title = title
    content.body = body
    content.sound = .default
    content.badge = NSNumber(value: UIApplication.shared.applicationIconBadgeNumber + 1)

    let trigger = UNTimeIntervalNotificationTrigger(timeInterval: delay, repeats: false)
    let request = UNNotificationRequest(identifier: UUID().uuidString, content: content, trigger: trigger)

    UNUserNotificationCenter.current().add(request) { error in
      if let error = error {
        print("❌ Notification error: \(error)")
      } else {
        print("✅ Notification scheduled: \(title)")
      }
    }
  }

  func userNotificationCenter(
    _ center: UNUserNotificationCenter,
    willPresent notification: UNNotification,
    withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void
  ) {
    let userInfo = notification.request.content.userInfo
    print("📬 Notification received: \(userInfo)")
    completionHandler([.banner, .sound, .badge])
  }

  func userNotificationCenter(
    _ center: UNUserNotificationCenter,
    didReceive response: UNNotificationResponse,
    withCompletionHandler completionHandler: @escaping () -> Void
  ) {
    let userInfo = response.notification.request.content.userInfo
    print("📬 Notification tapped: \(userInfo)")
    completionHandler()
  }
}

struct LocalNotification: Identifiable {
  let id = UUID()
  let title: String
  let body: String
  let timestamp: Date
}
