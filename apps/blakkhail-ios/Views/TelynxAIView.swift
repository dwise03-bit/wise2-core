import SwiftUI

struct TelynxAIView: View {
  @StateObject private var aiManager = TelynxAIManager()
  @State private var userMessage = ""
  @FocusState private var isFocused: Bool

  var body: some View {
    ZStack {
      Color.blakkhailNavy.ignoresSafeArea()

      VStack(spacing: 0) {
        // Header
        VStack(spacing: 8) {
          Text("TELYNX AI ASSISTANT")
            .font(.system(size: 24, weight: .black))
            .foregroundColor(.blakkhailCyan)
            .tracking(1.2)
          Text("AI-powered business intelligence")
            .font(.system(size: 12, weight: .light))
            .foregroundColor(.gray)
        }
        .frame(maxWidth: .infinity)
        .padding(16)
        .background(Color.black.opacity(0.3))

        // Messages
        ScrollViewReader { proxy in
          ScrollView {
            VStack(alignment: .leading, spacing: 12) {
              ForEach(aiManager.messages, id: \.id) { message in
                HStack(alignment: .top, spacing: 12) {
                  if message.isUser {
                    Spacer()
                    VStack(alignment: .trailing, spacing: 4) {
                      Text(message.text)
                        .font(.system(size: 13, weight: .regular))
                        .foregroundColor(.white)
                      Text(message.timestamp)
                        .font(.system(size: 11, weight: .light))
                        .foregroundColor(.gray)
                    }
                    .padding(12)
                    .background(Color.blakkhailCyan.opacity(0.2))
                    .cornerRadius(8)
                  } else {
                    VStack(alignment: .leading, spacing: 4) {
                      Text(message.text)
                        .font(.system(size: 13, weight: .regular))
                        .foregroundColor(.white)
                      Text(message.timestamp)
                        .font(.system(size: 11, weight: .light))
                        .foregroundColor(.gray)
                    }
                    .padding(12)
                    .background(Color.blakkhailGold.opacity(0.1))
                    .cornerRadius(8)
                    Spacer()
                  }
                }
                .id(message.id)
              }

              if aiManager.isLoading {
                HStack(spacing: 6) {
                  ForEach(0..<3, id: \.self) { _ in
                    Circle()
                      .fill(Color.blakkhailGold)
                      .frame(width: 6, height: 6)
                  }
                }
                .padding(12)
              }
            }
            .padding(16)
            .onChange(of: aiManager.messages) { _ in
              if let last = aiManager.messages.last?.id {
                proxy.scrollTo(last, anchor: .bottom)
              }
            }
          }
        }

        Divider()
          .background(Color.white.opacity(0.1))

        // Input
        VStack(spacing: 12) {
          HStack(spacing: 12) {
            TextField("Ask Telynx...", text: $userMessage)
              .font(.system(size: 13, weight: .regular))
              .foregroundColor(.white)
              .focused($isFocused)
              .submitLabel(.send)

            Button(action: sendMessage) {
              Image(systemName: "paperplane.fill")
                .font(.system(size: 14, weight: .bold))
                .foregroundColor(.blakkhailNavy)
                .frame(width: 36, height: 36)
                .background(Color.blakkhailCyan)
                .cornerRadius(6)
            }
            .disabled(userMessage.trimmingCharacters(in: .whitespaces).isEmpty || aiManager.isLoading)
          }
          .padding(12)
          .background(Color.black.opacity(0.3))
          .cornerRadius(8)
          .padding(12)
        }
      }
    }
  }

  private func sendMessage() {
    let message = userMessage.trimmingCharacters(in: .whitespaces)
    guard !message.isEmpty else { return }

    Task {
      await aiManager.sendMessage(message)
      userMessage = ""
    }
  }
}

struct AIMessage: Identifiable, Equatable {
  let id = UUID()
  let text: String
  let isUser: Bool
  let timestamp: String

  static func == (lhs: AIMessage, rhs: AIMessage) -> Bool {
    lhs.text == rhs.text && lhs.isUser == rhs.isUser && lhs.timestamp == rhs.timestamp
  }
}

@MainActor
class TelynxAIManager: ObservableObject {
  @Published var messages: [AIMessage] = []
  @Published var isLoading = false

  init() {
    messages = [
      AIMessage(
        text: "Hello! I'm Telynx, your AI business assistant. Ask me anything about your business, analytics, or get strategic advice.",
        isUser: false,
        timestamp: "Now"
      )
    ]
  }

  func sendMessage(_ text: String) async {
    messages.append(AIMessage(text: text, isUser: true, timestamp: timeString()))
    isLoading = true

    await Task.sleep(800_000_000)

    let responses = [
      "I've analyzed your request. Here's what I found: Based on current trends, you should focus on customer retention and upselling.",
      "That's a great question. Let me pull the relevant data from your analytics dashboard.",
      "I'd recommend implementing this strategy: 1) Define KPIs, 2) Set up monitoring, 3) Review weekly.",
      "Your metrics show a 15% improvement this quarter. Would you like to explore growth opportunities?"
    ]

    let response = responses.randomElement() ?? "I'm processing your request. Please try again."
    messages.append(AIMessage(text: response, isUser: false, timestamp: timeString()))

    isLoading = false
  }

  private func timeString() -> String {
    let formatter = DateFormatter()
    formatter.timeStyle = .short
    return formatter.string(from: Date())
  }
}

#Preview {
  TelynxAIView()
    .preferredColorScheme(.dark)
}
