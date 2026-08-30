const STORAGE_KEY = 'wise-imp-desktop-settings';

export const isTauri = Boolean(window.__TAURI_INTERNALS__);

let tauriInvoke = null;
let mouseDown = false;
let webX = Math.max(24, Math.round(window.innerWidth / 2 - 150));
let webY = Math.max(24, Math.round(window.innerHeight / 2 - 150));
let webWidth = 300;
let webHeight = 300;

window.addEventListener('pointerdown', (event) => {
  if (event.button === 0) mouseDown = true;
});
window.addEventListener('pointerup', (event) => {
  if (event.button === 0) mouseDown = false;
});
window.addEventListener('pointercancel', () => {
  mouseDown = false;
});

async function nativeInvoke(cmd, args) {
  if (!tauriInvoke) {
    const mod = await import('@tauri-apps/api/core');
    tauriInvoke = mod.invoke;
  }
  return tauriInvoke(cmd, args);
}

function readWebSettings() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null') || {};
  } catch {
    return {};
  }
}

function stageEl() {
  return document.querySelector('#pet-stage');
}

function applyWebPosition() {
  const stage = stageEl();
  if (!stage) return;
  stage.style.left = `${webX}px`;
  stage.style.top = `${webY}px`;
  stage.style.width = `${webWidth}px`;
  stage.style.height = `${webHeight}px`;
}

function webWorkArea() {
  return {
    x: 0,
    y: 0,
    width: Math.max(webWidth, window.innerWidth),
    height: Math.max(webHeight, window.innerHeight)
  };
}

async function webInvoke(cmd, args = {}) {
  switch (cmd) {
    case 'get_work_area':
      return webWorkArea();
    case 'get_window_size':
      return { width: webWidth, height: webHeight };
    case 'get_window_position':
      return { x: webX, y: webY };
    case 'set_window_position':
      webX = args.x;
      webY = args.y;
      applyWebPosition();
      return;
    case 'start_window_drag':
      return;
    case 'left_mouse_down':
      return mouseDown;
    case 'load_settings':
      return {
        wanderEnabled: true,
        alwaysOnTop: true,
        soundEnabled: false,
        width: 300,
        ...readWebSettings()
      };
    case 'save_settings':
      localStorage.setItem(STORAGE_KEY, JSON.stringify(args.settings || {}));
      return;
    case 'set_always_on_top':
      return;
    case 'close_app': {
      const stage = stageEl();
      if (stage) stage.hidden = true;
      const status = document.querySelector('#imp-status');
      if (status) {
        status.hidden = false;
        status.textContent = 'Imp dismissed. Refresh to bring it back.';
      }
      return;
    }
    default:
      throw new Error(`Unknown web command: ${cmd}`);
  }
}

export function invoke(cmd, args) {
  if (isTauri) return nativeInvoke(cmd, args);
  return webInvoke(cmd, args);
}

export async function followPointerUntilRelease(onMove) {
  if (isTauri) {
    await invoke('start_window_drag');
    for (let i = 0; i < 600; i += 1) {
      if (!(await invoke('left_mouse_down'))) return;
      await new Promise((resolve) => setTimeout(resolve, 16));
    }
    return;
  }

  await new Promise((resolve) => {
    const move = (event) => {
      onMove(event.clientX, event.clientY);
    };
    const up = (event) => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      onMove(event.clientX, event.clientY);
      resolve();
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  });
}

export function bootPlatform() {
  document.documentElement.classList.toggle('tauri', isTauri);
  document.documentElement.classList.toggle('web', !isTauri);
  document.body.classList.toggle('tauri', isTauri);
  document.body.classList.toggle('web', !isTauri);
  const product = document.querySelector('#product');
  if (product) product.hidden = isTauri;
  if (!isTauri) {
    const saved = readWebSettings();
    if (Number.isFinite(saved.x) && Number.isFinite(saved.y)) {
      webX = saved.x;
      webY = saved.y;
    }
    applyWebPosition();
  }
}
