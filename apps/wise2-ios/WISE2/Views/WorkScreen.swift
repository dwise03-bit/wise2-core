import SwiftUI

struct WorkScreen: View {
  @StateObject private var viewModel = WorkScreenViewModel()
  let selectedBusiness: String

  var body: some View {
    CommandSurface(title: "Work", subtitle: "CRM, clients, projects, tasks, documents", selectedBusiness: selectedBusiness) {
      Picker("Work area", selection: $viewModel.selectedTab) {
        ForEach(WorkScreenViewModel.WorkTab.allCases, id: \.self) { tab in
          Text(tab.title).tag(tab)
        }
      }
      .pickerStyle(.segmented)
      .accessibilityIdentifier("work-area-picker")

      CommandCard {
        Text(selectedBusiness == "ALL BUSINESSES" ? "Portfolio CRM · customers + prospects" : "Scoped context: \(selectedBusiness)")
          .font(.headline)
          .foregroundColor(.wise2TextPrimary)
        Text("Customers, prospects, and Hermes approvals. \(BusinessScope.scopeCaption).")
          .font(.caption)
          .foregroundColor(.wise2TextSecondary)
        if viewModel.isLoading {
          ProgressView().tint(.wise2Primary)
        }
        if let error = viewModel.errorMessage {
          Text(error)
            .font(.caption2)
            .foregroundColor(.wise2Warning)
        }
      }

      switch viewModel.selectedTab {
      case .crm:
        crmSection
      case .projects:
        projectsSection
      case .tasks:
        tasksSection
      case .activity:
        activitySection
      }
    }
    .preferredColorScheme(.dark)
    .refreshable { await viewModel.loadData() }
  }

  private var crmSection: some View {
    VStack(alignment: .leading, spacing: 12) {
      SectionLabel(title: "CRM")
      ForEach(viewModel.crmItems) { item in
        NavigationLink {
          DetailScreen(title: item.title, rows: item.details)
        } label: {
          WorkNavRow(icon: item.icon, title: item.title, detail: item.subtitle, badge: item.badge)
        }
        .buttonStyle(.plain)
      }
    }
  }

  private var projectsSection: some View {
    VStack(alignment: .leading, spacing: 12) {
      SectionLabel(title: "Projects")
      ForEach(viewModel.projects) { project in
        NavigationLink {
          DetailScreen(title: project.name, rows: ["Status: \(project.status)", "Progress: \(project.progress)%", "Team: \(project.teamSize)", "Due: \(project.dueDate)", "Notes and documents attached"])
        } label: {
          ProjectCard(project: project)
        }
        .buttonStyle(.plain)
      }
    }
  }

  private var tasksSection: some View {
    VStack(alignment: .leading, spacing: 12) {
      SectionLabel(title: "Approvals")
      if viewModel.tasks.isEmpty {
        CommandCard {
          Text(viewModel.isLoading ? "Loading Hermes approvals…" : "No Hermes approvals in queue.")
            .font(.subheadline)
            .foregroundColor(.wise2TextSecondary)
        }
      }
      ForEach(viewModel.tasks) { task in
        NavigationLink {
          DetailScreen(title: task.title, rows: ["Kind: \(task.project)", "Assignee: \(task.assignee)", "Risk: \(task.priority)", "When: \(task.dueDate)", "Status: \(task.status)"])
        } label: {
          TaskCard(task: task) { status in
            viewModel.updateTaskStatus(task.id, status: status)
          }
        }
        .buttonStyle(.plain)
      }
    }
  }

  private var activitySection: some View {
    VStack(alignment: .leading, spacing: 12) {
      SectionLabel(title: "Activity History")
      ForEach(viewModel.activityItems, id: \.self) { item in
        CommandCard {
          Text(item)
            .font(.subheadline)
            .foregroundColor(.wise2TextPrimary)
          Text("Audit scoped to \(selectedBusiness)")
            .font(.caption)
            .foregroundColor(.wise2TextMuted)
        }
      }
    }
  }
}

struct WorkNavRow: View {
  let icon: String
  let title: String
  let detail: String
  let badge: String

  var body: some View {
    CommandCard {
      HStack(spacing: 12) {
        Image(systemName: icon)
          .foregroundColor(.wise2Primary)
          .frame(width: 28)
        VStack(alignment: .leading, spacing: 4) {
          Text(title)
            .font(.headline)
            .foregroundColor(.wise2TextPrimary)
          Text(detail)
            .font(.caption)
            .foregroundColor(.wise2TextSecondary)
        }
        Spacer()
        Text(badge)
          .font(.caption.weight(.bold))
          .foregroundColor(.wise2Primary)
        Image(systemName: "chevron.right")
          .font(.caption)
          .foregroundColor(.wise2TextMuted)
      }
    }
  }
}

struct ProjectCard: View {
  let project: Project

  var body: some View {
    CommandCard {
      HStack {
        VStack(alignment: .leading, spacing: 4) {
          Text(project.name)
            .font(.headline)
            .foregroundColor(.wise2TextPrimary)
          Text("\(project.status) · \(project.teamSize) people · due \(project.dueDate)")
            .font(.caption)
            .foregroundColor(.wise2TextSecondary)
        }
        Spacer()
        Text("\(project.progress)%")
          .font(.caption.weight(.bold))
          .foregroundColor(.wise2Primary)
      }
      ProgressView(value: Double(project.progress), total: 100)
        .tint(.wise2Primary)
    }
  }
}

struct TaskCard: View {
  let task: WorkTask
  let onStatusChange: (String) -> Void

  var body: some View {
    CommandCard {
      HStack(alignment: .top) {
        VStack(alignment: .leading, spacing: 4) {
          Text(task.title)
            .font(.headline)
            .foregroundColor(.wise2TextPrimary)
          Text("\(task.project) · \(task.assignee) · \(task.dueDate)")
            .font(.caption)
            .foregroundColor(.wise2TextSecondary)
        }
        Spacer()
        Menu(task.status) {
          ForEach(["To Do", "In Progress", "In Review", "Done"], id: \.self) { status in
            Button(status) { onStatusChange(status) }
          }
        }
        .font(.caption.weight(.semibold))
        .foregroundColor(.wise2Primary)
      }
      Label(task.priority, systemImage: "flag.fill")
        .font(.caption)
        .foregroundColor(task.priority == "High" ? .wise2Danger : .wise2Warning)
    }
  }
}

#Preview {
  WorkScreen(selectedBusiness: "ALL BUSINESSES")
}
