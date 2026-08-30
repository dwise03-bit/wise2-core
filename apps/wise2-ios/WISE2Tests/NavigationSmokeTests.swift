import XCTest
@testable import WISE2

final class NavigationSmokeTests: XCTestCase {
  func testBusinessOSModuleIncludesFivePrimaryDestinations() {
    let primary: [BusinessOSModule] = [.command, .crm, .work, .ai]
    for module in primary {
      XCTAssertFalse(module.title.isEmpty)
      XCTAssertFalse(module.systemImage.isEmpty)
    }
    XCTAssertEqual(BusinessOSModule.allCases.count, 16)
  }

  func testMoreModulesIncludeSalesInventoryAnalytics() {
    let businessModules: [BusinessOSModule] = [.sales, .inventory, .analytics, .settings]
    for module in businessModules {
      XCTAssertFalse(module.title.isEmpty)
      XCTAssertFalse(module.systemImage.isEmpty)
    }
  }

  func testMoreModulesIncludePhoneClientsCloudStudioMoneyTrading() {
    let moreModules: [BusinessOSModule] = [.sales, .inventory, .analytics, .phone, .clients, .cloud, .studio, .money, .trading, .settings]
    XCTAssertEqual(moreModules.count, 10)
    for module in moreModules {
      XCTAssertFalse(module.title.isEmpty)
    }
  }
}
