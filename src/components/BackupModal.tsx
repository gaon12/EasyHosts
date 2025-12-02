import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { BackupInfo } from '../types';
import { RotateCcw, Trash2, HardDrive, Calendar, FileText } from 'lucide-react';

interface BackupModalProps {
    isOpen: boolean;
    onClose: () => void;
    onRestore: () => void;
}

export const BackupModal: React.FC<BackupModalProps> = ({
    isOpen,
    onClose,
    onRestore
}) => {
    const [backups, setBackups] = useState<BackupInfo[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            loadBackups();
        }
    }, [isOpen]);

    const loadBackups = async () => {
        setLoading(true);
        try {
            const backupList = await invoke<BackupInfo[]>('list_backups');
            setBackups(backupList);
        } catch (error) {
            console.error('Failed to load backups:', error);
            alert('Failed to load backups: ' + error);
        } finally {
            setLoading(false);
        }
    };

    const handleRestore = async (backup: BackupInfo) => {
        if (!confirm(`Restore from backup ${backup.filename}?\n\nYour current hosts file will be backed up first.`)) {
            return;
        }

        try {
            await invoke('restore_backup', { backupPath: backup.path });
            alert('Backup restored successfully!');
            onRestore();
            onClose();
        } catch (error) {
            alert('Failed to restore backup: ' + error);
        }
    };

    const handleDelete = async (backup: BackupInfo) => {
        if (!confirm(`Delete backup ${backup.filename}?\n\nThis action cannot be undone.`)) {
            return;
        }

        try {
            await invoke('delete_backup', { backupPath: backup.path });
            loadBackups();
        } catch (error) {
            alert('Failed to delete backup: ' + error);
        }
    };

    const formatTimestamp = (timestamp: string) => {
        // Format: YYYYMMDD_HHMMSS -> YYYY-MM-DD HH:MM:SS
        if (timestamp.length >= 15) {
            const date = timestamp.substring(0, 8);
            const time = timestamp.substring(9, 15);
            return `${date.substring(0, 4)}-${date.substring(4, 6)}-${date.substring(6, 8)} ${time.substring(0, 2)}:${time.substring(2, 4)}:${time.substring(4, 6)}`;
        }
        return timestamp;
    };

    const formatSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" style={{ maxWidth: '700px' }} onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Backup Management</h2>
                    <p>Restore or delete your hosts file backups</p>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-tertiary)' }}>
                        Loading backups...
                    </div>
                ) : backups.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-tertiary)' }}>
                        <HardDrive size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
                        <p>No backups found</p>
                    </div>
                ) : (
                    <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                        {backups.map((backup) => (
                            <div
                                key={backup.path}
                                style={{
                                    padding: '16px',
                                    background: 'var(--bg-card)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: 'var(--radius-md)',
                                    marginBottom: '12px'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'start', gap: '12px' }}>
                                    <FileText size={20} style={{ color: 'var(--accent-blue)', flexShrink: 0, marginTop: '2px' }} />
                                    <div style={{ flex: 1 }}>
                                        <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '8px' }}>
                                            {backup.filename}
                                        </h3>
                                        <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <Calendar size={14} />
                                                {formatTimestamp(backup.timestamp)}
                                            </span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <HardDrive size={14} />
                                                {formatSize(backup.size)}
                                            </span>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button
                                            className="btn-secondary"
                                            onClick={() => handleRestore(backup)}
                                            title="Restore this backup"
                                            style={{ padding: '8px 16px', fontSize: '13px' }}
                                        >
                                            <RotateCcw size={16} style={{ marginRight: '8px' }} />
                                            Restore
                                        </button>
                                        <button
                                            className="btn-icon delete"
                                            onClick={() => handleDelete(backup)}
                                            title="Delete backup"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="modal-actions" style={{ marginTop: '20px' }}>
                    <button className="btn-secondary" onClick={onClose}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};
