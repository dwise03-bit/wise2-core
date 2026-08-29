import XCTest
@testable import WISE2

private final class MockBusinessOSTransport: BusinessOSAPITransport {
  var lastGetPath: String?
  var lastPostPath: String?
  var dashboardFixture = BusinessDashboard(
    revenueToday: 0,
    revenueMonth: 0,
    hotLeadCount: 0,
    activeJobCount: 0,
    unpaidInvoiceCount: 0,
    criticalAlertCount: 0
  )

  func authenticatedGet<T>(_ endpoint: String) async throws -> T where T: Decodable {
    lastGetPath = endpoint
    guard endpoint == BusinessOSClient.dashboardPath else {
      throw APIError.notFound
    }
    guard let value = dashboardFixture as? T else {
      throw APIError.invalidResponse
    }
    return value
  }

  func authenticatedPost<T, R>(_ endpoint: String, body: T) async throws -> R where T: Encodable, R: Decodable {
    lastPostPath = endpoint
    guard endpoint == BusinessOSClient.commandPath else {
      throw APIError.notFound
    }
    let operation = BusinessOperation(
      operationId: "op-test",
      status: "completed",
      message: "ok",
      auditEventId: nil,
      result: CommandResult(summary: "done", module: .command)
    )
    guard let value = operation as? R else {
      throw APIError.invalidResponse
    }
    return value
  }
}

final class BusinessOSClientTests: XCTestCase {
  func testDashboardUsesBusinessOSPath() async throws {
    let transport = MockBusinessOSTransport()
    let client = BusinessOSClient(transport: transport)

    let dashboard = try await client.dashboard()

    XCTAssertEqual(transport.lastGetPath, "/business-os/dashboard")
    XCTAssertEqual(dashboard.hotLeadCount, 0)
  }

  func testSubmitCommandUsesBusinessOSPath() async throws {
    let transport = MockBusinessOSTransport()
    let client = BusinessOSClient(transport: transport)

    let operation = try await client.submitCommand("show hot leads")

    XCTAssertEqual(transport.lastPostPath, "/business-os/command")
    XCTAssertEqual(operation.operationId, "op-test")
    XCTAssertEqual(operation.result?.summary, "done")
  }
}
