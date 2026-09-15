import SwiftUI

struct SenCereMessagesScreen: View {
  @StateObject private var apiService = SenCereAPIService()
  @State private var selectedThread: MessageThread?

  var body: some View {
    NavigationStack {
      if let selectedThread = selectedThread {
        MessageDetailView(thread: selectedThread)
          .navigationBarBackButtonHidden(true)
          .toolbar {
            ToolbarItem(placement: .navigationBarLeading) {
              Button(action: { self.selectedThread = nil }) {
                HStack(spacing: 4) {
                  Image(systemName: "chevron.left")
                  Text("Back")
                }
                .foregroundColor(.sencereGold)
              }
            }
          }
      } else {
        VStack(spacing: 0) {
          // Header
          VStack(alignment: .leading, spacing: 8) {
            Text("Messages")
              .font(.title2)
              .fontWeight(.bold)
              .foregroundColor(.white)
          }
          .padding(16)
          .frame(maxWidth: .infinity, alignment: .leading)

          // Message Threads
          ScrollView {
            VStack(spacing: 0) {
              ForEach(apiService.messages, id: \.id) { thread in
                Button(action: { selectedThread = thread }) {
                  MessageThreadRow(thread: thread)
                }
              }
            }
          }
        }
        .background(Color.black)
      }
    }
    .task {
      await apiService.fetchMessages()
    }
  }
}

struct MessageThreadRow: View {
  let thread: MessageThread

  var body: some View {
    VStack(alignment: .leading, spacing: 12) {
      HStack(spacing: 12) {
        // Avatar
        Circle()
          .fill(Color.sencereGold.opacity(0.2))
          .frame(width: 48, height: 48)
          .overlay(
            Text("👤")
              .font(.system(size: 24))
          )

        VStack(alignment: .leading, spacing: 4) {
          HStack {
            Text(thread.participants.first?.name ?? "Unknown")
              .font(.subheadline)
              .fontWeight(.semibold)
              .foregroundColor(.white)
            Spacer()
            if let msg = thread.lastMessage {
              Text(formatTime(msg.timestamp))
                .font(.caption)
                .foregroundColor(.gray)
            }
          }

          if let msg = thread.lastMessage {
            Text(msg.content)
              .font(.caption)
              .foregroundColor(.gray)
              .lineLimit(1)
          }
        }

        VStack {
          Spacer()
          if thread.unreadCount > 0 {
            Circle()
              .fill(Color.sencereGold)
              .frame(width: 20, height: 20)
              .overlay(
                Text("\(thread.unreadCount)")
                  .font(.caption2)
                  .fontWeight(.bold)
                  .foregroundColor(.black)
              )
          }
        }
      }
      .padding(12)
      .foregroundColor(.white)

      Divider()
        .background(Color.white.opacity(0.1))
    }
  }

  private func formatTime(_ date: Date) -> String {
    let calendar = Calendar.current
    if calendar.isDateInToday(date) {
      return date.formatted(date: .omitted, time: .shortened)
    } else if calendar.isDateInYesterday(date) {
      return "Yesterday"
    } else {
      return date.formatted(date: .abbreviated, time: .omitted)
    }
  }
}

struct MessageDetailView: View {
  let thread: MessageThread
  @State private var messageText = ""
  @State private var messages: [Message] = []

  var body: some View {
    VStack(spacing: 0) {
      // Header
      VStack(alignment: .leading, spacing: 8) {
        Text(thread.participants.first?.name ?? "Unknown")
          .font(.title2)
          .fontWeight(.bold)
          .foregroundColor(.white)
        Text(thread.participants.first?.email ?? "")
          .font(.caption)
          .foregroundColor(.gray)
      }
      .padding(16)
      .frame(maxWidth: .infinity, alignment: .leading)
      .background(Color.white.opacity(0.05))

      // Messages
      ScrollView {
        VStack(alignment: .leading, spacing: 12) {
          if let msg = thread.lastMessage {
            MessageBubble(message: msg, isOwn: false)
          }
        }
        .padding(16)
      }

      // Input
      VStack(spacing: 12) {
        HStack(spacing: 12) {
          TextField("Type a message...", text: $messageText)
            .font(.body)
            .foregroundColor(.white)
            .padding(12)
            .background(Color.white.opacity(0.05))
            .cornerRadius(8)

          Button(action: {}) {
            Image(systemName: "paperplane.fill")
              .font(.system(size: 16))
              .frame(width: 44, height: 44)
              .background(Color.sencereGold)
              .foregroundColor(.black)
              .cornerRadius(8)
          }
        }
      }
      .padding(16)
      .background(Color.white.opacity(0.05))
    }
    .background(Color.black)
  }
}

struct MessageBubble: View {
  let message: Message
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
            Text("👤")
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
          .font(.caption)
          .foregroundColor(.gray)
      }

      if !isOwn {
        Spacer()
      }
    }
  }
}

#Preview {
  SenCereMessagesScreen()
    .preferredColorScheme(.dark)
}
