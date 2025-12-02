import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
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
import { HostsData, HostEntry, Profile, DuplicateEntry } from "./types";
import { Save, CheckCircle, XCircle } from 'lucide-react';
import "./index.css";

function App() {
  const [hostsData, setHostsData] = useState<HostsData>({ entries: [], sections: [] });
  const [originalHostsData, setOriginalHostsData] = useState<HostsData>({ entries: [], sections: [] });
  const [loading, setLoading] = useState(true);
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
    checkPermissions();
    loadHostsFile();

    // Load dark mode preference
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDarkMode);
    applyTheme(savedDarkMode);
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
    showToast(`Imported ${importedData.entries.length} entries successfully`, 'success');
  };

  const handleProfileLoad = (profile: Profile) => {
    setHostsData(profile.hostsData);
    setOriginalHostsData(JSON.parse(JSON.stringify(profile.hostsData)));
    addToHistory(profile.hostsData);
    showToast(`Loaded profile: ${profile.name}`, 'success');
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
      showToast("Failed to load hosts file: " + error, 'error');
    } finally {
      setLoading(false);
    }
  };

  const saveHostsFile = async () => {
    if (!isAdmin) {
      showToast("Administrator privileges required to save changes", 'error');
      setShowPermissionModal(true);
      return;
    }

    try {
      const backupPath = await invoke<string>("save_hosts", { data: hostsData });
      showToast("Hosts file saved successfully! Backup: " + backupPath, 'success');
      setOriginalHostsData(JSON.parse(JSON.stringify(hostsData))); // Update original data
    } catch (error) {
      showToast("Failed to save hosts file: " + error, 'error');
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', String(newDarkMode));
    applyTheme(newDarkMode);
  };

  const toggleEntry = (index: number) => {
    const newData = { ...hostsData };
    newData.entries[index].enabled = !newData.entries[index].enabled;
    setHostsData(newData);
    addToHistory(newData);
  };

  const deleteEntry = (index: number) => {
    const newData = { ...hostsData };
    newData.entries.splice(index, 1);
    setHostsData(newData);
    addToHistory(newData);
  };

  const openEditModal = (entry: HostEntry, index: number) => {
    setEditingEntry({ entry, index });
    setModalOpen(true);
  };

  const handleSaveEntry = (entry: HostEntry) => {
    const newData = { ...hostsData };

    if (editingEntry !== null) {
      // Edit existing entry
      newData.entries[editingEntry.index] = entry;
    } else {
      // Add new entry
      newData.entries.push(entry);
    }

    setHostsData(newData);
    addToHistory(newData);
    setEditingEntry(null);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingEntry(null);
  };

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

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

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

  if (loading) {
    return (
      <div className="app-container">
        <div className="loading">Loading hosts file...</div>
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
          <h3>No entries found</h3>
          <p>
            {searchQuery
              ? "Try a different search query"
              : "Add your first hosts entry to get started"}
          </p>
        </div>
      )}

      {filteredEntries.map((entry) => {
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
      })}

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
            Save Changes
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
