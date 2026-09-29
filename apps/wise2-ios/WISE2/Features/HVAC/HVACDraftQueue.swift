import Foundation

struct HVACDraftRecord: Codable, Equatable, Identifiable {
  let id: String
  let idempotencyKey: String
  let notes: String
  let customerId: String?
  let createdAt: Date
  var synced: Bool
}

final class HVACDraftQueue {
  private let defaults: UserDefaults
  private let storageKey = "wise2.hvac.drafts"

  init(defaults: UserDefaults = .standard) {
    self.defaults = defaults
  }

  func all() -> [HVACDraftRecord] {
    guard let data = defaults.data(forKey: storageKey) else { return [] }
    return (try? JSONDecoder().decode([HVACDraftRecord].self, from: data)) ?? []
  }

  func enqueue(notes: String, customerId: String?) -> HVACDraftRecord {
    var drafts = all()
    let key = UUID().uuidString
    let record = HVACDraftRecord(
      id: key,
      idempotencyKey: key,
      notes: notes,
      customerId: customerId,
      createdAt: Date(),
      synced: false
    )
    drafts.insert(record, at: 0)
    persist(drafts)
    return record
  }

  func markSynced(idempotencyKey: String) {
    var drafts = all()
    guard let index = drafts.firstIndex(where: { $0.idempotencyKey == idempotencyKey }) else { return }
    drafts[index].synced = true
    persist(drafts)
  }

  private func persist(_ drafts: [HVACDraftRecord]) {
    if let data = try? JSONEncoder().encode(drafts) {
      defaults.set(data, forKey: storageKey)
    }
  }
}
