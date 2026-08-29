import Foundation
import Combine

@MainActor
class EnhancedAIViewModel: ObservableObject {
  @Published var messages: [ChatMessage] = []
  @Published var inputText = ""
  @Published var isLoading = false
  @Published var errorMessage: String?

  private let apiClient = APIClient.shared
  private let backendConnector = BackendConnector.shared
  private let persistence = PersistenceManager.shared

  init() {
    loadMessagesFromPersistence()
  }

  func sendMessage() async {
    guard !inputText.trimmingCharacters(in: .whitespaces).isEmpty else { return }

    let userMessage = ChatMessage(
      id: UUID().uuidString,
      role: "user",
      content: inputText,
      timestamp: Date()
    )

    await MainActor.run {
      messages.append(userMessage)
      inputText = ""
      isLoading = true
      errorMessage = nil
    }

    do {
      // Try real backend first, fallback to mock
      let response = try await getAIResponse(prompt: userMessage.content)

      let assistantMessage = ChatMessage(
        id: UUID().uuidString,
        role: "assistant",
        content: response,
        timestamp: Date()
      )

      await MainActor.run {
        messages.append(assistantMessage)
        isLoading = false
      }

      // Persist messages
      try persistence.saveChatMessage(role: "user", content: userMessage.content)
      try persistence.saveChatMessage(role: "assistant", content: response)

      print("✅ Message saved to persistence")
    } catch {
      await MainActor.run {
        errorMessage = error.localizedDescription
        isLoading = false
      }
      print("❌ AI response error: \(error)")
    }
  }

  private func getAIResponse(prompt: String) async throws -> String {
    do {
      // Try live backend
      return try await backendConnector.chat(prompt: prompt)
    } catch {
      // Fallback to mock API
      print("⚠️ Live backend unavailable, using mock: \(error.localizedDescription)")
      return try await apiClient.chat(prompt: prompt)
    }
  }

  private func loadMessagesFromPersistence() {
    let persistedMessages = persistence.fetchAllChatMessages()
    messages = persistedMessages.map { entity in
      ChatMessage(
        id: entity.id?.uuidString ?? UUID().uuidString,
        role: entity.role ?? "assistant",
        content: entity.content ?? "",
        timestamp: entity.timestamp ?? Date()
      )
    }
    print("✅ Loaded \(messages.count) messages from persistence")
  }

  func clearConversation() async {
    await MainActor.run {
      messages.removeAll()
      errorMessage = nil
    }
    print("🗑️ Conversation cleared")
  }

  func exportConversation() -> String {
    messages.map { "\($0.role.uppercased()): \($0.content)" }.joined(separator: "\n\n")
  }
}
