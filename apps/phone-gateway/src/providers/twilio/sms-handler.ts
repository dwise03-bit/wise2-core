import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../../logger';
import { getTwilioClient } from './client';

export interface InboundSmsPayload {
  MessageSid: string;
  AccountSid: string;
  MessagingServiceSid?: string;
  From: string;
  To: string;
  Body: string;
  NumMedia: string;
  NumSegments: string;
}

export interface SmsRecord {
  id: string;
  type: 'inbound' | 'outbound';
  from: string;
  to: string;
  body: string;
  messageSid: string;
  status: string;
  timestamp: string;
  linkedJob?: string;
  linkedCall?: string;
}

// In-memory storage for SMS records (should be replaced with database in production)
const smsRecords: Map<string, SmsRecord> = new Map();

/**
 * Handle inbound SMS from Twilio
 */
export async function handleInboundSms(req: Request, res: Response): Promise<void> {
  try {
    const payload = req.body as InboundSmsPayload;

    logger.info('Inbound SMS received', {
      messageSid: payload.MessageSid,
      from: payload.From,
      to: payload.To,
      bodyLength: payload.Body.length,
    });

    // Store SMS record
    const record: SmsRecord = {
      id: uuidv4(),
      type: 'inbound',
      from: payload.From,
      to: payload.To,
      body: payload.Body,
      messageSid: payload.MessageSid,
      status: 'received',
      timestamp: new Date().toISOString(),
    };

    smsRecords.set(record.id, record);
    logger.debug('SMS record stored', { recordId: record.id });

    // TODO: Integrate with Field Tech app to:
    // 1. Look up associated job by customer phone
    // 2. Create or update job communication history
    // 3. Notify technician of inbound message
    // 4. Store in database

    // Respond with empty TwiML (Twilio expects a 200 OK response)
    res.setHeader('Content-Type', 'application/xml');
    res.send('<?xml version="1.0" encoding="UTF-8"?><Response></Response>');
  } catch (error) {
    logger.error('Inbound SMS handling failed', { error });
    res.status(500).json({ error: 'Failed to process SMS' });
  }
}

/**
 * Send outbound SMS
 */
export async function sendSms(to: string, body: string, linkedJob?: string): Promise<SmsRecord> {
  try {
    const client = getTwilioClient();
    const { sid, status } = await client.sendSms(to, body);

    const record: SmsRecord = {
      id: uuidv4(),
      type: 'outbound',
      from: client.getPhoneNumber(),
      to,
      body,
      messageSid: sid,
      status,
      timestamp: new Date().toISOString(),
      linkedJob,
    };

    smsRecords.set(record.id, record);
    logger.info('SMS sent and recorded', { recordId: record.id, to, messageSid: sid });

    return record;
  } catch (error) {
    logger.error('Failed to send SMS', { to, error });
    throw error;
  }
}

/**
 * Retrieve SMS record history
 */
export function getSmsHistory(filter?: { linkedJob?: string; from?: string; to?: string }): SmsRecord[] {
  let records = Array.from(smsRecords.values());

  if (filter?.linkedJob) {
    records = records.filter((r) => r.linkedJob === filter.linkedJob);
  }
  if (filter?.from) {
    records = records.filter((r) => r.from === filter.from);
  }
  if (filter?.to) {
    records = records.filter((r) => r.to === filter.to);
  }

  return records.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

/**
 * Missed call text-back workflow
 */
export async function sendMissedCallResponse(from: string, linkedJob?: string): Promise<SmsRecord> {
  const message = `Hi, this is WISE² HVAC support. We missed your call. Please reply with your name, address, and a short description of what's going on.`;

  logger.info('Sending missed call text-back', { from, linkedJob });

  return sendSms(from, message, linkedJob);
}
