import Foundation
import Combine

@MainActor
class EnhancedWorkViewModel: ObservableObject {
  @Published var projects: [Project] = []
  @Published var tasks: [WorkTask] = []
  @Published var isLoading = false
  @Published var errorMessage: String?
  @Published var selectedTab = "Projects"

  private let backendConnector = BackendConnector.shared
  private let persistence = PersistenceManager.shared

  init() {
    Task {
      await loadProjects()
      await loadTasks()
    }
  }

  func loadProjects() async {
    isLoading = true
    do {
      projects = try await backendConnector.getProjects()
    } catch {
      projects = []
      errorMessage = error.localizedDescription
    }
    isLoading = false
  }

  func loadTasks() async {
    isLoading = true
    do {
      tasks = try await backendConnector.getTasks()
    } catch {
      tasks = []
      errorMessage = error.localizedDescription
    }
    isLoading = false
  }

  func updateTaskStatus(_ taskId: String, newStatus: String) async {
    do {
      let updated = try await backendConnector.updateTaskStatus(taskId: taskId, status: newStatus)
      if let index = tasks.firstIndex(where: { $0.id == taskId }) {
        tasks[index] = updated
      }
    } catch {
      errorMessage = "Failed to update task: \(error.localizedDescription)"
    }
  }

  func createProject(name: String, description: String) async {
    do {
      let newProject = try await backendConnector.createProject(name: name, description: description)
      projects.append(newProject)
      try persistence.saveProject(name: name, status: "active", progress: Int32(0))
    } catch {
      errorMessage = "Failed to create project: \(error.localizedDescription)"
    }
  }

  func refreshData() async {
    await loadProjects()
    await loadTasks()
  }
}
