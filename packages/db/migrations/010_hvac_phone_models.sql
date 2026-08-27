-- WISE² HVAC + PHONE SERVICE MODELS MIGRATION
-- Adds complete phone system, HVAC property/equipment, technician, appointment, and work order tables

-- Create Technician table
CREATE TABLE IF NOT EXISTS "Technician" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "firstName" TEXT NOT NULL,
  "lastName" TEXT NOT NULL,
  "email" TEXT NOT NULL UNIQUE,
  "phone" TEXT NOT NULL,
  "specialization" TEXT[] DEFAULT '{}',
  "licenseNumber" TEXT,
  "certifications" TEXT[] DEFAULT '{}',
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "Technician_email_idx" ON "Technician"("email");
CREATE INDEX "Technician_isActive_idx" ON "Technician"("isActive");

-- Add HVAC relationships to Customer table
ALTER TABLE "Customer" ADD COLUMN IF NOT EXISTS "hvacPropertyId" TEXT;

-- Create HVACProperty table
CREATE TABLE IF NOT EXISTS "HVACProperty" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "customerId" TEXT NOT NULL,
  "address" TEXT NOT NULL,
  "city" TEXT NOT NULL,
  "state" TEXT NOT NULL,
  "zipCode" TEXT NOT NULL,
  "coordinates" TEXT,
  "propertyType" TEXT NOT NULL,
  "squareFeet" INTEGER,
  "heatingType" TEXT,
  "coolingType" TEXT,
  "age" INTEGER,
  "phonePrimary" TEXT,
  "phoneSecondary" TEXT,
  "preferredContact" TEXT,
  "serviceArea" TEXT,
  "maintenancePlan" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "HVACProperty_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE CASCADE,
  CONSTRAINT "HVACProperty_customerId_address_key" UNIQUE ("customerId", "address")
);

CREATE INDEX "HVACProperty_customerId_idx" ON "HVACProperty"("customerId");
CREATE INDEX "HVACProperty_zipCode_idx" ON "HVACProperty"("zipCode");

-- Create HVACEquipment table
CREATE TABLE IF NOT EXISTS "HVACEquipment" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "propertyId" TEXT NOT NULL,
  "equipmentType" TEXT NOT NULL,
  "manufacturer" TEXT NOT NULL,
  "model" TEXT NOT NULL,
  "serial" TEXT NOT NULL UNIQUE,
  "tonnage" DOUBLE PRECISION,
  "voltage" TEXT,
  "phase" TEXT,
  "refrigerant" TEXT,
  "installDate" TIMESTAMP(3),
  "warrantyEnd" TIMESTAMP(3),
  "lastServiceDate" TIMESTAMP(3),
  "nameplatePhotoUrl" TEXT,
  "locationPhotoUrl" TEXT,
  "technicianNotes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "HVACEquipment_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "HVACProperty" ("id") ON DELETE CASCADE,
  CONSTRAINT "HVACEquipment_propertyId_serial_key" UNIQUE ("propertyId", "serial")
);

CREATE INDEX "HVACEquipment_propertyId_idx" ON "HVACEquipment"("propertyId");
CREATE INDEX "HVACEquipment_serial_idx" ON "HVACEquipment"("serial");

-- Create DiagnosticReading table
CREATE TABLE IF NOT EXISTS "DiagnosticReading" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "equipmentId" TEXT NOT NULL,
  "workOrderId" TEXT,
  "suctionPsig" DOUBLE PRECISION,
  "liquidPsig" DOUBLE PRECISION,
  "suctionSatTempF" DOUBLE PRECISION,
  "liquidSatTempF" DOUBLE PRECISION,
  "suctionTempF" DOUBLE PRECISION,
  "liquidTempF" DOUBLE PRECISION,
  "superheat" DOUBLE PRECISION,
  "subcooling" DOUBLE PRECISION,
  "returnTempF" DOUBLE PRECISION,
  "supplyTempF" DOUBLE PRECISION,
  "outdoorTempF" DOUBLE PRECISION,
  "deltaTempF" DOUBLE PRECISION,
  "staticPressure" DOUBLE PRECISION,
  "voltageL1" DOUBLE PRECISION,
  "voltageL2" DOUBLE PRECISION,
  "voltageL3" DOUBLE PRECISION,
  "currentL1" DOUBLE PRECISION,
  "currentL2" DOUBLE PRECISION,
  "currentL3" DOUBLE PRECISION,
  "frequencyHz" DOUBLE PRECISION,
  "continuityOk" BOOLEAN,
  "resistanceOhms" DOUBLE PRECISION,
  "capturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "verifiedBy" TEXT,
  "notes" TEXT,
  CONSTRAINT "DiagnosticReading_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "HVACEquipment" ("id") ON DELETE CASCADE,
  CONSTRAINT "DiagnosticReading_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES "WorkOrder" ("id") ON DELETE SET NULL
);

CREATE INDEX "DiagnosticReading_equipmentId_idx" ON "DiagnosticReading"("equipmentId");
CREATE INDEX "DiagnosticReading_workOrderId_idx" ON "DiagnosticReading"("workOrderId");
CREATE INDEX "DiagnosticReading_capturedAt_idx" ON "DiagnosticReading"("capturedAt");

-- Create EquipmentServiceHistory table
CREATE TABLE IF NOT EXISTS "EquipmentServiceHistory" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "equipmentId" TEXT NOT NULL,
  "workOrderId" TEXT,
  "serviceType" TEXT NOT NULL,
  "summary" TEXT NOT NULL,
  "partsReplaced" TEXT[] DEFAULT '{}',
  "technicianName" TEXT NOT NULL,
  "serviceDate" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "EquipmentServiceHistory_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "HVACEquipment" ("id") ON DELETE CASCADE,
  CONSTRAINT "EquipmentServiceHistory_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES "WorkOrder" ("id") ON DELETE SET NULL
);

CREATE INDEX "EquipmentServiceHistory_equipmentId_idx" ON "EquipmentServiceHistory"("equipmentId");
CREATE INDEX "EquipmentServiceHistory_serviceDate_idx" ON "EquipmentServiceHistory"("serviceDate");

-- ===== PHONE SERVICE TABLES =====

-- Create PhoneProvider table
CREATE TABLE IF NOT EXISTS "PhoneProvider" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "providerName" TEXT NOT NULL UNIQUE,
  "isConfigured" BOOLEAN NOT NULL DEFAULT false,
  "isConnected" BOOLEAN NOT NULL DEFAULT false,
  "accountId" TEXT,
  "apiKey" TEXT,
  "authToken" TEXT,
  "webhookUrl" TEXT,
  "webhookSecret" TEXT,
  "inboundNumber" TEXT,
  "outboundNumber" TEXT,
  "lastTestedAt" TIMESTAMP(3),
  "lastError" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);

-- Create PhoneConfiguration table
CREATE TABLE IF NOT EXISTS "PhoneConfiguration" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "businessName" TEXT NOT NULL DEFAULT 'WISE² HVAC Solutions',
  "businessPhone" TEXT,
  "greeting" TEXT,
  "timezone" TEXT NOT NULL DEFAULT 'UTC',
  "businessHours" JSONB,
  "officePhoneNumber" TEXT,
  "dispatchPhoneNumber" TEXT,
  "emergencyPhoneNumber" TEXT,
  "aiEnabled" BOOLEAN NOT NULL DEFAULT true,
  "aiModel" TEXT NOT NULL DEFAULT 'hermes',
  "aiTimeout" INTEGER NOT NULL DEFAULT 30000,
  "recordingEnabled" BOOLEAN NOT NULL DEFAULT true,
  "recordingNotice" TEXT,
  "recordingRetentionDays" INTEGER DEFAULT 90,
  "dailyBudget" DOUBLE PRECISION,
  "monthlyBudget" DOUBLE PRECISION,
  "alertThreshold" DOUBLE PRECISION,
  "smsEnabled" BOOLEAN NOT NULL DEFAULT false,
  "smsOptInRequired" BOOLEAN NOT NULL DEFAULT true,
  "updatedAt" TIMESTAMP(3) NOT NULL
);

-- Create PhoneNumber table
CREATE TABLE IF NOT EXISTS "PhoneNumber" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "number" TEXT NOT NULL UNIQUE,
  "provider" TEXT NOT NULL,
  "providerNumberId" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "isPrimary" BOOLEAN NOT NULL DEFAULT false,
  "maxConcurrentCalls" INTEGER DEFAULT 5,
  "callsThisMonth" INTEGER NOT NULL DEFAULT 0,
  "callsThisYear" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);

CREATE INDEX "PhoneNumber_number_idx" ON "PhoneNumber"("number");
CREATE INDEX "PhoneNumber_isActive_idx" ON "PhoneNumber"("isActive");

-- Create Call table (with enums)
CREATE TYPE "CallStatus" AS ENUM ('INITIATED', 'RINGING', 'ANSWERED', 'IN_PROGRESS', 'HELD', 'TRANSFERRING', 'DISCONNECTED', 'FAILED');
CREATE TYPE "CallDirection" AS ENUM ('INBOUND', 'OUTBOUND');
CREATE TYPE "CallDisposition" AS ENUM ('UNKNOWN', 'ANSWERED', 'ABANDONED', 'NO_ANSWER', 'BUSY', 'FAILED', 'TRANSFERRED', 'ESCALATED');
CREATE TYPE "RecordingConsent" AS ENUM ('NOT_REQUIRED', 'REQUIRED_NOT_GIVEN', 'REQUIRED_AND_GIVEN', 'FORBIDDEN');

CREATE TABLE IF NOT EXISTS "Call" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "callSid" TEXT UNIQUE,
  "inboundNumber" TEXT NOT NULL,
  "callerNumber" TEXT NOT NULL,
  "customerId" TEXT,
  "propertyId" TEXT,
  "technicianId" TEXT,
  "status" "CallStatus" NOT NULL DEFAULT 'INITIATED',
  "direction" "CallDirection" NOT NULL DEFAULT 'INBOUND',
  "startedAt" TIMESTAMP(3) NOT NULL,
  "answeredAt" TIMESTAMP(3),
  "endedAt" TIMESTAMP(3),
  "durationSeconds" INTEGER,
  "recordingUrl" TEXT,
  "recordingConsent" "RecordingConsent" NOT NULL DEFAULT 'NOT_REQUIRED',
  "disposition" "CallDisposition" NOT NULL DEFAULT 'UNKNOWN',
  "optOut" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Call_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE SET NULL,
  CONSTRAINT "Call_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "HVACProperty" ("id") ON DELETE SET NULL,
  CONSTRAINT "Call_technicianId_fkey" FOREIGN KEY ("technicianId") REFERENCES "Technician" ("id") ON DELETE SET NULL
);

CREATE INDEX "Call_customerId_idx" ON "Call"("customerId");
CREATE INDEX "Call_callerNumber_idx" ON "Call"("callerNumber");
CREATE INDEX "Call_status_idx" ON "Call"("status");
CREATE INDEX "Call_startedAt_idx" ON "Call"("startedAt");
CREATE INDEX "Call_disposition_idx" ON "Call"("disposition");

-- Create CallEvent table
CREATE TABLE IF NOT EXISTS "CallEvent" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "callId" TEXT NOT NULL,
  "eventType" TEXT NOT NULL,
  "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "details" JSONB,
  CONSTRAINT "CallEvent_callId_fkey" FOREIGN KEY ("callId") REFERENCES "Call" ("id") ON DELETE CASCADE
);

CREATE INDEX "CallEvent_callId_idx" ON "CallEvent"("callId");
CREATE INDEX "CallEvent_timestamp_idx" ON "CallEvent"("timestamp");

-- Create CallTranscript table
CREATE TABLE IF NOT EXISTS "CallTranscript" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "callId" TEXT NOT NULL UNIQUE,
  "language" TEXT NOT NULL DEFAULT 'en-US',
  "confidence" DOUBLE PRECISION,
  "status" VARCHAR(50) NOT NULL DEFAULT 'PENDING',
  "errorMessage" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CallTranscript_callId_fkey" FOREIGN KEY ("callId") REFERENCES "Call" ("id") ON DELETE CASCADE
);

CREATE INDEX "CallTranscript_callId_idx" ON "CallTranscript"("callId");
CREATE INDEX "CallTranscript_status_idx" ON "CallTranscript"("status");

-- Create TranscriptSegment table
CREATE TABLE IF NOT EXISTS "TranscriptSegment" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "transcriptId" TEXT NOT NULL,
  "speaker" TEXT NOT NULL,
  "text" TEXT NOT NULL,
  "startMs" INTEGER NOT NULL,
  "endMs" INTEGER NOT NULL,
  "confidence" DOUBLE PRECISION,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "TranscriptSegment_transcriptId_fkey" FOREIGN KEY ("transcriptId") REFERENCES "CallTranscript" ("id") ON DELETE CASCADE
);

CREATE INDEX "TranscriptSegment_transcriptId_idx" ON "TranscriptSegment"("transcriptId");

-- Create CallSummary table
CREATE TYPE "CallUrgency" AS ENUM ('ROUTINE', 'PRIORITY', 'URGENT', 'SAFETY_CRITICAL');

CREATE TABLE IF NOT EXISTS "CallSummary" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "callId" TEXT NOT NULL UNIQUE,
  "reason" TEXT NOT NULL,
  "symptoms" TEXT[] DEFAULT '{}',
  "urgency" "CallUrgency" NOT NULL DEFAULT 'ROUTINE',
  "equipmentType" TEXT,
  "actions" TEXT[] DEFAULT '{}',
  "needsFollowUp" BOOLEAN NOT NULL DEFAULT false,
  "followUpDate" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CallSummary_callId_fkey" FOREIGN KEY ("callId") REFERENCES "Call" ("id") ON DELETE CASCADE
);

CREATE INDEX "CallSummary_callId_idx" ON "CallSummary"("callId");
CREATE INDEX "CallSummary_urgency_idx" ON "CallSummary"("urgency");

-- ===== APPOINTMENTS & SCHEDULING =====

CREATE TYPE "AppointmentStatus" AS ENUM ('SCHEDULED', 'CONFIRMED', 'REMINDED', 'IN_PROGRESS', 'COMPLETED', 'NO_SHOW', 'CANCELLED');

CREATE TABLE IF NOT EXISTS "Appointment" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "customerId" TEXT NOT NULL,
  "propertyId" TEXT NOT NULL,
  "technicianId" TEXT,
  "scheduledAt" TIMESTAMP(3) NOT NULL,
  "duration" INTEGER NOT NULL DEFAULT 60,
  "status" "AppointmentStatus" NOT NULL DEFAULT 'SCHEDULED',
  "appointmentType" TEXT NOT NULL,
  "notes" TEXT,
  "workOrderId" TEXT UNIQUE,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Appointment_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE CASCADE,
  CONSTRAINT "Appointment_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "HVACProperty" ("id") ON DELETE CASCADE,
  CONSTRAINT "Appointment_technicianId_fkey" FOREIGN KEY ("technicianId") REFERENCES "Technician" ("id") ON DELETE SET NULL,
  CONSTRAINT "Appointment_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES "WorkOrder" ("id") ON DELETE SET NULL
);

CREATE INDEX "Appointment_customerId_idx" ON "Appointment"("customerId");
CREATE INDEX "Appointment_propertyId_idx" ON "Appointment"("propertyId");
CREATE INDEX "Appointment_technicianId_idx" ON "Appointment"("technicianId");
CREATE INDEX "Appointment_scheduledAt_idx" ON "Appointment"("scheduledAt");
CREATE INDEX "Appointment_status_idx" ON "Appointment"("status");

-- ===== WORK ORDERS =====

CREATE TYPE "WorkOrderStatus" AS ENUM ('CREATED', 'ASSIGNED', 'ACCEPTED', 'EN_ROUTE', 'ARRIVED', 'IN_PROGRESS', 'DIAGNOSIS', 'REPAIR', 'ON_HOLD', 'NEEDS_PARTS', 'COMPLETED', 'CANCELLED', 'RETURN_VISIT_NEEDED');
CREATE TYPE "WorkOrderUrgency" AS ENUM ('ROUTINE', 'PRIORITY', 'URGENT', 'EMERGENCY');

CREATE TABLE IF NOT EXISTS "WorkOrder" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "workOrderNumber" TEXT NOT NULL UNIQUE,
  "customerId" TEXT NOT NULL,
  "propertyId" TEXT NOT NULL,
  "technicianId" TEXT,
  "description" TEXT NOT NULL,
  "serviceType" TEXT NOT NULL,
  "urgency" "WorkOrderUrgency" NOT NULL DEFAULT 'ROUTINE',
  "status" "WorkOrderStatus" NOT NULL DEFAULT 'CREATED',
  "sourceType" TEXT NOT NULL DEFAULT 'PHONE',
  "sourceCallId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "scheduledAt" TIMESTAMP(3),
  "startedAt" TIMESTAMP(3),
  "completedAt" TIMESTAMP(3),
  "photosBefore" TEXT[] DEFAULT '{}',
  "photosAfter" TEXT[] DEFAULT '{}',
  "materialsUsed" JSONB DEFAULT '[]'::jsonb,
  "needsFollowUp" BOOLEAN NOT NULL DEFAULT false,
  "followUpDate" TIMESTAMP(3),
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "WorkOrder_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE CASCADE,
  CONSTRAINT "WorkOrder_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "HVACProperty" ("id") ON DELETE CASCADE,
  CONSTRAINT "WorkOrder_technicianId_fkey" FOREIGN KEY ("technicianId") REFERENCES "Technician" ("id") ON DELETE SET NULL
);

CREATE INDEX "WorkOrder_customerId_idx" ON "WorkOrder"("customerId");
CREATE INDEX "WorkOrder_propertyId_idx" ON "WorkOrder"("propertyId");
CREATE INDEX "WorkOrder_technicianId_idx" ON "WorkOrder"("technicianId");
CREATE INDEX "WorkOrder_status_idx" ON "WorkOrder"("status");
CREATE INDEX "WorkOrder_createdAt_idx" ON "WorkOrder"("createdAt");
CREATE INDEX "WorkOrder_completedAt_idx" ON "WorkOrder"("completedAt");

-- Manually add foreign key from DiagnosticReading and EquipmentServiceHistory
-- (already done above with ON DELETE SET NULL for workOrderId)

-- ===== SMS & OUTBOUND COMMUNICATION =====

CREATE TYPE "SMSStatus" AS ENUM ('SENT', 'DELIVERED', 'FAILED', 'BOUNCED', 'QUEUED', 'FAILED_DELIVERY');

CREATE TABLE IF NOT EXISTS "SMSMessage" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "smsId" TEXT UNIQUE,
  "fromNumber" TEXT NOT NULL,
  "toNumber" TEXT NOT NULL,
  "customerId" TEXT,
  "direction" TEXT NOT NULL DEFAULT 'OUTBOUND',
  "message" TEXT NOT NULL,
  "status" "SMSStatus" NOT NULL DEFAULT 'SENT',
  "campaignId" TEXT,
  "templateId" TEXT,
  "variables" JSONB,
  "sentAt" TIMESTAMP(3),
  "deliveredAt" TIMESTAMP(3),
  "failureReason" TEXT,
  "optOut" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "SMSMessage_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE SET NULL,
  CONSTRAINT "SMSMessage_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "OutboundCampaign" ("id") ON DELETE SET NULL
);

CREATE INDEX "SMSMessage_customerId_idx" ON "SMSMessage"("customerId");
CREATE INDEX "SMSMessage_toNumber_idx" ON "SMSMessage"("toNumber");
CREATE INDEX "SMSMessage_status_idx" ON "SMSMessage"("status");
CREATE INDEX "SMSMessage_sentAt_idx" ON "SMSMessage"("sentAt");

-- Create OutboundCampaign table
CREATE TYPE "CampaignStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'ACTIVE', 'COMPLETED', 'PAUSED', 'FAILED');

CREATE TABLE IF NOT EXISTS "OutboundCampaign" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "campaignType" TEXT NOT NULL,
  "description" TEXT,
  "templateText" TEXT NOT NULL,
  "variables" TEXT[] DEFAULT '{}',
  "status" "CampaignStatus" NOT NULL DEFAULT 'DRAFT',
  "scheduledAt" TIMESTAMP(3),
  "startAt" TIMESTAMP(3),
  "endAt" TIMESTAMP(3),
  "targetAudience" TEXT NOT NULL,
  "filters" JSONB,
  "messagesSent" INTEGER NOT NULL DEFAULT 0,
  "messagesDelivered" INTEGER NOT NULL DEFAULT 0,
  "messagesFailed" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);

CREATE INDEX "OutboundCampaign_campaignType_idx" ON "OutboundCampaign"("campaignType");
CREATE INDEX "OutboundCampaign_status_idx" ON "OutboundCampaign"("status");

-- Create CallbackTask table
CREATE TYPE "CallbackStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'ABANDONED');

CREATE TABLE IF NOT EXISTS "CallbackTask" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "callId" TEXT,
  "customerId" TEXT NOT NULL,
  "attempts" INTEGER NOT NULL DEFAULT 0,
  "maxAttempts" INTEGER NOT NULL DEFAULT 3,
  "nextAttempt" TIMESTAMP(3),
  "status" "CallbackStatus" NOT NULL DEFAULT 'PENDING',
  "method" TEXT NOT NULL DEFAULT 'CALL',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CallbackTask_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE CASCADE
);

CREATE INDEX "CallbackTask_customerId_idx" ON "CallbackTask"("customerId");
CREATE INDEX "CallbackTask_status_idx" ON "CallbackTask"("status");
CREATE INDEX "CallbackTask_nextAttempt_idx" ON "CallbackTask"("nextAttempt");

-- ===== COMPLIANCE & CONSENT =====

CREATE TABLE IF NOT EXISTS "Consent" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "customerId" TEXT NOT NULL,
  "phoneNumber" TEXT,
  "consentType" TEXT NOT NULL,
  "isGiven" BOOLEAN NOT NULL DEFAULT false,
  "consentDate" TIMESTAMP(3),
  "consentMethod" TEXT,
  "consentChannel" TEXT,
  "notes" TEXT,
  "documentUrl" TEXT,
  "revokedAt" TIMESTAMP(3),
  "revokeMethod" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Consent_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE CASCADE,
  CONSTRAINT "Consent_customerId_consentType_key" UNIQUE ("customerId", "consentType")
);

CREATE INDEX "Consent_customerId_idx" ON "Consent"("customerId");
CREATE INDEX "Consent_consentType_idx" ON "Consent"("consentType");
CREATE INDEX "Consent_isGiven_idx" ON "Consent"("isGiven");

-- Create OptOut table
CREATE TABLE IF NOT EXISTS "OptOut" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "phoneNumber" TEXT NOT NULL UNIQUE,
  "type" TEXT NOT NULL DEFAULT 'CALL',
  "reason" TEXT,
  "optOutDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "optInDate" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);

CREATE INDEX "OptOut_phoneNumber_idx" ON "OptOut"("phoneNumber");
