-- CreateTable SoundLabsProject
CREATE TABLE "SoundLabsProject" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "mixerState" JSONB NOT NULL DEFAULT '{}',
    "projectSize" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SoundLabsProject_pkey" PRIMARY KEY ("id")
);

-- CreateTable SoundLabsRecording
CREATE TABLE "SoundLabsRecording" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "s3Url" TEXT NOT NULL,
    "s3Key" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "duration" INTEGER,
    "uploadStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "uploadProgress" INTEGER NOT NULL DEFAULT 0,
    "uploadError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SoundLabsRecording_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SoundLabsProject_userId_idx" ON "SoundLabsProject"("userId");

-- CreateIndex
CREATE INDEX "SoundLabsRecording_projectId_idx" ON "SoundLabsRecording"("projectId");

-- AddForeignKey
ALTER TABLE "SoundLabsProject" ADD CONSTRAINT "SoundLabsProject_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SoundLabsRecording" ADD CONSTRAINT "SoundLabsRecording_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "SoundLabsProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;
