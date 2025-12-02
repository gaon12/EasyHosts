use crate::models::{HostEntry, HostsData, Section};
use std::fs;
use std::path::PathBuf;
use serde::{Serialize, Deserialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct BackupInfo {
    pub filename: String,
    pub path: String,
    pub timestamp: String,
    pub size: u64,
}

/// Get the OS-specific hosts file path
pub fn get_hosts_path() -> PathBuf {
    #[cfg(target_os = "windows")]
    {
        PathBuf::from(r"C:\Windows\System32\drivers\etc\hosts")
    }
    
    #[cfg(not(target_os = "windows"))]
    {
        PathBuf::from("/etc/hosts")
    }
}

/// Read the hosts file and return raw content
pub fn read_hosts_file() -> Result<String, String> {
    let path = get_hosts_path();
    
    fs::read_to_string(&path)
        .map_err(|e| format!("Failed to read hosts file at {:?}: {}", path, e))
}

/// Parse hosts file content into structured data
pub fn parse_hosts(content: &str) -> HostsData {
    let mut entries = Vec::new();
    let mut sections = Vec::new();
    let mut pending_comment: Option<String> = None;
    
    for line in content.lines() {
        let trimmed = line.trim();
        
        // Skip empty lines
        if trimmed.is_empty() {
            continue;
        }
        
        // Check if it's a comment-only line
        if trimmed.starts_with('#') {
            let comment_text = trimmed[1..].trim();

            // Skip empty comments
            if comment_text.is_empty() {
                continue;
            }

            // Check if this looks like a section header
            // Only recognize as section if:
            // 1. Contains special markers (===, ---)
            // 2. Ends with colon AND has significant length (to avoid "For example:")
            // 3. Is marked explicitly (starts with "SECTION:" or similar)
            let is_section = comment_text.contains("===")
                || comment_text.contains("---")
                || (comment_text.ends_with(':') && comment_text.len() < 30 && !comment_text.to_lowercase().contains("example"))
                || comment_text.to_uppercase().starts_with("SECTION:");

            if is_section {
                sections.push(Section {
                    title: comment_text.to_string(),
                    enabled: true,
                });
                pending_comment = None;
            } else {
                // This is a standalone comment - save it for the next entry
                pending_comment = Some(comment_text.to_string());
            }
            continue;
        }
        
        // Parse entry line (enabled or disabled)
        let (is_enabled, working_line) = if trimmed.starts_with("# ") {
            (false, trimmed[2..].trim())
        } else {
            (true, trimmed)
        };
        
        // Split by whitespace and #
        let comment_split: Vec<&str> = working_line.splitn(2, '#').collect();
        let entry_part = comment_split[0].trim();
        let inline_comment = comment_split.get(1).map(|s| s.trim().to_string());
        
        // Skip if no entry part
        if entry_part.is_empty() {
            continue;
        }
        
        // Parse IP and domains
        let parts: Vec<&str> = entry_part.split_whitespace().collect();
        if parts.len() >= 2 {
            let ip = parts[0].to_string();
            let domains: Vec<String> = parts[1..].iter().map(|s| s.to_string()).collect();
            
            // Determine final comment: prefer pending_comment, then inline_comment
            let final_comment = pending_comment.take()
                .or(inline_comment);
            
            entries.push(HostEntry {
                enabled: is_enabled,
                ip,
                domains,
                comment: final_comment,
            });
        }
    }
    
    HostsData { entries, sections }
}

/// Convert HostsData back to hosts file format
pub fn serialize_hosts(data: &HostsData) -> String {
    let mut output = String::new();
    
    for entry in &data.entries {
        let prefix = if entry.enabled { "" } else { "# " };
        let domains = entry.domains.join(" ");
        let comment_part = entry.comment.as_ref()
            .map(|c| format!(" # {}", c))
            .unwrap_or_default();
        
        output.push_str(&format!("{}{} {}{}\n", prefix, entry.ip, domains, comment_part));
    }
    
    output
}

/// Create a backup of the hosts file with timestamp
pub fn backup_hosts_file() -> Result<String, String> {
    let path = get_hosts_path();
    let content = fs::read_to_string(&path)
        .map_err(|e| format!("Failed to read hosts file for backup: {}", e))?;
    
    // Create backup filename with timestamp
    let timestamp = chrono::Local::now().format("%Y%m%d_%H%M%S");
    let backup_path = path.parent()
        .ok_or("Failed to get parent directory")?
        .join(format!("hosts.bak_{}", timestamp));
    
    fs::write(&backup_path, content)
        .map_err(|e| format!("Failed to write backup file: {}", e))?;
    
    Ok(backup_path.to_string_lossy().to_string())
}

/// Save hosts data to file
pub fn save_hosts_file(data: &HostsData) -> Result<(), String> {
    let path = get_hosts_path();
    let content = serialize_hosts(data);

    fs::write(&path, content)
        .map_err(|e| format!("Failed to write hosts file: {}", e))
}

/// Reset hosts file to Windows default
#[cfg(target_os = "windows")]
pub fn reset_hosts_to_default() -> Result<(), String> {
    let default_content = r#"# Copyright (c) Microsoft Corp.
#
# This is a sample HOSTS file used by Microsoft TCP/IP for Windows.
#
# This file contains the mappings of IP addresses to host names. Each
# entry should be kept on an individual line. The IP address should
# be placed in the first column followed by the corresponding host name.
# The IP address and the host name should be separated by at least one
# space.
#
# Additionally, comments (such as these) may be inserted on individual
# lines or following the machine name denoted by a '#' symbol.
#
#
# For example:
#      102.54.94.97     rhino.acme.com          # source server
#       38.25.63.10     x.acme.com              # x client host

# localhost name resolution is handled within DNS itself.
#	127.0.0.1       localhost
#	::1             localhost
"#;

    // Create backup first
    backup_hosts_file()?;

    let path = get_hosts_path();
    fs::write(&path, default_content)
        .map_err(|e| format!("Failed to reset hosts file: {}", e))
}

#[cfg(not(target_os = "windows"))]
pub fn reset_hosts_to_default() -> Result<(), String> {
    Err("Reset to default is only supported on Windows".to_string())
}

/// List all backup files
pub fn list_backups() -> Result<Vec<BackupInfo>, String> {
    let path = get_hosts_path();
    let dir = path.parent()
        .ok_or("Failed to get parent directory")?;

    let mut backups = Vec::new();

    let entries = fs::read_dir(dir)
        .map_err(|e| format!("Failed to read directory: {}", e))?;

    for entry in entries {
        let entry = entry.map_err(|e| format!("Failed to read entry: {}", e))?;
        let filename = entry.file_name().to_string_lossy().to_string();

        if filename.starts_with("hosts.bak_") {
            let metadata = entry.metadata()
                .map_err(|e| format!("Failed to get metadata: {}", e))?;

            // Extract timestamp from filename (hosts.bak_YYYYMMDD_HHMMSS)
            let timestamp = filename.replace("hosts.bak_", "");

            backups.push(BackupInfo {
                filename,
                path: entry.path().to_string_lossy().to_string(),
                timestamp,
                size: metadata.len(),
            });
        }
    }

    // Sort by timestamp descending (newest first)
    backups.sort_by(|a, b| b.timestamp.cmp(&a.timestamp));

    Ok(backups)
}

/// Restore hosts file from a backup
pub fn restore_backup(backup_path: String) -> Result<(), String> {
    // Create a backup of current state first
    backup_hosts_file()?;

    // Read backup content
    let backup_content = fs::read_to_string(&backup_path)
        .map_err(|e| format!("Failed to read backup file: {}", e))?;

    // Write to hosts file
    let hosts_path = get_hosts_path();
    fs::write(&hosts_path, backup_content)
        .map_err(|e| format!("Failed to restore hosts file: {}", e))?;

    Ok(())
}

/// Delete a backup file
pub fn delete_backup(backup_path: String) -> Result<(), String> {
    fs::remove_file(&backup_path)
        .map_err(|e| format!("Failed to delete backup file: {}", e))
}
