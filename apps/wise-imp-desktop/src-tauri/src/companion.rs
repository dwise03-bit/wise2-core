use serde::{Deserialize, Serialize};
use std::fs;
use std::path::{Path, PathBuf};
use std::process::Command;
use tauri::Manager;

const MAX_FILES: usize = 500;
const MAX_READ_BYTES: u64 = 24 * 1024;
const BLOCKED_DIRS: [&str; 5] = [".git", "node_modules", "target", "dist", "build"];

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
struct CompanionStore {
  approved_roots: Vec<String>,
  tasks: Vec<TaskItem>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TaskItem {
  pub title: String,
  #[serde(default)]
  pub done: bool,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct FilesResult { pub files: Vec<String> }

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SummaryResult { pub summary: String, pub inspected_files: Vec<String> }

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SaveTasksResult { pub saved: bool, pub tasks: Vec<TaskItem> }

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct LaunchResult { pub launched: bool, pub app: String }

fn store_path(app: &tauri::AppHandle) -> Result<PathBuf, String> {
  let dir = app.path().app_data_dir().map_err(|e| e.to_string())?;
  fs::create_dir_all(&dir).map_err(|e| e.to_string())?;
  Ok(dir.join("companion-store.json"))
}

fn load_store(app: &tauri::AppHandle) -> CompanionStore {
  store_path(app).ok()
    .and_then(|path| fs::read_to_string(path).ok())
    .and_then(|raw| serde_json::from_str(&raw).ok())
    .unwrap_or_default()
}

fn save_store(app: &tauri::AppHandle, store: &CompanionStore) -> Result<(), String> {
  let path = store_path(app)?;
  fs::write(path, serde_json::to_vec_pretty(store).map_err(|e| e.to_string())?).map_err(|e| e.to_string())
}

fn canonical_directory(root: &str) -> Result<PathBuf, String> {
  let path = fs::canonicalize(root).map_err(|_| "The selected project folder does not exist.".to_string())?;
  if !path.is_dir() { return Err("The selected path is not a folder.".to_string()); }
  Ok(path)
}

fn approved_root(app: &tauri::AppHandle, root: &str) -> Result<PathBuf, String> {
  let path = canonical_directory(root)?;
  let normalized = path.to_string_lossy().to_string();
  if !load_store(app).approved_roots.iter().any(|entry| entry == &normalized) {
    return Err("This folder is not approved. No files were read.".to_string());
  }
  Ok(path)
}

fn collect_files(root: &Path, query: &str, out: &mut Vec<String>) -> Result<(), String> {
  if out.len() >= MAX_FILES { return Ok(()); }
  for entry in fs::read_dir(root).map_err(|e| e.to_string())? {
    if out.len() >= MAX_FILES { break; }
    let entry = entry.map_err(|e| e.to_string())?;
    let path = entry.path();
    if path.is_dir() {
      let name = path.file_name().and_then(|v| v.to_str()).unwrap_or_default();
      if !BLOCKED_DIRS.contains(&name) { collect_files(&path, query, out)?; }
    } else if path.is_file() {
      let candidate = path.to_string_lossy();
      if query.is_empty() || candidate.to_lowercase().contains(query) { out.push(candidate.to_string()); }
    }
  }
  Ok(())
}

#[tauri::command]
pub fn approve_project_root(app: tauri::AppHandle, root: String) -> Result<String, String> {
  let path = canonical_directory(&root)?;
  let normalized = path.to_string_lossy().to_string();
  let mut store = load_store(&app);
  if !store.approved_roots.contains(&normalized) { store.approved_roots.push(normalized.clone()); save_store(&app, &store)?; }
  Ok(normalized)
}

#[tauri::command]
pub fn find_project_files(app: tauri::AppHandle, root: String, query: Option<String>) -> Result<FilesResult, String> {
  let root = approved_root(&app, &root)?;
  let mut files = Vec::new();
  collect_files(&root, &query.unwrap_or_default().to_lowercase(), &mut files)?;
  Ok(FilesResult { files })
}

#[tauri::command]
pub fn summarize_project(app: tauri::AppHandle, root: String) -> Result<SummaryResult, String> {
  let root = approved_root(&app, &root)?;
  let mut files = Vec::new();
  collect_files(&root, "", &mut files)?;
  let important: Vec<String> = files.iter().filter(|file| {
    let name = Path::new(file).file_name().and_then(|v| v.to_str()).unwrap_or_default().to_lowercase();
    matches!(name.as_str(), "readme.md" | "package.json" | "cargo.toml" | "pyproject.toml" | "go.mod")
  }).take(8).cloned().collect();
  let mut facts = Vec::new();
  for file in &important {
    if fs::metadata(file).map(|m| m.len() <= MAX_READ_BYTES).unwrap_or(false) {
      if let Ok(text) = fs::read_to_string(file) {
        let first = text.lines().find(|line| !line.trim().is_empty()).unwrap_or("").trim();
        if !first.is_empty() { facts.push(format!("{}: {}", Path::new(file).file_name().unwrap_or_default().to_string_lossy(), first)); }
      }
    }
  }
  let summary = format!("Inspected {} permitted file(s).{}{}", files.len(),
    if important.is_empty() { " No standard project manifest was found." } else { " Key project files were found." },
    if facts.is_empty() { String::new() } else { format!(" {}", facts.join(" | ")) });
  Ok(SummaryResult { summary, inspected_files: important })
}

#[tauri::command]
pub fn save_task_list(app: tauri::AppHandle, tasks: Vec<TaskItem>) -> Result<SaveTasksResult, String> {
  if tasks.len() > 200 || tasks.iter().any(|task| task.title.trim().is_empty() || task.title.len() > 240) {
    return Err("Task list is invalid.".to_string());
  }
  let mut store = load_store(&app);
  store.tasks = tasks;
  save_store(&app, &store)?;
  Ok(SaveTasksResult { saved: true, tasks: load_store(&app).tasks })
}

#[tauri::command]
pub fn launch_approved_app(app: tauri::AppHandle, name: String, root: Option<String>) -> Result<LaunchResult, String> {
  #[cfg(windows)]
  {
    match name.as_str() {
      "explorer" => {
        let root = root.ok_or("Choose an approved project folder first.")?;
        let path = approved_root(&app, &root)?;
        Command::new("explorer.exe").arg(path).spawn().map_err(|e| e.to_string())?;
      }
      "notepad" => { Command::new("notepad.exe").spawn().map_err(|e| e.to_string())?; }
      _ => return Err("This application is not allowlisted.".to_string()),
    }
    Ok(LaunchResult { launched: true, app: name })
  }
  #[cfg(not(windows))]
  {
    let _ = (app, name, root);
    Err("Approved app launch is available only on Windows.".to_string())
  }
}