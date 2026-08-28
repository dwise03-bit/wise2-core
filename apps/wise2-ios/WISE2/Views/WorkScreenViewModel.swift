import Foundation

@MainActor
class WorkScreenViewModel: ObservableObject {
  @Published var projects: [Project] = []
  @Published var tasks: [WorkTask] = []
  @Published var selectedTab: WorkTab = .crm
  @Published var isLoading = false
  @Published var errorMessage: String?

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

  let crmItems: [WorkAreaItem] = [
    WorkAreaItem(icon: "person.text.rectangle.fill", title: "Leads", subtitle: "New demand, follow-ups, qualification", badge: "12", details: ["3 hot leads", "5 follow-ups due", "4 need qualification"]),
    WorkAreaItem(icon: "person.2.fill", title: "Contacts", subtitle: "People, roles, notes, consent", badge: "418", details: ["Daniel-owned records", "Business membership required", "Activity history visible"]),
    WorkAreaItem(icon: "building.2.fill", title: "Companies", subtitle: "Accounts, brands, clients, vendors", badge: "76", details: ["WISE Defense", "WISE² HVAC", "WISE² Trading", "Client Brands"]),
    WorkAreaItem(icon: "chart.bar.xaxis", title: "Pipeline", subtitle: "Stages, value, next action", badge: "$86K", details: ["Discovery", "Proposal", "Verbal", "Won/Lost"]),
    WorkAreaItem(icon: "folder.fill", title: "Documents", subtitle: "Files, approvals, proposals", badge: "31", details: ["Scoped files", "Approval queue", "No raw secret storage"])
  ]

  let activityItems = [
    "Daniel updated Command Center launch task",
    "WISE² AI prepared invoice draft preview",
    "Client Brands website approval moved to in review",
    "Automation incident acknowledged"
  ]

  init() {
    loadData()
  }

  func loadData() {
    isLoading = false
    projects = [
      Project(id: "proj_001", name: "WISE² Command Center", status: "In Progress", progress: 82, teamSize: 4, dueDate: "Today"),
      Project(id: "proj_002", name: "Client Brands Website", status: "In Review", progress: 64, teamSize: 2, dueDate: "Tomorrow"),
      Project(id: "proj_003", name: "WISE Defense Systems Map", status: "Planning", progress: 25, teamSize: 3, dueDate: "Sep 4")
    ]

    tasks = [
      WorkTask(id: "task_001", title: "Finish iPhone safe-area verification", project: "WISE² Command Center", assignee: "Daniel", priority: "High", dueDate: "Today", status: "In Progress"),
      WorkTask(id: "task_002", title: "Approve homepage copy", project: "Client Brands Website", assignee: "Daniel", priority: "Medium", dueDate: "Tomorrow", status: "In Review"),
      WorkTask(id: "task_003", title: "Follow up HVAC leads", project: "WISE² HVAC", assignee: "WISE² AI", priority: "High", dueDate: "4:30 PM", status: "To Do")
    ]
  }

  func updateTaskStatus(_ taskId: String, status: String) {
    if let index = tasks.firstIndex(where: { $0.id == taskId }) {
      tasks[index].status = status
    }
  }
}

struct WorkAreaItem: Identifiable {
  let id = UUID().uuidString
  let icon: String
  let title: String
  let subtitle: String
  let badge: String
  let details: [String]
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
