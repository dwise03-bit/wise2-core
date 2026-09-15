import SwiftUI

struct WorkScreen: View {
  @StateObject private var store = WorkStore()

  var body: some View {
    NavigationView {
      Group {
        if store.isLoading && store.projects.isEmpty && store.jobs.isEmpty {
          ProgressView("Loading work…")
        } else if let error = store.errorMessage, store.projects.isEmpty && store.jobs.isEmpty {
          BusinessErrorView(message: error) { Task { await store.load() } }
        } else {
          List {
            Section("Projects") {
              if store.projects.isEmpty {
                Text("No projects yet").foregroundColor(.wise2TextMuted)
              } else {
                ForEach(store.projects) { project in
                  VStack(alignment: .leading, spacing: 4) {
                    Text(project.title).foregroundColor(.wise2TextPrimary)
                    Text(project.status).font(.caption).foregroundColor(.wise2TextSecondary)
                  }
                  .listRowBackground(Color.wise2Surface)
                }
              }
            }
            Section("Jobs") {
              if store.jobs.isEmpty {
                Text("No jobs scheduled").foregroundColor(.wise2TextMuted)
              } else {
                ForEach(store.jobs) { job in
                  VStack(alignment: .leading, spacing: 4) {
                    Text(job.title).foregroundColor(.wise2TextPrimary)
                    Text(job.status).font(.caption).foregroundColor(.wise2TextSecondary)
                  }
                  .listRowBackground(Color.wise2Surface)
                }
              }
            }
            Section {
              NavigationLink(destination: HVACScreen()) {
                Label("HVAC Field", systemImage: BusinessOSModule.hvac.systemImage)
              }
            }
          }
          .listStyle(.insetGrouped)
        }
      }
      .background(Color.wise2Background.ignoresSafeArea())
      .navigationTitle("Work")
      .refreshable { await store.load() }
      .task { await store.load() }
    }
  }
}
