import XCTest
@testable import WISE2

final class BusinessOSModelsTests: XCTestCase {
  func testDecodesBusinessDashboardFixture() throws {
    let json = """
    {
      "revenueToday": 425.50,
      "revenueMonth": 8320.00,
      "hotLeadCount": 4,
      "activeJobCount": 3,
      "unpaidInvoiceCount": 2,
      "criticalAlertCount": 1
    }
    """.data(using: .utf8)!

    let dashboard = try JSONDecoder().decode(BusinessDashboard.self, from: json)

    XCTAssertEqual(dashboard.revenueToday, 425.50)
    XCTAssertEqual(dashboard.revenueMonth, 8320.00)
    XCTAssertEqual(dashboard.hotLeadCount, 4)
    XCTAssertEqual(dashboard.activeJobCount, 3)
    XCTAssertEqual(dashboard.unpaidInvoiceCount, 2)
    XCTAssertEqual(dashboard.criticalAlertCount, 1)
  }

  func testDecodesBusinessOperationEnvelope() throws {
    let json = """
    {
      "operationId": "op-1",
      "status": "completed",
      "message": "ok",
      "auditEventId": "audit-1",
      "result": {
        "summary": "Business summary ready",
        "module": "command"
      }
    }
    """.data(using: .utf8)!

    let operation = try JSONDecoder().decode(BusinessOperation<CommandResult>.self, from: json)

    XCTAssertEqual(operation.operationId, "op-1")
    XCTAssertEqual(operation.status, "completed")
    XCTAssertEqual(operation.message, "ok")
    XCTAssertEqual(operation.auditEventId, "audit-1")
    XCTAssertEqual(operation.result?.summary, "Business summary ready")
    XCTAssertEqual(operation.result?.module, .command)
  }

  func testBusinessOSModuleRawValues() {
    XCTAssertEqual(BusinessOSModule.command.rawValue, "command")
    XCTAssertEqual(BusinessOSModule.settings.rawValue, "settings")
    XCTAssertEqual(BusinessOSModule.hvac.rawValue, "hvac")
    XCTAssertEqual(BusinessOSModule.allCases.count, 13)
  }
}
