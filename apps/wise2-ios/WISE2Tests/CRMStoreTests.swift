import XCTest
@testable import WISE2

@MainActor
final class CRMStoreTests: XCTestCase {
  func testGroupsLeadsByStage() async {
    let service = FakeBusinessOSService()
    service.leadsFixture = [
      BusinessLead(id: "1", businessName: "A", contactName: "Jane", email: "a@test.com", phone: nil, stage: .lead, estimatedOpportunity: 100, claimedBy: nil, claimedAt: nil, source: "prospect"),
      BusinessLead(id: "2", businessName: "B", contactName: "John", email: "b@test.com", phone: nil, stage: .qualified, estimatedOpportunity: 200, claimedBy: nil, claimedAt: nil, source: "prospect"),
    ]
    let store = CRMStore(service: service)

    await store.load()

    XCTAssertEqual(store.leads.count, 2)
    XCTAssertEqual(store.groupedLeads[.lead]?.count, 1)
    XCTAssertEqual(store.groupedLeads[.qualified]?.count, 1)
  }

  func testClaimConflictSurfacesError() async {
    let service = FakeBusinessOSService()
    service.claimError = APIError.forbidden
    let store = CRMStore(service: service)

    await store.claim(
      BusinessLead(id: "1", businessName: "A", contactName: "Jane", email: "a@test.com", phone: nil, stage: .lead, estimatedOpportunity: 0, claimedBy: nil, claimedAt: nil, source: "prospect")
    )

    XCTAssertNotNil(store.errorMessage)
  }
}
