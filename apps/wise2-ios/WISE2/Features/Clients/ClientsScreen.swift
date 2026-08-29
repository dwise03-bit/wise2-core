import SwiftUI

struct ClientsScreen: View {
  @StateObject private var store = ClientsStore()

  var body: some View {
    Group {
      if store.isLoading && store.customers.isEmpty {
        ProgressView("Loading customers…")
      } else if let error = store.errorMessage, store.customers.isEmpty {
        BusinessErrorView(message: error) { Task { await store.load() } }
      } else {
        List(store.customers) { customer in
          VStack(alignment: .leading, spacing: 4) {
            Text(customer.businessName).foregroundColor(.wise2TextPrimary)
            Text(customer.contactName).foregroundColor(.wise2TextSecondary)
            Text(String(format: "$%.0f MRR · %@", customer.mrr, customer.status))
              .font(.caption)
              .foregroundColor(.wise2TextMuted)
          }
          .listRowBackground(Color.wise2Surface)
        }
        .listStyle(.insetGrouped)
      }
    }
    .background(Color.wise2Background.ignoresSafeArea())
    .navigationTitle("Clients")
    .refreshable { await store.load() }
    .task { await store.load() }
  }
}
