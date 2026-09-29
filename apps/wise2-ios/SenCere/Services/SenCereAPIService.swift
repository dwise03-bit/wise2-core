import Foundation

class SenCereAPIService: NSObject, ObservableObject {
  @Published var projects: [SenCereProject] = []
  @Published var orders: [Order] = []
  @Published var quotes: [Quote] = []
  @Published var designs: [Design] = []
  @Published var messages: [MessageThread] = []
  @Published var recentActivity: [ActivityItem] = []
  @Published var currentUser: SenCereUser?
  @Published var isLoading = false
  @Published var error: String?

  private let baseURL = "https://api.wise2.net"
  private var token: String?

  func setToken(_ token: String) {
    self.token = token
  }

  // MARK: - Projects

  func fetchProjects() async {
    DispatchQueue.main.async {
      self.isLoading = true
    }

    let projects = mockProjects()
    DispatchQueue.main.async {
      self.projects = projects
      self.isLoading = false
    }
  }

  func fetchOrders() async {
    DispatchQueue.main.async {
      self.isLoading = true
    }

    let orders = mockOrders()
    DispatchQueue.main.async {
      self.orders = orders
      self.isLoading = false
    }
  }

  func fetchQuotes() async {
    DispatchQueue.main.async {
      self.isLoading = true
    }

    let quotes = mockQuotes()
    DispatchQueue.main.async {
      self.quotes = quotes
      self.isLoading = false
    }
  }

  func fetchDesigns() async {
    DispatchQueue.main.async {
      self.isLoading = true
    }

    let designs = mockDesigns()
    DispatchQueue.main.async {
      self.designs = designs
      self.isLoading = false
    }
  }

  func fetchMessages() async {
    DispatchQueue.main.async {
      self.isLoading = true
    }

    let messages = mockMessages()
    DispatchQueue.main.async {
      self.messages = messages
      self.isLoading = false
    }
  }

  func fetchRecentActivity() async {
    DispatchQueue.main.async {
      self.isLoading = true
    }

    let activity = mockRecentActivity()
    DispatchQueue.main.async {
      self.recentActivity = activity
      self.isLoading = false
    }
  }

  func fetchCurrentUser() async {
    DispatchQueue.main.async {
      self.isLoading = true
    }

    let user = mockCurrentUser()
    DispatchQueue.main.async {
      self.currentUser = user
      self.isLoading = false
    }
  }

  func createProject(_ project: SenCereProject) async -> Bool {
    DispatchQueue.main.async {
      self.projects.insert(project, at: 0)
    }
    return true
  }

  func createQuote(_ quote: Quote) async -> Bool {
    DispatchQueue.main.async {
      self.quotes.insert(quote, at: 0)
    }
    return true
  }

  func sendMessage(_ content: String, to threadId: String) async -> Bool {
    return true
  }

  // MARK: - Mock Data

  private func mockProjects() -> [SenCereProject] {
    [
      SenCereProject(
        id: "proj-001",
        name: "Team Hoodie Order",
        description: "Custom team hoodies for SenCere team",
        status: .production,
        progress: 0.75,
        createdDate: Date().addingTimeInterval(-7*24*3600),
        dueDate: Date().addingTimeInterval(3*24*3600),
        team: [
          TeamMember(id: "tm-1", name: "John Smith", email: "john@elite.com", avatar: nil, role: "Client"),
          TeamMember(id: "tm-2", name: "Design Team", email: "design@sencere.com", avatar: nil, role: "Designer")
        ],
        thumbnail: nil
      ),
      SenCereProject(
        id: "proj-002",
        name: "Event Shirt 2024",
        description: "Limited edition event merchandise",
        status: .design,
        progress: 0.45,
        createdDate: Date().addingTimeInterval(-14*24*3600),
        dueDate: Date().addingTimeInterval(10*24*3600),
        team: [
          TeamMember(id: "tm-3", name: "Sarah Lee", email: "sarah@client.com", avatar: nil, role: "Client")
        ],
        thumbnail: nil
      ),
      SenCereProject(
        id: "proj-003",
        name: "Company Hats",
        description: "Branded company hats",
        status: .complete,
        progress: 1.0,
        createdDate: Date().addingTimeInterval(-30*24*3600),
        dueDate: Date().addingTimeInterval(-5*24*3600),
        team: [],
        thumbnail: nil
      )
    ]
  }

  private func mockOrders() -> [Order] {
    [
      Order(
        id: "ord-001",
        projectId: "proj-001",
        projectName: "Team Hoodie Order",
        status: .inProduction,
        quantity: 50,
        dueDate: Date().addingTimeInterval(3*24*3600),
        progress: 0.75,
        thumbnail: nil
      ),
      Order(
        id: "ord-002",
        projectId: "proj-002",
        projectName: "Custom T-Shirt Order",
        status: .approved,
        quantity: 100,
        dueDate: Date().addingTimeInterval(7*24*3600),
        progress: 0.5,
        thumbnail: nil
      ),
      Order(
        id: "ord-003",
        projectId: "proj-003",
        projectName: "Engraved Tumblers",
        status: .completed,
        quantity: 25,
        dueDate: Date().addingTimeInterval(-5*24*3600),
        progress: 1.0,
        thumbnail: nil
      )
    ]
  }

  private func mockQuotes() -> [Quote] {
    [
      Quote(
        id: "quote-001",
        projectId: "proj-001",
        customerId: "cust-1",
        customerName: "John Smith",
        status: .approved,
        amount: 1250.00,
        items: [
          QuoteItem(id: "qi-1", description: "Custom Hoodies (50 units)", quantity: 50, unitPrice: 25.00)
        ],
        createdDate: Date().addingTimeInterval(-7*24*3600),
        expiresDate: Date().addingTimeInterval(23*24*3600)
      ),
      Quote(
        id: "quote-002",
        projectId: "proj-002",
        customerId: "cust-2",
        customerName: "Sarah Lee",
        status: .sent,
        amount: 890.00,
        items: [
          QuoteItem(id: "qi-2", description: "Event Shirts (100 units)", quantity: 100, unitPrice: 8.90)
        ],
        createdDate: Date().addingTimeInterval(-2*24*3600),
        expiresDate: Date().addingTimeInterval(28*24*3600)
      )
    ]
  }

  private func mockDesigns() -> [Design] {
    [
      Design(
        id: "design-001",
        name: "Elite Construction",
        category: .logos,
        thumbnailUrl: nil,
        createdDate: Date().addingTimeInterval(-30*24*3600),
        status: .approved
      ),
      Design(
        id: "design-002",
        name: "Team Hoodie",
        category: .apparel,
        thumbnailUrl: nil,
        createdDate: Date().addingTimeInterval(-14*24*3600),
        status: .approved
      ),
      Design(
        id: "design-003",
        name: "Event Shirt 2024",
        category: .apparel,
        thumbnailUrl: nil,
        createdDate: Date().addingTimeInterval(-7*24*3600),
        status: .draft
      ),
      Design(
        id: "design-004",
        name: "Company Hats",
        category: .apparel,
        thumbnailUrl: nil,
        createdDate: Date().addingTimeInterval(-25*24*3600),
        status: .approved
      )
    ]
  }

  private func mockMessages() -> [MessageThread] {
    [
      MessageThread(
        id: "thread-1",
        participants: [
          TeamMember(id: "tm-1", name: "SenCere Team", email: "team@sencere.com", avatar: nil, role: "Team")
        ],
        lastMessage: Message(
          id: "msg-1",
          senderId: "tm-1",
          senderName: "SenCere Team",
          senderAvatar: nil,
          content: "Your quote #PRQ-1-YSDQ has been sent! Review it when you have a moment.",
          timestamp: Date().addingTimeInterval(-2*3600),
          threadId: "thread-1"
        ),
        unreadCount: 0
      ),
      MessageThread(
        id: "thread-2",
        participants: [
          TeamMember(id: "tm-2", name: "Design Team", email: "design@sencere.com", avatar: nil, role: "Designer")
        ],
        lastMessage: Message(
          id: "msg-2",
          senderId: "tm-2",
          senderName: "Design Team",
          senderAvatar: nil,
          content: "Your design has been approved!",
          timestamp: Date().addingTimeInterval(-1*24*3600),
          threadId: "thread-2"
        ),
        unreadCount: 1
      ),
      MessageThread(
        id: "thread-3",
        participants: [
          TeamMember(id: "tm-3", name: "Production Team", email: "prod@sencere.com", avatar: nil, role: "Production")
        ],
        lastMessage: Message(
          id: "msg-3",
          senderId: "tm-3",
          senderName: "Production Team",
          senderAvatar: nil,
          content: "Update on your order: in production",
          timestamp: Date().addingTimeInterval(-12*3600),
          threadId: "thread-3"
        ),
        unreadCount: 0
      )
    ]
  }

  private func mockRecentActivity() -> [ActivityItem] {
    [
      ActivityItem(
        id: "act-1",
        type: .orderRequest,
        title: "New Order Request",
        description: "Custom T-Shirt Order",
        timestamp: Date().addingTimeInterval(-2*24*3600),
        icon: "📋"
      ),
      ActivityItem(
        id: "act-2",
        type: .designApproved,
        title: "Design Approved",
        description: "Team Hoodie Design",
        timestamp: Date().addingTimeInterval(-7*24*3600),
        icon: "✅"
      ),
      ActivityItem(
        id: "act-3",
        type: .orderProduction,
        title: "Order in Production",
        description: "Team Hoodie Order",
        timestamp: Date().addingTimeInterval(-5*24*3600),
        icon: "🏭"
      ),
      ActivityItem(
        id: "act-4",
        type: .paymentReceived,
        title: "Payment Received",
        description: "Quote #PRQ-1-YSDQ Approved",
        timestamp: Date().addingTimeInterval(-30*3600),
        icon: "💰"
      )
    ]
  }

  private func mockCurrentUser() -> SenCereUser {
    SenCereUser(
      id: "user-1",
      name: "SenCere Team",
      email: "team@sencere.com",
      avatar: nil,
      company: "SenCere Creative LLC",
      role: "Creative & Production Partner",
      phone: nil
    )
  }
}
