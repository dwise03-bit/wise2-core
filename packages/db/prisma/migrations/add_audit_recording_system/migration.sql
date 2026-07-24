-- CreateEnum for AuditSessionStatus
CREATE TYPE "AuditSessionStatus" AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'ARCHIVED');

-- CreateEnum for RecordingType
CREATE TYPE "RecordingType" AS ENUM ('AUDIO', 'VIDEO');

-- CreateEnum for TranscriptionStatus
CREATE TYPE "TranscriptionStatus" AS ENUM ('PENDING', 'QUEUED', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateTable for AuditSession
CREATE TABLE "AuditSession" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "clientName" TEXT NOT NULL,
    "auditTopic" TEXT NOT NULL,
    "status" "AuditSessionStatus" NOT NULL DEFAULT 'SCHEDULED',
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AuditSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable for AuditRecording
CREATE TABLE "AuditRecording" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "type" "RecordingType" NOT NULL DEFAULT 'AUDIO',
    "duration" INTEGER,
    "fileSize" INTEGER,
    "s3Url" TEXT,
    "s3Key" TEXT,
    "uploadStatus" "UploadStatus" NOT NULL DEFAULT 'PENDING',
    "uploadProgress" INTEGER NOT NULL DEFAULT 0,
    "uploadError" TEXT,
    "transcriptionStatus" "TranscriptionStatus" NOT NULL DEFAULT 'PENDING',
    "transcriptionJobId" TEXT,
    "transcript" TEXT,
    "transcriptionError" TEXT,
    "userNotes" TEXT,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "uploadedAt" TIMESTAMP(3),
    "transcribedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "archivedAt" TIMESTAMP(3),

    CONSTRAINT "AuditRecording_pkey" PRIMARY KEY ("id")
);

-- CreateTable for AuditMoment
CREATE TABLE "AuditMoment" (
    "id" TEXT NOT NULL,
    "recordingId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "timestampMs" INTEGER NOT NULL,
    "category" TEXT,
    "severity" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AuditMoment_pkey" PRIMARY KEY ("id")
);

-- Add auditSession to Booking
ALTER TABLE "Booking" ADD COLUMN "auditSession" BOOLEAN DEFAULT false;

-- CreateIndex on AuditSession
CREATE UNIQUE INDEX "AuditSession_bookingId_key" ON "AuditSession"("bookingId");
CREATE INDEX "AuditSession_status_idx" ON "AuditSession"("status");
CREATE INDEX "AuditSession_startedAt_idx" ON "AuditSession"("startedAt");

-- CreateIndex on AuditRecording
CREATE INDEX "AuditRecording_sessionId_idx" ON "AuditRecording"("sessionId");
CREATE INDEX "AuditRecording_uploadStatus_idx" ON "AuditRecording"("uploadStatus");
CREATE INDEX "AuditRecording_transcriptionStatus_idx" ON "AuditRecording"("transcriptionStatus");
CREATE INDEX "AuditRecording_expiresAt_idx" ON "AuditRecording"("expiresAt");

-- CreateIndex on AuditMoment
CREATE INDEX "AuditMoment_recordingId_idx" ON "AuditMoment"("recordingId");
CREATE INDEX "AuditMoment_category_idx" ON "AuditMoment"("category");
CREATE INDEX "AuditMoment_severity_idx" ON "AuditMoment"("severity");

-- Add foreign key constraints
ALTER TABLE "AuditSession" ADD CONSTRAINT "AuditSession_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE;
ALTER TABLE "AuditRecording" ADD CONSTRAINT "AuditRecording_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "AuditSession"("id") ON DELETE CASCADE;
ALTER TABLE "AuditMoment" ADD CONSTRAINT "AuditMoment_recordingId_fkey" FOREIGN KEY ("recordingId") REFERENCES "AuditRecording"("id") ON DELETE CASCADE;
