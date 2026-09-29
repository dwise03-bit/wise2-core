import SwiftUI

struct SenCereAIAssistantScreen: View {
  @StateObject private var aiService = AIAssistantService()
  @State private var messageText = ""
  @State private var showSuggestions = true

  var body: some View {
    NavigationStack {
      VStack(spacing: 0) {
        // Header
        VStack(alignment: .leading, spacing: 8) {
          HStack {
            VStack(alignment: .leading, spacing: 4) {
              Text("WISE² Assistant")
                .font(.title2)
                .fontWeight(.bold)
                .foregroundColor(.white)
              Text("AI-powered project management")
                .font(.caption)
                .foregroundColor(.gray)
            }
            Spacer()
            Circle()
              .fill(Color.sencereGold.opacity(0.2))
              .frame(width: 44, height: 44)
              .overlay(
                Text("🤖")
                  .font(.system(size: 20))
              )
          }
        }
        .padding(16)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Color.white.opacity(0.05))

        // Chat Messages
        ScrollViewReader { proxy in
          ScrollView {
            VStack(alignment: .leading, spacing: 12) {
              // Welcome message
              if aiService.messages.isEmpty {
                VStack(alignment: .center, spacing: 16) {
                  Text("🤖")
                    .font(.system(size: 60))
                  Text("WISE² Assistant")
                    .font(.title2)
                    .fontWeight(.bold)
                    .foregroundColor(.white)
                  Text("Ask me anything about your projects, orders, or team.")
                    .font(.body)
                    .foregroundColor(.gray)
                    .multilineTextAlignment(.center)
                }
                .frame(maxWidth: .infinity)
                .padding(32)
              }

              // Messages
              ForEach(aiService.messages, id: \.id) { message in
                MessageBubbleAI(message: message, isOwn: message.isUser)
                  .id(message.id)
              }

              // Typing indicator
              if aiService.isLoading {
                HStack(spacing: 4) {
                  Circle()
                    .fill(Color.sencereGold)
                    .frame(width: 8, height: 8)
                  Circle()
                    .fill(Color.sencereGold.opacity(0.5))
                    .frame(width: 8, height: 8)
                  Circle()
                    .fill(Color.sencereGold.opacity(0.3))
                    .frame(width: 8, height: 8)
                }
                .padding(12)
                .background(Color.white.opacity(0.05))
                .cornerRadius(12)
              }
            }
            .padding(16)
            .onChange(of: aiService.messages.count) { _ in
              if let lastMessage = aiService.messages.last {
                proxy.scrollTo(lastMessage.id, anchor: .bottom)
              }
            }
          }
        }

        // Suggestions
        if showSuggestions && aiService.messages.isEmpty {
          VStack(alignment: .leading, spacing: 8) {
            Text("Quick Actions")
              .font(.caption)
              .fontWeight(.bold)
              .foregroundColor(.gray)
              .padding(.horizontal, 16)

            ScrollView(.horizontal, showsIndicators: false) {
              HStack(spacing: 8) {
                ForEach(aiService.suggestions, id: \.self) { suggestion in
                  Button(action: {
                    messageText = suggestion
                    sendMessage()
                  }) {
                    Text(suggestion)
                      .font(.caption)
                      .foregroundColor(.sencereGold)
                      .lineLimit(1)
                      .padding(.horizontal, 12)
                      .padding(.vertical, 8)
                      .background(Color.sencereGold.opacity(0.1))
                      .border(Color.sencereGold.opacity(0.3), width: 1)
                      .cornerRadius(6)
                  }
                }
              }
              .padding(.horizontal, 16)
            }
          }
          .padding(.vertical, 8)
          .background(Color.white.opacity(0.02))
        }

        // Input Area
        VStack(spacing: 12) {
          HStack(spacing: 12) {
            TextField("Ask about projects, orders, team...", text: $messageText)
              .font(.body)
              .foregroundColor(.white)
              .padding(12)
              .background(Color.white.opacity(0.05))
              .cornerRadius(8)
              .disabled(aiService.isLoading)

            Button(action: sendMessage) {
              Image(systemName: "arrow.up.circle.fill")
                .font(.system(size: 24))
                .frame(width: 44, height: 44)
                .background(Color.sencereGold)
                .foregroundColor(.black)
                .cornerRadius(8)
            }
            .disabled(messageText.trimmingCharacters(in: .whitespaces).isEmpty || aiService.isLoading)
          }

          // Quick commands
          HStack(spacing: 8) {
            QuickCommandButton(icon: "📊", label: "Summary", action: {
              messageText = "Show me a summary of active projects"
              sendMessage()
            })
            QuickCommandButton(icon: "⚠️", label: "At Risk", action: {
              messageText = "Which projects are at risk or delayed?"
              sendMessage()
            })
            QuickCommandButton(icon: "💬", label: "Updates", action: {
              messageText = "What are the latest project updates?"
              sendMessage()
            })
            QuickCommandButton(icon: "🎯", label: "Next Steps", action: {
              messageText = "What should I do next?"
              sendMessage()
            })
          }
        }
        .padding(16)
        .background(Color.white.opacity(0.05))
      }
      .background(Color.black)
    }
    .task {
      await aiService.loadSuggestions()
    }
  }

  private func sendMessage() {
    let userMessage = messageText.trimmingCharacters(in: .whitespaces)
    guard !userMessage.isEmpty else { return }

    messageText = ""
    showSuggestions = false

    Task {
      await aiService.sendMessage(userMessage)
    }
  }
}

struct MessageBubbleAI: View {
  let message: AIMessage
  let isOwn: Bool

  var body: some View {
    HStack(spacing: 12) {
      if isOwn {
        Spacer()
      } else {
        Circle()
          .fill(Color.sencereGold.opacity(0.2))
          .frame(width: 32, height: 32)
          .overlay(
            Text("🤖")
              .font(.system(size: 16))
          )
      }

      VStack(alignment: isOwn ? .trailing : .leading, spacing: 4) {
        Text(message.content)
          .font(.body)
          .foregroundColor(isOwn ? .black : .white)
          .padding(12)
          .background(isOwn ? Color.sencereGold : Color.white.opacity(0.1))
          .cornerRadius(12)

        Text(message.timestamp.formatted(date: .omitted, time: .shortened))
          .font(.caption2)
          .foregroundColor(.gray)
      }

      if !isOwn {
        Spacer()
      }
    }
  }
}

struct QuickCommandButton: View {
  let icon: String
  let label: String
  let action: () -> Void

  var body: some View {
    Button(action: action) {
      VStack(spacing: 4) {
        Text(icon)
          .font(.system(size: 16))
        Text(label)
          .font(.caption2)
          .lineLimit(1)
      }
      .frame(maxWidth: .infinity)
      .frame(height: 60)
      .background(Color.white.opacity(0.05))
      .border(Color.white.opacity(0.1), width: 1)
      .cornerRadius(8)
      .foregroundColor(.gray)
    }
  }
}

#Preview {
  SenCereAIAssistantScreen()
    .preferredColorScheme(.dark)
}
