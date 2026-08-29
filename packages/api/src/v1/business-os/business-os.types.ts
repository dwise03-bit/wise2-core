export interface BusinessDashboardDto {
  revenueToday: number;
  revenueMonth: number;
  hotLeadCount: number;
  activeJobCount: number;
  unpaidInvoiceCount: number;
  criticalAlertCount: number;
}

export interface CommandResultDto {
  summary: string;
  module?: string;
}

export interface BusinessOperationDto<T> {
  operationId: string;
  status: string;
  message: string;
  auditEventId?: string | null;
  result?: T | null;
}

export const ALLOWED_COMMAND_INTENTS = [
  'show_hot_leads',
  'show_business_summary',
  'health_check',
] as const;

export type AllowedCommandIntent = (typeof ALLOWED_COMMAND_INTENTS)[number];

export const BLOCKED_COMMAND_CAPABILITIES = [
  'shell',
  'exec',
  'ssh',
  'run_command',
  'terminal',
] as const;
