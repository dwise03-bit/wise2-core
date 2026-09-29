import SwiftUI

struct CRMScreen: View {
  @StateObject private var store = CRMStore()

  var body: some View {
    NavigationView {
      Group {
        if store.isLoading && store.leads.isEmpty {
          ProgressView("Loading pipeline…")
        } else if let error = store.errorMessage, store.leads.isEmpty {
          BusinessErrorView(message: error) {
            Task { await store.load() }
          }
        } else {
          List {
            if let claimMessage = store.claimMessage {
              Text(claimMessage)
                .foregroundColor(.wise2Success)
                .listRowBackground(Color.wise2Surface)
            }

            ForEach(CrmStage.allCases) { stage in
              let rows = store.groupedLeads[stage] ?? []
              if !rows.isEmpty || store.selectedStage == stage {
                Section(stage.title) {
                  if rows.isEmpty {
                    Text("No leads in this stage")
                      .foregroundColor(.wise2TextMuted)
                  } else {
                    ForEach(rows) { lead in
                      LeadRow(lead: lead) {
                        Task { await store.claim(lead) }
                      }
                    }
                  }
                }
              }
            }
          }
          .listStyle(.insetGrouped)
        }
      }
      .background(Color.wise2Background.ignoresSafeArea())
      .navigationTitle("CRM")
      .toolbar {
        ToolbarItem(placement: .navigationBarTrailing) {
          Menu("Stage") {
            Button("All") { Task { await store.load(stage: nil) } }
            ForEach(CrmStage.allCases) { stage in
              Button(stage.title) { Task { await store.load(stage: stage) } }
            }
          }
        }
      }
      .refreshable { await store.load(stage: store.selectedStage) }
      .task { await store.load() }
    }
  }
}

private struct LeadRow: View {
  let lead: BusinessLead
  let onClaim: () -> Void

  var body: some View {
    VStack(alignment: .leading, spacing: 6) {
      Text(lead.businessName)
        .font(.headline)
        .foregroundColor(.wise2TextPrimary)
      Text(lead.contactName)
        .foregroundColor(.wise2TextSecondary)
      Text(String(format: "$%.0f", lead.estimatedOpportunity))
        .font(.caption)
        .foregroundColor(.wise2Primary)
      if let claimedBy = lead.claimedBy {
        Text("Claimed by \(claimedBy)")
          .font(.caption)
          .foregroundColor(.wise2TextMuted)
      } else if lead.source == "prospect" {
        Button("Claim lead", action: onClaim)
          .font(.caption.bold())
      }
    }
    .listRowBackground(Color.wise2Surface)
  }
}
