-- Add podcast music models to the schema

-- AlterTable: Add podcast project relationships to User
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "podcastProjects" TEXT[];

-- CreateTable: PodcastProject
CREATE TABLE IF NOT EXISTS "PodcastProject" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "thumbnailUrl" TEXT,
    "podcastName" TEXT NOT NULL,
    "podcastCategory" TEXT,
    "episodeNumber" INTEGER,
    "releaseDate" TIMESTAMP(3),
    "mood" TEXT,
    "duration" INTEGER,
    "genre" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "PodcastProject_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable: AudioGeneration
CREATE TABLE IF NOT EXISTS "AudioGeneration" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "podcastProjectId" TEXT NOT NULL,
    "jobId" TEXT UNIQUE,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "progress" INTEGER NOT NULL DEFAULT 0,
    "prompt" TEXT NOT NULL,
    "aiModel" TEXT NOT NULL DEFAULT 'default',
    "seed" INTEGER,
    "audioUrl" TEXT,
    "audioFileSize" INTEGER,
    "duration" INTEGER,
    "waveformData" TEXT,
    "errorMessage" TEXT,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "maxRetries" INTEGER NOT NULL DEFAULT 3,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    CONSTRAINT "AudioGeneration_podcastProjectId_fkey" FOREIGN KEY ("podcastProjectId") REFERENCES "PodcastProject" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable: UsageRecord
CREATE TABLE IF NOT EXISTS "UsageRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "podcastProjectId" TEXT,
    "audioGenerationId" TEXT,
    "costInCents" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UsageRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "PodcastProject_userId_idx" ON "PodcastProject"("userId");
CREATE INDEX "PodcastProject_status_idx" ON "PodcastProject"("status");
CREATE INDEX "AudioGeneration_podcastProjectId_idx" ON "AudioGeneration"("podcastProjectId");
CREATE INDEX "AudioGeneration_jobId_idx" ON "AudioGeneration"("jobId");
CREATE INDEX "AudioGeneration_status_idx" ON "AudioGeneration"("status");
CREATE INDEX "UsageRecord_userId_idx" ON "UsageRecord"("userId");
CREATE INDEX "UsageRecord_createdAt_idx" ON "UsageRecord"("createdAt");
