import Foundation
import CoreData

@MainActor
class PersistenceManager {
  static let shared = PersistenceManager()

  let container: NSPersistentContainer

  init() {
    container = NSPersistentContainer(name: "WISE2")
    container.loadPersistentStores { _, error in
      if let error = error {
        print("❌ CoreData load error: \(error)")
      } else {
        print("✅ CoreData initialized")
      }
    }
    container.viewContext.automaticallyMergesChangesFromParent = true
  }

  func save() throws {
    let context = container.viewContext
    if context.hasChanges {
      try context.save()
      print("✅ Data saved to CoreData")
    }
  }

  func delete(_ object: NSManagedObject) throws {
    let context = container.viewContext
    context.delete(object)
    try save()
  }

  func fetchAllChatMessages() -> [ChatMessageEntity] {
    let fetchRequest = NSFetchRequest<ChatMessageEntity>(entityName: "ChatMessageEntity")
    fetchRequest.sortDescriptors = [NSSortDescriptor(keyPath: \ChatMessageEntity.timestamp, ascending: true)]

    do {
      return try container.viewContext.fetch(fetchRequest)
    } catch {
      print("❌ Fetch error: \(error)")
      return []
    }
  }

  func saveChatMessage(role: String, content: String) throws {
    let entity = ChatMessageEntity(context: container.viewContext)
    entity.id = UUID()
    entity.role = role
    entity.content = content
    entity.timestamp = Date()
    try save()
  }

  func fetchAllProjects() -> [ProjectEntity] {
    let fetchRequest = NSFetchRequest<ProjectEntity>(entityName: "ProjectEntity")
    fetchRequest.sortDescriptors = [NSSortDescriptor(keyPath: \ProjectEntity.name, ascending: true)]

    do {
      return try container.viewContext.fetch(fetchRequest)
    } catch {
      print("❌ Fetch error: \(error)")
      return []
    }
  }

  func saveProject(name: String, status: String, progress: Int32) throws {
    let entity = ProjectEntity(context: container.viewContext)
    entity.id = UUID()
    entity.name = name
    entity.status = status
    entity.progress = progress
    entity.createdAt = Date()
    try save()
  }

  func clearAllData() throws {
    let context = container.viewContext
    let entities = container.managedObjectModel.entities
    for entity in entities {
      let fetchRequest = NSFetchRequest<NSFetchRequestResult>(entityName: entity.name ?? "")
      let deleteRequest = NSBatchDeleteRequest(fetchRequest: fetchRequest)
      try context.execute(deleteRequest)
    }
    try save()
  }
}
