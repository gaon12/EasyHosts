export const en = {
  // Common
  common: {
    save: 'Save',
    cancel: 'Cancel',
    close: 'Close',
    delete: 'Delete',
    edit: 'Edit',
    add: 'Add',
    import: 'Import',
    export: 'Export',
    loading: 'Loading...',
    search: 'Search',
    filter: 'Filter',
    clear: 'Clear',
    test: 'Test',
    restore: 'Restore',
    create: 'Create',
    saveChanges: 'Save Changes',
  },

  // Header
  header: {
    title: 'Easy Hosts',
    settings: 'Settings',
  },

  // Search Bar
  searchBar: {
    placeholder: 'Search IP or domain...',
    addEntry: 'Add Entry',
    filterByTags: 'Filter by tags:',
    clearFilters: 'Clear filters',
    untaggedEntries: 'Untagged entries (auto-generated)',
  },

  // Entry Card
  entryCard: {
    noDomain: 'No domain',
    allDomains: 'All domains:',
    pingTest: 'Ping Test',
    testing: 'Testing...',
  },

  // Add Entry Modal
  addEntry: {
    title: 'Add New Entry',
    editTitle: 'Edit Entry',
    subtitle: 'Configure your hosts file entry',
    ipAddress: 'IP Address',
    ipPlaceholder: '127.0.0.1 or ::1',
    domains: 'Domain(s)',
    domainsPlaceholder: 'example.com or multiple.com domains.com',
    domainsHelp: 'Separate multiple domains with spaces',
    comment: 'Comment (Optional)',
    commentPlaceholder: 'Local development server',
    tags: 'Tags (Optional)',
    tagsPlaceholder: 'dev, api, frontend',
    tagsHelp: 'Separate multiple tags with commas',
    lookupHelp: 'Enter domain below, then click lookup to auto-fill IP (Domain → IP)',
    saveChanges: 'Save Changes',
    addEntry: 'Add Entry',
    errors: {
      invalidIp: 'Please enter a valid IPv4 or IPv6 address',
      invalidDomains: 'Please enter valid domain name(s). Each domain must be 1-253 characters.',
      enterDomainFirst: 'Please enter a domain first',
      dnsLookupFailed: 'DNS lookup failed:',
      tooManyDomains: 'Too many domains. Maximum 100 domains per entry.',
      tooManyTags: 'Too many tags. Maximum 20 tags per entry.',
    },
  },

  // Settings Modal
  settings: {
    title: 'Settings',
    subtitle: 'Application settings and tools',
    aboutTitle: 'About Easy Hosts',
    version: 'Version:',
    platform: 'Platform:',
    description: 'A modern hosts file manager',

    appearance: 'Appearance',
    switchToDark: 'Switch to Dark Mode',
    switchToLight: 'Switch to Light Mode',

    compactView: 'Use compact list view for entries',
    compactViewDescription: 'Render entries in a simple table-like list. This is recommended when you have hundreds or thousands of entries.',

    language: 'Language',
    languageDescription: 'Choose your preferred language',

    editTools: 'Edit Tools',
    undo: 'Undo (Ctrl+Z)',
    redo: 'Redo (Ctrl+Y)',

    dataManagement: 'Data Management',
    manageProfiles: 'Manage Profiles',
    manageRemoteSources: 'Manage Remote Sources',
    manageBackups: 'Manage Backups',

    network: 'Network',
    autoFlushDns: 'Automatically flush DNS cache after saving',
    autoFlushDnsDescription: 'After writing the hosts file, run the appropriate command (ipconfig /flushdns, etc.) to refresh DNS resolution.',
    autoSwitchBySsid: 'Automatically switch profiles based on Wi-Fi SSID',
    autoSwitchBySsidDescription: 'Periodically detects the current Wi-Fi SSID and activates the matching profile using the rules below (no changes are saved until you click "Save Changes").',
    ssidRulesTitle: 'SSID → Profile Rules',
    ssidRulesNoProfiles: 'No profiles found. Create a profile first to map it to a Wi-Fi network.',
    ssidRulesEmpty: 'No SSID rules yet. Add a mapping between a Wi-Fi name and a profile.',
    ssidRulesAdd: 'Add / Update Rule',
    ssidPlaceholder: 'Wi-Fi SSID (e.g., Office-WiFi)',
    ssidProfileSelect: 'Select profile to activate',
    unknownProfile: 'Unknown profile',

    dangerZone: 'Danger Zone',
    dangerZoneDescription: 'Reset hosts file to Windows default. This will remove all custom entries.',
    resetToDefault: 'Reset to Default',
    resetConfirm: 'Are you sure? This action cannot be undone!',
    yesReset: 'Yes, Reset',
    resetting: 'Resetting...',
    resetSuccess: 'Hosts file has been reset to Windows default.\nA backup was created automatically.',
    resetFailed: 'Failed to reset hosts file:',
  },

  // Profile Modal
  profiles: {
    title: 'Profile Management',
    subtitle: 'Save and switch between different host configurations',
    createNew: 'Create New Profile',
    profileName: 'Profile Name',
    profileNamePlaceholder: 'e.g., Development, Production',
    description: 'Description (optional)',
    descriptionPlaceholder: 'Brief description',
    noProfiles: 'No profiles yet. Create one to get started!',
    entries: 'entries',
    updated: 'Updated',
    deleteConfirm: 'Are you sure you want to delete this profile?',
    createFailed: 'Failed to create profile:',
    activateFailed: 'Failed to activate profile:',
    deleteFailed: 'Failed to delete profile:',
    loadedProfile: 'Loaded profile:',
  },

  // Backup Modal
  backups: {
    title: 'Backup Management',
    subtitle: 'Restore or delete your hosts file backups',
    noBackups: 'No backups found',
    loadingBackups: 'Loading backups...',
    restoreConfirm: 'Restore from backup {filename}?\n\nYour current hosts file will be backed up first.',
    deleteConfirm: 'Delete backup {filename}?\n\nThis action cannot be undone.',
    restoreSuccess: 'Backup restored successfully!',
    restoreFailed: 'Failed to restore backup:',
    deleteFailed: 'Failed to delete backup:',
    loadFailed: 'Failed to load backups:',
  },

  // Export Modal
  exportModal: {
    title: 'Export Hosts Configuration',
    subtitle: 'Choose export format',
    exportAsJson: 'Export as JSON',
    jsonDescription: 'Recommended for backup and import later',
    exportAsHosts: 'Export as Hosts File',
    hostsDescription: 'Standard hosts file format',
    exportSuccess: 'Exported successfully!',
    exportFailed: 'Failed to export:',
  },

  // Import Modal
  importModal: {
    title: 'Import Hosts Configuration',
    subtitle: 'Import from JSON backup file',
    selectFile: 'Select JSON File',
    loadingFile: 'Loading file...',
    chooseFile: 'Choose a previously exported JSON file',
    preview: 'Preview',
    sections: 'sections',
    mergeMode: 'Merge with existing entries',
    replaceMode: 'Replace all entries',
    importSuccess: 'Imported {count} entries successfully',
    importFailed: 'Failed to import:',
  },

  // Permission Modal
  permission: {
    title: 'Elevated Privileges Required',
    description: 'Easy Hosts needs elevated privileges to modify the hosts file.',
    descriptionWindows: 'Easy Hosts needs administrator privileges to modify the Windows hosts file.',
    descriptionLinux: 'Easy Hosts needs root privileges to modify the /etc/hosts file.',
    descriptionMac: 'Easy Hosts needs sudo privileges to modify the /etc/hosts file.',
    requirements: 'Requirements:',
    requirementAdmin: 'Run with elevated privileges to save changes',
    requirementAdminWindows: 'Run as Administrator to save changes',
    requirementAdminLinux: 'Run with sudo or as root to save changes',
    requirementAdminMac: 'Run with sudo privileges to save changes',
    requirementRead: 'Read-only mode is available without elevated privileges',
    continueReadOnly: 'Continue in Read-Only Mode',
    elevationFailed: 'Failed to request elevation:',
    hostsFilePath: 'Hosts file location:',
  },

  // Duplicate Warning
  duplicates: {
    title: 'Duplicate Domain Conflicts Detected',
    description: '{count} domain(s) are mapped to multiple IPs:',
    mappedTo: 'Mapped to:',
    viewEntry: 'View Entry',
  },

  // Global Errors
  error: {
    webviewMissingTitle: 'Desktop runtime not detected',
    webviewMissingDescription:
      'This build of EasyHosts must run inside the Tauri desktop app. Please start via "npm run tauri dev" or use the installed desktop application.',
  },

  // Empty State
  emptyState: {
    noEntries: 'No entries found',
    tryDifferent: 'Try a different search query',
    addFirst: 'Add your first hosts entry to get started',
  },

  // Toast Messages
  toast: {
    saveSuccess: 'Hosts file saved successfully! Backup:',
    saveFailed: 'Failed to save hosts file:',
    adminRequired: 'Administrator privileges required to save changes',
    loadFailed: 'Failed to load hosts file:',
    loadingHostsFile: 'Loading hosts file...',
    loadedProfile: 'Loaded profile:',
    importedEntries: 'Imported {count} entries successfully',
     flushDnsSuccess: 'DNS cache flushed successfully.',
     flushDnsFailed: 'Failed to flush DNS cache:',
  },

  // Section Header
  section: {
    enabled: 'Enabled',
    disabled: 'Disabled',
  },

  // Raw Edit Mode
  rawEdit: {
    title: 'Raw Hosts Editor',
    subtitle: 'Edit the raw hosts file text with a live diff preview',
    warning: 'Advanced feature: Changes here will replace the structured view. Make sure the format is valid before applying.',
    editorLabel: 'Raw hosts content',
    unsavedIndicator: 'Modified (not yet applied)',
    diffTitle: 'Changes preview',
    diffHint: 'Green: added, Red: removed',
    noChanges: 'No changes detected',
    applying: 'Applying...',
    applyChanges: 'Apply to editor view',
    openEditor: 'Open Raw Hosts Editor',
  },

  // Remote Sources
  remoteSources: {
    title: 'Remote Hosts Sources',
    subtitle: 'Subscribe to remote hosts files (GitHub, Gist, blocklists) and merge them into your configuration',
    description: 'Add one or more remote hosts sources. You can merge or replace your current entries with the remote content.',
    examples: 'Examples: https://example.com/hosts.txt, https://raw.githubusercontent.com/user/repo/branch/hosts',
    addTitle: 'Add Remote Source',
    namePlaceholder: 'Source name (e.g., GitHub, AdBlock List)',
    urlPlaceholder: 'Full URL to remote hosts file (http/https)',
    applyMode: 'Apply mode:',
    mergeMode: 'Merge with existing entries',
    replaceMode: 'Replace all entries',
    addButton: 'Add Source',
    empty: 'No remote sources yet. Add one to get started.',
    disable: 'Disable source',
    enable: 'Enable source',
    delete: 'Delete source',
    lastUpdated: 'Last update:',
    statusOk: 'OK',
    statusError: 'Error',
    neverUpdated: 'Never',
    applying: 'Applying...',
    applyNow: 'Fetch & Apply',
    invalidUrl: 'Please enter a valid http(s) URL.',
    deleteConfirm: 'Delete this remote source? This will not modify your hosts file.',
    applyFailed: 'Failed to apply remote source:',
  },

  // Onboarding
  onboarding: {
    welcome: {
      title: 'Welcome to Easy Hosts!',
      description: 'A modern and intuitive hosts file manager.\n\nLet\'s take a quick tour to get you started.',
    },
    whatIsHosts: {
      title: 'What is a Hosts File?',
      description: 'The hosts file maps domain names to IP addresses.\n\nIt\'s used for local development, blocking ads, or redirecting websites.',
    },
    adminRequired: {
      title: 'Elevated Privileges',
      description: 'Modifying the hosts file requires elevated privileges.\n\nPlease run Easy Hosts with appropriate permissions to save changes.',
    },
    autoBackup: {
      title: 'Automatic Backups',
      description: 'Every time you save changes, Easy Hosts automatically creates a backup.\n\nYou can restore from any backup in the settings.',
    },
    ready: {
      title: 'You\'re All Set!',
      description: 'Start managing your hosts file with confidence.\n\nYou can always access help from the settings menu.',
    },
    next: 'Next',
    back: 'Back',
    skip: 'Skip',
    getStarted: 'Get Started',
  },
};

export type TranslationKeys = typeof en;
