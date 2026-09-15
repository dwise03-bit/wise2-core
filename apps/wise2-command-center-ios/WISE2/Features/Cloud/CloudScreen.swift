import SwiftUI

struct CloudScreen: View {
  @StateObject private var store = CloudStore()

  var body: some View {
    Group {
      if store.isLoading && store.inventory == nil {
        ProgressView("Loading cloud inventory…")
      } else if let error = store.errorMessage, store.inventory == nil {
        BusinessErrorView(message: error) { Task { await store.load() } }
      } else {
        List {
          if let health = store.health {
            Section("Health") {
              Text(health.status.capitalized).foregroundColor(.wise2TextPrimary)
              ForEach(health.components, id: \.name) { component in
                Text("\(component.name): \(component.status)")
                  .font(.caption)
                  .foregroundColor(.wise2TextSecondary)
              }
            }
          }
          if let inventory = store.inventory {
            Section("Inventory") {
              Text(inventory.controlBridgeConfigured ? "Control Bridge configured" : "Control Bridge unavailable")
                .foregroundColor(inventory.controlBridgeConfigured ? .wise2Success : .wise2Warning)
              ForEach(inventory.apps, id: \.self) { app in
                Text(app).foregroundColor(.wise2TextPrimary)
              }
            }
          }
          Section("Named operations") {
            CloudActionButton(title: "Health check", operation: "healthCheck", store: store)
            CloudActionButton(title: "Deploy", operation: "deploy", store: store, target: "wise2-api")
            CloudActionButton(title: "Restart", operation: "restart", store: store, target: "wise2-api")
            CloudActionButton(title: "Rollback", operation: "rollback", store: store, target: "wise2-api")
          }
          if let operation = store.lastOperation {
            Section("Last operation") {
              Text(operation.message).foregroundColor(.wise2TextSecondary)
              Text("ID: \(operation.operationId)").font(.caption).foregroundColor(.wise2TextMuted)
            }
          }
        }
        .listStyle(.insetGrouped)
      }
    }
    .background(Color.wise2Background.ignoresSafeArea())
    .navigationTitle("WISE² Cloud")
    .alert("Confirm sensitive action", isPresented: $store.awaitingConfirmation) {
      Button("Confirm") { Task { await store.confirmPendingOperation() } }
      Button("Cancel", role: .cancel) { store.cancelPendingOperation() }
    } message: {
      Text("Authenticate to run \(store.pendingOperation ?? "operation")")
    }
    .refreshable { await store.load() }
    .task { await store.load() }
  }
}

private struct CloudActionButton: View {
  let title: String
  let operation: String
  @ObservedObject var store: CloudStore
  var target: String?

  var body: some View {
    Button(title) {
      store.requestOperation(operation, target: target)
    }
    .foregroundColor(.wise2Primary)
  }
}
