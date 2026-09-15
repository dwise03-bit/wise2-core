import SwiftUI

struct ProjectDetailScreen: View {
  let project: SenCereProject
  @Environment(\.dismiss) var dismiss

  var body: some View {
    ScrollView {
      VStack(alignment: .leading, spacing: 16) {
        // Header
        VStack(alignment: .leading, spacing: 8) {
          HStack {
            VStack(alignment: .leading, spacing: 4) {
              Text(project.name)
                .font(.title2)
                .fontWeight(.bold)
                .foregroundColor(.white)
              Text(project.description)
                .font(.caption)
                .foregroundColor(.gray)
            }
            Spacer()
            Text(statusBadge(project.status))
              .font(.caption2)
              .fontWeight(.semibold)
              .padding(.horizontal, 8)
              .padding(.vertical, 4)
              .background(statusColor(project.status).opacity(0.2))
              .foregroundColor(statusColor(project.status))
              .cornerRadius(4)
          }
        }
        .padding(16)

        // Progress Section
        VStack(alignment: .leading, spacing: 12) {
          Text("PROGRESS")
            .font(.caption)
            .fontWeight(.bold)
            .foregroundColor(.gray)

          ProgressView(value: project.progress)
            .tint(.sencereGold)

          HStack {
            Text("\(Int(project.progress * 100))% complete")
              .font(.subheadline)
              .fontWeight(.semibold)
              .foregroundColor(.white)
            Spacer()
            if let dueDate = project.dueDate {
              Text("Due \(dueDate.formatted(date: .abbreviated, time: .omitted))")
                .font(.caption)
                .foregroundColor(.gray)
            }
          }
        }
        .padding(16)
        .background(Color.white.opacity(0.05))
        .cornerRadius(8)
        .padding(.horizontal, 16)

        // Timeline
        VStack(alignment: .leading, spacing: 12) {
          Text("TIMELINE")
            .font(.caption)
            .fontWeight(.bold)
            .foregroundColor(.gray)

          HStack(spacing: 12) {
            VStack(alignment: .leading, spacing: 4) {
              Text("Started")
                .font(.caption)
                .foregroundColor(.gray)
              Text(project.createdDate.formatted(date: .abbreviated, time: .omitted))
                .font(.subheadline)
                .fontWeight(.semibold)
                .foregroundColor(.white)
            }
            Spacer()
            VStack(alignment: .trailing, spacing: 4) {
              Text("Due")
                .font(.caption)
                .foregroundColor(.gray)
              if let dueDate = project.dueDate {
                Text(dueDate.formatted(date: .abbreviated, time: .omitted))
                  .font(.subheadline)
                  .fontWeight(.semibold)
                  .foregroundColor(.white)
              }
            }
          }
        }
        .padding(16)
        .background(Color.white.opacity(0.05))
        .cornerRadius(8)
        .padding(.horizontal, 16)

        // Team Section
        VStack(alignment: .leading, spacing: 12) {
          HStack {
            Text("TEAM")
              .font(.caption)
              .fontWeight(.bold)
              .foregroundColor(.gray)
            Spacer()
            if !project.team.isEmpty {
              Text("\(project.team.count) members")
                .font(.caption)
                .foregroundColor(.gray)
            }
          }

          if !project.team.isEmpty {
            VStack(spacing: 8) {
              ForEach(project.team, id: \.id) { member in
                HStack(spacing: 12) {
                  Circle()
                    .fill(Color.sencereGold.opacity(0.3))
                    .frame(width: 40, height: 40)
                    .overlay(
                      Text(String(member.name.prefix(1)))
                        .font(.subheadline)
                        .fontWeight(.semibold)
                        .foregroundColor(.sencereGold)
                    )
                  VStack(alignment: .leading, spacing: 2) {
                    Text(member.name)
                      .font(.subheadline)
                      .fontWeight(.semibold)
                      .foregroundColor(.white)
                    Text(member.role)
                      .font(.caption)
                      .foregroundColor(.gray)
                  }
                  Spacer()
                  Text(member.email)
                    .font(.caption)
                    .foregroundColor(.gray)
                }
              }
            }
          } else {
            Text("No team members assigned yet")
              .font(.caption)
              .foregroundColor(.gray)
          }
        }
        .padding(16)
        .background(Color.white.opacity(0.05))
        .cornerRadius(8)
        .padding(.horizontal, 16)

        // Actions
        VStack(spacing: 12) {
          Button(action: {}) {
            HStack {
              Image(systemName: "message.fill")
              Text("Message Team")
            }
            .frame(maxWidth: .infinity)
            .padding(12)
            .background(Color.sencereGold)
            .foregroundColor(.black)
            .fontWeight(.semibold)
            .cornerRadius(8)
          }

          Button(action: {}) {
            HStack {
              Image(systemName: "pencil")
              Text("Edit Project")
            }
            .frame(maxWidth: .infinity)
            .padding(12)
            .background(Color.white.opacity(0.05))
            .foregroundColor(.sencereGold)
            .fontWeight(.semibold)
            .border(Color.white.opacity(0.1), width: 1)
            .cornerRadius(8)
          }
        }
        .padding(16)
      }
    }
    .background(Color.black)
    .navigationBarBackButtonHidden(true)
    .toolbar {
      ToolbarItem(placement: .navigationBarLeading) {
        Button(action: { dismiss() }) {
          HStack(spacing: 4) {
            Image(systemName: "chevron.left")
            Text("Back")
          }
          .foregroundColor(.sencereGold)
        }
      }
    }
  }

  private func statusBadge(_ status: SenCereProject.ProjectStatus) -> String {
    switch status {
    case .planning: return "Planning"
    case .design: return "Design"
    case .production: return "Production"
    case .quality: return "Quality Check"
    case .complete: return "Complete"
    case .cancelled: return "Cancelled"
    }
  }

  private func statusColor(_ status: SenCereProject.ProjectStatus) -> Color {
    switch status {
    case .planning: return .blue
    case .design: return .purple
    case .production: return .orange
    case .quality: return .yellow
    case .complete: return .green
    case .cancelled: return .red
    }
  }
}
