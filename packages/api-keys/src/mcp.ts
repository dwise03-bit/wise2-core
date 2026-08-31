#!/usr/bin/env node
/**
 * MCP server: gather and store WISE² client API keys.
 * Tools never return raw secret values.
 */

import { createInterface } from 'node:readline';
import { PROFILES, fieldsForProfile, getField, isProfileId } from './catalog.ts';
import type { ProfileId } from './types.ts';
import { deleteKey, getNextPrompt, getStatus, skipKey, storeKey } from './workflow.ts';

interface JsonRpc {
  jsonrpc?: string;
  id?: number | string | null;
  method?: string;
  params?: Record<string, unknown>;
}

function textResult(payload: unknown) {
  return {
    content: [{ type: 'text', text: JSON.stringify(payload, null, 2) }],
  };
}

function errorResult(message: string) {
  return {
    content: [{ type: 'text', text: JSON.stringify({ ok: false, error: message }) }],
    isError: true,
  };
}

function profileFrom(args: Record<string, unknown> | undefined): ProfileId {
  const value = typeof args?.profile === 'string' ? args.profile : 'core';
  if (!isProfileId(value)) throw new Error(`Unknown profile: ${value}`);
  return value;
}

function clientFrom(args: Record<string, unknown> | undefined): string {
  return typeof args?.client === 'string' && args.client.trim()
    ? args.client.trim()
    : 'default';
}

const TOOLS = [
  {
    name: 'api_keys_list_profiles',
    description:
      'List WISE² API key profiles and the fields in a profile. Use before starting a client key-gathering workflow.',
    inputSchema: {
      type: 'object',
      properties: {
        profile: {
          type: 'string',
          description: 'Optional profile id to list fields for (core, phone, field-service, hvac, studio, full)',
        },
      },
    },
  },
  {
    name: 'api_keys_status',
    description:
      'Show which API keys are configured, missing, or skipped for a client. Returns masked values only.',
    inputSchema: {
      type: 'object',
      properties: {
        client: { type: 'string', description: 'Client slug, default default' },
        profile: { type: 'string', description: 'Profile id, default core' },
      },
    },
  },
  {
    name: 'api_keys_next',
    description:
      'Return the next missing API key and the client-facing steps to collect it. Call after each store or skip.',
    inputSchema: {
      type: 'object',
      properties: {
        client: { type: 'string' },
        profile: { type: 'string' },
      },
    },
  },
  {
    name: 'api_keys_store',
    description:
      'Store one API key for a client. Never log or echo the value. Returns a masked suffix on success.',
    inputSchema: {
      type: 'object',
      properties: {
        client: { type: 'string' },
        envVariable: { type: 'string' },
        value: { type: 'string' },
      },
      required: ['envVariable', 'value'],
    },
  },
  {
    name: 'api_keys_skip',
    description: 'Skip an optional or blocked API key so the workflow can continue.',
    inputSchema: {
      type: 'object',
      properties: {
        client: { type: 'string' },
        envVariable: { type: 'string' },
      },
      required: ['envVariable'],
    },
  },
  {
    name: 'api_keys_remove',
    description: 'Remove a stored API key from the client vault.',
    inputSchema: {
      type: 'object',
      properties: {
        client: { type: 'string' },
        envVariable: { type: 'string' },
      },
      required: ['envVariable'],
    },
  },
];

function callTool(name: string, args: Record<string, unknown> | undefined) {
  switch (name) {
    case 'api_keys_list_profiles': {
      const profile = typeof args?.profile === 'string' ? args.profile : '';
      if (profile) {
        if (!isProfileId(profile)) throw new Error(`Unknown profile: ${profile}`);
        return textResult({
          profile,
          fields: fieldsForProfile(profile).map((field) => ({
            envVariable: field.envVariable,
            name: field.name,
            serviceId: field.serviceId,
            docsUrl: field.docsUrl,
            clientSteps: field.clientSteps,
          })),
        });
      }
      return textResult({ profiles: PROFILES });
    }
    case 'api_keys_status':
      return textResult(getStatus(clientFrom(args), profileFrom(args)));
    case 'api_keys_next':
      return textResult(getNextPrompt(clientFrom(args), profileFrom(args)));
    case 'api_keys_store': {
      const envVariable = String(args?.envVariable ?? '');
      const value = String(args?.value ?? '');
      const field = getField(envVariable);
      if (!field) throw new Error(`Unknown key: ${envVariable}`);
      return textResult(storeKey(clientFrom(args), envVariable, value));
    }
    case 'api_keys_skip':
      return textResult(skipKey(clientFrom(args), String(args?.envVariable ?? '')));
    case 'api_keys_remove':
      return textResult(deleteKey(clientFrom(args), String(args?.envVariable ?? '')));
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

function handle(message: JsonRpc): unknown {
  if (!message.method) return undefined;

  if (message.method === 'initialize') {
    return {
      jsonrpc: '2.0',
      id: message.id,
      result: {
        protocolVersion: '2024-11-05',
        capabilities: { tools: {} },
        serverInfo: { name: 'wise2-api-keys', version: '0.1.0' },
      },
    };
  }

  if (message.method === 'notifications/initialized' || message.method === 'initialized') {
    return undefined;
  }

  if (message.method === 'tools/list') {
    return { jsonrpc: '2.0', id: message.id, result: { tools: TOOLS } };
  }

  if (message.method === 'tools/call') {
    const name = String(message.params?.name ?? '');
    const args = (message.params?.arguments ?? {}) as Record<string, unknown>;
    try {
      return { jsonrpc: '2.0', id: message.id, result: callTool(name, args) };
    } catch (error) {
      return {
        jsonrpc: '2.0',
        id: message.id,
        result: errorResult(error instanceof Error ? error.message : 'Tool failed'),
      };
    }
  }

  if (message.method === 'ping') {
    return { jsonrpc: '2.0', id: message.id, result: {} };
  }

  if (message.id === undefined || message.id === null) return undefined;
  return {
    jsonrpc: '2.0',
    id: message.id,
    error: { code: -32601, message: `Method not found: ${message.method}` },
  };
}

const rl = createInterface({ input: process.stdin, terminal: false });
rl.on('line', (line) => {
  const trimmed = line.trim();
  if (!trimmed) return;
  let message: JsonRpc;
  try {
    message = JSON.parse(trimmed) as JsonRpc;
  } catch {
    return;
  }
  const response = handle(message);
  if (response !== undefined) {
    process.stdout.write(`${JSON.stringify(response)}\n`);
  }
});
