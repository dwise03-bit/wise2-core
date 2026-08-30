import SwiftUI

struct CommsScreen: View {
  @StateObject private var store = CommsStore()

  var body: some View {
    Group {
      if store.isLoading && store.dashboard == nil {
        ProgressView("Loading AI Phone…")
      } else if let dashboard = store.dashboard {
        List {
          Section {
            VStack(alignment: .leading, spacing: 8) {
              Text(dashboard.config.aiPersona)
                .font(.caption)
                .foregroundColor(.wise2Gold)
              Text(dashboard.config.phoneNumber ?? "Number not assigned")
                .font(.title2.monospaced().weight(.semibold))
                .foregroundColor(.wise2TextPrimary)
              HStack {
                Circle()
                  .fill(store.isLive ? Color.green : Color.wise2TextMuted)
                  .frame(width: 8, height: 8)
                Text(store.isLive ? "Live" : "Paused")
                  .font(.caption.weight(.semibold))
                  .foregroundColor(store.isLive ? .green : .wise2TextMuted)
                Spacer()
                Button(store.isLive ? "Pause" : "Go Live") {
                  Task { await store.toggleEnabled() }
                }
                .disabled(store.isSaving)
              }
            }
            .listRowBackground(Color.wise2Surface)
          }

          Section("Today") {
            metric("Calls today", "\(dashboard.stats.callsToday)")
            metric("Avg duration", formatDuration(dashboard.stats.avgDurationSeconds))
            metric("Leads captured", "\(dashboard.stats.leadsCaptured)")
            metric("Total calls", "\(dashboard.stats.totalCalls)")
          }

          Section("Greeting") {
            TextEditor(text: $store.greeting)
              .frame(minHeight: 90)
              .foregroundColor(.wise2TextPrimary)
              .listRowBackground(Color.wise2Surface)
            Button(store.savedMessage ?? "Save greeting") {
              Task { await store.saveGreeting() }
            }
            .disabled(store.isSaving)
            .listRowBackground(Color.wise2Surface)
          }

          Section("What WISE² handles") {
            ForEach(dashboard.capabilities, id: \.self) { capability in
              Text(capability)
                .font(.subheadline)
                .foregroundColor(.wise2TextSecondary)
                .listRowBackground(Color.wise2Surface)
            }
          }

          Section("Recent calls") {
            if dashboard.recentCalls.isEmpty {
              Text("No calls yet. The line will log every conversation here.")
                .foregroundColor(.wise2TextMuted)
            } else {
              ForEach(dashboard.recentCalls) { call in
                VStack(alignment: .leading, spacing: 4) {
                  HStack {
                    Text(call.callerName ?? "Unknown caller")
                      .foregroundColor(.wise2TextPrimary)
                    Spacer()
                    Text(formatDuration(call.durationSeconds ?? 0))
                      .font(.caption)
                      .foregroundColor(.wise2Gold)
                  }
                  Text(call.callerNumber)
                    .font(.caption)
                    .foregroundColor(.wise2TextMuted)
                  if let intent = call.intent {
                    Text(intent.uppercased())
                      .font(.caption2)
                      .foregroundColor(.wise2Primary)
                  }
                  if let summary = call.summary {
                    Text(summary)
                      .font(.caption)
                      .foregroundColor(.wise2TextSecondary)
                  }
                  if let outcome = call.outcome {
                    Text(outcome.replacingOccurrences(of: "_", with: " "))
                      .font(.caption2.weight(.semibold))
                      .foregroundColor(.wise2Gold)
                  }
                }
                .listRowBackground(Color.wise2Surface)
              }
            }
          }

          if let transfer = dashboard.config.transferNumber {
            Section("Routing") {
              Text("Urgent calls transfer to \(transfer)")
                .font(.caption)
                .foregroundColor(.wise2TextSecondary)
                .listRowBackground(Color.wise2Surface)
            }
          }

          Section {
            Text(dashboard.poweredBy)
              .font(.caption2)
              .foregroundColor(.wise2TextMuted)
              .listRowBackground(Color.wise2Surface)
          }
        }
        .listStyle(.insetGrouped)
      } else if let error = store.errorMessage {
        BusinessErrorView(message: error) { Task { await store.load() } }
      } else {
        VStack(spacing: 12) {
          Image(systemName: "phone.fill")
            .font(.largeTitle)
            .foregroundColor(.wise2Primary)
          Text("AI Phone is not configured yet")
            .foregroundColor(.wise2TextSecondary)
        }
      }
    }
    .background(Color.wise2Background.ignoresSafeArea())
    .navigationTitle("AI Phone")
    .refreshable { await store.load() }
    .task { await store.load() }
  }

  private func metric(_ label: String, _ value: String) -> some View {
    HStack {
      Text(label).foregroundColor(.wise2TextSecondary)
      Spacer()
      Text(value).foregroundColor(.wise2Gold).fontWeight(.semibold)
    }
    .listRowBackground(Color.wise2Surface)
  }

  private func formatDuration(_ seconds: Int) -> String {
    if seconds <= 0 { return "—" }
    return "\(seconds / 60):\(String(format: "%02d", seconds % 60))"
  }
}
