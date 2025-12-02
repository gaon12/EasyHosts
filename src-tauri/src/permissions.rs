/// Check if the application is running with administrator/root privileges
pub fn check_admin() -> bool {
    #[cfg(target_os = "windows")]
    {
        check_admin_windows()
    }
    
    #[cfg(not(target_os = "windows"))]
    {
        check_admin_unix()
    }
}

#[cfg(target_os = "windows")]
fn check_admin_windows() -> bool {
    // Try to open hosts file with write access
    // If successful, we have admin privileges
    let hosts_path = super::hosts::get_hosts_path();
    
    match std::fs::OpenOptions::new()
        .write(true)
        .append(true)
        .open(&hosts_path)
    {
        Ok(_) => true,
        Err(_) => false,
    }
}

#[cfg(not(target_os = "windows"))]
fn check_admin_unix() -> bool {
    unsafe {
        libc::geteuid() == 0
    }
}

/// Request elevation by restarting the application with admin privileges
pub fn request_elevation() -> Result<(), String> {
    #[cfg(target_os = "windows")]
    {
        request_elevation_windows()
    }
    
    #[cfg(not(target_os = "windows"))]
    {
        Err("Elevation request not implemented for this platform. Please restart manually with sudo.".to_string())
    }
}

#[cfg(target_os = "windows")]
fn request_elevation_windows() -> Result<(), String> {
    use std::process::Command;
    use std::env;
    
    // Get the current executable path
    let exe_path = env::current_exe()
        .map_err(|e| format!("Failed to get executable path: {}", e))?;
    
    // Use PowerShell Start-Process with -Verb RunAs to request UAC elevation
    let _status = Command::new("powershell")
        .args(&[
            "-Command",
            &format!("Start-Process -FilePath '{}' -Verb RunAs", exe_path.display())
        ])
        .spawn()
        .map_err(|e| format!("Failed to spawn elevation request: {}", e))?;
    
    // Exit current non-elevated instance
    std::process::exit(0);
}
