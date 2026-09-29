import Foundation

protocol BusinessOSAPITransport {
  func authenticatedGet<T: Decodable>(_ endpoint: String) async throws -> T
  func authenticatedPost<T: Encodable, R: Decodable>(_ endpoint: String, body: T) async throws -> R
  func authenticatedPatch<T: Encodable, R: Decodable>(_ endpoint: String, body: T) async throws -> R
}

extension APIClient: BusinessOSAPITransport {}

/// Empty body for POST requests that carry no payload.
struct BusinessOSEmptyBody: Encodable {}

protocol BusinessOSServing {
  func dashboard() async throws -> BusinessDashboard
  func submitCommand(_ text: String) async throws -> BusinessOperation<CommandResult>
  func capabilities() async throws -> BusinessCapabilities

  func leads(stage: CrmStage?) async throws -> [BusinessLead]
  func opportunities() async throws -> [BusinessOpportunity]
  func claimLead(_ id: String) async throws -> LeadClaimResult

  func customers() async throws -> [BusinessCustomer]

  func projects() async throws -> [BusinessProject]
  func jobs() async throws -> [BusinessJob]

  func agentJobs(status: String?) async throws -> [AgentJob]
  func approveAgentJob(_ id: String) async throws -> BusinessOperation<AgentJob>
  func rejectAgentJob(_ id: String, note: String?) async throws -> BusinessOperation<AgentJob>

  func conversations() async throws -> [BusinessConversation]
  func phoneDashboard() async throws -> AiPhoneDashboard
  func updatePhoneConfig(_ update: AiPhoneConfigUpdate) async throws -> AiPhoneConfig

  func cloudInventory() async throws -> CloudInventory
  func cloudHealth() async throws -> CloudHealth
  func cloudOperation(_ operation: String, target: String?) async throws -> BusinessOperation<CloudOperationResult>

  func hvacJobs() async throws -> [HvacJob]
  func hvacDrafts() async throws -> [HvacDraft]
  func saveHvacDraft(_ request: HvacDraftRequest) async throws -> HvacDraft

  func studioSummary() async throws -> StudioSummary
  func financeSummary() async throws -> FinanceSummary
  func analyticsDashboard() async throws -> AnalyticsDashboard
}

final class BusinessOSClient: BusinessOSServing {
  static let dashboardPath = "/business-os/dashboard"
  static let commandPath = "/business-os/command"

  private let transport: BusinessOSAPITransport

  init(transport: BusinessOSAPITransport = APIClient.shared) {
    self.transport = transport
  }

  func dashboard() async throws -> BusinessDashboard {
    try await transport.authenticatedGet(Self.dashboardPath)
  }

  func submitCommand(_ text: String) async throws -> BusinessOperation<CommandResult> {
    struct Request: Encodable { let text: String }
    return try await transport.authenticatedPost(Self.commandPath, body: Request(text: text))
  }

  func capabilities() async throws -> BusinessCapabilities {
    try await transport.authenticatedGet("/business-os/capabilities")
  }

  func leads(stage: CrmStage?) async throws -> [BusinessLead] {
    let path = stage.map { "/business-os/crm/leads?stage=\($0.rawValue)" }
      ?? "/business-os/crm/leads"
    return try await transport.authenticatedGet(path)
  }

  func opportunities() async throws -> [BusinessOpportunity] {
    try await transport.authenticatedGet("/business-os/crm/opportunities")
  }

  func claimLead(_ id: String) async throws -> LeadClaimResult {
    try await transport.authenticatedPost(
      "/business-os/crm/leads/\(id)/claim",
      body: BusinessOSEmptyBody()
    )
  }

  func customers() async throws -> [BusinessCustomer] {
    try await transport.authenticatedGet("/business-os/clients")
  }

  func projects() async throws -> [BusinessProject] {
    try await transport.authenticatedGet("/business-os/work/projects")
  }

  func jobs() async throws -> [BusinessJob] {
    try await transport.authenticatedGet("/business-os/work/jobs")
  }

  func agentJobs(status: String?) async throws -> [AgentJob] {
    let path = status.map { "/business-os/ai/jobs?status=\($0)" }
      ?? "/business-os/ai/jobs"
    return try await transport.authenticatedGet(path)
  }

  func approveAgentJob(_ id: String) async throws -> BusinessOperation<AgentJob> {
    try await transport.authenticatedPost(
      "/business-os/ai/jobs/\(id)/approve",
      body: BusinessOSEmptyBody()
    )
  }

  func rejectAgentJob(_ id: String, note: String?) async throws -> BusinessOperation<AgentJob> {
    struct RejectBody: Encodable { let note: String? }
    return try await transport.authenticatedPost(
      "/business-os/ai/jobs/\(id)/reject",
      body: RejectBody(note: note)
    )
  }

  func conversations() async throws -> [BusinessConversation] {
    try await transport.authenticatedGet("/business-os/comms/conversations")
  }

  func phoneDashboard() async throws -> AiPhoneDashboard {
    try await transport.authenticatedGet("/business-os/phone")
  }

  func updatePhoneConfig(_ update: AiPhoneConfigUpdate) async throws -> AiPhoneConfig {
    let response: AiPhoneConfigResponse = try await transport.authenticatedPatch(
      "/business-os/phone",
      body: update
    )
    return response.config
  }

  func cloudInventory() async throws -> CloudInventory {
    try await transport.authenticatedGet("/business-os/cloud/inventory")
  }

  func cloudHealth() async throws -> CloudHealth {
    try await transport.authenticatedGet("/business-os/cloud/health")
  }

  func cloudOperation(
    _ operation: String,
    target: String?
  ) async throws -> BusinessOperation<CloudOperationResult> {
    struct OperationRequest: Encodable {
      let operation: String
      let target: String?
    }
    return try await transport.authenticatedPost(
      "/business-os/cloud/operations",
      body: OperationRequest(operation: operation, target: target)
    )
  }

  func hvacJobs() async throws -> [HvacJob] {
    try await transport.authenticatedGet("/business-os/hvac/jobs")
  }

  func hvacDrafts() async throws -> [HvacDraft] {
    try await transport.authenticatedGet("/business-os/hvac/drafts")
  }

  func saveHvacDraft(_ request: HvacDraftRequest) async throws -> HvacDraft {
    try await transport.authenticatedPost("/business-os/hvac/drafts", body: request)
  }

  func studioSummary() async throws -> StudioSummary {
    try await transport.authenticatedGet("/business-os/studio/summary")
  }

  func financeSummary() async throws -> FinanceSummary {
    try await transport.authenticatedGet("/business-os/finance/summary")
  }

  func analyticsDashboard() async throws -> AnalyticsDashboard {
    try await transport.authenticatedGet("/analytics/dashboard")
  }
}
