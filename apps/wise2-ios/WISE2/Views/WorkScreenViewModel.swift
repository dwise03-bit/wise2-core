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
        _ = try await apiClient.getDashboardMetrics()

        // Mock project data
        projects = [
          Project(
            id: "proj_001",
            name: "WISE² Command Center",
            status: "In Progress",
            progress: 75,
            teamSize: 4,
            dueDate: "2026-09-15"
          ),
          Project(
            id: "proj_002",
            name: "Mobile App Launch",
            status: "Planning",
            progress: 30,
            teamSize: 6,
            dueDate: "2026-10-01"
          ),
          Project(
            id: "proj_003",
            name: "API Integration",
            status: "In Review",
            progress: 90,
            teamSize: 3,
            dueDate: "2026-08-30"
          ),
        ]

        // Mock task data
        tasks = [
          WorkTask(
            id: "task_001",
            title: "Design login flow",
            project: "WISE² Command Center",
            assignee: "You",
            priority: "High",
            dueDate: "2026-08-28",
            status: "Done"
          ),
          WorkTask(
            id: "task_002",
            title: "Implement auth endpoints",
            project: "WISE² Command Center",
            assignee: "You",
            priority: "High",
            dueDate: "2026-08-29",
            status: "In Progress"
          ),
          WorkTask(
            id: "task_003",
            title: "Review Phase 2 AI Tab",
            project: "WISE² Command Center",
            assignee: "You",
            priority: "Medium",
            dueDate: "2026-08-31",
            status: "To Do"
          ),
          WorkTask(
            id: "task_004",
            title: "Mobile mockups",
            project: "Mobile App Launch",
            assignee: "Sarah",
            priority: "High",
            dueDate: "2026-09-01",
            status: "In Progress"
          ),
          WorkTask(
            id: "task_005",
            title: "API documentation",
            project: "API Integration",
            assignee: "Mike",
            priority: "Medium",
            dueDate: "2026-08-30",
            status: "In Review"
          ),
        ]

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

struct Project: Identifiable {
  let id: String
  let name: String
  let status: String
  let progress: Int
  let teamSize: Int
  let dueDate: String
}

struct WorkTask: Identifiable {
  let id: String
  let title: String
  let project: String
  let assignee: String
  let priority: String
  var dueDate: String
  var status: String
}
