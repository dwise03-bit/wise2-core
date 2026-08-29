import SwiftUI

struct AIWorkforceScreen: View {
  @StateObject private var store = AIWorkforceStore()

  var body: some View {
    NavigationView {
      Group {
        if store.isLoading && store.jobs.isEmpty {
          ProgressView("Loading agent jobs…")
        } else if let error = store.errorMessage, store.jobs.isEmpty {
          BusinessErrorView(message: error) { Task { await store.load() } }
        } else {
          List {
            if let message = store.actionMessage {
              Text(message).foregroundColor(.wise2Success).listRowBackground(Color.wise2Surface)
            }
            Section("Approval queue (\(store.pendingJobs.count))") {
              if store.pendingJobs.isEmpty {
                Text("No pending approvals").foregroundColor(.wise2TextMuted)
              } else {
                ForEach(store.pendingJobs) { job in
                  AgentJobRow(job: job) {
                    Task { await store.approve(job) }
                  } onReject: {
                    Task { await store.reject(job) }
                  }
                }
              }
            }
            Section("All jobs") {
              ForEach(store.jobs) { job in
                VStack(alignment: .leading, spacing: 4) {
                  Text(job.summary).foregroundColor(.wise2TextPrimary)
                  Text("\(job.role) · \(job.status)").font(.caption).foregroundColor(.wise2TextSecondary)
                }
                .listRowBackground(Color.wise2Surface)
              }
            }
          }
          .listStyle(.insetGrouped)
        }
      }
      .background(Color.wise2Background.ignoresSafeArea())
      .navigationTitle("AI Workforce")
      .refreshable { await store.load() }
      .task { await store.load() }
    }
  }
}

private struct AgentJobRow: View {
  let job: AgentJob
  let onApprove: () -> Void
  let onReject: () -> Void

  var body: some View {
    VStack(alignment: .leading, spacing: 8) {
      Text(job.summary).foregroundColor(.wise2TextPrimary)
      HStack {
        Button("Approve", action: onApprove).buttonStyle(.borderedProminent)
        Button("Reject", action: onReject).buttonStyle(.bordered)
      }
    }
    .listRowBackground(Color.wise2Surface)
  }
}
