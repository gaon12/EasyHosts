use std::net::ToSocketAddrs;
use std::process::Command;

pub fn lookup_domain(domain: &str) -> Result<String, String> {
    // Add a dummy port to satisfy ToSocketAddrs
    let address = format!("{}:0", domain);

    match address.to_socket_addrs() {
        Ok(mut addrs) => {
            if let Some(addr) = addrs.next() {
                Ok(addr.ip().to_string())
            } else {
                Err("No IP address found for domain".to_string())
            }
        }
        Err(e) => Err(format!("DNS lookup failed: {}", e)),
    }
}

/// Best-effort DNS cache flush for the current platform.
/// This requires elevated privileges on most systems.
pub fn flush_dns_cache() -> Result<(), String> {
    #[cfg(target_os = "windows")]
    {
        let output = Command::new("ipconfig")
            .arg("/flushdns")
            .output()
            .map_err(|e| format!("Failed to run ipconfig /flushdns: {}", e))?;

        if output.status.success() {
            Ok(())
        } else {
            Err(format!(
                "ipconfig /flushdns failed: {}",
                String::from_utf8_lossy(&output.stderr)
            ))
        }
    }

    #[cfg(target_os = "macos")]
    {
        // macOS typically requires both commands
        let first = Command::new("dscacheutil")
            .arg("-flushcache")
            .status()
            .map_err(|e| format!("Failed to run dscacheutil -flushcache: {}", e))?;

        let second = Command::new("killall")
            .arg("-HUP")
            .arg("mDNSResponder")
            .status()
            .map_err(|e| format!("Failed to run killall -HUP mDNSResponder: {}", e))?;

        if first.success() && second.success() {
            Ok(())
        } else {
            Err("Failed to flush DNS cache on macOS".to_string())
        }
    }

    #[cfg(target_os = "linux")]
    {
        // Try several common DNS cache flush mechanisms.
        let candidates: &[(&str, &[&str])] = &[
            ("systemd-resolve", &["--flush-caches"]),
            ("resolvectl", &["flush-caches"]),
            ("service", &["nscd", "restart"]),
            ("systemctl", &["restart", "nscd"]),
        ];

        let mut last_error: Option<String> = None;

        for (cmd, args) in candidates {
            match Command::new(cmd).args(*args).status() {
                Ok(status) if status.success() => return Ok(()),
                Ok(status) => {
                    last_error = Some(format!(
                        "{} {:?} exited with status {}",
                        cmd, args, status
                    ));
                }
                Err(e) => {
                    last_error = Some(format!("Failed to run {} {:?}: {}", cmd, args, e));
                }
            }
        }

        Err(last_error.unwrap_or_else(|| {
            "DNS cache flush is not supported or tooling is missing on this system".to_string()
        }))
    }

    #[cfg(not(any(target_os = "windows", target_os = "macos", target_os = "linux")))]
    {
        Err("DNS cache flush is not supported on this platform".to_string())
    }
}
