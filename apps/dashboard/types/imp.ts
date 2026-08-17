/**
 * WISE² Personal IMP Expression System
 * Defines expression states and state machine for avatar behavior
 */

export type ImpExpression =
  | 'idle'
  | 'listening'
  | 'thinking'
  | 'speaking'
  | 'happy'
  | 'curious'
  | 'focused'
  | 'playful'
  | 'warning'
  | 'error'
  | 'sleeping'
  | 'offline';

export type ImpColorVariant = 'blue' | 'gold' | 'green' | 'magenta';

export interface ImpEvent {
  type:
    | 'user_message'
    | 'voice_start'
    | 'voice_end'
    | 'ai_thinking'
    | 'ai_stream_start'
    | 'ai_stream_end'
    | 'tool_start'
    | 'tool_success'
    | 'tool_error'
    | 'hardware_status'
    | 'battery_status'
    | 'device_online'
    | 'device_offline';

  timestamp: Date;
  payload?: Record<string, unknown>;
}

export interface ImpState {
  expression: ImpExpression;
  colorVariant: ImpColorVariant;
  isAnimating: boolean;
  lastEventTime: Date | null;
}

/**
 * Expression transition rules
 * Defines which states can transition to which states
 */
export const EXPRESSION_TRANSITIONS: Record<ImpExpression, ImpExpression[]> = {
  idle: ['listening', 'thinking', 'sleeping', 'offline'],
  listening: ['thinking', 'idle'],
  thinking: ['speaking', 'happy', 'curious', 'warning', 'error', 'idle'],
  speaking: ['happy', 'idle', 'playful'],
  happy: ['idle', 'playful'],
  curious: ['thinking', 'focused', 'idle'],
  focused: ['thinking', 'idle'],
  playful: ['happy', 'idle'],
  warning: ['thinking', 'error', 'idle'],
  error: ['warning', 'thinking', 'idle'],
  sleeping: ['idle'],
  offline: ['idle'],
};

/**
 * Map ImpEvents to appropriate expressions
 */
export function getExpressionForEvent(event: ImpEvent): ImpExpression {
  switch (event.type) {
    case 'voice_start':
      return 'listening';
    case 'ai_thinking':
      return 'thinking';
    case 'ai_stream_start':
      return 'speaking';
    case 'tool_start':
      return 'focused';
    case 'tool_success':
      return 'happy';
    case 'tool_error':
      return 'error';
    case 'device_offline':
      return 'offline';
    case 'ai_stream_end':
      return 'idle';
    default:
      return 'idle';
  }
}

/**
 * Get duration (ms) expression should display before auto-transitioning
 */
export function getExpressionDuration(expression: ImpExpression): number {
  switch (expression) {
    case 'listening':
      return Infinity; // Stay until user stops
    case 'thinking':
      return Infinity; // Stay until AI responds
    case 'speaking':
      return Infinity; // Stay until stream ends
    case 'happy':
      return 2000;
    case 'playful':
      return 2500;
    case 'curious':
      return 2000;
    case 'focused':
      return 1500;
    case 'warning':
      return 3000;
    case 'error':
      return 4000;
    case 'idle':
      return Infinity; // Default state
    case 'sleeping':
      return Infinity;
    case 'offline':
      return Infinity;
    default:
      return 1000;
  }
}

/**
 * Get relative path to IMP graphic for given expression & color
 */
export function getImpImagePath(
  expression: ImpExpression,
  variant: ImpColorVariant = 'blue',
  format: 'webp' | 'png' | 'svg' = 'webp'
): string {
  // Map expressions to available graphic states
  // Available: celebrate, idle, thinking, wave
  // Others fall back to nearest match
  const graphicState = mapExpressionToGraphic(expression);
  return `/wise-imp/${graphicState}-${variant}.${format}`;
}

function mapExpressionToGraphic(expression: ImpExpression): string {
  switch (expression) {
    case 'happy':
    case 'playful':
    case 'curious':
      return 'celebrate';
    case 'thinking':
    case 'focused':
    case 'warning':
      return 'thinking';
    case 'listening':
      return 'wave';
    case 'idle':
    case 'sleeping':
    case 'offline':
    case 'error':
    case 'speaking':
    default:
      return 'idle';
  }
}
