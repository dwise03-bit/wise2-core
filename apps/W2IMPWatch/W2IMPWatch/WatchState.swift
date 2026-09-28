import Foundation
import SwiftUI

enum DisplayState: String, CaseIterable {
    case idle = "02_idle_state"
    case wake = "03_wake_state"
    case charging = "04_charging_state"
    case notification = "05_notification_state"
    case night = "06_night_mode"
    case alwaysOn = "07_always_on_mode"

    var imageName: String {
        self.rawValue
    }

    var displayName: String {
        switch self {
        case .idle: return "Idle"
        case .wake: return "Wake"
        case .charging: return "Charging"
        case .notification: return "Alert"
        case .night: return "Night"
        case .alwaysOn: return "Always On"
        }
    }
}

@MainActor
class WatchViewModel: ObservableObject {
    @Published var currentState: DisplayState = .idle
    @Published var showingStatePicker = false

    private var resetTimer: Timer?
    private let resetDuration: TimeInterval = 2.5

    func tapWatchFace() {
        // Only transition to wake if not already there
        if currentState != .wake {
            currentState = .wake
            scheduleReturnToIdle()
        }
    }

    private func scheduleReturnToIdle() {
        // Cancel any existing timer
        resetTimer?.invalidate()

        resetTimer = Timer.scheduledTimer(withTimeInterval: resetDuration, repeats: false) { [weak self] _ in
            Task { @MainActor in
                withAnimation {
                    self?.currentState = .idle
                }
            }
        }
    }

    func setState(_ state: DisplayState) {
        currentState = state
        resetTimer?.invalidate()
    }

    deinit {
        resetTimer?.invalidate()
    }
}
