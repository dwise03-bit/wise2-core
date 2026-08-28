export type ControlConfig = {
  host: string;
  port: number;
  token: string;
  repoDir: string;
  composeFile: string;
  auditFile: string;
  allowedServices: string[];
};

export type Envelope<T> = { ok: boolean; requestId: string; data?: T; error?: string };
