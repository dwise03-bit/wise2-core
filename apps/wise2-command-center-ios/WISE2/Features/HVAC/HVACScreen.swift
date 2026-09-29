import SwiftUI

struct HVACScreen: View {
  @StateObject private var store = HVACStore()

  var body: some View {
    Group {
      if store.isLoading && store.jobs.isEmpty {
        ProgressView("Loading HVAC jobs…")
      } else {
        List {
          Section("Field jobs") {
            if store.jobs.isEmpty {
              Text("No HVAC jobs").foregroundColor(.wise2TextMuted)
            } else {
              ForEach(store.jobs) { job in
                VStack(alignment: .leading, spacing: 4) {
                  Text(job.customerName).foregroundColor(.wise2TextPrimary)
                  Text("\(job.status) · \(job.technician ?? "Unassigned")")
                    .font(.caption)
                    .foregroundColor(.wise2TextSecondary)
                }
                .listRowBackground(Color.wise2Surface)
              }
            }
          }
          Section("Offline draft") {
            TextField("Notes, measurements, photo refs…", text: $store.draftNotes)
            Button("Save draft") { Task { await store.saveDraft() } }
          }
          Section("Draft queue") {
            if store.drafts.isEmpty {
              Text("No local drafts").foregroundColor(.wise2TextMuted)
            } else {
              ForEach(store.drafts) { draft in
                VStack(alignment: .leading, spacing: 4) {
                  Text(draft.notes).foregroundColor(.wise2TextPrimary)
                  Text(draft.synced ? "Synced" : "Pending sync")
                    .font(.caption)
                    .foregroundColor(draft.synced ? .wise2Success : .wise2Warning)
                }
                .listRowBackground(Color.wise2Surface)
              }
            }
          }
        }
        .listStyle(.insetGrouped)
      }
    }
    .background(Color.wise2Background.ignoresSafeArea())
    .navigationTitle("HVAC Field")
    .refreshable { await store.load() }
    .task { await store.load() }
  }
}
