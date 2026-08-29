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

  func dashboard() async throws -> BusinessDashboard {
    try dashboardResult.get()
  }

  func submitCommand(_ text: String) async throws -> BusinessOperation<CommandResult> {
    try commandResult.get()
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
