import XCTest
@testable import WISE2

final class HVACDraftQueueTests: XCTestCase {
  func testDraftQueuePersistsLocallyAndDedupesByIdempotencyKey() {
    let defaults = UserDefaults(suiteName: "HVACDraftQueueTests")!
    defaults.removePersistentDomain(forName: "HVACDraftQueueTests")
    let queue = HVACDraftQueue(defaults: defaults)

    let first = queue.enqueue(notes: "Filter check", customerId: nil)
    queue.markSynced(idempotencyKey: first.idempotencyKey)

    let drafts = queue.all()
    XCTAssertEqual(drafts.count, 1)
    XCTAssertTrue(drafts[0].synced)
  }
}
