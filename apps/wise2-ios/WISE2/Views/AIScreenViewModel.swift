import Foundation
import LocalAuthentication

@MainActor
class AIScreenViewModel: ObservableObject {
  @Published var messages: [ChatMessage] = []
  @Published var inputText = ""
  @Published var isLoading = false
  @Published var errorMessage: String?
  @Published var proposedAction: AIProposedAction?
  @Published var actionHistory: [String] = ["Session restored", "Capabilities loaded", "No critical action executed"]

  private let apiClient = APIClient.shared

  var suggestedCommands: [String] {
    [
      "Brief me on today",
      "Follow up leads",
      "Create invoice draft",
      "Review operations",
      "Prepare deployment restart"
    ]
  }

  var canSend: Bool {
    !inputText.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
  }

  var auditRows: [String] {
    actionHistory.reversed()
  }

  func sendMessage(scope: String) async {
    let prompt = inputText.trimmingCharacters(in: .whitespacesAndNewlines)
    guard !prompt.isEmpty else { return }

    messages.append(
      ChatMessage(
        id: UUID().uuidString,
        role: .user,
        content: prompt,
        timestamp: Date(),
        source: scope
      )
    )
    inputText = ""
    errorMessage = nil

    if proposedMutation(for: prompt, scope: scope) {
      return
    }

    isLoading = true
    do {
      let response = try await apiClient.chat(prompt: prompt)
      messages.append(
        ChatMessage(
          id: UUID().uuidString,
          role: .assistant,
          content: response,
          timestamp: Date(),
          source: "WISE² AI · Level 1 read"
        )
      )
      actionHistory.append("Read request completed: \(prompt)")
    } catch {
      let fallback = "I could not reach the live AI service. I can still prepare safe drafts and approval previews while offline."
      messages.append(
        ChatMessage(
          id: UUID().uuidString,
          role: .assistant,
          content: fallback,
          timestamp: Date(),
          source: "Offline fallback · no backend mutation"
        )
      )
      actionHistory.append("Read request failed without mutation: \(prompt)")
    }
    isLoading = false
  }

  func approveProposedAction() async {
    guard let action = proposedAction else { return }
    proposedAction = nil
    isLoading = true
    try? await Task.sleep(nanoseconds: 450_000_000)
    messages.append(
      ChatMessage(
        id: UUID().uuidString,
        role: .assistant,
        content: "Approved preview recorded. The app will only report execution after a backend-confirmed command endpoint is available.",
        timestamp: Date(),
        source: "Approval policy · \(action.level)"
      )
    )
    actionHistory.append("Approved preview: \(action.title)")
    isLoading = false
  }

  func rejectProposedAction() {
    guard let action = proposedAction else { return }
    proposedAction = nil
    messages.append(
      ChatMessage(
        id: UUID().uuidString,
        role: .assistant,
        content: "Rejected. No change was sent, queued, or retried.",
        timestamp: Date(),
        source: "Approval policy · \(action.level)"
      )
    )
    actionHistory.append("Rejected preview: \(action.title)")
  }

  func confirmCriticalActionWithFaceID() async -> Bool {
    let context = LAContext()
    var error: NSError?
    guard context.canEvaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, error: &error) else {
      errorMessage = "Face ID is unavailable on this device. Critical action remains blocked."
      return false
    }

    do {
      let passed = try await context.evaluatePolicy(
        .deviceOwnerAuthenticationWithBiometrics,
        localizedReason: "Confirm this WISE² critical action."
      )
      actionHistory.append(passed ? "Face ID confirmed for critical preview" : "Face ID failed")
      return passed
    } catch {
      errorMessage = "Face ID confirmation failed. Critical action remains blocked."
      actionHistory.append("Face ID failed for critical preview")
      return false
    }
  }

  func clearConversation() {
    messages.removeAll()
    proposedAction = nil
    errorMessage = nil
  }

  private func proposedMutation(for prompt: String, scope: String) -> Bool {
    let lowered = prompt.lowercased()
    if lowered.contains("invoice") || lowered.contains("follow up") {
      proposedAction = AIProposedAction(
        title: lowered.contains("invoice") ? "Create invoice draft" : "Create lead follow-up task",
        level: "Level 2 · Create/Modify",
        exactMutation: lowered.contains("invoice")
          ? "Draft invoice for \(scope); no payment request will be sent until owner approval."
          : "Create one CRM task in \(scope) assigned to Daniel with today as the due date.",
        auditRows: ["Actor: Daniel Wise", "Scope: \(scope)", "Mutation: draft only", "External visibility: none"]
      )
      actionHistory.append("Prepared Level 2 preview: \(prompt)")
      return true
    }

    if lowered.contains("deploy") || lowered.contains("restart") || lowered.contains("permission") || lowered.contains("payment") {
      proposedAction = AIProposedAction(
        title: "Critical operation preview",
        level: "Level 3 · Critical",
        exactMutation: "Prepare a critical action request for \(scope). Execution is blocked pending explicit approval, Face ID, and server authorization.",
        auditRows: ["Actor: Daniel Wise", "Scope: \(scope)", "Requires: explicit approval + Face ID", "Server enforcement: required"]
      )
      actionHistory.append("Prepared Level 3 preview: \(prompt)")
      return true
    }

    return false
  }
}

struct ChatMessage: Identifiable {
  let id: String
  let role: MessageRole
  let content: String
  let timestamp: Date
  let source: String?

  enum MessageRole {
    case user
    case assistant
  }
}

struct AIProposedAction: Identifiable {
  let id = UUID().uuidString
  let title: String
  let level: String
  let exactMutation: String
  let auditRows: [String]

  var isCritical: Bool {
    level.contains("Level 3")
  }
}
