import { useEffect, useState, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { Header } from "./components/Header";
import { SearchBar } from "./components/SearchBar";
import { SectionHeader } from "./components/SectionHeader";
import { EntryCard } from "./components/EntryCard";
import { AddEntryModal } from "./components/AddEntryModal";
import { PermissionModal } from "./components/PermissionModal";
import { ExportModal } from "./components/ExportModal";
import { ImportModal } from "./components/ImportModal";
import { ProfileModal } from "./components/ProfileModal";
import { DuplicateWarning } from "./components/DuplicateWarning";
import { SettingsModal } from "./components/SettingsModal";
import { BackupModal } from "./components/BackupModal";
import { OnboardingModal } from "./components/OnboardingModal";
import { RawEditModal } from "./components/RawEditModal";
import { RemoteSourcesModal } from "./components/RemoteSourcesModal";
import { HostsData, HostEntry, Profile, DuplicateEntry } from "./types";
import { Save, CheckCircle, XCircle } from 'lucide-react';
import { useLanguage } from "./contexts/LanguageContext";
import "./index.css";

function App() {
  const { t } = useLanguage();
  const [hostsData, setHostsData] = useState<HostsData>({ entries: [], sections: [] });
  const [originalHostsData, setOriginalHostsData] = useState<HostsData>({ entries: [], sections: [] });
  const [loading, setLoading] = useState(true);
  const [webviewAvailable, setWebviewAvailable] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [darkMode, setDarkMode] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<{ entry: HostEntry; index: number } | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showRawEditModal, setShowRawEditModal] = useState(false);
  const [showRemoteSourcesModal, setShowRemoteSourcesModal] = useState(false);
  const [autoFlushDns, setAutoFlushDns] = useState(false);
  const [autoSwitchBySsid, setAutoSwitchBySsid] = useState(false);
  const [compactView, setCompactView] = useState(false);

  // BETA-04: Undo/Redo history
  const [history, setHistory] = useState<HostsData[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Add to history when hostsData changes
  const addToHistory = (data: HostsData) => {
    setHistory(prev => {
      // Remove any "future" history if we're not at the end
      const newHistory = prev.slice(0, historyIndex + 1);
      // Add new state
      newHistory.push(JSON.parse(JSON.stringify(data)));
      // Limit history to last 50 states
      if (newHistory.length > 50) {
        newHistory.shift();
        setHistoryIndex(prev => prev - 1);
        return newHistory;
      }
      setHistoryIndex(newHistory.length - 1);
      return newHistory;
    });
  };

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  const undo = () => {
    if (canUndo) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setHostsData(JSON.parse(JSON.stringify(history[newIndex])));
    }
  };

  const redo = () => {
    if (canRedo) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setHostsData(JSON.parse(JSON.stringify(history[newIndex])));
    }
  };

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key === 'z') {
        e.preventDefault();
        undo();
      } else if ((e.ctrlKey || e.metaKey) && (e.shiftKey && e.key === 'z' || e.key === 'y')) {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [historyIndex, history]);

  useEffect(() => {
    const hasTauri =
      typeof window !== 'undefined' &&
      (
        (window as any).__TAURI__ !== undefined ||
        (window as any).__TAURI_IPC__ !== undefined ||
        (window as any).__TAURI_INTERNALS__ !== undefined ||
        window.navigator?.userAgent.includes('Tauri')
      );

    if (!hasTauri) {
      setWebviewAvailable(false);
      setLoading(false);
    } else {
      setWebviewAvailable(true);
      checkPermissions();
      loadHostsFile();
    }

    // Load dark mode preference
    const savedDarkModeRaw = localStorage.getItem('darkMode');
    const savedDarkMode = savedDarkModeRaw === null ? false : savedDarkModeRaw === 'true';
    setDarkMode(savedDarkMode);
    applyTheme(savedDarkMode);

    // Load DNS flush preference
    const savedAutoFlush = localStorage.getItem('autoFlushDns');
    if (savedAutoFlush !== null) {
      setAutoFlushDns(savedAutoFlush === 'true');
    }

    const savedAutoSwitch = localStorage.getItem('autoSwitchBySsid');
    if (savedAutoSwitch !== null) {
      setAutoSwitchBySsid(savedAutoSwitch === 'true');
    }

    const savedCompactView = localStorage.getItem('compactView');
    if (savedCompactView !== null) {
      setCompactView(savedCompactView === 'true');
    }

    // Check if onboarding should be shown
    const onboardingCompleted = localStorage.getItem('onboardingCompleted');
    if (!onboardingCompleted) {
      setShowOnboarding(true);
    }
  }, []);

  // Listen for tray events to quickly cycle profiles
  useEffect(() => {
    const hasTauri =
      typeof window !== 'undefined' &&
      (
        (window as any).__TAURI__ !== undefined ||
        (window as any).__TAURI_IPC__ !== undefined ||
        (window as any).__TAURI_INTERNALS__ !== undefined ||
        window.navigator?.userAgent.includes('Tauri')
      );
    if (!hasTauri) {
      return;
    }

    let unlisten: (() => void) | undefined;

    (async () => {
      try {
        unlisten = await listen("tray://cycle-profile", () => {
          try {
            const raw = localStorage.getItem('profiles');
            if (!raw) return;
            const profiles: Profile[] = JSON.parse(raw);
            if (!profiles || profiles.length === 0) return;

            const activeId = localStorage.getItem('activeProfileId');
            const currentIndex = profiles.findIndex(p => p.id === activeId);
            const nextProfile = profiles[(currentIndex + 1) % profiles.length];

            localStorage.setItem('activeProfileId', nextProfile.id);
            handleProfileLoad(nextProfile);
          } catch (error) {
            console.error('Failed to cycle profile from tray:', error);
          }
        });
      } catch (error) {
        console.error('Failed to listen to tray events:', error);
      }
    })();

    return () => {
      if (unlisten) {
        unlisten();
      }
    };
  }, []);

  const applyTheme = (isDark: boolean) => {
    if (isDark) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  };

  // Deep equality check for hosts data
  const hasChanges = (): boolean => {
    return JSON.stringify(hostsData) !== JSON.stringify(originalHostsData);
  };

  // BETA-02: Detect duplicate domains
  const detectDuplicates = (): DuplicateEntry[] => {
    const domainMap = new Map<string, Array<{ index: number; ip: string }>>();

    hostsData.entries.forEach((entry, index) => {
      entry.domains.forEach(domain => {
        const normalized = domain.toLowerCase();
        if (!domainMap.has(normalized)) {
          domainMap.set(normalized, []);
        }
        domainMap.get(normalized)!.push({ index, ip: entry.ip });
      });
    });

    const duplicates: DuplicateEntry[] = [];
    domainMap.forEach((entries, domain) => {
      // Check if there are multiple entries with different IPs
      const uniqueIps = new Set(entries.map(e => e.ip));
      if (uniqueIps.size > 1) {
        duplicates.push({ domain, entries });
      }
    });

    return duplicates;
  };

  const duplicates = detectDuplicates();

  const checkPermissions = async () => {
    try {
      const adminStatus = await invoke<boolean>("check_admin");
      setIsAdmin(adminStatus);

      if (!adminStatus) {
        setShowPermissionModal(true);
      }
    } catch (error) {
      console.error("Failed to check permissions:", error);
    }
  };

  const handleContinueReadOnly = () => {
    setShowPermissionModal(false);
  };

  const handleImport = (importedData: HostsData, merge: boolean) => {
    let newData: HostsData;
    if (merge) {
      // Merge: add imported entries to existing
      newData = {
        entries: [...hostsData.entries, ...importedData.entries],
        sections: [...hostsData.sections, ...importedData.sections],
      };
    } else {
      // Replace: overwrite all
      newData = importedData;
    }
    setHostsData(newData);
    addToHistory(newData);
    showToast(t('toast.importedEntries', { count: importedData.entries.length }), 'success');
  };

  const handleProfileLoad = (profile: Profile) => {
    setHostsData(profile.hostsData);
    setOriginalHostsData(JSON.parse(JSON.stringify(profile.hostsData)));
    addToHistory(profile.hostsData);
    showToast(`${t('toast.loadedProfile')} ${profile.name}`, 'success');
  };

  const handleApplyRawEdit = (data: HostsData) => {
    setHostsData(data);
    addToHistory(data);
  };

  const handleMergeRemote = (remoteData: HostsData, merge: boolean) => {
    let newData: HostsData;
    if (merge) {
      newData = {
        entries: [...hostsData.entries, ...remoteData.entries],
        sections: [...hostsData.sections, ...remoteData.sections],
      };
    } else {
      newData = remoteData;
    }
    setHostsData(newData);
    addToHistory(newData);
    showToast(t('toast.importedEntries', { count: remoteData.entries.length }), 'success');
  };

  const loadHostsFile = async () => {
    setLoading(true);
    try {
      const data = await invoke<HostsData>("read_hosts");
      setHostsData(data);
      setOriginalHostsData(JSON.parse(JSON.stringify(data))); // Deep copy
      // Initialize history
      setHistory([JSON.parse(JSON.stringify(data))]);
      setHistoryIndex(0);
    } catch (error) {
      showToast(t('toast.loadFailed') + ' ' + error, 'error');
    } finally {
      setLoading(false);
    }
  };

  const saveHostsFile = async () => {
    if (!isAdmin) {
      showToast(t('toast.adminRequired'), 'error');
      setShowPermissionModal(true);
      return;
    }

    try {
      const backupPath = await invoke<string>("save_hosts", { data: hostsData });
      showToast(t('toast.saveSuccess') + ' ' + backupPath, 'success');
      setOriginalHostsData(JSON.parse(JSON.stringify(hostsData))); // Update original data

      if (autoFlushDns) {
        try {
          await invoke("flush_dns_cache");
          showToast(t('toast.flushDnsSuccess'), 'success');
        } catch (error) {
          showToast(t('toast.flushDnsFailed') + ' ' + error, 'error');
        }
      }
    } catch (error) {
      showToast(t('toast.saveFailed') + ' ' + error, 'error');
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const toggleDarkMode = useCallback(() => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', String(newDarkMode));
    applyTheme(newDarkMode);
  }, [darkMode]);

  const toggleAutoFlushDns = useCallback(() => {
    setAutoFlushDns(prev => {
      const next = !prev;
      localStorage.setItem('autoFlushDns', String(next));
      return next;
    });
  }, []);

  const toggleAutoSwitchBySsid = useCallback(() => {
    setAutoSwitchBySsid(prev => {
      const next = !prev;
      localStorage.setItem('autoSwitchBySsid', String(next));
      return next;
    });
  }, []);

  const toggleCompactView = useCallback(() => {
    setCompactView(prev => {
      const next = !prev;
      localStorage.setItem('compactView', String(next));
      return next;
    });
  }, []);

  const toggleEntry = useCallback((index: number) => {
    setHostsData(prev => {
      const newData = { ...prev };
      newData.entries[index].enabled = !newData.entries[index].enabled;
      addToHistory(newData);
      return newData;
    });
  }, []);

  const deleteEntry = useCallback((index: number) => {
    setHostsData(prev => {
      const newData = { ...prev };
      newData.entries.splice(index, 1);
      addToHistory(newData);
      return newData;
    });
  }, []);

  const openEditModal = useCallback((entry: HostEntry, index: number) => {
    setEditingEntry({ entry, index });
    setModalOpen(true);
  }, []);

  const handleSaveEntry = useCallback((entry: HostEntry) => {
    setHostsData(prev => {
      const newData = { ...prev };

      if (editingEntry !== null) {
        // Edit existing entry
        newData.entries[editingEntry.index] = entry;
      } else {
        // Add new entry
        newData.entries.push(entry);
      }

      addToHistory(newData);
      return newData;
    });
    setEditingEntry(null);
  }, [editingEntry]);

  const handleCloseModal = useCallback(() => {
    setModalOpen(false);
    setEditingEntry(null);
  }, []);

  // Get all unique tags from entries (including auto "etc" tag)
  const allTags = Array.from(
    new Set(
      hostsData.entries
        .flatMap(entry => {
          const tags = entry.tags || [];
          return tags.length > 0 ? tags : ['etc'];
        })
        .filter(tag => tag.length > 0)
    )
  ).sort((a, b) => {
    // Put "etc" at the end
    if (a === 'etc') return 1;
    if (b === 'etc') return -1;
    return a.localeCompare(b);
  });

  const toggleTag = useCallback((tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  }, []);

  const filteredEntries = hostsData.entries.filter(entry => {
    // Search query filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesDomain = entry.domains.some(domain =>
        domain.toLowerCase().includes(query)
      );
      const matchesIp = entry.ip.toLowerCase().includes(query);
      const matchesComment = entry.comment?.toLowerCase().includes(query);

      if (!matchesDomain && !matchesIp && !matchesComment) {
        return false;
      }
    }

    // Tag filter
    if (selectedTags.length > 0) {
      const entryTags = entry.tags && entry.tags.length > 0 ? entry.tags : ['etc'];
      const hasSelectedTag = selectedTags.some(tag => entryTags.includes(tag));
      if (!hasSelectedTag) {
        return false;
      }
    }

    return true;
  });

  const isLargeList = hostsData.entries.length > 500;
  const useCompactView = compactView || isLargeList;

  // SSID-based automatic profile switching
  useEffect(() => {
    const hasTauri = typeof window !== 'undefined' && (
      (window as any).__TAURI__ !== undefined ||
      (window as any).__TAURI_IPC__ !== undefined ||
      (window as any).__TAURI_INTERNALS__ !== undefined
    );
    if (!hasTauri) {
      return;
    }

    if (!autoSwitchBySsid) {
      return;
    }

    let cancelled = false;
    let timer: number | undefined;

    const poll = async () => {
      try {
        const ssid = await invoke<string | null>("get_current_ssid");
        if (!ssid) return;

        const rulesRaw = localStorage.getItem('ssidProfileRules');
        if (!rulesRaw) return;
        const rules: Array<{ ssid: string; profileId: string }> = JSON.parse(rulesRaw);
        const match = rules.find(r => r.ssid === ssid);
        if (!match) return;

        const profilesRaw = localStorage.getItem('profiles');
        if (!profilesRaw) return;
        const profiles: Profile[] = JSON.parse(profilesRaw);
        const profile = profiles.find(p => p.id === match.profileId);
        if (!profile) return;

        const activeId = localStorage.getItem('activeProfileId');
        if (activeId === profile.id) return;

        localStorage.setItem('activeProfileId', profile.id);
        setHostsData(profile.hostsData);
        setOriginalHostsData(JSON.parse(JSON.stringify(profile.hostsData)));
        addToHistory(profile.hostsData);
        showToast(`${t('toast.loadedProfile')} ${profile.name}`, 'success');
      } catch (error) {
        console.error('Failed to auto switch profile by SSID:', error);
      } finally {
        if (!cancelled) {
          timer = window.setTimeout(poll, 15000);
        }
      }
    };

    poll();

    return () => {
      cancelled = true;
      if (timer) {
        window.clearTimeout(timer);
      }
    };
  }, [autoSwitchBySsid, t]);

  if (!webviewAvailable) {
    return (
      <div className="app-container">
        <div className="empty-state">
          <h3>{t('error.webviewMissingTitle')}</h3>
          <p>{t('error.webviewMissingDescription')}</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="app-container">
        <div className="loading">{t('toast.loadingHostsFile')}</div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Header
        onSettings={() => setShowSettingsModal(true)}
      />

      <SearchBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onAddEntry={() => setModalOpen(true)}
        allTags={allTags}
        selectedTags={selectedTags}
        onToggleTag={toggleTag}
      />

      <DuplicateWarning
        duplicates={duplicates}
        onViewEntry={(index) => {
          // Scroll to the entry (simplified - you can enhance with refs)
          setSearchQuery(''); // Clear search to show all entries
          setTimeout(() => {
            const cards = document.querySelectorAll('.entry-card');
            if (cards[index]) {
              cards[index].scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }, 100);
        }}
      />

      {hostsData.sections.map((section, _idx) => (
        <SectionHeader
          key={`section-${_idx}`}
          section={section}
          onToggle={() => {
            const newData = { ...hostsData };
            newData.sections[_idx].enabled = !newData.sections[_idx].enabled;
            setHostsData(newData);
            addToHistory(newData);
          }}
        />
      ))}

      {filteredEntries.length === 0 && (
        <div className="empty-state">
          <h3>{t('emptyState.noEntries')}</h3>
          <p>
            {searchQuery
              ? t('emptyState.tryDifferent')
              : t('emptyState.addFirst')}
          </p>
        </div>
      )}

      {useCompactView ? (
        <div className="compact-list">
          {filteredEntries.map((entry) => {
            const originalIndex = hostsData.entries.indexOf(entry);
            const primaryDomain = entry.domains[0] || t('entryCard.noDomain');
            return (
              <div key={originalIndex} className="compact-row">
                <button
                  className={`compact-toggle ${entry.enabled ? 'on' : 'off'}`}
                  onClick={() => toggleEntry(originalIndex)}
                />
                <div className="compact-domain" title={primaryDomain}>
                  {primaryDomain}
                </div>
                <div className="compact-ip">{entry.ip}</div>
                <div className="compact-actions">
                  <button
                    className="btn-icon"
                    onClick={() => openEditModal(entry, originalIndex)}
                    title={t('common.edit')}
                  >
                    <span>✎</span>
                  </button>
                  <button
                    className="btn-icon delete"
                    onClick={() => deleteEntry(originalIndex)}
                    title={t('common.delete')}
                  >
                    <span>✕</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        filteredEntries.map((entry) => {
          const originalIndex = hostsData.entries.indexOf(entry);
          return (
            <EntryCard
              key={originalIndex}
              entry={entry}
              onToggle={() => toggleEntry(originalIndex)}
              onEdit={() => openEditModal(entry, originalIndex)}
              onDelete={() => deleteEntry(originalIndex)}
            />
          );
        })
      )}

      {hasChanges() && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1000
        }}>
          <button
            className="btn-primary"
            style={{ padding: '16px 32px', fontSize: '16px', boxShadow: 'var(--shadow-lg)' }}
            onClick={saveHostsFile}
          >
            <Save size={20} />
            {t('common.saveChanges')}
          </button>
        </div>
      )}

      <AddEntryModal
        isOpen={modalOpen}
        entry={editingEntry?.entry}
        onClose={handleCloseModal}
        onSave={handleSaveEntry}
      />

      <ExportModal
        isOpen={showExportModal}
        hostsData={hostsData}
        onClose={() => setShowExportModal(false)}
      />

      <ImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImport={handleImport}
      />

      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        currentData={hostsData}
        onProfileLoad={handleProfileLoad}
      />

      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        onReset={loadHostsFile}
        darkMode={darkMode}
        onToggleDarkMode={toggleDarkMode}
        autoFlushDns={autoFlushDns}
        onToggleAutoFlushDns={toggleAutoFlushDns}
        autoSwitchBySsid={autoSwitchBySsid}
        onToggleAutoSwitchBySsid={toggleAutoSwitchBySsid}
        compactView={compactView}
        onToggleCompactView={toggleCompactView}
        onOpenRawEditor={() => setShowRawEditModal(true)}
        onRemoteSources={() => setShowRemoteSourcesModal(true)}
        onProfiles={() => setShowProfileModal(true)}
        onBackups={() => setShowBackupModal(true)}
        onImport={() => setShowImportModal(true)}
        onExport={() => setShowExportModal(true)}
        onUndo={undo}
        onRedo={redo}
        canUndo={canUndo}
        canRedo={canRedo}
      />

      <BackupModal
        isOpen={showBackupModal}
        onClose={() => setShowBackupModal(false)}
        onRestore={loadHostsFile}
      />

      <PermissionModal
        isOpen={showPermissionModal}
        onContinueAnyway={handleContinueReadOnly}
      />

      <OnboardingModal
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
      />

      <RawEditModal
        isOpen={showRawEditModal}
        hostsData={hostsData}
        onClose={() => setShowRawEditModal(false)}
        onApply={handleApplyRawEdit}
      />

      <RemoteSourcesModal
        isOpen={showRemoteSourcesModal}
        onClose={() => setShowRemoteSourcesModal(false)}
        onMerge={handleMergeRemote}
      />

      {toast && (
        <div className={`toast ${toast.type}`}>
          <span className="toast-icon">
            {toast.type === 'success' ? <CheckCircle size={20} /> : <XCircle size={20} />}
          </span>
          <span className="toast-message">{toast.message}</span>
        </div>
      )}
    </div>
  );
}

export default App;
