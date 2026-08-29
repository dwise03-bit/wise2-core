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
      print("✅ Loaded \(projects.count) projects from backend")
    } catch {
      // Fallback to mock data
      projects = mockProjects
      print("⚠️ Using mock projects: \(error.localizedDescription)")
    }
    isLoading = false
  }

  func loadTasks() async {
    isLoading = true
    do {
      tasks = try await backendConnector.getTasks()
      print("✅ Loaded \(tasks.count) tasks from backend")
    } catch {
      // Fallback to mock data
      tasks = mockTasks
      print("⚠️ Using mock tasks: \(error.localizedDescription)")
    }
    isLoading = false
  }

  func updateTaskStatus(_ taskId: String, newStatus: String) async {
    do {
      let updated = try await backendConnector.updateTaskStatus(taskId: taskId, status: newStatus)

      if let index = tasks.firstIndex(where: { $0.id == taskId }) {
        tasks[index] = updated
      }
      print("✅ Task updated: \(taskId)")
    } catch {
      errorMessage = "Failed to update task: \(error.localizedDescription)"
      print("❌ Update error: \(error)")
    }
  }

  func createProject(name: String, description: String) async {
    do {
      let newProject = try await backendConnector.createProject(name: name, description: description)
      projects.append(newProject)

      try persistence.saveProject(name: name, status: "active", progress: 0)
      print("✅ Project created: \(name)")
    } catch {
      errorMessage = "Failed to create project: \(error.localizedDescription)"
      print("❌ Create error: \(error)")
    }
  }

  func refreshData() async {
    await loadProjects()
    await loadTasks()
  }

  // MARK: - Mock Data

  private let mockProjects = [
    Project(
      id: "proj-1",
      name: "WISE² Dashboard",
      description: "Rebuild command center",
      status: "In Progress",
      progress: 65,
      createdAt: Date()
    ),
    Project(
      id: "proj-2",
      name: "AI Integration",
      description: "Connect ChatGPT API",
      status: "Planning",
      progress: 20,
      createdAt: Date()
    ),
    Project(
      id: "proj-3",
      name: "Mobile App",
      description: "Native iOS app",
      status: "In Progress",
      progress: 85,
      createdAt: Date()
    ),
  ]

  private let mockTasks = [
    WorkTask(
      id: "task-1",
      title: "Fix authentication flow",
      status: "In Review",
      priority: "High",
      dueDate: Date().addingTimeInterval(86400),
      assignee: "You"
    ),
    WorkTask(
      id: "task-2",
      title: "Add push notifications",
      status: "To Do",
      priority: "Medium",
      dueDate: Date().addingTimeInterval(172800),
      assignee: "Team"
    ),
    WorkTask(
      id: "task-3",
      title: "Database optimization",
      status: "In Progress",
      priority: "High",
      dueDate: Date().addingTimeInterval(259200),
      assignee: "You"
    ),
    WorkTask(
      id: "task-4",
      title: "Document API endpoints",
      status: "In Progress",
      priority: "Low",
      dueDate: Date().addingTimeInterval(345600),
      assignee: "Documentation"
    ),
    WorkTask(
      id: "task-5",
      title: "Security audit",
      status: "To Do",
      priority: "Critical",
      dueDate: Date().addingTimeInterval(432000),
      assignee: "Security Team"
    ),
  ]
}
