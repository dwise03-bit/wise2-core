import XCTest
@testable import WISE2

@MainActor
final class CloudStoreTests: XCTestCase {
  func testSensitiveActionRequiresConfirmationBeforeDispatch() async {
    let service = FakeBusinessOSService()
    let authorizer = PreviewSensitiveActionAuthorizer(shouldAuthorize: false)
    let store = CloudStore(service: service, authorizer: authorizer)

    store.requestOperation("deploy", target: "wise2-api")
    XCTAssertTrue(store.awaitingConfirmation)

    await store.confirmPendingOperation()

    XCTAssertNil(store.lastOperation)
    XCTAssertEqual(store.errorMessage, "Biometric confirmation required")
  }

  func testAuthorizedOperationDispatchesAfterConfirmation() async {
    let service = FakeBusinessOSService()
    let authorizer = PreviewSensitiveActionAuthorizer(shouldAuthorize: true)
    let store = CloudStore(service: service, authorizer: authorizer)

    store.requestOperation("healthCheck")
    await store.confirmPendingOperation()

    XCTAssertEqual(store.lastOperation?.operationId, "cloud-op")
    XCTAssertEqual(store.lastOperation?.auditEventId, "audit-1")
  }
}
