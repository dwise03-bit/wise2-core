/**
 * Portable WISE² companion core. Character renderers provide an adapter; this
 * module deliberately has no dependency on IMP sprites, DOM, or Tauri.
 */
export const TaskStatus = Object.freeze({
  PLANNING: 'planning', AWAITING_CONFIRMATION: 'awaiting_confirmation',
  WORKING: 'working', VERIFYING: 'verifying', SUCCESS: 'success',
  ERROR: 'error', CANCELLED: 'cancelled'
});

export class CompanionError extends Error {
  constructor(code, message, details) { super(message); this.code = code; this.details = details; }
}

export class SkillRegistry {
  #skills = new Map();
  register(skill) {
    for (const key of ['id', 'description', 'permissions', 'execute', 'verify']) {
      if (!(key in skill)) throw new CompanionError('INVALID_SKILL', `Skill is missing ${key}`);
    }
    if (this.#skills.has(skill.id)) throw new CompanionError('DUPLICATE_SKILL', `Skill already registered: ${skill.id}`);
    this.#skills.set(skill.id, Object.freeze({ timeoutMs: 15000, sensitive: false, ...skill }));
    return this;
  }
  get(id) {
    const skill = this.#skills.get(id);
    if (!skill) throw new CompanionError('UNKNOWN_SKILL', `Unknown skill: ${id}`);
    return skill;
  }
  list() { return [...this.#skills.values()].map(({ execute, verify, ...meta }) => meta); }
}

export class TaskEngine {
  constructor({ registry, permissions, audit = () => {}, onStatus = () => {} }) {
    this.registry = registry; this.permissions = permissions; this.audit = audit; this.onStatus = onStatus;
    this.running = null;
  }
  async run(id, input, { signal } = {}) {
    if (this.running) throw new CompanionError('BUSY', 'The companion is already executing a task.');
    const skill = this.registry.get(id);
    const task = { id: taskId(), skill: id, status: TaskStatus.PLANNING, startedAt: new Date().toISOString() };
    const update = (status, detail) => { task.status = status; task.detail = detail; this.onStatus({ ...task }); this.audit({ ...task }); };
    this.running = task;
    try {
      if (skill.validate) skill.validate(input);
      if (skill.sensitive || skill.permissions.length) {
        update(TaskStatus.AWAITING_CONFIRMATION, skill.description);
        const allowed = await this.permissions.request({ skill: skill.id, permissions: skill.permissions, input });
        if (!allowed) throw new CompanionError('PERMISSION_DENIED', 'No action was performed because permission was denied.');
      }
      if (signal?.aborted) throw new CompanionError('CANCELLED', 'Task was cancelled before it began.');
      update(TaskStatus.WORKING, skill.description);
      const result = await withTimeout(skill.execute(input, { signal, update }), skill.timeoutMs);
      if (signal?.aborted) throw new CompanionError('CANCELLED', 'Task was cancelled.');
      update(TaskStatus.VERIFYING, 'Verifying result');
      const verification = await skill.verify(result, input);
      if (!verification?.ok) throw new CompanionError('VERIFICATION_FAILED', verification?.message || 'Result could not be verified.');
      update(TaskStatus.SUCCESS, verification.message || 'Verified complete');
      return { task, result, verification };
    } catch (error) {
      const normalized = error instanceof CompanionError ? error : new CompanionError('EXECUTION_FAILED', error.message || 'Task failed.');
      update(normalized.code === 'CANCELLED' ? TaskStatus.CANCELLED : TaskStatus.ERROR, normalized.message);
      throw normalized;
    } finally { this.running = null; }
  }
}

function taskId() {
  return globalThis.crypto?.randomUUID?.() || `task-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function withTimeout(promise, ms) {
  let timer;
  return Promise.race([
    promise,
    new Promise((_, reject) => { timer = setTimeout(() => reject(new CompanionError('TIMEOUT', 'The task timed out safely.')), ms); })
  ]).finally(() => clearTimeout(timer));
}

export function createDefaultRegistry(api) {
  const registry = new SkillRegistry();
  const pathInput = (input) => {
    if (!input?.root || typeof input.root !== 'string') throw new CompanionError('INVALID_INPUT', 'Choose a permitted project folder first.');
  };
  registry.register({
    id: 'project.find', description: 'Find permitted project files', permissions: ['filesystem:read'], inputs: { root: 'string', query: 'string?' },
    validate: pathInput, execute: (input) => api.findFiles(input), verify: (r) => ({ ok: Array.isArray(r?.files), message: `Found ${r.files.length} file(s).` })
  }).register({
    id: 'project.summarize', description: 'Summarize approved project information', permissions: ['filesystem:read'], inputs: { root: 'string' },
    validate: pathInput, execute: (input) => api.summarizeProject(input), verify: (r) => ({ ok: Boolean(r?.summary), message: 'Summary is based on inspected project files.' })
  }).register({
    id: 'tasks.update', description: 'Create or update a local task list', permissions: ['filesystem:write:tasks'], sensitive: true, inputs: { tasks: 'array' },
    validate: (input) => { if (!Array.isArray(input?.tasks)) throw new CompanionError('INVALID_INPUT', 'Tasks must be an array.'); },
    execute: (input) => api.saveTasks(input), verify: (r) => ({ ok: r?.saved === true, message: 'Task list was saved and reloaded.' })
  }).register({
    id: 'app.launch', description: 'Launch an approved local application', permissions: ['app:launch'], sensitive: true, inputs: { app: 'allowlisted app id' },
    validate: (input) => { if (!input?.app) throw new CompanionError('INVALID_INPUT', 'Choose an approved application.'); },
    execute: (input) => api.launchApprovedApp(input), verify: (r) => ({ ok: r?.launched === true, message: 'Approved application launch was requested.' })
  }).register({
    id: 'project.review', description: 'Prepare a verified project review', permissions: ['filesystem:read', 'filesystem:write:tasks'], sensitive: true, inputs: { root: 'string' },
    validate: pathInput,
    execute: async (input, ctx) => {
      const files = await api.findFiles({ ...input, query: '' }); ctx.update(TaskStatus.WORKING, 'Inspecting approved project files');
      const summary = await api.summarizeProject(input); ctx.update(TaskStatus.WORKING, 'Creating review checklist');
      const tasks = await api.saveTasks({ tasks: [{ title: 'Review project summary', done: false }, { title: 'Inspect key files', done: false }] });
      return { files, summary, tasks };
    },
    verify: (r) => ({ ok: Array.isArray(r?.files?.files) && Boolean(r?.summary?.summary) && r?.tasks?.saved === true, message: 'Project review was verified from real files and saved checklist.' })
  });
  return registry;
}