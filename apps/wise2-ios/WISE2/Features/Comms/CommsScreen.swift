import SwiftUI

struct CommsScreen: View {
  @StateObject private var store = CommsStore()

  var body: some View {
    Group {
      if store.isLoading && store.conversations.isEmpty {
        ProgressView("Loading conversations…")
      } else if store.conversations.isEmpty {
        VStack(spacing: 12) {
          Image(systemName: "phone.fill")
            .font(.largeTitle)
            .foregroundColor(.wise2Primary)
          Text("No conversations yet")
            .foregroundColor(.wise2TextSecondary)
          Text("Configured comms providers will appear here.")
            .font(.caption)
            .multilineTextAlignment(.center)
            .foregroundColor(.wise2TextMuted)
        }
        .padding()
      } else {
        List(store.conversations) { conversation in
          VStack(alignment: .leading, spacing: 4) {
            HStack {
              Text(conversation.contactName).foregroundColor(.wise2TextPrimary)
              Spacer()
              Text(conversation.channel.rawValue.uppercased())
                .font(.caption2)
                .foregroundColor(.wise2Primary)
            }
            Text(conversation.preview).font(.caption).foregroundColor(.wise2TextSecondary)
            if conversation.humanTakeover {
              Text("Human takeover active").font(.caption2).foregroundColor(.wise2Warning)
            }
          }
          .listRowBackground(Color.wise2Surface)
        }
        .listStyle(.insetGrouped)
      }
    }
    .background(Color.wise2Background.ignoresSafeArea())
    .navigationTitle("Phone")
    .refreshable { await store.load() }
    .task { await store.load() }
  }
}
