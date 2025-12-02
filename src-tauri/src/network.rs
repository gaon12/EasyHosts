use std::process::Command;

/// Best-effort retrieval of the current Wi-Fi SSID.
/// Returns Ok(Some(ssid)) if detected, Ok(None) if not connected
/// or detection failed gracefully, and Err on hard failures.
pub fn current_ssid() -> Result<Option<String>, String> {
    #[cfg(target_os = "windows")]
    {
        return current_ssid_windows();
    }

    #[cfg(target_os = "macos")]
    {
        return current_ssid_macos();
    }

    #[cfg(target_os = "linux")]
    {
        return current_ssid_linux();
    }

    #[cfg(not(any(target_os = "windows", target_os = "macos", target_os = "linux")))]
    {
        Err("SSID detection is not supported on this platform".to_string())
    }
}

#[cfg(target_os = "windows")]
fn current_ssid_windows() -> Result<Option<String>, String> {
    let output = Command::new("netsh")
        .args(["wlan", "show", "interfaces"])
        .output()
        .map_err(|e| format!("Failed to run netsh: {}", e))?;

    if !output.status.success() {
        return Err(format!(
            "netsh returned non-zero exit code: {}",
            output.status
        ));
    }

    let stdout = String::from_utf8_lossy(&output.stdout);
    for line in stdout.lines() {
        let trimmed = line.trim();
        if trimmed.starts_with("SSID") {
            // Example: "SSID                   : MyWifi"
            if let Some(idx) = trimmed.find(':') {
                let ssid = trimmed[idx + 1..].trim();
                if !ssid.is_empty() && ssid != "SSID" {
                    return Ok(Some(ssid.to_string()));
                }
            }
        }
    }

    Ok(None)
}

#[cfg(target_os = "macos")]
fn current_ssid_macos() -> Result<Option<String>, String> {
    // Try the `airport` utility first
    let output = Command::new("/System/Library/PrivateFrameworks/Apple80211.framework/Versions/Current/Resources/airport")
        .arg("-I")
        .output();

    if let Ok(out) = output {
        if out.status.success() {
            let stdout = String::from_utf8_lossy(&out.stdout);
            for line in stdout.lines() {
                let trimmed = line.trim();
                if trimmed.starts_with("SSID:") {
                    let ssid = trimmed.trim_start_matches("SSID:").trim();
                    if !ssid.is_empty() {
                        return Ok(Some(ssid.to_string()));
                    }
                }
            }
        }
    }

    // Fallback to networksetup on en0
    let output = Command::new("networksetup")
        .args(["-getairportnetwork", "en0"])
        .output()
        .map_err(|e| format!("Failed to run networksetup: {}", e))?;

    if !output.status.success() {
        return Ok(None);
    }

    let stdout = String::from_utf8_lossy(&output.stdout);
    // Example: "Current Wi-Fi Network: MyWifi"
    if let Some(idx) = stdout.find(':') {
        let ssid = stdout[idx + 1..].trim();
        if !ssid.is_empty() {
            return Ok(Some(ssid.to_string()));
        }
    }

    Ok(None)
}

#[cfg(target_os = "linux")]
fn current_ssid_linux() -> Result<Option<String>, String> {
    // Try NetworkManager's nmcli
    if let Ok(output) = Command::new("nmcli")
        .args(["-t", "-f", "active,ssid", "dev", "wifi"])
        .output()
    {
        if output.status.success() {
            let stdout = String::from_utf8_lossy(&output.stdout);
            for line in stdout.lines() {
                // Format: "yes:MyWifi" or "no:Other"
                let parts: Vec<&str> = line.split(':').collect();
                if parts.len() >= 2 && parts[0] == "yes" {
                    let ssid = parts[1].trim();
                    if !ssid.is_empty() {
                        return Ok(Some(ssid.to_string()));
                    }
                }
            }
        }
    }

    // Fallback to iwgetid -r
    if let Ok(output) = Command::new("iwgetid").arg("-r").output() {
        if output.status.success() {
            let stdout = String::from_utf8_lossy(&output.stdout);
            let ssid = stdout.trim();
            if !ssid.is_empty() {
                return Ok(Some(ssid.to_string()));
            }
        }
    }

    Ok(None)
}

