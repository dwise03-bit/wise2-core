#!/usr/bin/env node
import { loadConfig } from './config.js';
import { models, chat, vision } from './backends/ollama.js';
import { resolveRoute } from './router.js';
import { controlRequest, controlPath } from './backends/control-bridge.js';
import { handoffWithLauncher } from './backends/cloud.js';
import { execFileSync } from 'node:child_process';

const argv = process.argv.slice(2); const json = argv.includes('--json');
const clean = argv.filter((x) => !['--json', '--verbose'].includes(x));
const cfg = loadConfig(clean.includes('--config') ? clean[clean.indexOf('--config') + 1] : undefined);
const out = (v: unknown) => process.stdout.write(json ? JSON.stringify(v) + '\n' : String(v) + '\n');

async function main() {
  const configIndex = clean.indexOf('--config');
  const filtered = configIndex >= 0 ? clean.filter((_, i) => i !== configIndex && i !== configIndex + 1) : clean;
  const [command, ...args] = filtered;
  if (!command || command === 'help') return out('WISE² COMMAND CENTER\nwise [fast|code|vision|rag|gpu|status|doctor|models|routes|project|control|handoff]');
  if (command === 'routes') return out(cfg.roles);
  if (command === 'models') return out({ local: { url: cfg.localOllamaUrl, models: await models(cfg.localOllamaUrl) }, roles: cfg.roles });
  if (command === 'project') { let root = ''; try { root = execFileSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim(); } catch {} return out({ isGitRepo: Boolean(root), root, branch: root ? execFileSync('git', ['branch', '--show-current'], { encoding: 'utf8' }).trim() : undefined }); }
  if (command === 'control') return out(await controlRequest(cfg, 'GET', controlPath(args)));
  if (command === 'handoff') { if (args[0] !== 'claude' && args[0] !== 'codex') throw new Error('handoff requires claude or codex'); process.exitCode = await handoffWithLauncher(args[0], process.cwd()); return; }
  if (command === 'doctor') { let ok = true; try { await models(cfg.localOllamaUrl); } catch { ok = false; } return out({ ok, checks: [{ id: 'local-ollama', ok, remediation: ok ? undefined : 'Run: ollama serve' }, { id: 'arm64', ok: process.arch === 'arm64', remediation: 'Use an arm64 Node runtime' }] }); }
  if (command === 'status') { let local: string[] = []; try { local = await models(cfg.localOllamaUrl); } catch {} return out({ mac: { arch: process.arch }, localOllama: { reachable: local.length > 0, url: cfg.localOllamaUrl, models: local }, gpu: { configured: Boolean(cfg.gpuOllamaUrl) }, hermes: { configured: Boolean(cfg.hermesUrl) }, controlBridge: { configured: Boolean(cfg.controlBridgeUrl) }, cloud: { claudeInstalled: false, codexInstalled: false } }); }
  const role = command === 'vision' ? 'vision' : command === 'gpu' ? 'architect' : command === 'code' ? 'code' : command === 'rag' ? 'rag' : 'fast';
  const route = resolveRoute(role, cfg); const prompt = args.slice(command === 'vision' ? 1 : 0).join(' ');
  if (route.backend === 'gpu-ollama') { if (!cfg.gpuOllamaUrl) throw new Error('GPU route is not configured'); process.stderr.write('WISE² route: GPU host\n'); return out(await chat(cfg.gpuOllamaUrl, route.model, prompt, cfg)); }
  return out(command === 'vision' ? await vision(cfg.localOllamaUrl, route.model, args[0], prompt, cfg) : await chat(cfg.localOllamaUrl, route.model, prompt, cfg));
}
main().catch((e) => { console.error(e instanceof Error ? e.message : e); process.exitCode = 1; });
