import SwiftUI

struct InventoryScreen: View {
  @StateObject private var store = InventoryStore()

  var body: some View {
    Group {
      if store.isLoading && store.snapshot == nil {
        ProgressView("Loading inventory…")
      } else if let snapshot = store.snapshot {
        List {
          Section("Stock") {
            InventoryMetricRow(label: "SKU count", value: "\(snapshot.skuCount)")
            InventoryMetricRow(label: "Low stock alerts", value: "\(snapshot.lowStockCount)")
            InventoryMetricRow(label: "Pending orders", value: "\(snapshot.pendingOrders)")
          }
          if let inventory = store.cloudInventory {
            Section("Cloud apps") {
              ForEach(inventory.apps, id: \.self) { app in
                Text(app).foregroundColor(.wise2TextPrimary).listRowBackground(Color.wise2Surface)
              }
            }
            Section("Services") {
              ForEach(inventory.services, id: \.self) { service in
                Text(service).foregroundColor(.wise2TextSecondary).listRowBackground(Color.wise2Surface)
              }
            }
          }
          Section {
            Text("TODO: Connect cherry-count retail inventory and print-shop product catalog.")
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
    .navigationTitle("Inventory")
    .refreshable { await store.load() }
    .task { await store.load() }
  }
}

private struct InventoryMetricRow: View {
  let label: String
  let value: String

  var body: some View {
    HStack {
      Text(label).foregroundColor(.wise2TextSecondary)
      Spacer()
      Text(value).foregroundColor(.wise2TextPrimary)
    }
    .listRowBackground(Color.wise2Surface)
  }
}
