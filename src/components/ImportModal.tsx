import React, { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { open } from '@tauri-apps/plugin-dialog';
import { HostsData } from '../types';
import { FolderOpen, FileText, Folder } from 'lucide-react';

interface ImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onImport: (data: HostsData, merge: boolean) => void;
}

export const ImportModal: React.FC<ImportModalProps> = ({ isOpen, onClose, onImport }) => {
    const [importing, setImporting] = useState(false);
    const [previewData, setPreviewData] = useState<HostsData | null>(null);
    const [mergeMode, setMergeMode] = useState(true);

    const handleSelectFile = async () => {
        try {
            const selected = await open({
                multiple: false,
                filters: [{
                    name: 'JSON',
                    extensions: ['json']
                }]
            });

            if (selected && typeof selected === 'string') {
                setImporting(true);

                // Read file
                const { readTextFile } = await import('@tauri-apps/plugin-fs');
                const jsonStr = await readTextFile(selected);

                // Parse and validate
                const importedData = await invoke<HostsData>('import_from_json', { jsonStr });
                setPreviewData(importedData);
            }
        } catch (error) {
            alert('Failed to import: ' + error);
        } finally {
            setImporting(false);
        }
    };

    const handleConfirmImport = () => {
        if (previewData) {
            onImport(previewData, mergeMode);
            setPreviewData(null);
            onClose();
        }
    };

    const handleCancel = () => {
        setPreviewData(null);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={handleCancel}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Import Hosts Configuration</h2>
                    <p>Import from JSON backup file</p>
                </div>

                {!previewData ? (
                    <>
                        <button
                            className="btn-primary"
                            onClick={handleSelectFile}
                            disabled={importing}
                            style={{ width: '100%', marginBottom: '16px', justifyContent: 'center' }}
                        >
                            <FolderOpen size={18} />
                            Select JSON File
                        </button>
                        <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', textAlign: 'center' }}>
                            {importing ? 'Loading file...' : 'Choose a previously exported JSON file'}
                        </p>
                    </>
                ) : (
                    <>
                        <div style={{
                            padding: '16px',
                            background: 'var(--bg-input)',
                            borderRadius: 'var(--radius-md)',
                            marginBottom: '16px'
                        }}>
                            <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>
                                Preview
                            </h3>
                            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <FileText size={14} /> {previewData.entries.length} entries
                            </p>
                            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Folder size={14} /> {previewData.sections.length} sections
                            </p>
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                <input
                                    type="radio"
                                    checked={mergeMode}
                                    onChange={() => setMergeMode(true)}
                                />
                                <span style={{ fontSize: '14px' }}>Merge with existing entries</span>
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginTop: '8px' }}>
                                <input
                                    type="radio"
                                    checked={!mergeMode}
                                    onChange={() => setMergeMode(false)}
                                />
                                <span style={{ fontSize: '14px' }}>Replace all entries</span>
                            </label>
                        </div>
                    </>
                )}

                <div className="modal-actions">
                    <button className="btn-secondary" onClick={handleCancel}>
                        Cancel
                    </button>
                    {previewData && (
                        <button className="btn-primary" onClick={handleConfirmImport}>
                            Import
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
