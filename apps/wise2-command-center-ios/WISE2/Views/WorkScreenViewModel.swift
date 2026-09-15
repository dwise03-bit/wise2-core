import Foundation

@MainActor
class WorkScreenViewModel: ObservableObject {
  @Published var projects: [Project] = []
  @Published var tasks: [WorkTask] = []
  @Published var selectedTab: WorkTab = .projects
  @Published var isLoading: Bool = false
  @Published var errorMessage: String?

  private let apiClient = APIClient.shared

  enum WorkTab: CaseIterable {
    case projects
    case tasks
    case diagnostics
  }

  init() {
    loadData()
  }

  func loadData() {
    isLoading = true
    errorMessage = nil

    Task {
      do {
        async let liveProjects = apiClient.getProjects()
        async let liveTasks = apiClient.getTasks()
        projects = try await liveProjects
        tasks = try await liveTasks

        isLoading = false
      } catch {
        errorMessage = error.localizedDescription
        isLoading = false
      }
    }
  }

  func updateTaskStatus(_ taskId: String, status: String) {
    if let index = tasks.firstIndex(where: { $0.id == taskId }) {
      tasks[index].status = status
    }
  }
}

struct Project: Identifiable, Codable {
  let id: String
  let name: String
  let status: String
  let progress: Int
  let teamSize: Int
  let dueDate: String
}

struct WorkTask: Identifiable, Codable {
  let id: String
  let title: String
  let project: String
  let assignee: String
  let priority: String
  var dueDate: String
  var status: String
}
