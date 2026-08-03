-- AlterTable
ALTER TABLE "User" ADD COLUMN "consultingBookings" TEXT;

-- CreateTable
CREATE TABLE "ConsultingService" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "hourlyRate" DOUBLE PRECISION NOT NULL,
    "minHours" INTEGER NOT NULL DEFAULT 1,
    "maxHours" INTEGER,
    "tags" TEXT[],
    "icon" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConsultingService_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Consultant" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "bio" TEXT,
    "expertise" TEXT[],
    "hourlyRate" DOUBLE PRECISION NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Consultant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConsultantService" (
    "id" TEXT NOT NULL,
    "consultantId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "customHourlyRate" DOUBLE PRECISION,
    "capacity" INTEGER NOT NULL DEFAULT 10,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConsultantService_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CalendarAvailability" (
    "id" TEXT NOT NULL,
    "consultantId" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "isRecurring" BOOLEAN NOT NULL DEFAULT true,
    "validFrom" TIMESTAMP(3),
    "validTo" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CalendarAvailability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Booking" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "consultantId" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "durationHours" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'scheduled',
    "totalPrice" DOUBLE PRECISION NOT NULL,
    "stripePaymentIntentId" TEXT,
    "paymentStatus" TEXT NOT NULL DEFAULT 'pending',
    "meetingLink" TEXT,
    "notes" TEXT,
    "consultantNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PostCallSummary" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "recordingUrl" TEXT,
    "transcript" TEXT,
    "summary" TEXT NOT NULL,
    "followUpDate" TIMESTAMP(3),
    "followUpNotes" TEXT,
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PostCallSummary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActionItem" (
    "id" TEXT NOT NULL,
    "summaryId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "owner" TEXT,
    "dueDate" TIMESTAMP(3),
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ActionItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Consultant_email_key" ON "Consultant"("email");

-- CreateIndex
CREATE UNIQUE INDEX "ConsultantService_consultantId_serviceId_key" ON "ConsultantService"("consultantId", "serviceId");

-- CreateIndex
CREATE INDEX "ConsultantService_consultantId_idx" ON "ConsultantService"("consultantId");

-- CreateIndex
CREATE INDEX "ConsultantService_serviceId_idx" ON "ConsultantService"("serviceId");

-- CreateIndex
CREATE INDEX "CalendarAvailability_consultantId_idx" ON "CalendarAvailability"("consultantId");

-- CreateIndex
CREATE INDEX "Booking_userId_idx" ON "Booking"("userId");

-- CreateIndex
CREATE INDEX "Booking_consultantId_idx" ON "Booking"("consultantId");

-- CreateIndex
CREATE INDEX "Booking_serviceId_idx" ON "Booking"("serviceId");

-- CreateIndex
CREATE INDEX "Booking_startTime_idx" ON "Booking"("startTime");

-- CreateIndex
CREATE UNIQUE INDEX "PostCallSummary_bookingId_key" ON "PostCallSummary"("bookingId");

-- CreateIndex
CREATE INDEX "PostCallSummary_bookingId_idx" ON "PostCallSummary"("bookingId");

-- CreateIndex
CREATE INDEX "ActionItem_summaryId_idx" ON "ActionItem"("summaryId");

-- AddForeignKey
ALTER TABLE "ConsultantService" ADD CONSTRAINT "ConsultantService_consultantId_fkey" FOREIGN KEY ("consultantId") REFERENCES "Consultant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsultantService" ADD CONSTRAINT "ConsultantService_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "ConsultingService"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalendarAvailability" ADD CONSTRAINT "CalendarAvailability_consultantId_fkey" FOREIGN KEY ("consultantId") REFERENCES "Consultant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "ConsultingService"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_consultantId_fkey" FOREIGN KEY ("consultantId") REFERENCES "Consultant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostCallSummary" ADD CONSTRAINT "PostCallSummary_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActionItem" ADD CONSTRAINT "ActionItem_summaryId_fkey" FOREIGN KEY ("summaryId") REFERENCES "PostCallSummary"("id") ON DELETE CASCADE ON UPDATE CASCADE;
