use crate::models::PingResult;
use std::process::Command;

/// Execute ping command and return result
pub fn ping_host(domain: &str) -> PingResult {
    let output = if cfg!(target_os = "windows") {
        // Windows: ping -n 3 domain
        Command::new("ping")
            .args(&["-n", "3", domain])
            .output()
    } else {
        // Unix: ping -c 3 domain
        Command::new("ping")
            .args(&["-c", "3", domain])
            .output()
    };
    
    match output {
        Ok(result) => {
            let stdout = String::from_utf8_lossy(&result.stdout);
            
            if result.status.success() {
                // Parse RTT from output
                if let Some(avg_rtt) = parse_ping_output(&stdout) {
                    PingResult {
                        success: true,
                        avg_rtt: Some(avg_rtt),
                        message: format!("{:.2}ms", avg_rtt),
                    }
                } else {
                    PingResult {
                        success: true,
                        avg_rtt: None,
                        message: "Success (RTT unknown)".to_string(),
                    }
                }
            } else {
                PingResult {
                    success: false,
                    avg_rtt: None,
                    message: "Timeout".to_string(),
                }
            }
        }
        Err(e) => PingResult {
            success: false,
            avg_rtt: None,
            message: format!("Error: {}", e),
        },
    }
}

/// Parse ping output to extract average RTT
fn parse_ping_output(output: &str) -> Option<f64> {
    // Windows: "Average = 46ms" or "평균 = 46ms"
    // Unix: "rtt min/avg/max/mdev = 0.123/0.456/0.789/0.123 ms"
    
    if cfg!(target_os = "windows") {
        // Try English format
        if let Some(avg_line) = output.lines().find(|line| line.contains("Average")) {
            let parts: Vec<&str> = avg_line.split('=').collect();
            if parts.len() >= 2 {
                let value_str = parts[1].trim().trim_end_matches("ms").trim();
                return value_str.parse::<f64>().ok();
            }
        }
        
        // Try Korean format (평균)
        if let Some(avg_line) = output.lines().find(|line| line.contains("평균")) {
            let parts: Vec<&str> = avg_line.split('=').collect();
            if parts.len() >= 2 {
                let value_str = parts[1].trim().trim_end_matches("ms").trim();
                return value_str.parse::<f64>().ok();
            }
        }
    } else {
        // Unix format: look for "rtt min/avg/max/mdev"
        if let Some(rtt_line) = output.lines().find(|line| line.contains("rtt")) {
            let parts: Vec<&str> = rtt_line.split('=').collect();
            if parts.len() >= 2 {
                let values: Vec<&str> = parts[1].trim().split('/').collect();
                if values.len() >= 2 {
                    // Second value is average
                    return values[1].parse::<f64>().ok();
                }
            }
        }
    }
    
    None
}
