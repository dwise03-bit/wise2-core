import './style.css';
import { createDefaultRegistry, TaskEngine, TaskStatus } from './companion-core.js';
import { invoke, isTauri, followPointerUntilRelease, bootPlatform } from './platform.js';

bootPlatform();

const BASE = import.meta.env.BASE_URL || '/';
const imp = document.querySelector('#imp');
const stage = document.querySelector('#pet-stage');
const speech = document.querySelector('#speech');
const menu = document.querySelector('#menu');

const SPRITES = {
  idle: `${BASE}assets/idle_hover.png`,
  left: `${BASE}assets/fly_left.png`,
  right: `${BASE}assets/fly_right.png`,
  land: `${BASE}assets/land_perch.png`,
  sit: `${BASE}assets/sit.png`,
  sleep: `${BASE}assets/sleep.png`,
  click: `${BASE}assets/click_react.png`,
  drag: `${BASE}assets/drag_dangle.png`
};

const DRAG_THRESHOLD = 8;
const SAVE_DEBOUNCE_MS = 250;

const state = {
  x: 100,
  y: 100,
  width: 300,
  height: 300,
  busy: false,
  sleeping: false,
  dragging: false,
  wanderEnabled: true,
  alwaysOnTop: true,
  soundEnabled: false,
  hidden: false,
  demoMode: false,
  suppressClick: false,
  bounds: { x: 0, y: 0, width: 1920, height: 1080 }
};

const sayings = [
  'Spark secured.',
  'WISE² online.',
  'Noise eliminated.',
  'Two minds. One vision.',
  'What are we building next?'
];

let actionTimer = 0;
let saveTimer = 0;
let flightFrame = 0;
let firstWander = true;
let demoRun = 0;

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function setSprite(name) {
  imp.src = SPRITES[name] || SPRITES.idle;
}

function showSpeech(text, ms = 1800) {
  speech.textContent = text;
  speech.hidden = false;
  clearTimeout(showSpeech.timer);
  showSpeech.timer = setTimeout(() => { speech.hidden = true; }, ms);
}

function clamp(value, min, max) {
  if (max < min) return min;
  return Math.max(min, Math.min(max, value));
}

function clampToBounds(x, y) {
  const b = state.bounds;
  return {
    x: clamp(x, b.x, b.x + b.width - state.width),
    y: clamp(y, b.y, b.y + b.height - state.height)
  };
}

function currentSettings() {
  return {
    x: state.x,
    y: state.y,
    width: 300,
    wanderEnabled: state.wanderEnabled,
    alwaysOnTop: state.alwaysOnTop,
    soundEnabled: state.soundEnabled
  };
}

function persistSettings() {
  clearTimeout(saveTimer);
  saveTimer = window.setTimeout(() => {
    invoke('save_settings', { settings: currentSettings() }).catch((error) => {
      console.warn('Failed to save settings:', error);
    });
  }, SAVE_DEBOUNCE_MS);
}

async function refreshMetrics() {
  try {
    const [area, size, pos] = await Promise.all([
      invoke('get_work_area'),
      invoke('get_window_size'),
      invoke('get_window_position')
    ]);
    state.bounds = area;
    state.width = size.width;
    state.height = size.height;
    state.x = pos.x;
    state.y = pos.y;
  } catch (error) {
    console.warn('Using fallback screen bounds:', error);
  }
}

async function moveWindow(x, y) {
  const next = clampToBounds(Math.round(x), Math.round(y));
  state.x = next.x;
  state.y = next.y;
  await invoke('set_window_position', { x: state.x, y: state.y });
}

function stopScheduler() {
  clearTimeout(actionTimer);
  actionTimer = 0;
}

function scheduleNext(ms = 4500 + Math.random() * 3500) {
  stopScheduler();
  if (!state.wanderEnabled || state.sleeping || state.dragging || state.hidden || state.demoMode) return;
  actionTimer = window.setTimeout(async () => {
    try {
      await doIdleAction();
    } finally {
      if (!state.dragging && !state.hidden) scheduleNext();
    }
  }, ms);
}

async function animateTo(targetX, targetY, direction) {
  if (state.busy || state.dragging || state.sleeping) return;
  state.busy = true;
  const token = ++flightFrame;
  setSprite(direction);
  const startX = state.x;
  const startY = state.y;
  const clampedTarget = clampToBounds(targetX, targetY);
  const distance = Math.hypot(clampedTarget.x - startX, clampedTarget.y - startY);
  const duration = clamp(distance * 2.2, 650, 1800);
  const started = performance.now();

  await new Promise((resolve) => {
    const tick = async (now) => {
      if (token !== flightFrame || state.dragging) {
        resolve();
        return;
      }
      const t = clamp((now - started) / duration, 0, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      const arc = Math.sin(Math.PI * t) * 45;
      const x = startX + (clampedTarget.x - startX) * eased;
      const y = startY + (clampedTarget.y - startY) * eased - arc;
      try { await moveWindow(x, y); } catch (error) { console.error(error); }
      if (t < 1) requestAnimationFrame(tick);
      else resolve();
    };
    requestAnimationFrame(tick);
  });

  if (token === flightFrame && !state.dragging && !state.sleeping) {
    setSprite('land');
    await delay(350);
    if (!state.dragging && !state.sleeping) setSprite('idle');
  }
  persistSettings();
  state.busy = false;
}

async function wander() {
  if (state.busy || state.dragging || state.sleeping || state.demoMode || !state.wanderEnabled) return;
  const b = state.bounds;
  const rangeX = Math.max(0, b.width - state.width);
  const rangeY = Math.max(0, b.height - state.height);
  const targetX = b.x + Math.random() * rangeX;
  const targetY = b.y + Math.random() * rangeY;
  await animateTo(targetX, targetY, targetX < state.x ? 'left' : 'right');
}

async function doIdleAction() {
  if (state.busy || state.dragging || state.sleeping || !state.wanderEnabled) return;
  if (firstWander) {
    firstWander = false;
    await wander();
    return;
  }
  const roll = Math.random();
  if (roll < 0.55) {
    await wander();
    return;
  }
  if (roll < 0.75) {
    state.busy = true;
    setSprite('sit');
    await delay(2500);
    if (!state.dragging && !state.sleeping) setSprite('idle');
    state.busy = false;
    return;
  }
  state.sleeping = true;
  setSprite('sleep');
  showSpeech('Recharge mode…', 1500);
  await delay(5500);
  if (state.sleeping && !state.dragging) {
    state.sleeping = false;
    setSprite('idle');
  }
}

async function playClickReaction() {
  if (state.demoMode) stopDemo(false);
  if (state.dragging) return;
  flightFrame += 1;
  state.sleeping = false;
  state.busy = true;
  stopScheduler();
  setSprite('click');
  imp.classList.remove('clicked');
  void imp.offsetWidth;
  imp.classList.add('clicked');
  showSpeech(sayings[Math.floor(Math.random() * sayings.length)]);
  await delay(900);
  if (!state.dragging && !state.sleeping) setSprite('idle');
  state.busy = false;
  if (!state.dragging && !state.sleeping) scheduleNext(1800);
}

function stopDemo(announce = true) {
  if (!state.demoMode) return;
  state.demoMode = false;
  demoRun += 1;
  flightFrame += 1;
  state.busy = false;
  imp.classList.remove('dancing');
  if (!state.dragging) setSprite(state.sleeping ? 'sleep' : 'idle');
  if (announce) showSpeech('Showcase paused.');
  if (!state.sleeping && !state.dragging) scheduleNext(1800);
}

async function runDemo() {
  if (state.demoMode || state.dragging) return;
  state.demoMode = true;
  state.sleeping = false;
  const run = ++demoRun;
  const active = () => state.demoMode && run === demoRun && !state.dragging;
  const fly = async (x, y, direction) => {
    if (!active()) return;
    const b = state.bounds;
    await animateTo(b.x + Math.max(0, b.width - state.width) * x, b.y + Math.max(0, b.height - state.height) * y, direction);
  };
  stopScheduler();
  showSpeech('Demo mode: watch the WISE² IMP move.', 2600);
  try {
    await fly(0.18, 0.22, 'left');
    await fly(0.72, 0.12, 'right');
    if (!active()) return;
    setSprite('sit');
    showSpeech('Perch. Pose. Power up.', 1800);
    await delay(1500);
    if (!active()) return;
    setSprite('click');
    imp.classList.add('dancing');
    showSpeech('The cyan shuffle.', 2200);
    await delay(2200);
    imp.classList.remove('dancing');
    if (!active()) return;
    setSprite('sleep');
    showSpeech('Even companions recharge.', 1500);
    await delay(1300);
    if (!active()) return;
    await fly(0.46, 0.30, 'left');
    if (!active()) return;
    setSprite('click');
    showSpeech('Showcase complete.', 2200);
    await delay(900);
  } finally {
    if (run === demoRun) {
      state.demoMode = false;
      state.busy = false;
      imp.classList.remove('dancing');
      if (!state.dragging) setSprite('idle');
      persistSettings();
      if (!state.dragging) scheduleNext(1800);
    }
  }
}

async function finishDrag() {
  await refreshMetrics();
  await moveWindow(state.x, state.y);
  persistSettings();
  state.dragging = false;
  state.busy = false;
  stage.classList.remove('dragging');
  setSprite(state.sleeping ? 'sleep' : 'idle');
  if (!state.sleeping) scheduleNext(1800);
  window.setTimeout(() => { state.suppressClick = false; }, 80);
}

stage.addEventListener('pointerdown', (event) => {
  if (event.button !== 0) return;
  menu.hidden = true;
  const startX = event.clientX;
  const startY = event.clientY;
  const grabOffsetX = event.clientX - state.x;
  const grabOffsetY = event.clientY - state.y;
  let startedDrag = false;

  const onMove = async (ev) => {
    if (startedDrag) return;
    if (Math.hypot(ev.clientX - startX, ev.clientY - startY) < DRAG_THRESHOLD) return;
    startedDrag = true;
    stopDemo(false);
    state.suppressClick = true;
    state.dragging = true;
    state.busy = true;
    flightFrame += 1;
    stopScheduler();
    setSprite('drag');
    stage.classList.add('dragging');
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerup', onUp);
    try {
      await followPointerUntilRelease(async (cx, cy) => {
        if (!isTauri) await moveWindow(cx - grabOffsetX, cy - grabOffsetY);
      });
    } catch (error) {
      console.error(error);
    }
    await finishDrag();
  };

  const onUp = () => {
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerup', onUp);
  };

  window.addEventListener('pointermove', onMove);
  window.addEventListener('pointerup', onUp);
});

imp.addEventListener('click', async () => {
  if (state.suppressClick || state.dragging) {
    state.suppressClick = false;
    return;
  }
  await playClickReaction();
});

stage.addEventListener('contextmenu', (event) => {
  event.preventDefault();
  menu.hidden = !menu.hidden;
});

menu.addEventListener('click', async (event) => {
  const action = event.target?.dataset?.action;
  if (!action) return;
  menu.hidden = true;
  if (action === 'demo') {
    await runDemo();
    return;
  }
  if (action === 'stop-demo') {
    stopDemo();
    return;
  }
  if (action === 'review') {
    stopDemo(false);
    await runProjectReview();
    return;
  }
  if (action === 'wake') {
    stopDemo(false);
    state.sleeping = false;
    setSprite('idle');
    showSpeech('Back online.');
    scheduleNext(800);
  }
  if (action === 'sleep') {
    stopDemo(false);
    flightFrame += 1;
    state.sleeping = true;
    state.busy = false;
    setSprite('sleep');
    showSpeech('Power nap initiated.');
    stopScheduler();
  }
  if (action === 'center') {
    const b = state.bounds;
    await moveWindow(b.x + (b.width - state.width) / 2, b.y + (b.height - state.height) / 2);
    persistSettings();
  }
  if (action === 'quit') await invoke('close_app');
});

window.addEventListener('keydown', async (event) => {
  if (event.key === 'Escape') menu.hidden = true;
  if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 'q') {
    event.preventDefault();
    await invoke('close_app');
  }
});

window.addEventListener('resize', () => {
  refreshMetrics().then(() => moveWindow(state.x, state.y)).catch(() => {});
});

document.addEventListener('visibilitychange', () => {
  state.hidden = document.hidden;
  if (state.hidden) stopScheduler();
  else if (!state.sleeping) scheduleNext(1200);
});

async function boot() {
  try {
    const saved = await invoke('load_settings');
    state.wanderEnabled = saved.wanderEnabled !== false;
    state.alwaysOnTop = saved.alwaysOnTop !== false;
    state.soundEnabled = Boolean(saved.soundEnabled);
  } catch (error) {
    console.warn('No saved settings yet:', error);
  }
  await refreshMetrics();
  setSprite('idle');
  showSpeech('WISE Imp Alpha 0.1 online.', 2400);
  persistSettings();
  scheduleNext(2500);
}

const companionApi = (() => {
  let approvedRoot = null;
  const ensureApproved = async (root) => {
    if (approvedRoot !== root) approvedRoot = await invoke('approve_project_root', { root });
    return approvedRoot;
  };
  return {
    findFiles: async ({ root, query }) => invoke('find_project_files', { root: await ensureApproved(root), query }),
    summarizeProject: async ({ root }) => invoke('summarize_project', { root: await ensureApproved(root) }),
    saveTasks: ({ tasks }) => invoke('save_task_list', { tasks }),
    launchApprovedApp: ({ app, root }) => invoke('launch_approved_app', { name: app, root })
  };
})();

const taskEngine = new TaskEngine({
  registry: createDefaultRegistry(companionApi),
  permissions: {
    request: async ({ skill, permissions }) => window.confirm(
      `Allow WISE Imp to run ${skill}?\\nPermissions: ${permissions.join(', ')}\\nNo shell commands or destructive actions are allowed.`
    )
  },
  onStatus: ({ status, detail }) => {
    if (status === TaskStatus.WORKING) { state.busy = true; setSprite('sit'); }
    if (status === TaskStatus.VERIFYING) setSprite('land');
    if (status === TaskStatus.SUCCESS) { state.busy = false; setSprite('click'); window.setTimeout(() => setSprite('idle'), 900); }
    if (status === TaskStatus.ERROR || status === TaskStatus.CANCELLED) { state.busy = false; setSprite('idle'); }
    showSpeech(detail || status, status === TaskStatus.WORKING ? 1600 : 2800);
  }
});

async function runProjectReview() {
  if (state.busy || state.dragging) return;
  const root = window.prompt('Enter the full path to the project folder to approve for this review.');
  if (!root?.trim()) { showSpeech('No project folder was selected.'); return; }
  stopScheduler();
  try {
    const completed = await taskEngine.run('project.review', { root: root.trim() });
    showSpeech(completed.verification.message, 4200);
    persistSettings();
  } catch (error) {
    showSpeech(error.message || 'Project review failed.', 4200);
  } finally {
    state.busy = false;
    if (!state.sleeping && !state.dragging) { setSprite('idle'); scheduleNext(1800); }
  }
}

boot();
