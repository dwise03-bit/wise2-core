import Foundation
@testable import WISE2

final class FakeBusinessOSService: BusinessOSServing {
  var leadsFixture: [BusinessLead] = []
  var claimError: Error?
  var claimResult = LeadClaimResult(leadId: "l1", claimedBy: "user-a", claimedAt: "2026-01-01T00:00:00Z", status: "claimed")
  var dashboardFixture = BusinessDashboard(revenueToday: 0, revenueMonth: 0, hotLeadCount: 0, activeJobCount: 0, unpaidInvoiceCount: 0, criticalAlertCount: 0)
  var dashboardError: Error?
  var commandFixture = BusinessOperation(operationId: "op", status: "completed", message: "ok", auditEventId: nil, result: CommandResult(summary: "ok", module: .command))
  var commandError: Error?
  var capabilitiesFixture = BusinessCapabilities(trading: false, cloud: false, hvac: true)

  func dashboard() async throws -> BusinessDashboard {
    if let dashboardError { throw dashboardError }
    return dashboardFixture
  }

  func submitCommand(_ text: String) async throws -> BusinessOperation<CommandResult> {
    if let commandError { throw commandError }
    return commandFixture
  }

  func capabilities() async throws -> BusinessCapabilities { capabilitiesFixture }

  func leads(stage: CrmStage?) async throws -> [BusinessLead] { leadsFixture }
  func opportunities() async throws -> [BusinessOpportunity] { [] }
  func claimLead(_ id: String) async throws -> LeadClaimResult {
    if let claimError { throw claimError }
    return claimResult
  }
  func customers() async throws -> [BusinessCustomer] { [] }
  func projects() async throws -> [BusinessProject] { [] }
  func jobs() async throws -> [BusinessJob] { [] }
  func agentJobs(status: String?) async throws -> [AgentJob] { [] }
  func approveAgentJob(_ id: String) async throws -> BusinessOperation<AgentJob> {
    BusinessOperation(operationId: "op", status: "completed", message: "ok", auditEventId: nil, result: nil)
  }
  func rejectAgentJob(_ id: String, note: String?) async throws -> BusinessOperation<AgentJob> {
    BusinessOperation(operationId: "op", status: "completed", message: "ok", auditEventId: nil, result: nil)
  }
  func conversations() async throws -> [BusinessConversation] { [] }
  func phoneDashboard() async throws -> AiPhoneDashboard {
    AiPhoneDashboard(
      config: AiPhoneConfig(
        enabled: true,
        phoneNumber: "+14045550100",
        greeting: "Thanks for calling.",
        afterHoursMessage: nil,
        transferNumber: nil,
        smsEnabled: true,
        voicemailEnabled: true,
        recordingEnabled: true,
        aiPersona: "WISE²",
        timezone: "America/New_York"
      ),
      stats: AiPhoneStats(callsToday: 0, totalCalls: 0, avgDurationSeconds: 0, leadsCaptured: 0, aiActive: true),
      recentCalls: [],
      capabilities: ["Answer inbound calls 24/7 with a custom greeting"],
      poweredBy: "WISE² AI Phone"
    )
  }
  func updatePhoneConfig(_ update: AiPhoneConfigUpdate) async throws -> AiPhoneConfig {
    var config = try await phoneDashboard().config
    if let enabled = update.enabled { config.enabled = enabled }
    if let greeting = update.greeting { config.greeting = greeting }
    return config
  }
  func cloudInventory() async throws -> CloudInventory {
    CloudInventory(apps: [], services: [], controlBridgeConfigured: false)
  }
  func cloudHealth() async throws -> CloudHealth {
    CloudHealth(status: "unavailable", components: [])
  }
  func cloudOperation(_ operation: String, target: String?) async throws -> BusinessOperation<CloudOperationResult> {
    BusinessOperation(operationId: "cloud-op", status: "queued", message: "queued", auditEventId: "audit-1", result: CloudOperationResult(operation: operation, target: target))
  }
  func hvacJobs() async throws -> [HvacJob] { [] }
  func hvacDrafts() async throws -> [HvacDraft] { [] }
  func saveHvacDraft(_ request: HvacDraftRequest) async throws -> HvacDraft {
    HvacDraft(id: "d1", idempotencyKey: request.idempotencyKey, customerId: request.customerId, notes: request.notes, synced: true, createdAt: "2026-01-01T00:00:00Z")
  }
  func studioSummary() async throws -> StudioSummary {
    StudioSummary(campaigns: 0, attributedLeads: 0, attributedRevenue: 0, providerAvailable: false)
  }
  func financeSummary() async throws -> FinanceSummary {
    FinanceSummary(revenueToday: 0, revenueMonth: 0, unpaidInvoiceCount: 0, providerAvailable: false, message: nil)
  }
  func analyticsDashboard() async throws -> AnalyticsDashboard {
    AnalyticsDashboard(totalUsers: 0, activeUsers: 0, totalProjects: 0, totalExports: 0, mrr: 0, churnRate: 0)
  }
}
