import SwiftUI

struct WorkScreen: View {
  @StateObject private var viewModel = WorkScreenViewModel()

  var body: some View {
    ZStack {
      Color.wise2Background.ignoresSafeArea()

      VStack(spacing: 0) {
        // Header
        VStack(alignment: .leading, spacing: 8) {
          Text("WORK")
            .font(.largeTitle)
            .fontWeight(.bold)
            .foregroundColor(.wise2TextPrimary)

          Text("CRM, Projects, Tasks")
            .foregroundColor(.wise2TextSecondary)
            .font(.subheadline)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(16)
        .background(Color.wise2Surface)

        // Tab Selector
        HStack(spacing: 0) {
          ForEach([WorkScreenViewModel.WorkTab.projects, .tasks], id: \.self) { tab in
            Button(action: { viewModel.selectedTab = tab }) {
              Text(tab == .projects ? "Projects" : "Tasks")
                .font(.subheadline)
                .fontWeight(.semibold)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 12)
                .foregroundColor(
                  viewModel.selectedTab == tab ? .wise2Primary : .wise2TextSecondary
                )
                .background(
                  viewModel.selectedTab == tab
                    ? Color.wise2Primary.opacity(0.1)
                    : Color.clear
                )
            }
          }
        }
        .background(Color.wise2Surface)

        // Content
        if viewModel.isLoading {
          VStack(spacing: 12) {
            ProgressView()
              .tint(.wise2Primary)
            Text("Loading work items...")
              .foregroundColor(.wise2TextSecondary)
          }
          .frame(maxHeight: .infinity)
        } else if let error = viewModel.errorMessage {
          VStack(spacing: 12) {
            Image(systemName: "exclamationmark.circle")
              .font(.system(size: 40))
              .foregroundColor(.wise2Danger)
            Text("Error")
              .font(.headline)
              .foregroundColor(.wise2TextPrimary)
            Text(error)
              .font(.caption)
              .foregroundColor(.wise2TextSecondary)
              .multilineTextAlignment(.center)
          }
          .frame(maxHeight: .infinity)
          .padding(16)
        } else {
          ScrollView {
            VStack(spacing: 12) {
              if viewModel.selectedTab == .projects {
                ForEach(viewModel.projects) { project in
                  ProjectCard(project: project)
                }
              } else {
                ForEach(viewModel.tasks) { task in
                  TaskCard(task: task, onStatusChange: { status in
                    viewModel.updateTaskStatus(task.id, status: status)
                  })
                }
              }
            }
            .padding(16)
          }
        }
      }
    }
    .preferredColorScheme(.dark)
  }
}

struct ProjectCard: View {
  let project: Project

  var statusColor: Color {
    switch project.status {
    case "In Progress": return .wise2Warning
    case "In Review": return .wise2Primary
    case "Planning": return .wise2TextSecondary
    case "Done": return .wise2Success
    default: return .wise2TextSecondary
    }
  }

  var body: some View {
    VStack(alignment: .leading, spacing: 12) {
      HStack {
        VStack(alignment: .leading, spacing: 4) {
          Text(project.name)
            .font(.headline)
            .foregroundColor(.wise2TextPrimary)
          Text(project.status)
            .font(.caption)
            .foregroundColor(statusColor)
            .fontWeight(.semibold)
        }
        Spacer()
        VStack(alignment: .trailing, spacing: 4) {
          Text("\(project.teamSize) members")
            .font(.caption)
            .foregroundColor(.wise2TextSecondary)
          Text(project.dueDate)
            .font(.caption)
            .foregroundColor(.wise2TextMuted)
        }
      }

      // Progress bar
      VStack(alignment: .leading, spacing: 4) {
        HStack {
          Text("Progress")
            .font(.caption)
            .foregroundColor(.wise2TextSecondary)
          Spacer()
          Text("\(project.progress)%")
            .font(.caption)
            .fontWeight(.semibold)
            .foregroundColor(.wise2Primary)
        }
        GeometryReader { geometry in
          ZStack(alignment: .leading) {
            RoundedRectangle(cornerRadius: 4)
              .fill(Color.wise2Primary.opacity(0.1))

            RoundedRectangle(cornerRadius: 4)
              .fill(Color.wise2Primary)
              .frame(width: geometry.size.width * CGFloat(project.progress) / 100)
          }
        }
        .frame(height: 6)
      }
    }
    .padding(12)
    .background(Color.wise2Surface)
    .cornerRadius(8)
  }
}

struct TaskCard: View {
  let task: WorkTask
  let onStatusChange: (String) -> Void

  var statusColor: Color {
    switch task.status {
    case "Done": return .wise2Success
    case "In Progress": return .wise2Warning
    case "In Review": return .wise2Primary
    default: return .wise2TextSecondary
    }
  }

  var priorityColor: Color {
    switch task.priority {
    case "High": return .wise2Danger
    case "Medium": return .wise2Warning
    default: return .wise2TextSecondary
    }
  }

  @State private var showStatusMenu = false

  var body: some View {
    VStack(alignment: .leading, spacing: 10) {
      HStack {
        VStack(alignment: .leading, spacing: 4) {
          Text(task.title)
            .font(.headline)
            .foregroundColor(.wise2TextPrimary)
          Text(task.project)
            .font(.caption)
            .foregroundColor(.wise2TextSecondary)
        }
        Spacer()
        Menu {
          Button("To Do") { onStatusChange("To Do") }
          Button("In Progress") { onStatusChange("In Progress") }
          Button("In Review") { onStatusChange("In Review") }
          Button("Done") { onStatusChange("Done") }
        } label: {
          Text(task.status)
            .font(.caption)
            .fontWeight(.semibold)
            .foregroundColor(statusColor)
            .padding(.horizontal, 8)
            .padding(.vertical, 4)
            .background(statusColor.opacity(0.1))
            .cornerRadius(4)
        }
      }

      HStack(spacing: 16) {
        HStack(spacing: 4) {
          Image(systemName: "person.fill")
            .font(.caption)
            .foregroundColor(.wise2TextSecondary)
          Text(task.assignee)
            .font(.caption)
            .foregroundColor(.wise2TextSecondary)
        }

        HStack(spacing: 4) {
          Image(systemName: "flag.fill")
            .font(.caption)
            .foregroundColor(priorityColor)
          Text(task.priority)
            .font(.caption)
            .foregroundColor(priorityColor)
        }

        Spacer()

        HStack(spacing: 4) {
          Image(systemName: "calendar")
            .font(.caption)
            .foregroundColor(.wise2TextMuted)
          Text(task.dueDate)
            .font(.caption)
            .foregroundColor(.wise2TextMuted)
        }
      }
    }
    .padding(12)
    .background(Color.wise2Surface)
    .cornerRadius(8)
  }
}

#Preview {
  WorkScreen()
    .environmentObject(AppState())
}
