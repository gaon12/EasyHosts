use std::net::ToSocketAddrs;

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
        Err(e) => Err(format!("DNS lookup failed: {}", e))
    }
}
