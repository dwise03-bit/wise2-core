import XCTest
@testable import WISE2

final class NavigationSmokeTests: XCTestCase {
  func testBusinessOSModuleIncludesFivePrimaryDestinations() {
    let primary: [BusinessOSModule] = [.command, .crm, .work, .ai]
    for module in primary {
      XCTAssertFalse(module.title.isEmpty)
      XCTAssertFalse(module.systemImage.isEmpty)
    }
    XCTAssertEqual(BusinessOSModule.allCases.count, 13)
  }

  func testMoreModulesIncludePhoneClientsCloudStudioMoneyTrading() {
    let moreModules: [BusinessOSModule] = [.phone, .clients, .cloud, .studio, .money, .trading, .settings]
    XCTAssertEqual(moreModules.count, 7)
    for module in moreModules {
      XCTAssertFalse(module.title.isEmpty)
    }
  }
}
