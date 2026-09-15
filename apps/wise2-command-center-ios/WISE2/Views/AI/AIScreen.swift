import SwiftUI

struct AIScreen: View {
  @StateObject private var viewModel = AIScreenViewModel()
  @EnvironmentObject var authManager: AuthManager

  var body: some View {
    ZStack {
      Color.wise2Background
        .ignoresSafeArea()

      VStack(spacing: 0) {
        // Header
        VStack(alignment: .leading, spacing: 8) {
          Text("WISE² AI")
            .font(.system(size: 24, weight: .bold))
            .foregroundColor(.wise2TextPrimary)

          Text("Ask anything about your business")
            .font(.system(size: 12))
            .foregroundColor(.wise2TextMuted)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(16)
        .background(Color.wise2Surface)
        .border(Color.wise2BorderMedium, width: 1)

        // Messages
        ScrollViewReader { proxy in
          ScrollView {
            VStack(spacing: 12) {
              if viewModel.messages.isEmpty {
                VStack(spacing: 16) {
                  Image(systemName: "sparkles")
                    .font(.system(size: 40))
                    .foregroundColor(.wise2TextMuted)

                  Text("Start a conversation")
                    .font(.system(size: 16, weight: .semibold))
                    .foregroundColor(.wise2TextPrimary)

                  Text("Ask WISE² anything about your business, analytics, or operations")
                    .font(.system(size: 12))
                    .foregroundColor(.wise2TextMuted)
                    .multilineTextAlignment(.center)
                }
                .frame(maxWidth: .infinity)
                .padding(32)
              } else {
                ForEach(viewModel.messages) { message in
                  ChatBubble(message: message)
                    .id(message.id)
                }

                if viewModel.isLoading {
                  HStack(spacing: 8) {
                    Circle()
                      .fill(Color.wise2Primary)
                      .frame(width: 8, height: 8)
                      .opacity(0.6)

                    Circle()
                      .fill(Color.wise2Primary)
                      .frame(width: 8, height: 8)
                      .opacity(0.4)

                    Circle()
                      .fill(Color.wise2Primary)
                      .frame(width: 8, height: 8)
                      .opacity(0.2)
                  }
                  .padding(12)
                }
              }
            }
            .padding(16)
            .onChange(of: viewModel.messages.count) { _ in
              if let lastMessage = viewModel.messages.last {
                withAnimation {
                  proxy.scrollTo(lastMessage.id, anchor: .bottom)
                }
              }
            }
          }
        }

        // Error
        if let error = viewModel.errorMessage {
          VStack(spacing: 8) {
            HStack(spacing: 8) {
              Image(systemName: "exclamationmark.circle.fill")
                .foregroundColor(.wise2Danger)

              Text(error)
                .font(.system(size: 12))
                .foregroundColor(.wise2Danger)

              Spacer()
            }
            .padding(12)
            .background(Color.wise2Danger.opacity(0.1))
            .border(Color.wise2Danger.opacity(0.3), width: 1)
          }
          .padding(16)
        }

        // Input
        VStack(spacing: 12) {
          HStack(spacing: 8) {
            TextField("Ask WISE²...", text: $viewModel.inputText)
              .textInputAutocapitalization(.sentences)
              .padding(12)
              .background(Color.wise2Surface)
              .border(Color.wise2BorderMedium, width: 1)
              .foregroundColor(.wise2TextPrimary)

            Button(action: {
              Task {
                await viewModel.sendMessage()
              }
            }) {
              Image(systemName: "arrow.up.circle.fill")
                .font(.system(size: 20))
                .foregroundColor(viewModel.inputText.trimmingCharacters(in: .whitespaces).isEmpty ? .wise2TextMuted : .wise2Primary)
            }
            .disabled(viewModel.inputText.trimmingCharacters(in: .whitespaces).isEmpty || viewModel.isLoading)
          }

          if !viewModel.messages.isEmpty {
            Button(action: { viewModel.clearConversation() }) {
              Text("Clear conversation")
                .font(.system(size: 12))
                .foregroundColor(.wise2TextMuted)
            }
          }
        }
        .padding(16)
        .background(Color.wise2Surface)
        .border(Color.wise2BorderMedium, width: 1)
      }
    }
  }
}

struct ChatBubble: View {
  let message: ChatMessage

  var body: some View {
    HStack(alignment: .top, spacing: 12) {
      if message.role == .assistant {
        Image(systemName: "sparkles")
          .font(.system(size: 14))
          .foregroundColor(.wise2Primary)
          .frame(width: 24, alignment: .center)
      }

      VStack(alignment: message.role == .user ? .trailing : .leading, spacing: 4) {
        Text(message.content)
          .font(.system(size: 14))
          .foregroundColor(message.role == .user ? .white : .wise2TextPrimary)
          .textSelection(.enabled)

        Text(message.timestamp.formatted(date: .omitted, time: .shortened))
          .font(.system(size: 10))
          .foregroundColor(.wise2TextMuted)
      }
      .frame(maxWidth: .infinity, alignment: message.role == .user ? .trailing : .leading)
      .padding(12)
      .background(message.role == .user ? Color.wise2Primary : Color.wise2Surface)
      .border(message.role == .user ? Color.wise2Primary : Color.wise2BorderMedium, width: 1)

      if message.role == .user {
        Image(systemName: "person.circle.fill")
          .font(.system(size: 14))
          .foregroundColor(.wise2TextMuted)
          .frame(width: 24, alignment: .center)
      }
    }
  }
}

#Preview {
  AIScreen()
    .environmentObject(AuthManager())
}
