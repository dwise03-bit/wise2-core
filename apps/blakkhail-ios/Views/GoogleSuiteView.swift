import SwiftUI

struct GoogleSuiteView: View {
  @StateObject private var googleManager = GoogleSuiteManager()
  @State private var selectedService: GoogleService = .gmail

  var body: some View {
    ZStack {
      Color.blakkhailNavy.ignoresSafeArea()

      VStack(spacing: 0) {
        // Header
        VStack(spacing: 8) {
          Text("GOOGLE WORKSPACE")
            .font(.system(size: 24, weight: .black))
            .foregroundColor(.blakkhailCyan)
            .tracking(1.2)
          Text("Integrated productivity suite")
            .font(.system(size: 12, weight: .light))
            .foregroundColor(.gray)
        }
        .frame(maxWidth: .infinity)
        .padding(16)
        .background(Color.black.opacity(0.3))

        // Service Tabs
        ScrollView(.horizontal, showsIndicators: false) {
          HStack(spacing: 12) {
            ForEach(GoogleService.allCases, id: \.self) { service in
              Button(action: { selectedService = service }) {
                VStack(spacing: 4) {
                  Image(systemName: service.icon)
                    .font(.system(size: 16, weight: .semibold))
                  Text(service.rawValue)
                    .font(.system(size: 11, weight: .bold))
                }
                .frame(width: 70)
                .padding(12)
                .background(selectedService == service ? Color.blakkhailCyan.opacity(0.2) : Color.black.opacity(0.2))
                .foregroundColor(selectedService == service ? .blakkhailCyan : .gray)
                .cornerRadius(8)
              }
            }
          }
          .padding(12)
        }

        Divider()
          .background(Color.white.opacity(0.1))

        // Content
        ScrollView {
          VStack(alignment: .leading, spacing: 16) {
            switch selectedService {
            case .gmail:
              GmailSection()
            case .calendar:
              CalendarSection()
            case .drive:
              DriveSection()
            case .sheets:
              SheetsSection()
            case .docs:
              DocsSection()
            }
          }
          .padding(16)
        }
      }
    }
  }
}

enum GoogleService: String, CaseIterable, Hashable {
  case gmail = "Gmail"
  case calendar = "Calendar"
  case drive = "Drive"
  case sheets = "Sheets"
  case docs = "Docs"

  var icon: String {
    switch self {
    case .gmail: return "envelope.fill"
    case .calendar: return "calendar"
    case .drive: return "folder.fill"
    case .sheets: return "tablecells"
    case .docs: return "doc.fill"
    }
  }
}

struct GmailSection: View {
  var body: some View {
    VStack(alignment: .leading, spacing: 12) {
      Text("EMAIL MANAGEMENT")
        .font(.system(size: 14, weight: .bold))
        .foregroundColor(.blakkhailGold)

      VStack(spacing: 10) {
        GoogleServiceCard(icon: "inbox.fill", title: "Inbox", subtitle: "24 unread messages", color: .blakkhailCyan)
        GoogleServiceCard(icon: "paperplane.fill", title: "Send", subtitle: "Compose new email", color: .blakkhailCyan)
        GoogleServiceCard(icon: "magnifyingglass", title: "Search", subtitle: "Find conversations", color: .blakkhailCyan)
        GoogleServiceCard(icon: "flag.fill", title: "Labels", subtitle: "Organize messages", color: .blakkhailCyan)
      }
    }
  }
}

struct CalendarSection: View {
  var body: some View {
    VStack(alignment: .leading, spacing: 12) {
      Text("SCHEDULE & EVENTS")
        .font(.system(size: 14, weight: .bold))
        .foregroundColor(.blakkhailGold)

      VStack(spacing: 10) {
        GoogleServiceCard(icon: "calendar", title: "Today's Schedule", subtitle: "3 events scheduled", color: .blakkhailGold)
        GoogleServiceCard(icon: "plus.circle.fill", title: "Create Event", subtitle: "Add to calendar", color: .blakkhailGold)
        GoogleServiceCard(icon: "clock.fill", title: "Availability", subtitle: "Find meeting time", color: .blakkhailGold)
        GoogleServiceCard(icon: "bell.fill", title: "Reminders", subtitle: "Get notifications", color: .blakkhailGold)
      }
    }
  }
}

struct DriveSection: View {
  var body: some View {
    VStack(alignment: .leading, spacing: 12) {
      Text("CLOUD STORAGE")
        .font(.system(size: 14, weight: .bold))
        .foregroundColor(.blakkhailGold)

      VStack(spacing: 10) {
        GoogleServiceCard(icon: "folder.fill", title: "My Drive", subtitle: "234 GB of 500 GB", color: .blakkhailNeon)
        GoogleServiceCard(icon: "arrowshape.up.fill", title: "Upload File", subtitle: "Add to storage", color: .blakkhailNeon)
        GoogleServiceCard(icon: "person.2.fill", title: "Shared", subtitle: "8 shared folders", color: .blakkhailNeon)
        GoogleServiceCard(icon: "star.fill", title: "Starred", subtitle: "Quick access items", color: .blakkhailNeon)
      }
    }
  }
}

struct SheetsSection: View {
  var body: some View {
    VStack(alignment: .leading, spacing: 12) {
      Text("SPREADSHEETS")
        .font(.system(size: 14, weight: .bold))
        .foregroundColor(.blakkhailGold)

      VStack(spacing: 10) {
        GoogleServiceCard(icon: "tablecells", title: "Create Sheet", subtitle: "New spreadsheet", color: .blakkhailCyan)
        GoogleServiceCard(icon: "chart.bar.fill", title: "Analytics", subtitle: "View data insights", color: .blakkhailCyan)
        GoogleServiceCard(icon: "function", title: "Formulas", subtitle: "Calculate metrics", color: .blakkhailCyan)
        GoogleServiceCard(icon: "arrow.up.arrow.down", title: "Share & Collaborate", subtitle: "Work together", color: .blakkhailCyan)
      }
    }
  }
}

struct DocsSection: View {
  var body: some View {
    VStack(alignment: .leading, spacing: 12) {
      Text("DOCUMENTS")
        .font(.system(size: 14, weight: .bold))
        .foregroundColor(.blakkhailGold)

      VStack(spacing: 10) {
        GoogleServiceCard(icon: "doc.fill", title: "Create Document", subtitle: "New doc", color: .blakkhailGold)
        GoogleServiceCard(icon: "pencil", title: "Edit", subtitle: "Compose content", color: .blakkhailGold)
        GoogleServiceCard(icon: "highlighter", title: "Format", subtitle: "Style & layout", color: .blakkhailGold)
        GoogleServiceCard(icon: "checkmark.circle.fill", title: "Comments", subtitle: "Suggest changes", color: .blakkhailGold)
      }
    }
  }
}

struct GoogleServiceCard: View {
  let icon: String
  let title: String
  let subtitle: String
  let color: Color

  var body: some View {
    Button(action: {}) {
      HStack(spacing: 12) {
        Image(systemName: icon)
          .font(.system(size: 18, weight: .semibold))
          .foregroundColor(color)
          .frame(width: 30)

        VStack(alignment: .leading, spacing: 2) {
          Text(title)
            .font(.system(size: 13, weight: .semibold))
            .foregroundColor(.white)
          Text(subtitle)
            .font(.system(size: 11, weight: .light))
            .foregroundColor(.gray)
        }

        Spacer()

        Image(systemName: "chevron.right")
          .font(.system(size: 12, weight: .semibold))
          .foregroundColor(.gray)
      }
      .padding(12)
      .background(Color.black.opacity(0.3))
      .cornerRadius(8)
    }
  }
}

@MainActor
class GoogleSuiteManager: ObservableObject {
  @Published var isAuthenticated = false
  @Published var userEmail = ""
  @Published var unreadEmails = 24
  @Published var upcomingEvents = 3
  @Published var storageUsed = "234 GB"

  func authenticateGoogle() async {
    print("✅ Google authentication initiated")
  }

  func fetchGmail() async {
    print("✅ Fetching Gmail data")
  }

  func fetchCalendar() async {
    print("✅ Fetching Calendar events")
  }

  func fetchDrive() async {
    print("✅ Fetching Drive files")
  }
}

#Preview {
  GoogleSuiteView()
    .preferredColorScheme(.dark)
}
