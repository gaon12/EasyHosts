export interface HostEntry {
  enabled: boolean;
  ip: string;
  domains: string[];
  comment?: string;
  tags?: string[]; // BETA-08: 태그 기능
}

export interface Section {
  title: string;
  enabled: boolean;
}

export interface HostsData {
  entries: HostEntry[];
  sections: Section[];
}

export interface PingResult {
  success: boolean;
  avg_rtt?: number;
  message: string;
}

// BETA-01: 프로파일 관리
export interface Profile {
  id: string;
  name: string;
  description?: string;
  hostsData: HostsData;
  createdAt: string;
  updatedAt: string;
}

export interface ProfileList {
  profiles: Profile[];
  activeProfileId: string | null;
}

// BETA-03: 백업 관리
export interface BackupInfo {
  filename: string;
  path: string;
  timestamp: string;
  size: number;
}

// BETA-02: 중복/충돌 감지
export interface DuplicateEntry {
  domain: string;
  entries: Array<{
    index: number;
    ip: string;
  }>;
}
