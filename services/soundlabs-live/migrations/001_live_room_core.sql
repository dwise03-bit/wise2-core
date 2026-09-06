CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS "SoundLabsLiveSession" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "projectId" TEXT NOT NULL REFERENCES "SoundLabsProject"("id") ON DELETE CASCADE,
  "ownerId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "status" TEXT NOT NULL DEFAULT 'DRAFT' CHECK ("status" IN ('DRAFT','LIVE','PAUSED','ENDED','ARCHIVED')),
  "crowdMode" TEXT NOT NULL DEFAULT 'GUIDED' CHECK ("crowdMode" IN ('WATCH_ONLY','GUIDED','CHAOS')),
  "currentTrackVersionId" TEXT,
  "finalTrackVersionId" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "SoundLabsLiveParticipant" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "sessionId" TEXT NOT NULL REFERENCES "SoundLabsLiveSession"("id") ON DELETE CASCADE,
  "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "role" TEXT NOT NULL DEFAULT 'VIEWER' CHECK ("role" IN ('OWNER','CO_ARTIST','PRODUCER','GUEST','MODERATOR','VIEWER')),
  "presence" TEXT NOT NULL DEFAULT 'offline',
  "joinedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "lastSeenAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE ("sessionId", "userId")
);

CREATE TABLE IF NOT EXISTS "SoundLabsLiveTrack" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "sessionId" TEXT NOT NULL REFERENCES "SoundLabsLiveSession"("id") ON DELETE CASCADE,
  "title" TEXT NOT NULL,
  "createdById" TEXT NOT NULL REFERENCES "User"("id") ON DELETE RESTRICT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "SoundLabsLiveTrackVersion" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "trackId" TEXT NOT NULL REFERENCES "SoundLabsLiveTrack"("id") ON DELETE CASCADE,
  "parentVersionId" TEXT REFERENCES "SoundLabsLiveTrackVersion"("id") ON DELETE SET NULL,
  "label" TEXT NOT NULL,
  "source" TEXT NOT NULL,
  "assetUrl" TEXT,
  "metadata" JSONB NOT NULL DEFAULT '{}'::jsonb,
  "createdById" TEXT NOT NULL REFERENCES "User"("id") ON DELETE RESTRICT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE "SoundLabsLiveSession"
  ADD CONSTRAINT "SoundLabsLiveSession_currentTrackVersionId_fkey"
  FOREIGN KEY ("currentTrackVersionId") REFERENCES "SoundLabsLiveTrackVersion"("id") ON DELETE SET NULL;
ALTER TABLE "SoundLabsLiveSession"
  ADD CONSTRAINT "SoundLabsLiveSession_finalTrackVersionId_fkey"
  FOREIGN KEY ("finalTrackVersionId") REFERENCES "SoundLabsLiveTrackVersion"("id") ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS "SoundLabsLivePoll" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "sessionId" TEXT NOT NULL REFERENCES "SoundLabsLiveSession"("id") ON DELETE CASCADE,
  "createdById" TEXT NOT NULL REFERENCES "User"("id") ON DELETE RESTRICT,
  "question" TEXT NOT NULL,
  "options" JSONB NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'OPEN' CHECK ("status" IN ('DRAFT','OPEN','CLOSED')),
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "closedAt" TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS "SoundLabsLivePollVote" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "pollId" TEXT NOT NULL REFERENCES "SoundLabsLivePoll"("id") ON DELETE CASCADE,
  "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "optionId" TEXT NOT NULL,
  "weight" INTEGER NOT NULL DEFAULT 1 CHECK ("weight" > 0),
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE ("pollId", "userId")
);

CREATE TABLE IF NOT EXISTS "SoundLabsLiveSuggestion" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "sessionId" TEXT NOT NULL REFERENCES "SoundLabsLiveSession"("id") ON DELETE CASCADE,
  "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "category" TEXT NOT NULL,
  "text" TEXT NOT NULL,
  "score" INTEGER NOT NULL DEFAULT 0,
  "moderationState" TEXT NOT NULL DEFAULT 'APPROVED',
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "SoundLabsLiveMessage" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "sessionId" TEXT NOT NULL REFERENCES "SoundLabsLiveSession"("id") ON DELETE CASCADE,
  "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "source" TEXT NOT NULL DEFAULT 'WISE2',
  "text" TEXT NOT NULL,
  "moderationState" TEXT NOT NULL DEFAULT 'APPROVED',
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "SoundLabsLiveSession_projectId_idx" ON "SoundLabsLiveSession"("projectId");
CREATE INDEX IF NOT EXISTS "SoundLabsLiveSession_ownerId_idx" ON "SoundLabsLiveSession"("ownerId");
CREATE INDEX IF NOT EXISTS "SoundLabsLiveParticipant_sessionId_idx" ON "SoundLabsLiveParticipant"("sessionId");
CREATE INDEX IF NOT EXISTS "SoundLabsLiveTrack_sessionId_idx" ON "SoundLabsLiveTrack"("sessionId");
CREATE INDEX IF NOT EXISTS "SoundLabsLiveTrackVersion_trackId_idx" ON "SoundLabsLiveTrackVersion"("trackId");
CREATE INDEX IF NOT EXISTS "SoundLabsLivePoll_sessionId_idx" ON "SoundLabsLivePoll"("sessionId");
CREATE INDEX IF NOT EXISTS "SoundLabsLiveSuggestion_sessionId_idx" ON "SoundLabsLiveSuggestion"("sessionId", "score" DESC);
CREATE INDEX IF NOT EXISTS "SoundLabsLiveMessage_sessionId_createdAt_idx" ON "SoundLabsLiveMessage"("sessionId", "createdAt" DESC);
