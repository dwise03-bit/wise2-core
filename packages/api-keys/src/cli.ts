#!/usr/bin/env node
/**
 * Interactive client workflow: gather and store WISE² API keys.
 * Values are written to data/clients/<slug>/keys.env (gitignored).
 * This CLI never prints a full secret after you paste it.
 */

import { createInterface } from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { PROFILES, fieldsForProfile, getProfile, isProfileId } from './catalog.ts';
import type { ProfileId } from './types.ts';
import { getNextPrompt, getStatus, skipKey, storeKey } from './workflow.ts';

function parseArgs(argv: string[]) {
  const args: Record<string, string | boolean> = {};
  for (let i = 0; i < argv.length; i++) {
    const token = argv[i];
    if (!token.startsWith('--')) {
      if (!args.command) args.command = token;
      continue;
    }
    const key = token.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith('--')) {
      args[key] = true;
    } else {
      args[key] = next;
      i++;
    }
  }
  return args;
}

async function promptLine(
  rl: ReturnType<typeof createInterface>,
  question: string,
  fallback?: string,
): Promise<string> {
  const suffix = fallback ? ` [${fallback}]` : '';
  const answer = (await rl.question(`${question}${suffix}: `)).trim();
  return answer || fallback || '';
}

function printStatus(client: string, profile: ProfileId): void {
  const status = getStatus(client, profile);
  console.log('');
  console.log(`${getProfile(profile).name} for ${status.client}`);
  console.log(
    `Required ${status.requiredConfigured}/${status.requiredTotal}  optional ${status.optionalConfigured}/${status.optionalTotal}  skipped ${status.skipped}`,
  );
  console.log(`Vault: ${status.vaultPath}`);
  for (const field of status.fields) {
    const mark =
      field.status === 'configured' ? 'set' : field.status === 'skipped' ? 'skip' : 'need';
    const extra = field.masked ? ` ${field.masked}` : '';
    const req = field.required ? 'required' : 'optional';
    console.log(`  [${mark}] ${field.name} (${req})${extra}`);
  }
  console.log('');
}

async function runGather(args: Record<string, string | boolean>): Promise<void> {
  const rl = createInterface({ input, output });
  try {
    const client =
      (typeof args.client === 'string' && args.client) ||
      (await promptLine(rl, 'Client slug', 'default'));

    if (typeof args.profile !== 'string') {
      console.log('');
      for (const profile of PROFILES) {
        console.log(`  ${profile.id.padEnd(16)} ${profile.summary}`);
      }
      console.log('');
    }

    const profileRaw =
      (typeof args.profile === 'string' && args.profile) ||
      (await promptLine(rl, 'Profile', 'core'));
    if (!isProfileId(profileRaw)) {
      throw new Error(`Unknown profile: ${profileRaw}`);
    }
    const profile = profileRaw;

    printStatus(client, profile);

    while (true) {
      const next = getNextPrompt(client, profile);
      if (next.done || !next.field) {
        console.log('All keys in this profile are stored or skipped.');
        printStatus(client, profile);
        break;
      }

      const field = next.field;
      const kind = next.required ? 'required' : 'optional';
      console.log(`Next (${kind}): ${field.name}`);
      console.log(`Docs: ${field.docsUrl}`);
      for (const step of field.clientSteps) {
        console.log(`  - ${step}`);
      }

      const value = await promptLine(
        rl,
        `Paste ${field.envVariable} (or skip / quit)`,
      );

      if (!value || value.toLowerCase() === 'skip') {
        skipKey(client, field.envVariable);
        console.log(`Skipped ${field.name}.`);
        continue;
      }
      if (value.toLowerCase() === 'quit' || value.toLowerCase() === 'exit') {
        console.log('Stopped. Run again to continue.');
        break;
      }

      const result = storeKey(client, field.envVariable, value);
      if (!result.ok) {
        console.log(`Not stored: ${result.error}`);
        const retry = (await promptLine(rl, 'Try again? (y/n)', 'y')).toLowerCase();
        if (retry === 'n' || retry === 'no') {
          skipKey(client, field.envVariable);
          console.log(`Skipped ${field.name}.`);
        }
        continue;
      }
      console.log(`Stored ${field.name} as ${result.masked}`);
    }
  } finally {
    rl.close();
  }
}

function runStatus(args: Record<string, string | boolean>): void {
  const client = typeof args.client === 'string' ? args.client : 'default';
  const profileRaw = typeof args.profile === 'string' ? args.profile : 'core';
  if (!isProfileId(profileRaw)) throw new Error(`Unknown profile: ${profileRaw}`);
  printStatus(client, profileRaw);
}

function runCatalog(args: Record<string, string | boolean>): void {
  const profileRaw = typeof args.profile === 'string' ? args.profile : '';
  if (profileRaw) {
    if (!isProfileId(profileRaw)) throw new Error(`Unknown profile: ${profileRaw}`);
    console.log(getProfile(profileRaw).name);
    for (const field of fieldsForProfile(profileRaw)) {
      console.log(`  ${field.envVariable}  ${field.name}`);
    }
    return;
  }
  for (const profile of PROFILES) {
    console.log(`${profile.id}\t${profile.summary}`);
  }
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  const command = typeof args.command === 'string' ? args.command : 'gather';

  if (command === 'help' || args.help) {
    console.log(`WISE² API keys

Usage:
  pnpm --filter @wise2/api-keys start gather -- --client acme --profile core
  pnpm --filter @wise2/api-keys start status -- --client acme --profile hvac
  pnpm --filter @wise2/api-keys start catalog
  pnpm --filter @wise2/api-keys start catalog -- --profile field-service

Commands:
  gather    Interactive client workflow (default)
  status    Show configured / missing / skipped (masked)
  catalog   List profiles or fields

Keys are stored under data/clients/<slug>/keys.env (gitignored).
Never commit that file. This tool never prints a full secret after paste.
`);
    return;
  }

  if (command === 'status') {
    runStatus(args);
    return;
  }
  if (command === 'catalog') {
    runCatalog(args);
    return;
  }
  if (command === 'gather') {
    await runGather(args);
    return;
  }

  throw new Error(`Unknown command: ${command}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
