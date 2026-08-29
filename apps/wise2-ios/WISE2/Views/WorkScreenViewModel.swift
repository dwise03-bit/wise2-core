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
      case .tasks: return "Approvals"
      case .activity: return "Activity"
      }
    }
  }

  init() {
    Task { await loadData() }
  }

  func loadData() async {
    isLoading = true
    errorMessage = nil

    async let crmLoad = loadCRM()
    async let projLoad = loadProjects()
    async let taskLoad = loadTasks()
    async let activityLoad = loadActivity()

    await crmLoad
    await projLoad
    await taskLoad
    await activityLoad

    isLoading = false
  }

  private func loadCRM() async {
    do {
      crmItems = try await apiClient.getCRMData()
    } catch {
      errorMessage = "CRM: \(error.localizedDescription)"
    }
  }

  private func loadProjects() async {
    do {
      projects = try await apiClient.getProjects()
    } catch {
      errorMessage = "Projects: \(error.localizedDescription)"
    }
  }

  private func loadTasks() async {
    do {
      tasks = try await apiClient.getTasks()
    } catch {
      errorMessage = "Approvals: \(error.localizedDescription)"
    }
  }

  private func loadActivity() async {
    do {
      activityItems = try await apiClient.getActivityFeed()
    } catch {
      activityItems = []
    }
  }

  func updateTaskStatus(_ taskId: String, status: String) {
    Task {
      do {
        try await apiClient.updateTaskStatus(taskId, status: status)
        await loadTasks()
        await loadActivity()
      } catch {
        errorMessage = "Failed to update approval: \(error.localizedDescription)"
      }
    }
  }
}
