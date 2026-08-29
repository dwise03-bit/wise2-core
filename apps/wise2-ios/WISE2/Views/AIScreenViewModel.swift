import Foundation
import LocalAuthentication

@MainActor
class AIScreenViewModel: ObservableObject {
  @Published var messages: [ChatMessage] = []
  @Published var inputText = ""
  @Published var isLoading = false
  @Published var errorMessage: String?
  @Published var proposedAction: AIProposedAction?
  @Published var pendingApprovals: [HermesActionItem] = []
  @Published var actionHistory: [String] = ["Session restored", "Capabilities loaded"]

  private let apiClient = APIClient.shared

  var suggestedCommands: [String] {
    [
      "Brief me on today",
      "Follow up leads",
      "Create invoice draft",
      "Review operations",
      "Prepare deployment restart",
    ]
  }

  var canSend: Bool {
    !inputText.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
  }

  var auditRows: [String] {
    actionHistory.reversed()
  }

  func loadPendingApprovals() async {
    do {
      pendingApprovals = try await apiClient.getPendingApprovals()
      if !pendingApprovals.isEmpty {
        actionHistory.append("Loaded \(pendingApprovals.count) pending Hermes approvals")
      }
    } catch {
      // Non-fatal — chat still works.
      errorMessage = error.localizedDescription
    }
  }

  func sendMessage(scope: String) async {
    let prompt = inputText.trimmingCharacters(in: .whitespacesAndNewlines)
    guard !prompt.isEmpty else { return }

    messages.append(
      ChatMessage(
        id: UUID().uuidString,
        content: prompt,
        role: .user,
        timestamp: Date(),
        source: scope
      )
    )
    inputText = ""
    errorMessage = nil

    if await prepareBackendApproval(for: prompt, scope: scope) {
      return
    }

    isLoading = true
    do {
      let response = try await apiClient.chat(prompt: prompt, scope: scope)
      messages.append(
        ChatMessage(
          id: response.id,
          content: response.content,
          role: response.role,
          timestamp: response.timestamp,
          source: response.source ?? "WISE² AI · Level 1 read"
        )
      )
      actionHistory.append("Hermes chat completed: \(prompt)")
    } catch {
      messages.append(
        ChatMessage(
          id: UUID().uuidString,
          content: "I could not reach Hermes. No mutation was queued.",
          role: .assistant,
          timestamp: Date(),
          source: "Offline fallback"
        )
      )
      actionHistory.append("Chat failed: \(prompt)")
    }
    isLoading = false
  }

  func approveProposedAction() async {
    guard let action = proposedAction else { return }
    if action.isCritical {
      let passed = await confirmCriticalActionWithFaceID()
      guard passed else { return }
    }

    isLoading = true
    do {
      try await apiClient.decideHermesAction(
        id: action.id,
        approve: true,
        note: "Approved from Command Center AI"
      )
      proposedAction = nil
      messages.append(
        ChatMessage(
          id: UUID().uuidString,
          content: "Approved on Hermes. Execution still requires the backend capability for this action kind.",
          role: .assistant,
          timestamp: Date(),
          source: "Hermes approval · \(action.level)"
        )
      )
      actionHistory.append("Approved Hermes action: \(action.title)")
      await loadPendingApprovals()
    } catch {
      errorMessage = error.localizedDescription
      actionHistory.append("Approve failed: \(action.title)")
    }
    isLoading = false
  }

  func rejectProposedAction() async {
    guard let action = proposedAction else { return }
    do {
      try await apiClient.decideHermesAction(
        id: action.id,
        approve: false,
        note: "Rejected from Command Center AI"
      )
      proposedAction = nil
      messages.append(
        ChatMessage(
          id: UUID().uuidString,
          content: "Rejected on Hermes. No change was executed.",
          role: .assistant,
          timestamp: Date(),
          source: "Hermes rejection · \(action.level)"
        )
      )
      actionHistory.append("Rejected Hermes action: \(action.title)")
      await loadPendingApprovals()
    } catch {
      errorMessage = error.localizedDescription
    }
  }

  func openPendingApproval(_ item: HermesActionItem) {
    proposedAction = AIProposedAction(
      id: item.id,
      title: item.title,
      exactMutation: item.summary ?? "Hermes action \(item.kind) · risk \(item.risk)",
      level: item.risk.lowercased() == "critical" ? "Level 3 · Critical" : "Level 2 · Create/Modify",
      isCritical: item.risk.lowercased() == "critical" || item.risk.lowercased() == "high",
      auditRows: [
        "Hermes id: \(item.id)",
        "Mode: \(item.mode)",
        "Kind: \(item.kind)",
        "Status: \(item.status)",
      ]
    )
  }

  func confirmCriticalActionWithFaceID() async -> Bool {
    let context = LAContext()
    var error: NSError?
    // Prefer biometrics; fall back to device passcode so operator preview still works.
    let policy: LAPolicy = context.canEvaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, error: &error)
      ? .deviceOwnerAuthenticationWithBiometrics
      : .deviceOwnerAuthentication
    guard context.canEvaluatePolicy(policy, error: &error) else {
      errorMessage = "Device authentication is unavailable. Critical action remains blocked."
      return false
    }
    do {
      return try await context.evaluatePolicy(
        policy,
        localizedReason: "Confirm this WISE² critical business action."
      )
    } catch {
      errorMessage = "Authentication failed. Critical action remains blocked."
      return false
    }
  }

  func clearConversation() {
    messages.removeAll()
    proposedAction = nil
    errorMessage = nil
  }

  private func prepareBackendApproval(for prompt: String, scope: String) async -> Bool {
    let lowered = prompt.lowercased()
    let isInvoiceOrFollowUp = lowered.contains("invoice") || lowered.contains("follow up") || lowered.contains("follow-up")
    let isCritical = lowered.contains("deploy") || lowered.contains("restart") || lowered.contains("permission") || lowered.contains("payment")
    guard isInvoiceOrFollowUp || isCritical else { return false }

    let title: String
    let kind: String
    let risk: String
    let summary: String
    if isCritical {
      title = "Critical operation request"
      kind = "systems.critical_preview"
      risk = "critical"
      summary = "Prepare a critical action for \(scope). Execution stays blocked until Hermes approval and server capability."
    } else if lowered.contains("invoice") {
      title = "Create invoice draft"
      kind = "finance.invoice_draft"
      risk = "medium"
      summary = "Draft invoice for \(scope); no payment request until owner approval."
    } else {
      title = "Create lead follow-up task"
      kind = "crm.follow_up"
      risk = "medium"
      summary = "Create one CRM follow-up in \(scope) assigned to the operator."
    }

    isLoading = true
    defer { isLoading = false }

    do {
      let created = try await apiClient.createHermesAction(
        title: title,
        summary: summary,
        kind: kind,
        risk: risk,
        mode: BusinessScope.hermesMode(for: scope),
        requiresApproval: true
      )
      proposedAction = AIProposedAction(
        id: created.id,
        title: created.title,
        exactMutation: created.summary ?? summary,
        level: isCritical ? "Level 3 · Critical" : "Level 2 · Create/Modify",
        isCritical: isCritical,
        auditRows: [
          "Hermes id: \(created.id)",
          "Scope: \(scope)",
          "Mode: \(created.mode)",
          "Server status: \(created.status)",
        ]
      )
      actionHistory.append("Queued Hermes approval: \(title)")
      await loadPendingApprovals()
      return true
    } catch {
      errorMessage = "Could not queue Hermes approval: \(error.localizedDescription)"
      return false
    }
  }
}
