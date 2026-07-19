-- Migration: Add Real-Time Collaboration System
-- Tables: ProjectCollaborators, Comments, ActivityLog, VersionHistory

-- ProjectCollaborators: Track who has access to projects
CREATE TABLE IF NOT EXISTS "ProjectCollaborator" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'EDITOR',
    "permissions" TEXT[] NOT NULL DEFAULT '{}',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastActiveAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'active',

    FOREIGN KEY ("projectId") REFERENCES "SoundLabsProject"("id") ON DELETE CASCADE,
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE,
    UNIQUE("projectId", "userId")
);

-- ProjectInvite: Share projects with invitations
CREATE TABLE IF NOT EXISTS "ProjectInvite" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "invitedBy" TEXT NOT NULL,
    "invitedEmail" TEXT NOT NULL,
    "token" TEXT NOT NULL UNIQUE,
    "role" TEXT NOT NULL DEFAULT 'EDITOR',
    "expiresAt" TIMESTAMP(3),
    "acceptedAt" TIMESTAMP(3),
    "acceptedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY ("projectId") REFERENCES "SoundLabsProject"("id") ON DELETE CASCADE,
    FOREIGN KEY ("invitedBy") REFERENCES "User"("id") ON DELETE CASCADE,
    FOREIGN KEY ("acceptedBy") REFERENCES "User"("id") ON DELETE SET NULL
);

-- Comments: Track comments and annotations
CREATE TABLE IF NOT EXISTS "ProjectComment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "timestamp" DOUBLE PRECISION,
    "trackId" TEXT,
    "threadId" TEXT,
    "mentions" TEXT[] NOT NULL DEFAULT '{}',
    "reactions" JSONB NOT NULL DEFAULT '{}',
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    FOREIGN KEY ("projectId") REFERENCES "SoundLabsProject"("id") ON DELETE CASCADE,
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

-- ActivityLog: Track all changes
CREATE TABLE IF NOT EXISTS "ActivityLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "details" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY ("projectId") REFERENCES "SoundLabsProject"("id") ON DELETE CASCADE,
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

-- VersionHistory: Track project versions
CREATE TABLE IF NOT EXISTS "VersionHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "snapshot" JSONB NOT NULL,
    "label" TEXT,
    "changeLog" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY ("projectId") REFERENCES "SoundLabsProject"("id") ON DELETE CASCADE,
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

-- Presence: Track active users
CREATE TABLE IF NOT EXISTS "UserPresence" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'online',
    "cursorPosition" JSONB,
    "editingTrackId" TEXT,
    "lastHeartbeat" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "socketId" TEXT,

    FOREIGN KEY ("projectId") REFERENCES "SoundLabsProject"("id") ON DELETE CASCADE,
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE,
    UNIQUE("projectId", "userId")
);

-- Create indexes for performance
CREATE INDEX "ProjectCollaborator_projectId" ON "ProjectCollaborator"("projectId");
CREATE INDEX "ProjectCollaborator_userId" ON "ProjectCollaborator"("userId");
CREATE INDEX "ProjectInvite_projectId" ON "ProjectInvite"("projectId");
CREATE INDEX "ProjectInvite_token" ON "ProjectInvite"("token");
CREATE INDEX "ProjectComment_projectId" ON "ProjectComment"("projectId");
CREATE INDEX "ProjectComment_threadId" ON "ProjectComment"("threadId");
CREATE INDEX "ActivityLog_projectId" ON "ActivityLog"("projectId");
CREATE INDEX "ActivityLog_userId" ON "ActivityLog"("userId");
CREATE INDEX "ActivityLog_createdAt" ON "ActivityLog"("createdAt");
CREATE INDEX "VersionHistory_projectId" ON "VersionHistory"("projectId");
CREATE INDEX "UserPresence_projectId" ON "UserPresence"("projectId");
