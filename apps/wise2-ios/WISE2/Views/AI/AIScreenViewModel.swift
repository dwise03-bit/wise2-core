import Foundation
import Combine

@MainActor
class AIScreenViewModel: ObservableObject {
  @Published var messages: [ChatMessage] = []
  @Published var inputText: String = ""
  @Published var isLoading: Bool = false
  @Published var errorMessage: String?

  private let apiClient = APIClient.shared

  func sendMessage() async {
    guard !inputText.trimmingCharacters(in: .whitespaces).isEmpty else { return }

    let userMessage = ChatMessage(
      id: UUID().uuidString,
      role: .user,
      content: inputText,
      timestamp: Date()
    )

    messages.append(userMessage)
    let prompt = inputText
    inputText = ""
    isLoading = true
    errorMessage = nil

    do {
      let response = try await apiClient.chat(prompt: prompt)

      let assistantMessage = ChatMessage(
        id: UUID().uuidString,
        role: .assistant,
        content: response,
        timestamp: Date()
      )

      messages.append(assistantMessage)
    } catch {
      errorMessage = "Failed to get response: \(error.localizedDescription)"
      print("❌ Chat error: \(error)")
    }

    isLoading = false
  }

  func clearConversation() {
    messages.removeAll()
    errorMessage = nil
  }
}

struct ChatMessage: Identifiable {
  let id: String
  let role: MessageRole
  let content: String
  let timestamp: Date

  enum MessageRole {
    case user
    case assistant
  }
}
