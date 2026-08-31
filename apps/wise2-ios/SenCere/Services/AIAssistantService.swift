import Foundation

struct AIMessage: Identifiable {
  let id: String = UUID().uuidString
  let content: String
  let timestamp: Date
  let isUser: Bool
}

class AIAssistantService: NSObject, ObservableObject {
  @Published var messages: [AIMessage] = []
  @Published var isLoading = false
  @Published var suggestions: [String] = []

  private let apiBaseURL = "https://api.wise2.net"
  private var conversationHistory: [String] = []

  func loadSuggestions() async {
    let suggestions = [
      "Summarize my projects",
      "Show project timeline",
      "Team capacity status",
      "Upcoming deadlines",
    ]

    DispatchQueue.main.async {
      self.suggestions = suggestions
    }
  }

  func sendMessage(_ userMessage: String) async {
    // Add user message
    let userMsg = AIMessage(content: userMessage, timestamp: Date(), isUser: true)
    DispatchQueue.main.async {
      self.messages.append(userMsg)
      self.isLoading = true
    }

    // Store in history
    conversationHistory.append(userMessage)

    // Get AI response
    let aiResponse = await generateResponse(userMessage)

    // Add AI response
    let aiMsg = AIMessage(content: aiResponse, timestamp: Date(), isUser: false)
    DispatchQueue.main.async {
      self.messages.append(aiMsg)
      self.isLoading = false
    }

    conversationHistory.append(aiResponse)
  }

  private func generateResponse(_ userMessage: String) async -> String {
    // Mock AI responses based on keywords
    let lowerMessage = userMessage.lowercased()

    if lowerMessage.contains("summary") || lowerMessage.contains("summarize") {
      return "📊 **Project Summary**\n\n12 active projects:\n• Team Hoodie Order (75% complete)\n• Event Shirt 2024 (45% complete)\n• Company Hats (100% complete)\n\n**Status**: 3 in production, 2 in design, 7 planning\n\n**Next milestone**: Team Hoodie delivery in 3 days"
    } else if lowerMessage.contains("risk") || lowerMessage.contains("delayed") {
      return "⚠️ **At-Risk Projects**\n\n1 project needs attention:\n\n**Event Shirt 2024**\n• Behind schedule: 45% vs 50% expected\n• Reason: Design approval delay\n• Action: Escalate to design team\n\n**Recommendation**: Schedule design review meeting with Design Team to accelerate approval"
    } else if lowerMessage.contains("update") || lowerMessage.contains("latest") {
      return "📝 **Latest Updates**\n\n✅ **2 hours ago** - Quote #PRQ-1-YSDQ approved by John Smith\n🏭 **5 hours ago** - Team Hoodie Order moved to production\n✅ **1 day ago** - Company Hats design approved\n💬 **1 day ago** - Design Team added feedback on Event Shirt\n\n**Pending**: 2 design approvals, 1 production sign-off"
    } else if lowerMessage.contains("next step") || lowerMessage.contains("what should") {
      return "🎯 **Recommended Next Steps**\n\n1. **Immediate** (Today)\n   • Approve Event Shirt design changes\n   • Review production timeline for Team Hoodies\n\n2. **This Week**\n   • Get production sign-off on all in-progress items\n   • Send final artwork to printer\n\n3. **Next Week**\n   • Prepare shipping logistics\n   • Schedule customer delivery calls\n\nEstimated time to complete: 2 hours per item"
    } else if lowerMessage.contains("team") || lowerMessage.contains("capacity") {
      return "👥 **Team Capacity Status**\n\n**Active Team Members**: 6\n• Design Team: 2 (75% allocated)\n• Production: 2 (90% allocated)\n• Quality Check: 1 (60% allocated)\n• Admin: 1 (40% allocated)\n\n**Available Capacity**: Design team has 25% headroom\n\n**Recommendation**: Ready to take on 1-2 new small projects"
    } else if lowerMessage.contains("deadline") || lowerMessage.contains("due") {
      return "📅 **Upcoming Deadlines**\n\n**This Week**\n• Team Hoodie Order: Due in 3 days (Aug 2)\n\n**Next Week**\n• Event Shirt 2024: Due in 10 days (Aug 9)\n\n**On Track**: 2/3 projects on schedule\n**At Risk**: Event Shirt may slip 2-3 days\n\n**Recommendation**: Expedite design approvals to reduce risk"
    } else if lowerMessage.contains("quote") || lowerMessage.contains("order") {
      return "📋 **Quote & Order Status**\n\n**Recent Quotes**\n• #PRQ-1-YSDQ: $1,250 (Team Hoodies) ✅ Approved\n• #PRQ-2-KSDQ: $890 (Event Shirts) ⏳ Pending\n\n**Active Orders**\n• Team Hoodie (50 units): In production\n• Custom Shirts (100 units): Approved, ready to produce\n• Engraved Tumblers (25 units): Completed\n\n**Total Pipeline Value**: $3,940"
    } else if lowerMessage.contains("help") {
      return "💡 **How I Can Help**\n\nI can assist with:\n\n📊 **Analytics**: Project summaries, team capacity, timelines\n⚠️ **Risks**: Identify at-risk items, suggest actions\n📝 **Updates**: Latest project status and activity\n🎯 **Planning**: Next steps and recommendations\n👥 **Team**: Capacity, workload, availability\n📋 **Quotes & Orders**: Pipeline, status, values\n\n**Ask me anything** about your projects, team, or business!"
    } else {
      return "I can help with your SenCere projects and team management. Here are some things you can ask:\n\n• \"Show me a project summary\"\n• \"Which projects are at risk?\"\n• \"What are the latest updates?\"\n• \"What should I do next?\"\n• \"Show team capacity status\"\n• \"Show upcoming deadlines\"\n\nWhat would you like to know?"
    }
  }
}
