import SwiftUI

struct CommandScreen: View {
  @StateObject private var store = CommandStore()
  @State private var commandText = ""

  private let columns = [GridItem(.flexible()), GridItem(.flexible())]

  var body: some View {
    NavigationView {
      ScrollView {
        VStack(alignment: .leading, spacing: 20) {
          header
          if store.isLoading && store.dashboard == nil { ProgressView("Syncing WISE²…") }
          if let dashboard = store.dashboard { metrics(dashboard) }
          if let error = store.errorMessage { statusCard(title: "Needs attention", value: error) }
          if let result = store.lastCommandResult { statusCard(title: "WISE²", value: result.summary) }
          commandComposer
        }
        .padding()
      }
      .background(Color.wise2Background.ignoresSafeArea())
      .navigationBarHidden(true)
      .task { await store.load() }
      .refreshable { await store.load() }
    }
  }

  private var header: some View {
    VStack(alignment: .leading, spacing: 6) {
      Text("WISE²")
        .font(.caption.weight(.bold))
        .foregroundColor(.wise2Primary)
      Text("Business Command")
        .font(.largeTitle.bold())
        .foregroundColor(.wise2TextPrimary)
      Text("Revenue, operations, AI and systems in one control plane.")
        .foregroundColor(.wise2TextSecondary)
    }
  }

  private func metrics(_ dashboard: BusinessDashboard) -> some View {
    LazyVGrid(columns: columns, spacing: 12) {
      metric("Today", dashboard.revenueToday, prefix: "$")
      metric("This Month", dashboard.revenueMonth, prefix: "$")
      metric("Hot Leads", Double(dashboard.hotLeadCount))
      metric("Active Jobs", Double(dashboard.activeJobCount))
      metric("Unpaid", Double(dashboard.unpaidInvoiceCount))
      metric("Critical", Double(dashboard.criticalAlertCount))
    }
  }

  private func metric(_ title: String, _ value: Double, prefix: String = "") -> some View {
    VStack(alignment: .leading, spacing: 8) {
      Text(title).font(.caption).foregroundColor(.wise2TextSecondary)
      Text(prefix + (prefix.isEmpty ? String(Int(value)) : String(format: "%.2f", value)))
        .font(.title2.bold()).foregroundColor(.wise2TextPrimary)
    }
    .frame(maxWidth: .infinity, alignment: .leading)
    .padding()
    .background(Color.wise2Surface)
    .cornerRadius(16)
  }

  private var commandComposer: some View {
    VStack(alignment: .leading, spacing: 10) {
      Text("ASK WISE²").font(.caption.bold()).foregroundColor(.wise2Primary)
      HStack {
        TextField("Show hot leads…", text: $commandText)
          .textInputAutocapitalization(.sentences)
          .padding(12)
          .background(Color.wise2Surface)
          .cornerRadius(14)
        Button {
          let text = commandText
          commandText = ""
          Task { await store.submit(text) }
        } label: {
          Image(systemName: store.isSubmitting ? "hourglass" : "arrow.up.circle.fill")
            .font(.title)
        }
        .disabled(store.isSubmitting || commandText.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
      }
    }
  }

  private func statusCard(title: String, value: String) -> some View {
    VStack(alignment: .leading, spacing: 6) {
      Text(title).font(.caption.bold()).foregroundColor(.wise2Primary)
      Text(value).foregroundColor(.wise2TextPrimary)
    }
    .frame(maxWidth: .infinity, alignment: .leading)
    .padding()
    .background(Color.wise2Surface)
    .cornerRadius(16)
  }
}
