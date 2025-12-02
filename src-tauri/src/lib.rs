mod models;
mod hosts;
mod ping;
mod permissions;
mod import_export;
mod dns;
mod network;

use models::{HostsData, PingResult};
use hosts::BackupInfo;
use tauri::tray::{TrayIconBuilder, TrayIconEvent};
use tauri::Emitter;

// Tauri commands

#[tauri::command]
fn read_hosts() -> Result<HostsData, String> {
    let content = hosts::read_hosts_file()?;
    Ok(hosts::parse_hosts(&content))
}

#[tauri::command]
fn save_hosts(data: HostsData) -> Result<String, String> {
    // Create backup first
    let backup_path = hosts::backup_hosts_file()?;

    // Save new content
    hosts::save_hosts_file(&data)?;

    Ok(backup_path)
}

#[tauri::command]
fn ping_host(domain: String) -> PingResult {
    ping::ping_host(&domain)
}

#[tauri::command]
fn get_hosts_path() -> String {
    hosts::get_hosts_path().to_string_lossy().to_string()
}

#[tauri::command]
fn check_admin() -> bool {
    permissions::check_admin()
}

#[tauri::command]
fn request_elevation() -> Result<(), String> {
    permissions::request_elevation()
}

#[tauri::command]
fn export_to_json(data: HostsData) -> Result<String, String> {
    import_export::export_to_json(&data)
}

#[tauri::command]
fn import_from_json(json_str: String) -> Result<HostsData, String> {
    import_export::import_from_json(&json_str)
}

#[tauri::command]
fn export_to_hosts_format(data: HostsData) -> String {
    import_export::export_to_hosts(&data)
}

/// Parse arbitrary hosts file content into structured data.
/// Used by the raw edit mode and remote source import.
#[tauri::command]
fn parse_hosts_text(content: String) -> HostsData {
    hosts::parse_hosts(&content)
}

#[tauri::command]
fn reset_hosts_to_default() -> Result<(), String> {
    hosts::reset_hosts_to_default()
}

#[tauri::command]
fn lookup_dns(domain: String) -> Result<String, String> {
    dns::lookup_domain(&domain)
}

#[tauri::command]
fn flush_dns_cache() -> Result<(), String> {
    dns::flush_dns_cache()
}

#[tauri::command]
fn get_current_ssid() -> Result<Option<String>, String> {
    network::current_ssid()
}

#[tauri::command]
fn list_backups() -> Result<Vec<BackupInfo>, String> {
    hosts::list_backups()
}

#[tauri::command]
fn restore_backup(backup_path: String) -> Result<(), String> {
    hosts::restore_backup(backup_path)
}

#[tauri::command]
fn delete_backup(backup_path: String) -> Result<(), String> {
    hosts::delete_backup(backup_path)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .setup(|app| {
            // System tray with quick profile cycling (desktop only)
            #[cfg(desktop)]
            {
                let app_handle = app.handle();
                let app_for_tray = app_handle.clone();

                let _tray = TrayIconBuilder::new()
                    .tooltip("EasyHosts")
                    .on_tray_icon_event(move |_tray, event| {
                        if let TrayIconEvent::Click { .. } = event {
                            let _ = app_for_tray.emit("tray://cycle-profile", ());
                        }
                    })
                    .build(app_handle);

                if let Err(err) = _tray {
                    eprintln!("Failed to create tray icon: {}", err);
                }
            }

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            read_hosts,
            save_hosts,
            ping_host,
            get_hosts_path,
            check_admin,
            request_elevation,
            export_to_json,
            import_from_json,
            export_to_hosts_format,
            parse_hosts_text,
            reset_hosts_to_default,
            lookup_dns,
            flush_dns_cache,
            get_current_ssid,
            list_backups,
            restore_backup,
            delete_backup
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
