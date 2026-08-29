import XCTest
@testable import WISE2

@MainActor
private final class MockBusinessOSService: BusinessOSServing {
  var dashboardResult: Result<BusinessDashboard, Error> = .success(
    BusinessDashboard(
      revenueToday: 100,
      revenueMonth: 5000,
      hotLeadCount: 2,
      activeJobCount: 1,
      unpaidInvoiceCount: 0,
      criticalAlertCount: 0
    )
  )
  var commandResult: Result<BusinessOperation<CommandResult>, Error> = .success(
    BusinessOperation(
      operationId: "op-1",
      status: "completed",
      message: "ok",
      auditEventId: nil,
      result: CommandResult(summary: "Hot leads ready", module: .crm)
    )
  )

  func dashboard() async throws -> BusinessDashboard { try dashboardResult.get() }
  func submitCommand(_ text: String) async throws -> BusinessOperation<CommandResult> { try commandResult.get() }

  // Stubs for the expanded protocol
  func capabilities() async throws -> BusinessCapabilities { BusinessCapabilities(trading: false, cloud: false, hvac: false) }
  func leads(stage: CrmStage?) async throws -> [BusinessLead] { [] }
  func opportunities() async throws -> [BusinessOpportunity] { [] }
  func claimLead(_ id: String) async throws -> LeadClaimResult {
    LeadClaimResult(leadId: id, claimedBy: "", claimedAt: "", status: "claimed")
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
  func cloudInventory() async throws -> CloudInventory {
    CloudInventory(apps: [], services: [], controlBridgeConfigured: false)
  }
  func cloudHealth() async throws -> CloudHealth {
    CloudHealth(status: "unknown", components: [])
  }
  func cloudOperation(_ operation: String, target: String?) async throws -> BusinessOperation<CloudOperationResult> {
    BusinessOperation(operationId: "op", status: "queued", message: "queued", auditEventId: nil,
                      result: CloudOperationResult(operation: operation, target: target))
  }
  func hvacJobs() async throws -> [HvacJob] { [] }
  func hvacDrafts() async throws -> [HvacDraft] { [] }
  func saveHvacDraft(_ request: HvacDraftRequest) async throws -> HvacDraft {
    HvacDraft(id: "d", idempotencyKey: request.idempotencyKey, customerId: nil,
              notes: request.notes, synced: true, createdAt: "")
  }
  func studioSummary() async throws -> StudioSummary {
    StudioSummary(campaigns: 0, attributedLeads: 0, attributedRevenue: 0, providerAvailable: false)
  }
  func financeSummary() async throws -> FinanceSummary {
    FinanceSummary(revenueToday: 0, revenueMonth: 0, unpaidInvoiceCount: 0, providerAvailable: false, message: nil)
  }
}

@MainActor
final class CommandStoreTests: XCTestCase {
  func testLoadSuccessPopulatesDashboard() async {
    let service = MockBusinessOSService()
    let store = CommandStore(service: service)

    await store.load()

    XCTAssertNotNil(store.dashboard)
    XCTAssertEqual(store.dashboard?.revenueToday, 100)
    XCTAssertFalse(store.isLoading)
    XCTAssertNil(store.errorMessage)
  }

  func testLoadFailureSetsError() async {
    struct TestError: LocalizedError {
      var errorDescription: String? { "network down" }
    }

    let service = MockBusinessOSService()
    service.dashboardResult = .failure(TestError())
    let store = CommandStore(service: service)

    await store.load()

    XCTAssertNil(store.dashboard)
    XCTAssertEqual(store.errorMessage, "network down")
  }

  func testSubmitCommandStoresResult() async {
    let service = MockBusinessOSService()
    let store = CommandStore(service: service)

    await store.submit("show hot leads")

    XCTAssertEqual(store.lastCommandResult?.summary, "Hot leads ready")
    XCTAssertEqual(store.lastOperation?.status, "completed")
    XCTAssertEqual(store.lastOperation?.operationId, "op-1")
    XCTAssertFalse(store.isSubmitting)
  }
}
