import SwiftUI

struct SalesScreen: View {
  @StateObject private var store = SalesStore()

  var body: some View {
    Group {
      if store.isLoading && store.snapshot == nil {
        ProgressView("Loading sales pipeline…")
      } else if let snapshot = store.snapshot {
        List {
          Section("Pipeline") {
            SalesMetricRow(label: "Open deals", value: "\(snapshot.openOpportunities)")
            SalesMetricRow(label: "Pipeline value", value: String(format: "$%.0f", snapshot.pipelineValue))
            SalesMetricRow(label: "Won this month", value: "\(snapshot.wonThisMonth)")
            SalesMetricRow(label: "Avg deal size", value: String(format: "$%.0f", snapshot.averageDealSize))
          }
          Section("Opportunities") {
            if store.opportunities.isEmpty {
              Text("No opportunities yet.")
                .foregroundColor(.wise2TextMuted)
            } else {
              ForEach(store.opportunities) { deal in
                VStack(alignment: .leading, spacing: 4) {
                  Text(deal.title).foregroundColor(.wise2TextPrimary)
                  HStack {
                    Text(deal.stage.title).font(.caption).foregroundColor(.wise2Gold)
                    Spacer()
                    Text(String(format: "$%.0f", deal.amount)).foregroundColor(.wise2TextSecondary)
                  }
                }
                .listRowBackground(Color.wise2Surface)
              }
            }
          }
          Section {
            Text("TODO: Wire revenue-os/estimates and proposal flows.")
              .font(.caption)
              .foregroundColor(.wise2TextMuted)
          }
        }
        .listStyle(.insetGrouped)
      } else if let error = store.errorMessage {
        BusinessErrorView(message: error) { Task { await store.load() } }
      }
    }
    .background(Color.wise2Background.ignoresSafeArea())
    .navigationTitle("Sales")
    .refreshable { await store.load() }
    .task { await store.load() }
  }
}

private struct SalesMetricRow: View {
  let label: String
  let value: String

  var body: some View {
    HStack {
      Text(label).foregroundColor(.wise2TextSecondary)
      Spacer()
      Text(value).foregroundColor(.wise2Gold).fontWeight(.semibold)
    }
    .listRowBackground(Color.wise2Surface)
  }
}
