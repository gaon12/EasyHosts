export type Platform = 'windows' | 'linux' | 'macos' | 'unknown';

export function getPlatform(): Platform {
  const userAgent = navigator.userAgent.toLowerCase();
  const platform = navigator.platform.toLowerCase();

  if (platform.includes('win')) {
    return 'windows';
  } else if (platform.includes('linux')) {
    return 'linux';
  } else if (platform.includes('mac')) {
    return 'macos';
  }

  // Fallback detection
  if (userAgent.includes('windows') || userAgent.includes('win')) {
    return 'windows';
  } else if (userAgent.includes('linux')) {
    return 'linux';
  } else if (userAgent.includes('mac')) {
    return 'macos';
  }

  return 'unknown';
}

export function getHostsFilePath(platform: Platform): string {
  switch (platform) {
    case 'windows':
      return 'C:\\Windows\\System32\\drivers\\etc\\hosts';
    case 'linux':
    case 'macos':
      return '/etc/hosts';
    default:
      return '/etc/hosts';
  }
}

export function getAdminRequirementMessage(platform: Platform): string {
  switch (platform) {
    case 'windows':
      return 'Run as Administrator';
    case 'linux':
      return 'Run with sudo or as root';
    case 'macos':
      return 'Run with sudo privileges';
    default:
      return 'Run with elevated privileges';
  }
}

export function getPlatformDisplayName(platform: Platform): string {
  switch (platform) {
    case 'windows':
      return 'Windows';
    case 'linux':
      return 'Linux';
    case 'macos':
      return 'macOS';
    default:
      return 'Unknown';
  }
}
