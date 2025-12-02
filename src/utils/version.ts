import packageJson from '../../package.json';

export const CURRENT_DATA_VERSION = '1.0.0';

export interface VersionInfo {
  app: string;
  data: string;
}

export function getVersionInfo(): VersionInfo {
  return {
    app: packageJson.version,
    data: CURRENT_DATA_VERSION,
  };
}

export function isCompatibleDataVersion(version?: string): boolean {
  if (!version) {
    // Legacy data without version field
    return true;
  }

  const [major] = version.split('.').map(Number);
  const [currentMajor] = CURRENT_DATA_VERSION.split('.').map(Number);

  // Compatible if major version matches
  return major === currentMajor;
}

export function migrateDataIfNeeded(data: any): any {
  // Add migration logic here for future versions
  if (!data.version) {
    // Legacy data - add version field
    return {
      ...data,
      version: CURRENT_DATA_VERSION,
    };
  }

  return data;
}
