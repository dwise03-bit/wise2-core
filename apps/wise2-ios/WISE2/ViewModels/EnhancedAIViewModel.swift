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
      content: inputText,
      role: .user,
      timestamp: Date()
    )

    messages.append(userMessage)
    inputText = ""
    isLoading = true
    errorMessage = nil

    do {
      let response = try await getAIResponse(prompt: userMessage.content)
      let assistantMessage = ChatMessage(
        id: UUID().uuidString,
        content: response,
        role: .assistant,
        timestamp: Date(),
        source: "Hermes"
      )
      messages.append(assistantMessage)
      isLoading = false

      try persistence.saveChatMessage(role: "user", content: userMessage.content)
      try persistence.saveChatMessage(role: "assistant", content: response)
    } catch {
      errorMessage = error.localizedDescription
      isLoading = false
    }
  }

  private func getAIResponse(prompt: String) async throws -> String {
    do {
      return try await backendConnector.chat(prompt: prompt)
    } catch {
      let fallback = try await apiClient.chat(prompt: prompt)
      return fallback.content
    }
  }

  private func loadMessagesFromPersistence() {
    let persistedMessages = persistence.fetchAllChatMessages()
    messages = persistedMessages.map { entity in
      ChatMessage(
        id: entity.id?.uuidString ?? UUID().uuidString,
        content: entity.content ?? "",
        role: (entity.role ?? "assistant") == "user" ? .user : .assistant,
        timestamp: entity.timestamp ?? Date()
      )
    }
  }

  func clearConversation() async {
    messages.removeAll()
    errorMessage = nil
  }

  func exportConversation() -> String {
    messages.map { "\($0.role.rawValue.uppercased()): \($0.content)" }.joined(separator: "\n\n")
  }
}
