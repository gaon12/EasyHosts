use crate::models::HostsData;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct ExportData {
    pub version: u32,
    pub timestamp: String,
    pub hosts_data: HostsData,
}

/// Export hosts data to JSON format
pub fn export_to_json(data: &HostsData) -> Result<String, String> {
    let export = ExportData {
        version: 1,
        timestamp: chrono::Local::now().to_rfc3339(),
        hosts_data: data.clone(),
    };
    
    serde_json::to_string_pretty(&export)
        .map_err(|e| format!("Failed to serialize to JSON: {}", e))
}

/// Import hosts data from JSON format
pub fn import_from_json(json_str: &str) -> Result<HostsData, String> {
    let export: ExportData = serde_json::from_str(json_str)
        .map_err(|e| format!("Failed to parse JSON: {}", e))?;
    
    // Version check (for future compatibility)
    if export.version > 1 {
        return Err(format!("Unsupported version: {}. Please update the application.", export.version));
    }
    
    Ok(export.hosts_data)
}

/// Export hosts data to hosts file format
pub fn export_to_hosts(data: &HostsData) -> String {
    crate::hosts::serialize_hosts(data)
}
