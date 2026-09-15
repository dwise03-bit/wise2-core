import Foundation

@MainActor
final class AIWorkforceStore: ObservableObject {
  @Published private(set) var jobs: [AgentJob] = []
  @Published private(set) var isLoading = false
  @Published private(set) var errorMessage: String?
  @Published private(set) var actionMessage: String?

  private let service: BusinessOSServing

  init(service: BusinessOSServing = BusinessOSClient()) {
    self.service = service
  }

  var pendingJobs: [AgentJob] {
    jobs.filter { $0.requiresApproval && $0.status == "pending_approval" }
  }

  func load() async {
    isLoading = true
    errorMessage = nil
    defer { isLoading = false }
    do {
      jobs = try await service.agentJobs(status: nil)
    } catch {
      errorMessage = error.localizedDescription
    }
  }

  func approve(_ job: AgentJob) async {
    actionMessage = nil
    do {
      _ = try await service.approveAgentJob(job.id)
      actionMessage = "Approved \(job.summary)"
      await load()
    } catch {
      errorMessage = error.localizedDescription
    }
  }

  func reject(_ job: AgentJob) async {
    actionMessage = nil
    do {
      _ = try await service.rejectAgentJob(job.id, note: "Rejected from Business OS")
      actionMessage = "Rejected \(job.summary)"
      await load()
    } catch {
      errorMessage = error.localizedDescription
    }
  }
}
