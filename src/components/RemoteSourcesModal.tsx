import React, { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { HostsData, RemoteSource } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { Globe2, Link, Plus, Trash2, ToggleLeft, ToggleRight, DownloadCloud } from 'lucide-react';

interface RemoteSourcesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMerge: (data: HostsData, merge: boolean) => void;
}

const STORAGE_KEY = 'remoteSources';

function loadRemoteSources(): RemoteSource[] {
  if (typeof localStorage === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

function saveRemoteSources(sources: RemoteSource[]): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sources));
}

export const RemoteSourcesModal: React.FC<RemoteSourcesModalProps> = ({
  isOpen,
  onClose,
  onMerge,
}) => {
  const { t } = useLanguage();
  const [sources, setSources] = useState<RemoteSource[]>([]);
  const [newName, setNewName] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [mergeMode, setMergeMode] = useState<'merge' | 'replace'>('merge');

  useEffect(() => {
    if (isOpen) {
      setSources(loadRemoteSources());
      setNewName('');
      setNewUrl('');
      setLoadingId(null);
    }
  }, [isOpen]);

  const persist = (next: RemoteSource[]) => {
    setSources(next);
    saveRemoteSources(next);
  };

  const handleAddSource = () => {
    const name = newName.trim();
    const url = newUrl.trim();
    if (!name || !url) return;
    if (!/^https?:\/\//i.test(url)) {
      alert(t('remoteSources.invalidUrl'));
      return;
    }

    const id =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

    const next: RemoteSource[] = [
      ...sources,
      {
        id,
        name,
        url,
        enabled: true,
      },
    ];
    setSaving(true);
    persist(next);
    setSaving(false);
    setNewName('');
    setNewUrl('');
  };

  const handleDeleteSource = (id: string) => {
    if (!confirm(t('remoteSources.deleteConfirm'))) return;
    persist(sources.filter((s) => s.id !== id));
  };

  const handleToggleEnabled = (id: string) => {
    const next = sources.map((s) =>
      s.id === id ? { ...s, enabled: !s.enabled } : s,
    );
    persist(next);
  };

  const handleApplySource = async (source: RemoteSource) => {
    setLoadingId(source.id);
    try {
      const response = await fetch(source.url);
      if (!response.ok) {
        throw new Error(`${response.status} ${response.statusText}`);
      }
      const text = await response.text();
      const remoteData = await invoke<HostsData>('parse_hosts_text', {
        content: text,
      });
      onMerge(remoteData, mergeMode === 'merge');

      const updated: RemoteSource = {
        ...source,
        lastUpdated: new Date().toISOString(),
        lastStatus: 'ok',
      };
      persist(
        sources.map((s) => (s.id === source.id ? updated : s)),
      );
    } catch (error) {
      console.error('Failed to apply remote source:', error);
      alert(
        t('remoteSources.applyFailed') +
          ' ' +
          (error instanceof Error ? error.message : String(error)),
      );
      const updated: RemoteSource = {
        ...source,
        lastUpdated: new Date().toISOString(),
        lastStatus: 'error',
      };
      persist(
        sources.map((s) => (s.id === source.id ? updated : s)),
      );
    } finally {
      setLoadingId(null);
    }
  };

  const formatTimestamp = (iso?: string) => {
    if (!iso) return t('remoteSources.neverUpdated');
    try {
      return new Date(iso).toLocaleString();
    } catch {
      return iso;
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="modal-content"
        style={{ maxWidth: '720px', maxHeight: '80vh', overflowY: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>{t('remoteSources.title')}</h2>
          <p>{t('remoteSources.subtitle')}</p>
        </div>

        <div
          style={{
            padding: '12px 14px',
            background: 'var(--bg-input)',
            borderRadius: 'var(--radius-md)',
            marginBottom: '16px',
            fontSize: '13px',
            color: 'var(--text-secondary)',
            display: 'flex',
            gap: '8px',
            alignItems: 'flex-start',
          }}
        >
          <Globe2 size={18} style={{ marginTop: '2px' }} />
          <div>
            <div>{t('remoteSources.description')}</div>
            <div style={{ marginTop: '4px' }}>
              {t('remoteSources.examples')}
            </div>
          </div>
        </div>

        {/* Add Source Form */}
        <div
          style={{
            padding: '14px 16px',
            background: 'var(--bg-card)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)',
            marginBottom: '16px',
          }}
        >
          <h3
            style={{
              fontSize: '14px',
              fontWeight: 600,
              marginBottom: '10px',
            }}
          >
            {t('remoteSources.addTitle')}
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                className="form-input"
                placeholder={t('remoteSources.namePlaceholder')}
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0 8px',
                  background: 'var(--bg-input)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-tertiary)',
                }}
              >
                <Link size={16} />
              </div>
              <input
                type="text"
                className="form-input"
                placeholder={t('remoteSources.urlPlaceholder')}
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div
                style={{
                  display: 'flex',
                  gap: '8px',
                  alignItems: 'center',
                  fontSize: '13px',
                  color: 'var(--text-secondary)',
                }}
              >
                <span>{t('remoteSources.applyMode')}</span>
                <button
                  type="button"
                  className={
                    mergeMode === 'merge' ? 'btn-primary' : 'btn-secondary'
                  }
                  onClick={() => setMergeMode('merge')}
                  style={{ padding: '4px 10px', fontSize: '12px' }}
                >
                  {t('remoteSources.mergeMode')}
                </button>
                <button
                  type="button"
                  className={
                    mergeMode === 'replace' ? 'btn-primary' : 'btn-secondary'
                  }
                  onClick={() => setMergeMode('replace')}
                  style={{ padding: '4px 10px', fontSize: '12px' }}
                >
                  {t('remoteSources.replaceMode')}
                </button>
              </div>
              <button
                className="btn-primary"
                onClick={handleAddSource}
                disabled={saving || !newName.trim() || !newUrl.trim()}
                style={{ display: 'flex', alignItems: 'center' }}
              >
                <Plus size={16} style={{ marginRight: '6px' }} />
                {t('remoteSources.addButton')}
              </button>
            </div>
          </div>
        </div>

        {/* Sources List */}
        <div style={{ maxHeight: '360px', overflowY: 'auto' }}>
          {sources.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '40px 20px',
                color: 'var(--text-tertiary)',
              }}
            >
              <DownloadCloud
                size={48}
                style={{ margin: '0 auto 12px', opacity: 0.3 }}
              />
              <div style={{ fontSize: '14px' }}>
                {t('remoteSources.empty')}
              </div>
            </div>
          ) : (
            sources.map((source) => (
              <div
                key={source.id}
                style={{
                  padding: '14px 16px',
                  background: 'var(--bg-card)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  marginBottom: '10px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '4px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <button
                      className="btn-icon"
                      onClick={() => handleToggleEnabled(source.id)}
                      title={
                        source.enabled
                          ? t('remoteSources.disable')
                          : t('remoteSources.enable')
                      }
                    >
                      {source.enabled ? (
                        <ToggleRight
                          size={20}
                          style={{ color: 'var(--accent-blue)' }}
                        />
                      ) : (
                        <ToggleLeft
                          size={20}
                          style={{ color: 'var(--text-tertiary)' }}
                        />
                      )}
                    </button>
                    <div>
                      <div
                        style={{
                          fontSize: '14px',
                          fontWeight: 600,
                          marginBottom: '2px',
                        }}
                      >
                        {source.name}
                      </div>
                      <div
                        style={{
                          fontSize: '12px',
                          color: 'var(--text-tertiary)',
                          wordBreak: 'break-all',
                        }}
                      >
                        {source.url}
                      </div>
                    </div>
                  </div>
                  <button
                    className="btn-icon delete"
                    onClick={() => handleDeleteSource(source.id)}
                    title={t('remoteSources.delete')}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: '8px',
                    fontSize: '12px',
                  }}
                >
                  <div style={{ color: 'var(--text-secondary)' }}>
                    {t('remoteSources.lastUpdated')}{' '}
                    {formatTimestamp(source.lastUpdated)}
                    {source.lastStatus && (
                      <span
                        style={{
                          marginLeft: '8px',
                          color:
                            source.lastStatus === 'ok'
                              ? 'var(--success-color)'
                              : 'var(--danger-color)',
                        }}
                      >
                        {source.lastStatus === 'ok'
                          ? t('remoteSources.statusOk')
                          : t('remoteSources.statusError')}
                      </span>
                    )}
                  </div>
                  <button
                    className="btn-secondary"
                    onClick={() => handleApplySource(source)}
                    disabled={!!loadingId}
                    style={{ padding: '4px 14px', fontSize: '12px' }}
                  >
                    {loadingId === source.id
                      ? t('remoteSources.applying')
                      : t('remoteSources.applyNow')}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="modal-actions" style={{ marginTop: '16px' }}>
          <button className="btn-secondary" onClick={onClose}>
            {t('common.close')}
          </button>
        </div>
      </div>
    </div>
  );
};

