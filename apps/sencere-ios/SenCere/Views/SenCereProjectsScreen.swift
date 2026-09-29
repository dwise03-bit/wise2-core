import SwiftUI

struct SenCereProjectsScreen: View {
  @StateObject private var apiService = SenCereAPIService()
  @State private var selectedTab = 0
  let tabs = ["Active", "Quotes Sent", "Orders in Pickup", "Designs"]

  var body: some View {
    NavigationStack {
      VStack(spacing: 0) {
        // Header
        VStack(alignment: .leading, spacing: 8) {
          Text("My Projects")
            .font(.title2)
            .fontWeight(.bold)
            .foregroundColor(.white)
        }
        .padding(16)
        .frame(maxWidth: .infinity, alignment: .leading)

        // Tabs
        Picker("Tab", selection: $selectedTab) {
          ForEach(0..<tabs.count, id: \.self) { index in
            Text(tabs[index]).tag(index)
          }
        }
        .pickerStyle(.segmented)
        .tint(.sencereGold)
        .padding(16)

        // Tab Content
        ScrollView {
          VStack(spacing: 12) {
            switch selectedTab {
            case 0:
              activeProjectsList
            case 1:
              quotesList
            case 2:
              ordersList
            case 3:
              designsList
            default:
              activeProjectsList
            }
          }
          .padding(16)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
      }
      .background(Color.black)
    }
    .task {
      await apiService.fetchProjects()
      await apiService.fetchQuotes()
      await apiService.fetchOrders()
      await apiService.fetchDesigns()
    }
  }

  var activeProjectsList: some View {
    VStack(spacing: 12) {
      ForEach(apiService.projects, id: \.id) { project in
        NavigationLink(destination: ProjectDetailScreen(project: project)) {
          ProjectCard(project: project)
        }
      }
    }
  }

  var quotesList: some View {
    VStack(spacing: 12) {
      ForEach(apiService.quotes, id: \.id) { quote in
        QuoteCard(quote: quote)
      }
    }
  }

  var ordersList: some View {
    VStack(spacing: 12) {
      ForEach(apiService.orders, id: \.id) { order in
        OrderCard(order: order)
      }
    }
  }

  var designsList: some View {
    VStack(spacing: 12) {
      ForEach(apiService.designs, id: \.id) { design in
        DesignCard(design: design)
      }
    }
  }
}

struct ProjectCard: View {
  let project: SenCereProject

  var body: some View {
    VStack(alignment: .leading, spacing: 12) {
      HStack {
        VStack(alignment: .leading, spacing: 4) {
          Text(project.name)
            .font(.subheadline)
            .fontWeight(.semibold)
            .foregroundColor(.white)
          Text(project.description)
            .font(.caption)
            .foregroundColor(.gray)
            .lineLimit(1)
        }
        Spacer()
        VStack(alignment: .trailing, spacing: 4) {
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

      // Progress
      ProgressView(value: project.progress)
        .tint(.sencereGold)

      HStack(spacing: 8) {
        Text("\(Int(project.progress * 100))% complete")
          .font(.caption)
          .foregroundColor(.gray)
        Spacer()
        if let dueDate = project.dueDate {
          Text("Due \(dueDate.formatted(date: .abbreviated, time: .omitted))")
            .font(.caption)
            .foregroundColor(.gray)
        }
      }

      // Team
      if !project.team.isEmpty {
        HStack(spacing: 8) {
          Text("Team:")
            .font(.caption)
            .foregroundColor(.gray)
          ForEach(project.team.prefix(3), id: \.id) { member in
            Circle()
              .fill(Color.sencereGold.opacity(0.3))
              .frame(width: 24, height: 24)
              .overlay(
                Text(String(member.name.prefix(1)))
                  .font(.caption2)
                  .fontWeight(.semibold)
                  .foregroundColor(.sencereGold)
              )
          }
          if project.team.count > 3 {
            Text("+\(project.team.count - 3)")
              .font(.caption)
              .foregroundColor(.gray)
          }
        }
      }
    }
    .padding(12)
    .background(Color.white.opacity(0.05))
    .border(Color.white.opacity(0.1), width: 1)
    .cornerRadius(8)
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

struct QuoteCard: View {
  let quote: Quote

  var body: some View {
    VStack(alignment: .leading, spacing: 8) {
      HStack {
        VStack(alignment: .leading, spacing: 4) {
          Text(quote.customerName)
            .font(.subheadline)
            .fontWeight(.semibold)
            .foregroundColor(.white)
          Text("Quote #\(quote.id.suffix(6))")
            .font(.caption)
            .foregroundColor(.gray)
        }
        Spacer()
        Text("$\(quote.amount, specifier: "%.2f")")
          .font(.subheadline)
          .fontWeight(.bold)
          .foregroundColor(.sencereGold)
      }

      HStack {
        Text(quoteStatus(quote.status))
          .font(.caption)
          .fontWeight(.semibold)
          .padding(.horizontal, 8)
          .padding(.vertical, 4)
          .background(quoteStatusColor(quote.status).opacity(0.2))
          .foregroundColor(quoteStatusColor(quote.status))
          .cornerRadius(4)

        Spacer()

        Text("Expires: \(quote.expiresDate.formatted(date: .abbreviated, time: .omitted))")
          .font(.caption)
          .foregroundColor(.gray)
      }
    }
    .padding(12)
    .background(Color.white.opacity(0.05))
    .border(Color.white.opacity(0.1), width: 1)
    .cornerRadius(8)
  }

  private func quoteStatus(_ status: Quote.QuoteStatus) -> String {
    switch status {
    case .draft: return "Draft"
    case .sent: return "Sent"
    case .viewed: return "Viewed"
    case .approved: return "Approved"
    case .rejected: return "Rejected"
    }
  }

  private func quoteStatusColor(_ status: Quote.QuoteStatus) -> Color {
    switch status {
    case .draft: return .gray
    case .sent: return .blue
    case .viewed: return .cyan
    case .approved: return .green
    case .rejected: return .red
    }
  }
}

struct OrderCard: View {
  let order: Order

  var body: some View {
    VStack(alignment: .leading, spacing: 12) {
      HStack {
        VStack(alignment: .leading, spacing: 4) {
          Text(order.projectName)
            .font(.subheadline)
            .fontWeight(.semibold)
            .foregroundColor(.white)
          Text("QTY: \(order.quantity) units")
            .font(.caption)
            .foregroundColor(.gray)
        }
        Spacer()
        VStack(alignment: .trailing, spacing: 4) {
          Text(orderStatusBadge(order.status))
            .font(.caption2)
            .fontWeight(.semibold)
            .padding(.horizontal, 8)
            .padding(.vertical, 4)
            .background(orderStatusColor(order.status).opacity(0.2))
            .foregroundColor(orderStatusColor(order.status))
            .cornerRadius(4)
        }
      }

      ProgressView(value: order.progress)
        .tint(.sencereGold)

      HStack {
        Text("\(Int(order.progress * 100))% complete")
          .font(.caption)
          .foregroundColor(.gray)
        Spacer()
        Text("Due: \(order.dueDate.formatted(date: .abbreviated, time: .omitted))")
          .font(.caption)
          .foregroundColor(.gray)
      }
    }
    .padding(12)
    .background(Color.white.opacity(0.05))
    .border(Color.white.opacity(0.1), width: 1)
    .cornerRadius(8)
  }

  private func orderStatusBadge(_ status: Order.OrderStatus) -> String {
    switch status {
    case .quote: return "Quote"
    case .approved: return "Approved"
    case .inProduction: return "In Production"
    case .qualityCheck: return "Quality Check"
    case .ready: return "Ready"
    case .completed: return "Completed"
    }
  }

  private func orderStatusColor(_ status: Order.OrderStatus) -> Color {
    switch status {
    case .quote: return .yellow
    case .approved: return .green
    case .inProduction: return .orange
    case .qualityCheck: return .cyan
    case .ready: return .blue
    case .completed: return .green
    }
  }
}

struct DesignCard: View {
  let design: Design

  var body: some View {
    VStack(alignment: .leading, spacing: 8) {
      HStack {
        VStack(alignment: .leading, spacing: 4) {
          Text(design.name)
            .font(.subheadline)
            .fontWeight(.semibold)
            .foregroundColor(.white)
          Text(design.category.rawValue.capitalized)
            .font(.caption)
            .foregroundColor(.gray)
        }
        Spacer()
        Text(designStatus(design.status))
          .font(.caption)
          .fontWeight(.semibold)
          .padding(.horizontal, 8)
          .padding(.vertical, 4)
          .background(designStatusColor(design.status).opacity(0.2))
          .foregroundColor(designStatusColor(design.status))
          .cornerRadius(4)
      }

      Text("Created: \(design.createdDate.formatted(date: .abbreviated, time: .omitted))")
        .font(.caption)
        .foregroundColor(.gray)
    }
    .padding(12)
    .background(Color.white.opacity(0.05))
    .border(Color.white.opacity(0.1), width: 1)
    .cornerRadius(8)
  }

  private func designStatus(_ status: Design.DesignStatus) -> String {
    switch status {
    case .draft: return "Draft"
    case .approved: return "Approved"
    case .archived: return "Archived"
    }
  }

  private func designStatusColor(_ status: Design.DesignStatus) -> Color {
    switch status {
    case .draft: return .yellow
    case .approved: return .green
    case .archived: return .gray
    }
  }
}

#Preview {
  SenCereProjectsScreen()
    .preferredColorScheme(.dark)
}
