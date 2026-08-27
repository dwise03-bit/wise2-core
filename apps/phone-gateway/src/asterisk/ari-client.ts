/**
 * Asterisk ARI Client Wrapper
 * Manages connection to Asterisk and call events
 */

import ari from 'ari-client';
import { EventEmitter } from 'events';
import { logger } from '../logger';

interface AriConfig {
  baseUrl: string;
  username: string;
  password: string;
  channelVariables?: Record<string, string>;
}

export class AsteriskARIClient extends EventEmitter {
  private client: any;
  private config: AriConfig;
  private connected = false;

  constructor(config: AriConfig) {
    super();
    this.config = config;
  }

  /**
   * Connect to Asterisk ARI
   */
  async connect(): Promise<void> {
    try {
      this.client = await ari.connect(
        this.config.baseUrl,
        this.config.username,
        this.config.password
      );

      // Setup WebSocket event listener
      // Inbound call event
      this.client.on('StasisStart', (event, channel) => {
        logger.info(`Inbound call: ${channel.id} from ${channel.caller.number}`);
        this.emit('inbound-call', {
          channelId: channel.id,
          callerId: channel.caller.number,
          timestamp: new Date(),
        });
      });

      // Channel state change
      this.client.on('ChannelStateChange', (event, channel) => {
        logger.info(`Channel state: ${channel.id} → ${channel.state}`);
        this.emit('channel-state-change', {
          channelId: channel.id,
          state: channel.state,
        });
      });

      // Channel hangup
      this.client.on('ChannelHangupRequest', (event, channel) => {
        logger.info(`Channel hangup: ${channel.id}`);
        this.emit('channel-hangup', {
          channelId: channel.id,
          cause: event.cause,
          cause_txt: event.cause_txt,
        });
      });

      // DTMF
      this.client.on('ChannelDtmfReceived', (event, channel) => {
        logger.debug(`DTMF: ${channel.id} → ${event.digit}`);
        this.emit('dtmf', {
          channelId: channel.id,
          digit: event.digit,
        });
      });

      // Connect to WebSocket
      this.client.start('wise2-phone-app');

      logger.info('Asterisk ARI client connected');
      this.connected = true;
    } catch (error) {
      logger.error('Failed to connect to Asterisk ARI:', error);
      throw error;
    }
  }

  /**
   * Disconnect from Asterisk
   */
  async disconnect(): Promise<void> {
    if (this.client) {
      this.client.stop();
      this.connected = false;
      logger.info('Asterisk ARI client disconnected');
    }
  }

  /**
   * Answer an inbound call
   */
  async answerCall(channelId: string): Promise<void> {
    try {
      const channel = this.client.Channel({ id: channelId });
      await channel.answer();
      logger.info(`Answered call: ${channelId}`);
    } catch (error) {
      logger.error(`Failed to answer call ${channelId}:`, error);
      throw error;
    }
  }

  /**
   * Hangup a call
   */
  async hangupCall(channelId: string): Promise<void> {
    try {
      const channel = this.client.Channel({ id: channelId });
      await channel.hangup();
      logger.info(`Hung up call: ${channelId}`);
    } catch (error) {
      logger.error(`Failed to hangup call ${channelId}:`, error);
      throw error;
    }
  }

  /**
   * Play audio to a channel
   */
  async playAudio(channelId: string, mediaUri: string): Promise<string> {
    try {
      const playback = await this.client.Playback().play({
        media: [mediaUri],
        language: 'en',
      });

      logger.info(`Playing audio to ${channelId}: ${mediaUri}`);
      return playback.id;
    } catch (error) {
      logger.error(`Failed to play audio to ${channelId}:`, error);
      throw error;
    }
  }

  /**
   * Stop audio playback
   */
  async stopAudio(channelId: string, playbackId: string): Promise<void> {
    try {
      const playback = this.client.Playback({ id: playbackId });
      await playback.stop();
      logger.info(`Stopped playback ${playbackId} on ${channelId}`);
    } catch (error) {
      logger.error(`Failed to stop playback:`, error);
    }
  }

  /**
   * Send DTMF (dial tones)
   */
  async sendDTMF(channelId: string, dtmf: string): Promise<void> {
    try {
      const channel = this.client.Channel({ id: channelId });
      await channel.sendDTMF({ dtmf });
      logger.info(`Sent DTMF to ${channelId}: ${dtmf}`);
    } catch (error) {
      logger.error(`Failed to send DTMF:`, error);
      throw error;
    }
  }

  /**
   * Record call audio
   */
  async recordCall(
    channelId: string,
    filename: string
  ): Promise<{ recordingId: string }> {
    try {
      const channel = this.client.Channel({ id: channelId });
      const recording = await channel.record({
        name: filename,
        format: 'wav',
        maxDurationSeconds: 3600,
      });

      logger.info(`Recording started: ${filename}`);
      return { recordingId: recording.id };
    } catch (error) {
      logger.error(`Failed to record call:`, error);
      throw error;
    }
  }

  /**
   * Initiate an outbound call
   */
  async initiateCall(exten: string, context: string): Promise<string> {
    try {
      const channel = await this.client.channels.originate({
        endpoint: `PJSIP/${exten}`,
        extension: exten,
        context: context,
        priority: 1,
        callerId: process.env.WISE2_SIP_OUTBOUND_CID || 'WISE2',
      });

      logger.info(`Initiated outbound call: ${channel.id} → ${exten}`);
      return channel.id;
    } catch (error) {
      logger.error(`Failed to initiate call:`, error);
      throw error;
    }
  }

  /**
   * Transfer call
   */
  async transferCall(
    channelId: string,
    extension: string,
    context: string = 'default'
  ): Promise<void> {
    try {
      const channel = this.client.Channel({ id: channelId });
      await channel.redirect({
        endpoint: `PJSIP/${extension}@${context}`,
      });

      logger.info(
        `Transferred call ${channelId} to ${extension}@${context}`
      );
    } catch (error) {
      logger.error(`Failed to transfer call:`, error);
      throw error;
    }
  }

  /**
   * Set channel variable
   */
  async setChannelVariable(
    channelId: string,
    name: string,
    value: string
  ): Promise<void> {
    try {
      const channel = this.client.Channel({ id: channelId });
      await channel.setChannelVar({
        variable: name,
        value: value,
      });

      logger.debug(`Set channel var: ${channelId}.${name} = ${value}`);
    } catch (error) {
      logger.error(`Failed to set channel variable:`, error);
    }
  }

  /**
   * Get channel info
   */
  async getChannelInfo(channelId: string): Promise<any> {
    try {
      const channel = this.client.Channel({ id: channelId });
      return await channel.get();
    } catch (error) {
      logger.error(`Failed to get channel info:`, error);
      throw error;
    }
  }

  /**
   * Health check
   */
  async health(): Promise<boolean> {
    return this.connected;
  }
}

export default AsteriskARIClient;
