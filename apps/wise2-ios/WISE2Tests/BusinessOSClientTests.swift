import XCTest
@testable import WISE2

private final class MockBusinessOSTransport: BusinessOSAPITransport {
  var lastGetPath: String?
  var lastPostPath: String?
  var lastPatchPath: String?
  var dashboardFixture = BusinessDashboard(
    revenueToday: 0,
    revenueMonth: 0,
    hotLeadCount: 0,
    activeJobCount: 0,
    unpaidInvoiceCount: 0,
    criticalAlertCount: 0
  )
  var phoneFixture = AiPhoneDashboard(
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
    stats: AiPhoneStats(callsToday: 2, totalCalls: 4, avgDurationSeconds: 90, leadsCaptured: 1, aiActive: true),
    recentCalls: [],
    capabilities: ["Answer inbound calls 24/7 with a custom greeting"],
    poweredBy: "WISE² AI Phone"
  )

  func authenticatedGet<T>(_ endpoint: String) async throws -> T where T: Decodable {
    lastGetPath = endpoint
    if endpoint == BusinessOSClient.dashboardPath {
      guard let value = dashboardFixture as? T else { throw APIError.invalidResponse }
      return value
    }
    if endpoint == "/business-os/phone" {
      guard let value = phoneFixture as? T else { throw APIError.invalidResponse }
      return value
    }
    throw APIError.notFound
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

  func authenticatedPatch<T, R>(_ endpoint: String, body: T) async throws -> R where T: Encodable, R: Decodable {
    lastPatchPath = endpoint
    let response = AiPhoneConfigResponse(config: phoneFixture.config)
    guard let value = response as? R else { throw APIError.invalidResponse }
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

  func testPhoneDashboardUsesBusinessOSPath() async throws {
    let transport = MockBusinessOSTransport()
    let client = BusinessOSClient(transport: transport)

    let dashboard = try await client.phoneDashboard()

    XCTAssertEqual(transport.lastGetPath, "/business-os/phone")
    XCTAssertEqual(dashboard.poweredBy, "WISE² AI Phone")
    XCTAssertEqual(dashboard.stats.callsToday, 2)
  }
}
