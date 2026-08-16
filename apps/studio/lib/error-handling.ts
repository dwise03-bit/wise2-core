/**
 * Error Handling & Recovery System
 * Comprehensive error definitions and recovery strategies for SUNO and OBS
 */

/**
 * Error Type Classifications
 */
export enum ErrorType {
  // Network errors
  NETWORK_TIMEOUT = 'NETWORK_TIMEOUT',
  NETWORK_OFFLINE = 'NETWORK_OFFLINE',
  CONNECTION_ERROR = 'CONNECTION_ERROR',

  // API errors
  API_ERROR = 'API_ERROR',
  AUTH_ERROR = 'AUTH_ERROR',
  RATE_LIMIT = 'RATE_LIMIT',
  INVALID_REQUEST = 'INVALID_REQUEST',
  NOT_FOUND = 'NOT_FOUND',
  SERVER_ERROR = 'SERVER_ERROR',

  // Storage errors
  STORAGE_ERROR = 'STORAGE_ERROR',
  DISK_FULL = 'DISK_FULL',

  // Streaming errors
  STREAM_DISCONNECTED = 'STREAM_DISCONNECTED',
  AUTH_EXPIRED = 'AUTH_EXPIRED',
  SCENE_SWITCH_FAILED = 'SCENE_SWITCH_FAILED',
  SOURCE_MISSING = 'SOURCE_MISSING',
  RECORDING_FAILED = 'RECORDING_FAILED',

  // Generation errors
  GENERATION_FAILED = 'GENERATION_FAILED',
  GENERATION_TIMEOUT = 'GENERATION_TIMEOUT',

  // Unknown errors
  UNKNOWN = 'UNKNOWN',
}

/**
 * Error Severity Levels
 */
export enum ErrorSeverity {
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL',
}

/**
 * Recovery Actions
 */
export enum RecoveryAction {
  RETRY = 'RETRY',
  QUEUE = 'QUEUE',
  FALLBACK = 'FALLBACK',
  REAUTHORIZE = 'REAUTHORIZE',
  RECONNECT = 'RECONNECT',
  FALLBACK_PLAYBACK = 'FALLBACK_PLAYBACK',
  STOP_RECORDING = 'STOP_RECORDING',
  MANUAL_INTERVENTION = 'MANUAL_INTERVENTION',
}

/**
 * Base Application Error
 */
export class AppError extends Error {
  public readonly type: ErrorType;
  public readonly severity: ErrorSeverity;
  public readonly code: string;
  public readonly recoveryActions: RecoveryAction[];
  public readonly timestamp: Date;
  public readonly context?: Record<string, any>;
  public readonly retryCount: number;
  public readonly maxRetries: number;

  constructor(
    message: string,
    type: ErrorType = ErrorType.UNKNOWN,
    severity: ErrorSeverity = ErrorSeverity.ERROR,
    options?: {
      code?: string;
      recoveryActions?: RecoveryAction[];
      context?: Record<string, any>;
      maxRetries?: number;
    }
  ) {
    super(message);
    this.name = 'AppError';
    this.type = type;
    this.severity = severity;
    this.code = options?.code || type;
    this.recoveryActions = options?.recoveryActions || [];
    this.context = options?.context;
    this.timestamp = new Date();
    this.retryCount = 0;
    this.maxRetries = options?.maxRetries || 3;
  }

  /**
   * Check if error is retryable
   */
  isRetryable(): boolean {
    return [
      ErrorType.NETWORK_TIMEOUT,
      ErrorType.NETWORK_OFFLINE,
      ErrorType.CONNECTION_ERROR,
      ErrorType.RATE_LIMIT,
      ErrorType.SERVER_ERROR,
      ErrorType.GENERATION_TIMEOUT,
      ErrorType.STREAM_DISCONNECTED,
    ].includes(this.type);
  }

  /**
   * Check if error requires user intervention
   */
  requiresUserIntervention(): boolean {
    return this.severity === ErrorSeverity.CRITICAL ||
           this.type === ErrorType.AUTH_EXPIRED ||
           this.type === ErrorType.DISK_FULL;
  }

  /**
   * Get user-friendly error message
   */
  getUserMessage(): string {
    const messages: Record<ErrorType, string> = {
      [ErrorType.NETWORK_TIMEOUT]: 'Network connection timed out. Please check your internet connection.',
      [ErrorType.NETWORK_OFFLINE]: 'You are currently offline. Requests will be queued when online.',
      [ErrorType.CONNECTION_ERROR]: 'Failed to connect to the server. Please try again.',
      [ErrorType.API_ERROR]: 'An API error occurred. Please try again.',
      [ErrorType.AUTH_ERROR]: 'Authentication failed. Please log in again.',
      [ErrorType.RATE_LIMIT]: 'Too many requests. Please wait before trying again.',
      [ErrorType.INVALID_REQUEST]: 'Invalid request. Please check your input.',
      [ErrorType.NOT_FOUND]: 'The requested resource was not found.',
      [ErrorType.SERVER_ERROR]: 'Server error. Please try again later.',
      [ErrorType.STORAGE_ERROR]: 'Storage operation failed. Please try again.',
      [ErrorType.DISK_FULL]: 'Disk is full. Please free up some space.',
      [ErrorType.STREAM_DISCONNECTED]: 'Stream connection lost. Attempting to reconnect...',
      [ErrorType.AUTH_EXPIRED]: 'Your authentication has expired. Please re-authorize.',
      [ErrorType.SCENE_SWITCH_FAILED]: 'Failed to switch scene. Reverting to previous scene.',
      [ErrorType.SOURCE_MISSING]: 'Source is missing. Disabling in preview.',
      [ErrorType.RECORDING_FAILED]: 'Recording failed. Please try again.',
      [ErrorType.GENERATION_FAILED]: 'Generation failed. Would you like to retry?',
      [ErrorType.GENERATION_TIMEOUT]: 'Generation timed out. The request is still processing.',
      [ErrorType.UNKNOWN]: 'An unknown error occurred.',
    };

    return messages[this.type] || this.message;
  }

  /**
   * Increment retry count
   */
  incrementRetry(): void {
    (this as any).retryCount += 1;
  }

  /**
   * Serialize for logging
   */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      type: this.type,
      severity: this.severity,
      code: this.code,
      timestamp: this.timestamp,
      context: this.context,
      retryCount: this.retryCount,
      maxRetries: this.maxRetries,
      stack: this.stack,
    };
  }
}

/**
 * SUNO-specific errors
 */
export class SunoError extends AppError {
  constructor(
    message: string,
    type: ErrorType = ErrorType.API_ERROR,
    options?: {
      code?: string;
      context?: Record<string, any>;
      maxRetries?: number;
    }
  ) {
    const severity = [ErrorType.GENERATION_FAILED, ErrorType.GENERATION_TIMEOUT]
      .includes(type)
      ? ErrorSeverity.WARNING
      : ErrorSeverity.ERROR;

    const recoveryActions = getRecoveryActionsForError(type);

    super(message, type, severity, {
      ...options,
      recoveryActions,
    });
    this.name = 'SunoError';
  }
}

/**
 * OBS-specific errors
 */
export class ObsError extends AppError {
  public readonly connectionAttempts?: number;
  public readonly maxConnectionAttempts?: number;

  constructor(
    message: string,
    type: ErrorType = ErrorType.API_ERROR,
    options?: {
      code?: string;
      context?: Record<string, any>;
      connectionAttempts?: number;
      maxConnectionAttempts?: number;
      maxRetries?: number;
    }
  ) {
    const severity = type === ErrorType.STREAM_DISCONNECTED
      ? ErrorSeverity.WARNING
      : ErrorSeverity.ERROR;

    const recoveryActions = getRecoveryActionsForError(type);

    super(message, type, severity, {
      ...options,
      recoveryActions,
    });
    this.name = 'ObsError';
    this.connectionAttempts = options?.connectionAttempts;
    this.maxConnectionAttempts = options?.maxConnectionAttempts;
  }

  /**
   * Check if reconnection is possible
   */
  canReconnect(): boolean {
    if (!this.connectionAttempts || !this.maxConnectionAttempts) {
      return true;
    }
    return this.connectionAttempts < this.maxConnectionAttempts;
  }
}

/**
 * Get recovery actions for error type
 */
export function getRecoveryActionsForError(type: ErrorType): RecoveryAction[] {
  const actions: Record<ErrorType, RecoveryAction[]> = {
    [ErrorType.NETWORK_TIMEOUT]: [
      RecoveryAction.RETRY,
      RecoveryAction.QUEUE,
    ],
    [ErrorType.NETWORK_OFFLINE]: [
      RecoveryAction.QUEUE,
    ],
    [ErrorType.CONNECTION_ERROR]: [
      RecoveryAction.RECONNECT,
      RecoveryAction.RETRY,
    ],
    [ErrorType.API_ERROR]: [
      RecoveryAction.RETRY,
      RecoveryAction.MANUAL_INTERVENTION,
    ],
    [ErrorType.AUTH_ERROR]: [
      RecoveryAction.REAUTHORIZE,
    ],
    [ErrorType.RATE_LIMIT]: [
      RecoveryAction.QUEUE,
      RecoveryAction.RETRY,
    ],
    [ErrorType.INVALID_REQUEST]: [
      RecoveryAction.MANUAL_INTERVENTION,
    ],
    [ErrorType.NOT_FOUND]: [
      RecoveryAction.MANUAL_INTERVENTION,
    ],
    [ErrorType.SERVER_ERROR]: [
      RecoveryAction.RETRY,
      RecoveryAction.QUEUE,
    ],
    [ErrorType.STORAGE_ERROR]: [
      RecoveryAction.FALLBACK_PLAYBACK,
      RecoveryAction.MANUAL_INTERVENTION,
    ],
    [ErrorType.DISK_FULL]: [
      RecoveryAction.MANUAL_INTERVENTION,
    ],
    [ErrorType.STREAM_DISCONNECTED]: [
      RecoveryAction.RECONNECT,
      RecoveryAction.RETRY,
    ],
    [ErrorType.AUTH_EXPIRED]: [
      RecoveryAction.REAUTHORIZE,
    ],
    [ErrorType.SCENE_SWITCH_FAILED]: [
      RecoveryAction.FALLBACK,
      RecoveryAction.RETRY,
    ],
    [ErrorType.SOURCE_MISSING]: [
      RecoveryAction.FALLBACK,
    ],
    [ErrorType.RECORDING_FAILED]: [
      RecoveryAction.STOP_RECORDING,
      RecoveryAction.MANUAL_INTERVENTION,
    ],
    [ErrorType.GENERATION_FAILED]: [
      RecoveryAction.RETRY,
      RecoveryAction.QUEUE,
    ],
    [ErrorType.GENERATION_TIMEOUT]: [
      RecoveryAction.QUEUE,
    ],
    [ErrorType.UNKNOWN]: [
      RecoveryAction.MANUAL_INTERVENTION,
    ],
  };

  return actions[type] || [RecoveryAction.MANUAL_INTERVENTION];
}

/**
 * Retry configuration
 */
export interface RetryConfig {
  maxAttempts: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
  jitterFactor: number;
}

/**
 * Default retry configurations
 */
export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  initialDelayMs: 1000,
  maxDelayMs: 30000,
  backoffMultiplier: 2,
  jitterFactor: 0.1,
};

/**
 * Calculate exponential backoff delay with jitter
 */
export function calculateBackoffDelay(
  attempt: number,
  config: RetryConfig = DEFAULT_RETRY_CONFIG
): number {
  const exponentialDelay = Math.min(
    config.initialDelayMs * Math.pow(config.backoffMultiplier, attempt),
    config.maxDelayMs
  );

  const jitter = exponentialDelay * config.jitterFactor * Math.random();
  return exponentialDelay + jitter;
}

/**
 * Error logger for debugging and monitoring
 */
export class ErrorLogger {
  private static logs: AppError[] = [];
  private static maxLogs = 1000;

  static log(error: AppError): void {
    this.logs.push(error);

    // Keep log size manageable
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('[ERROR]', error.toJSON());
    }
  }

  static getLogs(): AppError[] {
    return [...this.logs];
  }

  static getErrorsByType(type: ErrorType): AppError[] {
    return this.logs.filter((e) => e.type === type);
  }

  static getErrorsBySeverity(severity: ErrorSeverity): AppError[] {
    return this.logs.filter((e) => e.severity === severity);
  }

  static clear(): void {
    this.logs = [];
  }

  static export(): string {
    return JSON.stringify(
      this.logs.map((e) => e.toJSON()),
      null,
      2
    );
  }
}
