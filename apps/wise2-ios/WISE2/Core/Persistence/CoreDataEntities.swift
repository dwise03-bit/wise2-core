import CoreData
import Foundation

@objc(ChatMessageEntity)
public class ChatMessageEntity: NSManagedObject {
  @NSManaged public var id: UUID
  @NSManaged public var role: String
  @NSManaged public var content: String
  @NSManaged public var timestamp: Date
}

@objc(ProjectEntity)
public class ProjectEntity: NSManagedObject {
  @NSManaged public var id: UUID
  @NSManaged public var name: String
  @NSManaged public var status: String
  @NSManaged public var progress: Int32
  @NSManaged public var createdAt: Date
}

@objc(TaskEntity)
public class TaskEntity: NSManagedObject {
  @NSManaged public var id: UUID
  @NSManaged public var title: String
  @NSManaged public var status: String
  @NSManaged public var priority: String
  @NSManaged public var dueDate: Date?
  @NSManaged public var createdAt: Date
}

@objc(MediaEntity)
public class MediaEntity: NSManagedObject {
  @NSManaged public var id: UUID
  @NSManaged public var filename: String
  @NSManaged public var mimeType: String
  @NSManaged public var data: Data
  @NSManaged public var uploadedAt: Date
  @NSManaged public var isUploaded: Bool
}
