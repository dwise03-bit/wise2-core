/**
 * WISE² Memory System - Persistent Knowledge Base
 *
 * Maintains durable state about:
 * - Architecture and topology
 * - Customers and deployments
 * - Services and health
 * - Decisions and runbooks
 * - Daily logs
 *
 * Uses file-based storage (Markdown, JSON) for portability.
 */

import { WISEMemory, CustomerRecord, ServiceRecord, DecisionRecord, RunbookRecord } from '../types';
import * as fs from 'fs';
import * as path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const DAILY_LOGS_DIR = path.join(DATA_DIR, 'daily-logs');
const DECISIONS_DIR = path.join(DATA_DIR, 'decisions');
const PROJECTS_DIR = path.join(DATA_DIR, 'projects');
const CONTACTS_DIR = path.join(DATA_DIR, 'contacts');

// ─────────────────────────────────────────────────────────────────────
// INITIALIZATION
// ─────────────────────────────────────────────────────────────────────

/**
 * Ensure data directories exist
 */
export function initializeDataDirectories(): void {
  const dirs = [DATA_DIR, DAILY_LOGS_DIR, DECISIONS_DIR, PROJECTS_DIR, CONTACTS_DIR];
  for (const dir of dirs) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }
}

// ─────────────────────────────────────────────────────────────────────
// DAILY LOGS
// ─────────────────────────────────────────────────────────────────────

/**
 * Get today's daily log file path
 */
function getTodayLogPath(): string {
  const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  return path.join(DAILY_LOGS_DIR, `${date}.md`);
}

/**
 * Initialize today's daily log
 */
export function ensureDailyLog(): string {
  const logPath = getTodayLogPath();
  if (!fs.existsSync(logPath)) {
    const date = new Date();
    const header = `# ${date.toLocaleDateString()} - Daily Log

## Sessions
-

## Decisions Made
-

## Blockers
-

## Next Actions
- [ ]
`;
    fs.writeFileSync(logPath, header, 'utf-8');
  }
  return logPath;
}

/**
 * Append to today's daily log
 */
export function appendToLog(section: 'sessions' | 'decisions' | 'blockers' | 'actions', entry: string): void {
  const logPath = ensureDailyLog();
  let content = fs.readFileSync(logPath, 'utf-8');

  const sectionMap = {
    sessions: '## Sessions',
    decisions: '## Decisions Made',
    blockers: '## Blockers',
    actions: '## Next Actions',
  };

  const header = sectionMap[section];
  const regex = new RegExp(`(${header}\\n)`, 'i');
  const replacement = `${header}\n- ${entry}\n`;

  content = content.replace(regex, replacement);
  fs.writeFileSync(logPath, content, 'utf-8');
}

/**
 * Get today's log content
 */
export function readDailyLog(): string {
  const logPath = getTodayLogPath();
  return fs.existsSync(logPath) ? fs.readFileSync(logPath, 'utf-8') : '';
}

// ─────────────────────────────────────────────────────────────────────
// DECISIONS
// ─────────────────────────────────────────────────────────────────────

/**
 * Record a decision (ADR format)
 */
export function recordDecision(decision: DecisionRecord): void {
  const fileName = decision.id || `${Date.now()}`;
  const filePath = path.join(DECISIONS_DIR, `${fileName}.md`);

  const content = `# ${decision.title}

**Date**: ${decision.date}
**Status**: Active

## Context
${decision.context}

## Decision
${decision.decision}

## Rationale
${decision.rationale}

## Implications
${decision.implications.map((i) => `- ${i}`).join('\n')}

## Decided By
${decision.decided_by}

---
*Last Updated: ${new Date().toISOString()}*
`;

  fs.writeFileSync(filePath, content, 'utf-8');
}

/**
 * List recent decisions
 */
export function listDecisions(limit = 10): DecisionRecord[] {
  if (!fs.existsSync(DECISIONS_DIR)) return [];

  const files = fs
    .readdirSync(DECISIONS_DIR)
    .filter((f) => f.endsWith('.md'))
    .sort()
    .reverse()
    .slice(0, limit);

  return files.map((file) => ({
    id: path.basename(file, '.md'),
    title: file.replace('.md', ''),
    date: new Date().toISOString().split('T')[0],
    context: '',
    decision: '',
    rationale: '',
    implications: [],
    decided_by: 'system',
  }));
}

// ─────────────────────────────────────────────────────────────────────
// CUSTOMERS
// ─────────────────────────────────────────────────────────────────────

/**
 * Store customer record
 */
export function saveCustomer(customer: CustomerRecord): void {
  if (!fs.existsSync(PROJECTS_DIR)) {
    fs.mkdirSync(PROJECTS_DIR, { recursive: true });
  }

  const filePath = path.join(PROJECTS_DIR, `${customer.id}.json`);
  fs.writeFileSync(filePath, JSON.stringify(customer, null, 2), 'utf-8');
}

/**
 * Load customer record
 */
export function loadCustomer(customerId: string): CustomerRecord | null {
  const filePath = path.join(PROJECTS_DIR, `${customerId}.json`);
  if (fs.existsSync(filePath)) {
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  }
  return null;
}

/**
 * List all customers
 */
export function listCustomers(): CustomerRecord[] {
  if (!fs.existsSync(PROJECTS_DIR)) return [];

  return fs
    .readdirSync(PROJECTS_DIR)
    .filter((f) => f.endsWith('.json'))
    .map((f) => {
      const data = fs.readFileSync(path.join(PROJECTS_DIR, f), 'utf-8');
      return JSON.parse(data);
    });
}

// ─────────────────────────────────────────────────────────────────────
// SERVICES & TOPOLOGY
// ─────────────────────────────────────────────────────────────────────

const topologyPath = path.join(DATA_DIR, 'topology.json');

/**
 * Load service topology
 */
export function loadTopology(): ServiceRecord[] {
  if (!fs.existsSync(topologyPath)) {
    return [];
  }
  const data = fs.readFileSync(topologyPath, 'utf-8');
  return JSON.parse(data);
}

/**
 * Save service topology
 */
export function saveTopology(services: ServiceRecord[]): void {
  fs.writeFileSync(topologyPath, JSON.stringify(services, null, 2), 'utf-8');
}

/**
 * Update a service status
 */
export function updateServiceStatus(name: string, status: 'online' | 'offline' | 'degraded'): void {
  const services = loadTopology();
  const service = services.find((s) => s.name === name);
  if (service) {
    service.status = status;
    service.last_check = new Date().toISOString();
    saveTopology(services);
  }
}

// ─────────────────────────────────────────────────────────────────────
// GLOBAL MEMORY
// ─────────────────────────────────────────────────────────────────────

const memoryPath = path.join(DATA_DIR, 'wise2-memory.json');

/**
 * Load global WISE² memory
 */
export function loadMemory(): WISEMemory {
  if (fs.existsSync(memoryPath)) {
    const data = fs.readFileSync(memoryPath, 'utf-8');
    return JSON.parse(data);
  }

  return {
    architecture: {},
    customers: {},
    modules: {},
    services: {},
    decisions: [],
    runbooks: [],
    last_updated: new Date().toISOString(),
  };
}

/**
 * Save global WISE² memory
 */
export function saveMemory(memory: WISEMemory): void {
  memory.last_updated = new Date().toISOString();
  fs.writeFileSync(memoryPath, JSON.stringify(memory, null, 2), 'utf-8');
}

/**
 * Update architecture in memory
 */
export function updateArchitecture(key: string, value: unknown): void {
  const memory = loadMemory();
  memory.architecture[key] = value;
  saveMemory(memory);
}

/**
 * Add customer to memory
 */
export function addCustomerToMemory(customer: CustomerRecord): void {
  const memory = loadMemory();
  memory.customers[customer.id] = customer;
  saveMemory(memory);
}

/**
 * Get all customers from memory
 */
export function getCustomersFromMemory(): Record<string, CustomerRecord> {
  const memory = loadMemory();
  return memory.customers;
}

// ─────────────────────────────────────────────────────────────────────
// CONTACTS
// ─────────────────────────────────────────────────────────────────────

const contactsPath = path.join(CONTACTS_DIR, 'team.md');

/**
 * Ensure contacts file exists
 */
export function ensureContactsFile(): void {
  if (!fs.existsSync(CONTACTS_DIR)) {
    fs.mkdirSync(CONTACTS_DIR, { recursive: true });
  }
  if (!fs.existsSync(contactsPath)) {
    fs.writeFileSync(contactsPath, '# Team & Contacts\n\n', 'utf-8');
  }
}

/**
 * Add contact
 */
export function addContact(name: string, role: string, notes = ''): void {
  ensureContactsFile();
  const entry = `\n## ${name}\n- Role: ${role}\n- Notes: ${notes}\n`;
  fs.appendFileSync(contactsPath, entry, 'utf-8');
}

/**
 * Get contacts
 */
export function getContacts(): string {
  ensureContactsFile();
  return fs.readFileSync(contactsPath, 'utf-8');
}

// ─────────────────────────────────────────────────────────────────────
// PERIODIC CLEANUP
// ─────────────────────────────────────────────────────────────────────

/**
 * Archive old daily logs (keep last 30 days)
 */
export function archiveOldLogs(): void {
  if (!fs.existsSync(DAILY_LOGS_DIR)) return;

  const cutoffDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const files = fs.readdirSync(DAILY_LOGS_DIR);

  for (const file of files) {
    const filePath = path.join(DAILY_LOGS_DIR, file);
    const stat = fs.statSync(filePath);

    if (stat.mtime < cutoffDate) {
      // Move to archive (optional)
      // For now, just log it
      console.log(`[memory] Consider archiving old log: ${file}`);
    }
  }
}

export function initializeMemorySystem(): void {
  initializeDataDirectories();
  ensureDailyLog();
  ensureContactsFile();
  loadMemory(); // Warm the cache
}
