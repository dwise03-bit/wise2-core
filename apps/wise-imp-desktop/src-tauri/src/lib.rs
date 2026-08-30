use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use tauri::menu::{Menu, MenuItem};
use tauri::tray::TrayIconBuilder;
use tauri::{Manager, PhysicalPosition, PhysicalSize};

#[cfg(windows)]
#[link(name = "user32")]
extern "system" {
  fn GetAsyncKeyState(v_key: i32) -> i16;
}

#[cfg(target_os = "macos")]
#[link(name = "CoreGraphics", kind = "framework")]
extern "C" {
  fn CGEventSourceButtonState(state_id: u32, button: u32) -> bool;
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(default, rename_all = "camelCase")]
struct Settings {
  x: Option<i32>,
  y: Option<i32>,
  width: u32,
  wander_enabled: bool,
  always_on_top: bool,
  sound_enabled: bool,
}

impl Default for Settings {
  fn default() -> Self {
    Self {
      x: None,
      y: None,
      width: 300,
      wander_enabled: true,
      always_on_top: true,
      sound_enabled: false,
    }
  }
}

#[derive(Serialize)]
struct Rect {
  x: i32,
  y: i32,
  width: u32,
  height: u32,
}

#[derive(Serialize)]
struct Point {
  x: i32,
  y: i32,
}

#[derive(Serialize)]
struct Size {
  width: u32,
  height: u32,
}

fn settings_path(app: &tauri::AppHandle) -> Result<PathBuf, String> {
  let dir = app.path().app_data_dir().map_err(|e| e.to_string())?;
  std::fs::create_dir_all(&dir).map_err(|e| e.to_string())?;
  Ok(dir.join("settings.json"))
}

fn read_settings(app: &tauri::AppHandle) -> Settings {
  let Ok(path) = settings_path(app) else {
    return Settings::default();
  };
  let Ok(raw) = std::fs::read_to_string(path) else {
    return Settings::default();
  };
  serde_json::from_str(&raw).unwrap_or_default()
}

fn write_settings(app: &tauri::AppHandle, settings: &Settings) -> Result<(), String> {
  let path = settings_path(app)?;
  let raw = serde_json::to_string_pretty(settings).map_err(|e| e.to_string())?;
  std::fs::write(path, raw).map_err(|e| e.to_string())
}

fn work_area_for(window: &tauri::WebviewWindow) -> Result<Rect, String> {
  let monitor = window
    .current_monitor()
    .map_err(|e| e.to_string())?
    .or_else(|| window.primary_monitor().ok().flatten())
    .ok_or_else(|| "No monitor detected".to_string())?;
  let work = monitor.work_area();
  Ok(Rect {
    x: work.position.x,
    y: work.position.y,
    width: work.size.width,
    height: work.size.height,
  })
}

fn position_on_a_monitor(window: &tauri::WebviewWindow, x: i32, y: i32, width: u32, height: u32) -> bool {
  let Ok(monitors) = window.available_monitors() else {
    return false;
  };
  let pet_right = x + width as i32;
  let pet_bottom = y + height as i32;
  monitors.iter().any(|monitor| {
    let work = monitor.work_area();
    let left = work.position.x;
    let top = work.position.y;
    let right = left + work.size.width as i32;
    let bottom = top + work.size.height as i32;
    x < right && pet_right > left && y < bottom && pet_bottom > top
  })
}

fn center_on_work_area(window: &tauri::WebviewWindow, width: u32, height: u32) -> Result<(i32, i32), String> {
  let area = work_area_for(window)?;
  let x = area.x + (area.width as i32 - width as i32).max(0) / 2;
  let y = area.y + (area.height as i32 - height as i32).max(0) / 2;
  Ok((x, y))
}

fn restore_window(window: &tauri::WebviewWindow, settings: &Settings) -> Result<(), String> {
  let _ = window.set_skip_taskbar(true);
  let _ = window.set_shadow(false);
  let _ = window.set_always_on_top(settings.always_on_top);

  let logical_width = settings.width.clamp(180, 420);
  let _ = window.set_size(tauri::LogicalSize::new(logical_width as f64, logical_width as f64));

  let physical = window.outer_size().unwrap_or(PhysicalSize::new(logical_width, logical_width));
  let (x, y) = match (settings.x, settings.y) {
    (Some(x), Some(y)) if position_on_a_monitor(window, x, y, physical.width, physical.height) => (x, y),
    _ => center_on_work_area(window, physical.width, physical.height)?,
  };
  window
    .set_position(PhysicalPosition::new(x, y))
    .map_err(|e| e.to_string())?;
  window.show().map_err(|e| e.to_string())?;
  Ok(())
}

fn setup_tray(app: &tauri::App) -> Result<(), Box<dyn std::error::Error>> {
  let show = MenuItem::with_id(app, "show", "Show", true, None::<&str>)?;
  let hide = MenuItem::with_id(app, "hide", "Hide", true, None::<&str>)?;
  let quit = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
  let menu = Menu::with_items(app, &[&show, &hide, &quit])?;
  let icon = app
    .default_window_icon()
    .cloned()
    .ok_or("Missing default window icon")?;

  TrayIconBuilder::with_id("wise-imp-tray")
    .icon(icon)
    .menu(&menu)
    .tooltip("WISE Imp")
    .show_menu_on_left_click(true)
    .on_menu_event(|app, event| {
      let Some(window) = app.get_webview_window("main") else {
        if event.id().as_ref() == "quit" {
          app.exit(0);
        }
        return;
      };
      match event.id().as_ref() {
        "show" => {
          let _ = window.show();
          let _ = window.set_focus();
          let _ = window.set_skip_taskbar(true);
        }
        "hide" => {
          let _ = window.hide();
        }
        "quit" => app.exit(0),
        _ => {}
      }
    })
    .build(app)?;
  Ok(())
}

#[tauri::command]
fn set_window_position(window: tauri::WebviewWindow, x: i32, y: i32) -> Result<(), String> {
  window
    .set_position(PhysicalPosition::new(x, y))
    .map_err(|e| e.to_string())
}

#[tauri::command]
fn get_window_position(window: tauri::WebviewWindow) -> Result<Point, String> {
  let p = window.outer_position().map_err(|e| e.to_string())?;
  Ok(Point { x: p.x, y: p.y })
}

#[tauri::command]
fn get_window_size(window: tauri::WebviewWindow) -> Result<Size, String> {
  let s = window.outer_size().map_err(|e| e.to_string())?;
  Ok(Size {
    width: s.width,
    height: s.height,
  })
}

#[tauri::command]
fn start_window_drag(window: tauri::WebviewWindow) -> Result<(), String> {
  window.start_dragging().map_err(|e| e.to_string())
}

#[tauri::command]
fn get_work_area(window: tauri::WebviewWindow) -> Result<Rect, String> {
  work_area_for(&window)
}

#[tauri::command]
fn load_settings(app: tauri::AppHandle) -> Settings {
  read_settings(&app)
}

#[tauri::command]
fn save_settings(app: tauri::AppHandle, settings: Settings) -> Result<(), String> {
  write_settings(&app, &settings)
}

#[tauri::command]
fn set_always_on_top(window: tauri::WebviewWindow, enabled: bool) -> Result<(), String> {
  window.set_always_on_top(enabled).map_err(|e| e.to_string())
}

#[tauri::command]
fn close_app(app: tauri::AppHandle) {
  app.exit(0);
}

#[tauri::command]
fn left_mouse_down() -> bool {
  platform_left_mouse_down()
}

#[cfg(windows)]
fn platform_left_mouse_down() -> bool {
  unsafe { GetAsyncKeyState(0x01) < 0 }
}

#[cfg(target_os = "macos")]
fn platform_left_mouse_down() -> bool {
  unsafe { CGEventSourceButtonState(1, 0) }
}

#[cfg(not(any(windows, target_os = "macos")))]
fn platform_left_mouse_down() -> bool {
  false
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![
      set_window_position,
      get_window_position,
      get_window_size,
      start_window_drag,
      get_work_area,
      load_settings,
      save_settings,
      set_always_on_top,
      close_app,
      left_mouse_down
    ])
    .setup(|app| {
      let settings = read_settings(app.handle());
      if let Some(window) = app.get_webview_window("main") {
        if let Err(err) = restore_window(&window, &settings) {
          eprintln!("WISE Imp restore failed: {err}");
          let _ = window.show();
        }
      }
      setup_tray(app)?;
      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running WISE Imp");
}
