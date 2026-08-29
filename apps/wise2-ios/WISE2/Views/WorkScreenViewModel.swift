import Foundation

@MainActor
class WorkScreenViewModel: ObservableObject {
  @Published var projects: [Project] = []
  @Published var tasks: [WorkTask] = []
  @Published var selectedTab: WorkTab = .crm
  @Published var isLoading = false
  @Published var errorMessage: String?
  @Published var crmItems: [CRMItem] = []
  @Published var activityItems: [String] = []

  private let apiClient = APIClient.shared

  enum WorkTab: CaseIterable {
    case crm
    case projects
    case tasks
    case activity

    var title: String {
      switch self {
      case .crm: return "CRM"
      case .projects: return "Projects"
      case .tasks: return "Tasks"
      case .activity: return "Activity"
      }
    }
  }

  init() {
    Task {
      await loadData()
    }
  }

  func loadData() async {
    isLoading = true
    errorMessage = nil

    async let crmLoad = loadCRM()
    async let projLoad = loadProjects()
    async let taskLoad = loadTasks()

    await crmLoad
    await projLoad
    await taskLoad

    activityItems = [
      "Command Center iOS · Daniel · 2h ago · Phase 1 completed",
      "Website approval · Daniel · 4h ago · Sent for review",
      "Lead list cleanup · WISE² AI · 6h ago · 23 duplicates removed",
      "Invoice generated · System · 1d ago · Client Brands invoice #2847",
      "Meeting scheduled · Darrin · 2d ago · Q3 planning session"
    ]

    isLoading = false
  }

  private func loadCRM() async {
    do {
      crmItems = try await apiClient.getCRMData()
    } catch {
      errorMessage = "Failed to load CRM: \(error.localizedDescription)"
    }
  }

  private func loadProjects() async {
    do {
      projects = try await apiClient.getProjects()
    } catch {
      errorMessage = "Failed to load projects: \(error.localizedDescription)"
    }
  }

  private func loadTasks() async {
    do {
      tasks = try await apiClient.getTasks()
    } catch {
      errorMessage = "Failed to load tasks: \(error.localizedDescription)"
    }
  }

  func updateTaskStatus(_ taskId: String, status: String) {
    Task {
      do {
        try await apiClient.updateTaskStatus(taskId, status: status)
        if let index = tasks.firstIndex(where: { $0.id == taskId }) {
          tasks[index].status = status
        }
      } catch {
        errorMessage = "Failed to update task: \(error.localizedDescription)"
      }
    }
  }
}

