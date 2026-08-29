import Foundation

@MainActor
final class CRMStore: ObservableObject {
  @Published private(set) var leads: [BusinessLead] = []
  @Published private(set) var opportunities: [BusinessOpportunity] = []
  @Published private(set) var selectedStage: CrmStage?
  @Published private(set) var isLoading = false
  @Published private(set) var errorMessage: String?
  @Published private(set) var claimMessage: String?

  private let service: BusinessOSServing

  init(service: BusinessOSServing = BusinessOSClient()) {
    self.service = service
  }

  var groupedLeads: [CrmStage: [BusinessLead]] {
    Dictionary(grouping: leads, by: \.stage)
  }

  func load(stage: CrmStage? = nil) async {
    selectedStage = stage
    isLoading = true
    errorMessage = nil
    defer { isLoading = false }
    do {
      async let leadsTask = service.leads(stage: stage)
      async let oppsTask = service.opportunities()
      leads = try await leadsTask
      opportunities = try await oppsTask
    } catch {
      errorMessage = error.localizedDescription
    }
  }

  func claim(_ lead: BusinessLead) async {
    claimMessage = nil
    errorMessage = nil
    do {
      let result = try await service.claimLead(lead.id)
      claimMessage = result.status == "claimed" ? "Lead claimed" : "Already claimed by you"
      await load(stage: selectedStage)
    } catch {
      errorMessage = error.localizedDescription
    }
  }
}
