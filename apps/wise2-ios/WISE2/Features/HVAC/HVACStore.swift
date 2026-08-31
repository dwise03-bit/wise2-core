import Foundation

@MainActor
final class HVACStore: ObservableObject {
  @Published private(set) var jobs: [HvacJob] = []
  @Published private(set) var drafts: [HVACDraftRecord] = []
  @Published private(set) var isLoading = false
  @Published private(set) var errorMessage: String?
  @Published var draftNotes = ""

  private let service: BusinessOSServing
  private let draftQueue: HVACDraftQueue

  init(service: BusinessOSServing = BusinessOSClient(), draftQueue: HVACDraftQueue = HVACDraftQueue()) {
    self.service = service
    self.draftQueue = draftQueue
  }

  func load() async {
    isLoading = true
    errorMessage = nil
    drafts = draftQueue.all()
    defer { isLoading = false }
    do {
      jobs = try await service.hvacJobs()
    } catch {
      errorMessage = error.localizedDescription
    }
  }

  func saveDraft() async {
    let notes = draftNotes.trimmingCharacters(in: .whitespacesAndNewlines)
    guard !notes.isEmpty else { return }
    let local = draftQueue.enqueue(notes: notes, customerId: nil)
    drafts = draftQueue.all()
    draftNotes = ""
    do {
      _ = try await service.saveHvacDraft(
        HvacDraftRequest(idempotencyKey: local.idempotencyKey, customerId: nil, notes: notes)
      )
      draftQueue.markSynced(idempotencyKey: local.idempotencyKey)
      drafts = draftQueue.all()
    } catch {
      errorMessage = "Draft saved locally; sync pending when online."
    }
  }
}
