import Foundation

@MainActor
final class WorkStore: ObservableObject {
  @Published private(set) var projects: [BusinessProject] = []
  @Published private(set) var jobs: [BusinessJob] = []
  @Published private(set) var isLoading = false
  @Published private(set) var errorMessage: String?

  private let service: BusinessOSServing

  init(service: BusinessOSServing = BusinessOSClient()) {
    self.service = service
  }

  func load() async {
    isLoading = true
    errorMessage = nil
    defer { isLoading = false }
    do {
      async let projectsTask = service.projects()
      async let jobsTask = service.jobs()
      projects = try await projectsTask
      jobs = try await jobsTask
    } catch {
      errorMessage = error.localizedDescription
    }
  }
}
