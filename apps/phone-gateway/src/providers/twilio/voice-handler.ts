import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import twilio from 'twilio';
import { logger } from '../../logger';
import { getTwilioClient } from './client';

const VoiceResponse = twilio.twiml.VoiceResponse;

export interface InboundCallPayload {
  CallSid: string;
  AccountSid: string;
  From: string;
  To: string;
  CallStatus: string;
  Direction: string;
  ApiVersion: string;
}

export interface CallRecord {
  id: string;
  type: 'inbound' | 'outbound';
  from: string;
  to: string;
  callSid: string;
  status: string;
  duration?: number;
  startTime: string;
  endTime?: string;
  linkedJob?: string;
  recordingSid?: string;
  transcriptionSid?: string;
  transcript?: string;
  summary?: string;
}

// In-memory storage for call records (should be replaced with database in production)
const callRecords: Map<string, CallRecord> = new Map();

/**
 * Handle inbound voice call
 */
export async function handleInboundCall(req: Request, res: Response): Promise<void> {
  try {
    const payload = req.body as InboundCallPayload;

    logger.info('Inbound call received', {
      callSid: payload.CallSid,
      from: payload.From,
      to: payload.To,
      status: payload.CallStatus,
    });

    // Store call record
    const record: CallRecord = {
      id: uuidv4(),
      type: 'inbound',
      from: payload.From,
      to: payload.To,
      callSid: payload.CallSid,
      status: payload.CallStatus,
      startTime: new Date().toISOString(),
    };

    callRecords.set(record.id, record);

    // Generate TwiML response
    const response = new VoiceResponse();

    // TODO: Integrate with Field Tech app to:
    // 1. Look up associated job/technician by called number
    // 2. Route to available technician or voicemail
    // 3. Record call if enabled
    // 4. Transcribe if enabled

    // For now, provide basic greeting
    response.say('Thank you for calling WISE² HVAC support. Your call is important to us.');
    response.record({
      action: process.env.TWILIO_WEBHOOK_BASE_URL + '/twilio/recording-complete',
      method: 'POST',
      recordingStatusCallback: process.env.TWILIO_WEBHOOK_BASE_URL + '/twilio/recording-status',
      transcribe: getTwilioClient().isTranscriptionEnabled(),
      transcribeCallback: process.env.TWILIO_WEBHOOK_BASE_URL + '/twilio/transcription',
    });

    res.setHeader('Content-Type', 'application/xml');
    res.send(response.toString());
  } catch (error) {
    logger.error('Inbound call handling failed', { error });
    res.status(500).send(getErrorTwiml('An error occurred processing your call. Please try again.'));
  }
}

/**
 * Handle call status callback
 */
export async function handleCallStatus(req: Request, res: Response): Promise<void> {
  try {
    const callSid = req.body.CallSid as string;
    const callStatus = req.body.CallStatus as string;
    const duration = req.body.CallDuration as string;

    logger.info('Call status update', { callSid, status: callStatus, duration });

    // Find and update call record
    let record = Array.from(callRecords.values()).find((r) => r.callSid === callSid);
    if (record) {
      record.status = callStatus;
      if (duration) record.duration = parseInt(duration);
      if (callStatus === 'completed') {
        record.endTime = new Date().toISOString();
      }
      logger.debug('Call record updated', { callId: record.id, callSid });
    }

    res.status(200).json({ status: 'ok' });
  } catch (error) {
    logger.error('Call status handling failed', { error });
    res.status(500).json({ error: 'Failed to process call status' });
  }
}

/**
 * Handle recording complete callback
 */
export async function handleRecordingComplete(req: Request, res: Response): Promise<void> {
  try {
    const callSid = req.body.CallSid as string;
    const recordingSid = req.body.RecordingSid as string;

    logger.info('Recording complete', { callSid, recordingSid });

    // Find and update call record with recording
    let record = Array.from(callRecords.values()).find((r) => r.callSid === callSid);
    if (record) {
      record.recordingSid = recordingSid;
      logger.debug('Recording linked to call', { callId: record.id, recordingSid });
    }

    res.status(200).json({ status: 'ok' });
  } catch (error) {
    logger.error('Recording complete handling failed', { error });
    res.status(500).json({ error: 'Failed to process recording' });
  }
}

/**
 * Handle transcription complete callback
 */
export async function handleTranscriptionComplete(req: Request, res: Response): Promise<void> {
  try {
    const callSid = req.body.CallSid as string;
    const transcriptionSid = req.body.TranscriptionSid as string;
    const transcriptionText = req.body.TranscriptionText as string;

    logger.info('Transcription complete', { callSid, transcriptionSid, textLength: transcriptionText?.length || 0 });

    // Find and update call record with transcription
    let record = Array.from(callRecords.values()).find((r) => r.callSid === callSid);
    if (record) {
      record.transcriptionSid = transcriptionSid;
      record.transcript = transcriptionText;
      logger.debug('Transcription linked to call', { callId: record.id, transcriptionSid });
    }

    res.status(200).json({ status: 'ok' });
  } catch (error) {
    logger.error('Transcription complete handling failed', { error });
    res.status(500).json({ error: 'Failed to process transcription' });
  }
}

/**
 * Get call history
 */
export function getCallHistory(filter?: { linkedJob?: string; from?: string }): CallRecord[] {
  let records = Array.from(callRecords.values());

  if (filter?.linkedJob) {
    records = records.filter((r) => r.linkedJob === filter.linkedJob);
  }
  if (filter?.from) {
    records = records.filter((r) => r.from === filter.from);
  }

  return records.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
}

/**
 * Generate error TwiML response
 */
function getErrorTwiml(message: string): string {
  const response = new VoiceResponse();
  response.say(message);
  response.hangup();
  return response.toString();
}

/**
 * Generate call summary with AI (stubbed)
 */
export async function generateCallSummary(callRecord: CallRecord): Promise<string> {
  if (!callRecord.transcript) {
    return 'No transcript available for this call.';
  }

  // TODO: Integrate with LLM service to generate summary
  logger.info('Generating call summary', { callId: callRecord.id });

  // Placeholder: just return first 200 chars of transcript
  return callRecord.transcript.substring(0, 200) + '...';
}
