import { TranslationKeys } from './en';

export const ko: TranslationKeys = {
  // Common
  common: {
    save: '저장',
    cancel: '취소',
    close: '닫기',
    delete: '삭제',
    edit: '편집',
    add: '추가',
    import: '가져오기',
    export: '내보내기',
    loading: '로딩 중...',
    search: '검색',
    filter: '필터',
    clear: '지우기',
    test: '테스트',
    restore: '복원',
    create: '생성',
    saveChanges: '변경사항 저장',
  },

  // Header
  header: {
    title: 'Easy Hosts',
    settings: '설정',
  },

  // Search Bar
  searchBar: {
    placeholder: 'IP 또는 도메인 검색...',
    addEntry: '항목 추가',
    filterByTags: '태그로 필터:',
    clearFilters: '필터 지우기',
    untaggedEntries: '태그 없는 항목 (자동 생성)',
  },

  // Entry Card
  entryCard: {
    noDomain: '도메인 없음',
    allDomains: '모든 도메인:',
    pingTest: 'Ping 테스트',
    testing: '테스트 중...',
  },

  // Add Entry Modal
  addEntry: {
    title: '새 항목 추가',
    editTitle: '항목 편집',
    subtitle: 'hosts 파일 항목을 설정하세요',
    ipAddress: 'IP 주소',
    ipPlaceholder: '127.0.0.1 또는 ::1',
    domains: '도메인',
    domainsPlaceholder: 'example.com 또는 multiple.com domains.com',
    domainsHelp: '여러 도메인은 공백으로 구분하세요',
    comment: '설명 (선택사항)',
    commentPlaceholder: '로컬 개발 서버',
    tags: '태그 (선택사항)',
    tagsPlaceholder: 'dev, api, frontend',
    tagsHelp: '여러 태그는 쉼표로 구분하세요',
    lookupHelp: '아래에 도메인을 입력한 후 조회를 클릭하여 IP 자동 입력 (도메인 → IP)',
    saveChanges: '변경사항 저장',
    addEntry: '항목 추가',
    errors: {
      invalidIp: '올바른 IPv4 또는 IPv6 주소를 입력하세요',
      invalidDomains: '올바른 도메인 이름을 입력하세요. 각 도메인은 1-253자여야 합니다.',
      enterDomainFirst: '먼저 도메인을 입력하세요',
      dnsLookupFailed: 'DNS 조회 실패:',
      tooManyDomains: '도메인이 너무 많습니다. 최대 100개까지 가능합니다.',
      tooManyTags: '태그가 너무 많습니다. 최대 20개까지 가능합니다.',
    },
  },

  // Settings Modal
  settings: {
    title: '설정',
    subtitle: '애플리케이션 설정 및 도구',
    aboutTitle: 'Easy Hosts 정보',
    version: '버전:',
    platform: '플랫폼:',
    description: '현대적인 hosts 파일 관리자',

    appearance: '외관',
    switchToDark: '다크 모드로 전환',
    switchToLight: '라이트 모드로 전환',

    compactView: '항목을 간단한 리스트 뷰로 표시',
    compactViewDescription: '카드 대신 테이블 형태의 간단한 리스트로 렌더링합니다. 수백~수천 개의 항목이 있을 때 권장됩니다.',

    language: '언어',
    languageDescription: '선호하는 언어를 선택하세요',

    editTools: '편집 도구',
    undo: '실행 취소 (Ctrl+Z)',
    redo: '다시 실행 (Ctrl+Y)',

    dataManagement: '데이터 관리',
    manageProfiles: '프로파일 관리',
    manageRemoteSources: '원격 소스 관리',
    manageBackups: '백업 관리',

    network: '네트워크',
    autoFlushDns: '저장 후 DNS 캐시 자동 초기화',
    autoFlushDnsDescription: 'hosts 파일을 저장한 뒤 ipconfig /flushdns 등의 명령을 실행하여 DNS 해석 결과를 새로 고칩니다.',
    autoSwitchBySsid: 'Wi-Fi SSID에 따라 프로파일 자동 전환',
    autoSwitchBySsidDescription: '현재 Wi-Fi SSID를 주기적으로 감지하고 아래 규칙에 따라 프로파일을 활성화합니다. (실제 hosts 저장은 여전히 "변경사항 저장"을 눌러야 합니다.)',
    ssidRulesTitle: 'SSID → 프로파일 규칙',
    ssidRulesNoProfiles: '프로파일이 없습니다. 먼저 프로파일을 생성한 뒤 Wi-Fi에 연결하세요.',
    ssidRulesEmpty: 'SSID 규칙이 없습니다. Wi-Fi 이름과 프로파일을 매핑해 보세요.',
    ssidRulesAdd: '규칙 추가 / 업데이트',
    ssidPlaceholder: 'Wi-Fi SSID (예: Office-WiFi)',
    ssidProfileSelect: '활성화할 프로파일 선택',
    unknownProfile: '알 수 없는 프로파일',

    dangerZone: '위험 구역',
    dangerZoneDescription: 'hosts 파일을 Windows 기본값으로 재설정합니다. 모든 사용자 지정 항목이 제거됩니다.',
    resetToDefault: '기본값으로 재설정',
    resetConfirm: '정말로 실행하시겠습니까? 이 작업은 취소할 수 없습니다!',
    yesReset: '예, 재설정',
    resetting: '재설정 중...',
    resetSuccess: 'Hosts 파일이 Windows 기본값으로 재설정되었습니다.\n백업이 자동으로 생성되었습니다.',
    resetFailed: 'hosts 파일 재설정 실패:',
  },

  // Profile Modal
  profiles: {
    title: '프로파일 관리',
    subtitle: '다양한 호스트 구성을 저장하고 전환하세요',
    createNew: '새 프로파일 생성',
    profileName: '프로파일 이름',
    profileNamePlaceholder: '예: 개발, 운영',
    description: '설명 (선택사항)',
    descriptionPlaceholder: '간단한 설명',
    noProfiles: '프로파일이 없습니다. 새로 만들어 시작하세요!',
    entries: '개 항목',
    updated: '업데이트됨',
    deleteConfirm: '이 프로파일을 삭제하시겠습니까?',
    createFailed: '프로파일 생성 실패:',
    activateFailed: '프로파일 활성화 실패:',
    deleteFailed: '프로파일 삭제 실패:',
    loadedProfile: '프로파일 로드됨:',
  },

  // Backup Modal
  backups: {
    title: '백업 관리',
    subtitle: 'hosts 파일 백업을 복원하거나 삭제하세요',
    noBackups: '백업 파일이 없습니다',
    loadingBackups: '백업 로딩 중...',
    restoreConfirm: '{filename} 백업에서 복원하시겠습니까?\n\n현재 hosts 파일이 먼저 백업됩니다.',
    deleteConfirm: '{filename} 백업을 삭제하시겠습니까?\n\n이 작업은 취소할 수 없습니다.',
    restoreSuccess: '백업이 성공적으로 복원되었습니다!',
    restoreFailed: '백업 복원 실패:',
    deleteFailed: '백업 삭제 실패:',
    loadFailed: '백업 로드 실패:',
  },

  // Export Modal
  exportModal: {
    title: 'Hosts 구성 내보내기',
    subtitle: '내보내기 형식 선택',
    exportAsJson: 'JSON으로 내보내기',
    jsonDescription: '백업 및 나중에 가져오기에 권장',
    exportAsHosts: 'Hosts 파일로 내보내기',
    hostsDescription: '표준 hosts 파일 형식',
    exportSuccess: '성공적으로 내보냈습니다!',
    exportFailed: '내보내기 실패:',
  },

  // Import Modal
  importModal: {
    title: 'Hosts 구성 가져오기',
    subtitle: 'JSON 백업 파일에서 가져오기',
    selectFile: 'JSON 파일 선택',
    loadingFile: '파일 로딩 중...',
    chooseFile: '이전에 내보낸 JSON 파일을 선택하세요',
    preview: '미리보기',
    sections: '개 섹션',
    mergeMode: '기존 항목과 병합',
    replaceMode: '모든 항목 교체',
    importSuccess: '{count}개 항목을 성공적으로 가져왔습니다',
    importFailed: '가져오기 실패:',
  },

  // Permission Modal
  permission: {
    title: '관리자 권한 필요',
    description: 'Easy Hosts는 hosts 파일을 수정하기 위해 관리자 권한이 필요합니다.',
    descriptionWindows: 'Easy Hosts는 Windows hosts 파일을 수정하기 위해 관리자 권한이 필요합니다.',
    descriptionLinux: 'Easy Hosts는 /etc/hosts 파일을 수정하기 위해 root 권한이 필요합니다.',
    descriptionMac: 'Easy Hosts는 /etc/hosts 파일을 수정하기 위해 sudo 권한이 필요합니다.',
    requirements: '요구사항:',
    requirementAdmin: '변경사항을 저장하려면 관리자 권한으로 실행',
    requirementAdminWindows: '변경사항을 저장하려면 관리자 권한으로 실행',
    requirementAdminLinux: '변경사항을 저장하려면 sudo 또는 root로 실행',
    requirementAdminMac: '변경사항을 저장하려면 sudo 권한으로 실행',
    requirementRead: '관리자 권한 없이 읽기 전용 모드 사용 가능',
    continueReadOnly: '읽기 전용 모드로 계속',
    elevationFailed: '권한 상승 요청 실패:',
    hostsFilePath: 'Hosts 파일 위치:',
  },

  // Duplicate Warning
  duplicates: {
    title: '중복 도메인 충돌 감지',
    description: '{count}개 도메인이 여러 IP에 매핑되어 있습니다:',
    mappedTo: '매핑됨:',
    viewEntry: '항목 보기',
  },

  // Global Errors
  error: {
    webviewMissingTitle: '데스크톱 실행 환경을 찾을 수 없습니다',
    webviewMissingDescription:
      '이 EasyHosts 빌드는 Tauri 데스크톱 앱 안에서 실행되어야 합니다.\n`npm run tauri dev` 또는 설치된 앱을 통해 실행해주세요.',
  },

  // Empty State
  emptyState: {
    noEntries: '항목이 없습니다',
    tryDifferent: '다른 검색어를 시도하세요',
    addFirst: '첫 번째 hosts 항목을 추가하여 시작하세요',
  },

  // Toast Messages
  toast: {
    saveSuccess: 'Hosts 파일이 성공적으로 저장되었습니다! 백업:',
    saveFailed: 'Hosts 파일 저장 실패:',
    adminRequired: '변경사항을 저장하려면 관리자 권한이 필요합니다',
    loadFailed: 'Hosts 파일 로드 실패:',
    loadingHostsFile: 'Hosts 파일 로딩 중...',
    loadedProfile: '프로파일 로드됨:',
    importedEntries: '{count}개 항목을 성공적으로 가져왔습니다',
    flushDnsSuccess: 'DNS 캐시가 성공적으로 초기화되었습니다.',
    flushDnsFailed: 'DNS 캐시 초기화 실패:',
  },

  // Section Header
  section: {
    enabled: '활성화됨',
    disabled: '비활성화됨',
  },

  // Raw Edit Mode
  rawEdit: {
    title: 'Raw Hosts 편집기',
    subtitle: '원시 hosts 파일 텍스트를 직접 편집하고 변경 사항을 미리보기 합니다',
    warning: '고급 기능입니다. 여기서 적용한 내용은 구조화된 뷰를 모두 대체합니다. 저장 전에 형식이 올바른지 꼭 확인하세요.',
    editorLabel: '원시 hosts 내용',
    unsavedIndicator: '수정됨 (아직 적용되지 않음)',
    diffTitle: '변경 사항 미리보기',
    diffHint: '초록: 추가, 빨강: 제거',
    noChanges: '변경 사항이 없습니다',
    applying: '적용 중...',
    applyChanges: '편집 뷰에 적용',
    openEditor: 'Raw Hosts 편집기 열기',
  },

  // Remote Sources
  remoteSources: {
    title: '원격 Hosts 소스',
    subtitle: 'GitHub, Gist, 광고 차단 리스트 등 원격 hosts 파일을 구독하고 현재 구성에 병합합니다',
    description: '여러 개의 원격 hosts 소스를 추가할 수 있습니다. 현재 항목과 병합하거나 전체를 교체할 수 있습니다.',
    examples: '예: https://example.com/hosts.txt, https://raw.githubusercontent.com/user/repo/branch/hosts',
    addTitle: '원격 소스 추가',
    namePlaceholder: '소스 이름 (예: GitHub, AdBlock 리스트)',
    urlPlaceholder: '원격 hosts 파일의 전체 URL (http/https)',
    applyMode: '적용 방식:',
    mergeMode: '기존 항목과 병합',
    replaceMode: '모든 항목 교체',
    addButton: '소스 추가',
    empty: '원격 소스가 없습니다. 먼저 소스를 추가하세요.',
    disable: '소스 비활성화',
    enable: '소스 활성화',
    delete: '소스 삭제',
    lastUpdated: '마지막 업데이트:',
    statusOk: '정상',
    statusError: '오류',
    neverUpdated: '기록 없음',
    applying: '적용 중...',
    applyNow: '가져와서 적용',
    invalidUrl: '올바른 http(s) URL을 입력하세요.',
    deleteConfirm: '이 원격 소스를 삭제하시겠습니까?\n\nhosts 파일 내용은 변경되지 않습니다.',
    applyFailed: '원격 소스를 적용하지 못했습니다:',
  },

  // Onboarding
  onboarding: {
    welcome: {
      title: 'Easy Hosts에 오신 것을 환영합니다!',
      description: '현대적이고 직관적인 hosts 파일 관리자입니다.\n\n간단한 튜토리얼로 시작해볼까요?',
    },
    whatIsHosts: {
      title: 'Hosts 파일이란?',
      description: 'hosts 파일은 도메인 이름을 IP 주소로 매핑합니다.\n\n로컬 개발, 광고 차단, 웹사이트 리디렉션 등에 사용됩니다.',
    },
    adminRequired: {
      title: '관리자 권한 필요',
      description: 'hosts 파일을 수정하려면 관리자 권한이 필요합니다.\n\n변경사항을 저장하려면 Easy Hosts를 적절한 권한으로 실행해주세요.',
    },
    autoBackup: {
      title: '자동 백업',
      description: '변경사항을 저장할 때마다 Easy Hosts가 자동으로 백업을 생성합니다.\n\n설정에서 언제든지 백업을 복원할 수 있습니다.',
    },
    ready: {
      title: '모든 준비 완료!',
      description: '이제 안심하고 hosts 파일을 관리하세요.\n\n설정 메뉴에서 언제든지 도움말에 접근할 수 있습니다.',
    },
    next: '다음',
    back: '이전',
    skip: '건너뛰기',
    getStarted: '시작하기',
  },
};
