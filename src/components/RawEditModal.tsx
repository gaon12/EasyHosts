import React, { useEffect, useMemo, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { HostsData } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface RawEditModalProps {
  isOpen: boolean;
  hostsData: HostsData;
  onClose: () => void;
  onApply: (data: HostsData) => void;
}

type DiffLineType = 'same' | 'added' | 'removed';

interface DiffLine {
  type: DiffLineType;
  text: string;
}

export const RawEditModal: React.FC<RawEditModalProps> = ({
  isOpen,
  hostsData,
  onClose,
  onApply,
}) => {
  const { t } = useLanguage();
  const [originalText, setOriginalText] = useState('');
  const [rawText, setRawText] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    setLoading(true);
    setError(null);

    // Always generate from current in-memory data so unsaved changes are included
    invoke<string>('export_to_hosts_format', { data: hostsData })
      .then((text) => {
        setOriginalText(text);
        setRawText(text);
      })
      .catch((e) => {
        console.error('Failed to export hosts data:', e);
        setError(String(e));
      })
      .finally(() => {
        setLoading(false);
      });
  }, [isOpen, hostsData]);

  const hasChanges = useMemo(() => originalText !== rawText, [originalText, rawText]);

  const diffLines = useMemo<DiffLine[]>(() => {
    if (!hasChanges) return [];

    const a = originalText.split('\n');
    const b = rawText.split('\n');
    const maxLen = Math.max(a.length, b.length);
    const lines: DiffLine[] = [];

    for (let i = 0; i < maxLen; i += 1) {
      const lineA = a[i];
      const lineB = b[i];

      if (lineA === undefined && lineB !== undefined) {
        lines.push({ type: 'added', text: lineB });
      } else if (lineA !== undefined && lineB === undefined) {
        lines.push({ type: 'removed', text: lineA });
      } else if (lineA !== undefined && lineB !== undefined) {
        if (lineA === lineB) {
          lines.push({ type: 'same', text: lineA });
        } else {
          lines.push({ type: 'removed', text: lineA });
          lines.push({ type: 'added', text: lineB });
        }
      }
    }

    return lines;
  }, [originalText, rawText, hasChanges]);

  const handleApply = async () => {
    setSaving(true);
    setError(null);
    try {
      const parsed = await invoke<HostsData>('parse_hosts_text', { content: rawText });
      onApply(parsed);
      onClose();
    } catch (e) {
      console.error('Failed to parse raw hosts text:', e);
      setError(String(e));
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
    >
      <div
        className="modal-content"
        style={{ maxWidth: '960px', width: '100%', maxHeight: '80vh', overflow: 'hidden' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>{t('rawEdit.title')}</h2>
          <p>{t('rawEdit.subtitle')}</p>
        </div>

        {loading ? (
          <div style={{ padding: '24px', textAlign: 'center' }}>
            {t('common.loading')}
          </div>
        ) : (
          <>
            <div
              style={{
                padding: '12px 14px',
                marginBottom: '12px',
                background: 'var(--danger-bg)',
                borderRadius: 'var(--radius-md)',
                fontSize: '13px',
                color: 'var(--text-secondary)',
              }}
            >
              {t('rawEdit.warning')}
            </div>

            {error && (
              <div
                style={{
                  padding: '8px 10px',
                  marginBottom: '12px',
                  background: 'var(--danger-bg)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '13px',
                  color: 'var(--danger-color)',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {error}
              </div>
            )}

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1.4fr 1fr',
                gap: '12px',
                height: 'calc(80vh - 220px)',
                minHeight: '260px',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '6px',
                    fontSize: '13px',
                    color: 'var(--text-secondary)',
                  }}
                >
                  <span>{t('rawEdit.editorLabel')}</span>
                  {hasChanges && (
                    <span>{t('rawEdit.unsavedIndicator')}</span>
                  )}
                </div>
                <textarea
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  spellCheck={false}
                  style={{
                    flex: 1,
                    width: '100%',
                    resize: 'none',
                    fontFamily: 'monospace',
                    fontSize: '13px',
                    lineHeight: 1.4,
                    padding: '10px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-input)',
                    color: 'var(--text-primary)',
                    outline: 'none',
                  }}
                />
              </div>

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  overflow: 'hidden',
                  background: 'var(--bg-card)',
                }}
              >
                <div
                  style={{
                    padding: '8px 10px',
                    borderBottom: '1px solid var(--border-color)',
                    fontSize: '13px',
                    fontWeight: 600,
                    display: 'flex',
                    justifyContent: 'space-between',
                  }}
                >
                  <span>{t('rawEdit.diffTitle')}</span>
                  <span style={{ fontWeight: 400, color: 'var(--text-tertiary)' }}>
                    {hasChanges ? t('rawEdit.diffHint') : t('rawEdit.noChanges')}
                  </span>
                </div>
                <pre
                  style={{
                    flex: 1,
                    margin: 0,
                    padding: '8px 10px',
                    fontFamily: 'monospace',
                    fontSize: '12px',
                    lineHeight: 1.4,
                    overflow: 'auto',
                    background: 'var(--bg-card)',
                  }}
                >
                  {diffLines.length === 0 ? (
                    <span style={{ color: 'var(--text-tertiary)' }}>
                      {t('rawEdit.noChanges')}
                    </span>
                  ) : (
                    diffLines.map((line, idx) => {
                      let color = 'var(--text-secondary)';
                      if (line.type === 'added') color = 'var(--success-color)';
                      if (line.type === 'removed') color = 'var(--danger-color)';

                      const prefix =
                        line.type === 'added' ? '+ ' : line.type === 'removed' ? '- ' : '  ';

                      return (
                        <div key={idx} style={{ color }}>
                          {prefix}
                          {line.text}
                        </div>
                      );
                    })
                  )}
                </pre>
              </div>
            </div>
          </>
        )}

        <div className="modal-actions" style={{ marginTop: '16px' }}>
          <button className="btn-secondary" onClick={handleClose}>
            {t('common.cancel')}
          </button>
          <button
            className="btn-primary"
            onClick={handleApply}
            disabled={saving || !hasChanges}
          >
            {saving ? t('rawEdit.applying') : t('rawEdit.applyChanges')}
          </button>
        </div>
      </div>
    </div>
  );
};

