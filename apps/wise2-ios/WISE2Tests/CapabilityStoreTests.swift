import XCTest
@testable import WISE2

@MainActor
final class CapabilityStoreTests: XCTestCase {
  func testUserWithoutTradingCapabilityIsBlocked() async {
    let service = FakeBusinessOSService()
    let store = CapabilityStore(service: service)

    await store.load()

    XCTAssertFalse(store.canAccessTrading)
  }

  func testFounderRoleReceivesTradingCapability() async {
    let service = FakeBusinessOSService()
    service.capabilitiesFixture = BusinessCapabilities(trading: true, cloud: true, hvac: true)
    let store = CapabilityStore(service: service)

    await store.load()

    XCTAssertTrue(store.canAccessTrading)
  }
}
