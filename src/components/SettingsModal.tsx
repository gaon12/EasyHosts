import React, { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { RotateCcw, AlertTriangle, Info, Sun, Moon, Undo, Redo, FolderOpen, HardDrive, Upload, Download } from 'lucide-react';
import packageJson from '../../package.json';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onReset: () => void;
    darkMode: boolean;
    onToggleDarkMode: () => void;
    onProfiles: () => void;
    onBackups: () => void;
    onImport: () => void;
    onExport: () => void;
    onUndo: () => void;
    onRedo: () => void;
    canUndo: boolean;
    canRedo: boolean;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
    isOpen,
    onClose,
    onReset,
    darkMode,
    onToggleDarkMode,
    onProfiles,
    onBackups,
    onImport,
    onExport,
    onUndo,
    onRedo,
    canUndo,
    canRedo
}) => {
    const [resetting, setResetting] = useState(false);
    const [showResetConfirm, setShowResetConfirm] = useState(false);

    const handleReset = async () => {
        setResetting(true);
        try {
            await invoke('reset_hosts_to_default');
            alert('Hosts file has been reset to Windows default.\nA backup was created automatically.');
            onReset();
            onClose();
        } catch (error) {
            alert('Failed to reset hosts file: ' + error);
        } finally {
            setResetting(false);
            setShowResetConfirm(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" style={{ maxWidth: '600px', maxHeight: '80vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Settings</h2>
                    <p>Application settings and tools</p>
                </div>

                <div style={{ marginBottom: '24px' }}>
                    {/* About Section */}
                    <div style={{
                        padding: '16px',
                        background: 'var(--bg-input)',
                        borderRadius: 'var(--radius-md)',
                        marginBottom: '16px',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '12px'
                    }}>
                        <Info size={20} style={{ color: 'var(--accent-blue)', flexShrink: 0, marginTop: '2px' }} />
                        <div>
                            <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '4px' }}>
                                About Easy Hosts
                            </h3>
                            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                                Version: {packageJson.version}
                            </p>
                            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                                A modern hosts file manager for Windows
                            </p>
                        </div>
                    </div>

                    {/* Appearance Section */}
                    <div style={{
                        padding: '16px',
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-md)',
                        marginBottom: '16px'
                    }}>
                        <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>
                            Appearance
                        </h3>
                        <button
                            className="btn-secondary"
                            onClick={onToggleDarkMode}
                            style={{ width: '100%', justifyContent: 'center', gap: '12px' }}
                        >
                            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
                            Switch to {darkMode ? 'Light' : 'Dark'} Mode
                        </button>
                    </div>

                    {/* Edit Tools Section */}
                    <div style={{
                        padding: '16px',
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-md)',
                        marginBottom: '16px'
                    }}>
                        <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>
                            Edit Tools
                        </h3>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                                className="btn-secondary"
                                onClick={onUndo}
                                disabled={!canUndo}
                                style={{ flex: 1, justifyContent: 'center', gap: '12px', opacity: canUndo ? 1 : 0.4 }}
                            >
                                <Undo size={18} />
                                Undo (Ctrl+Z)
                            </button>
                            <button
                                className="btn-secondary"
                                onClick={onRedo}
                                disabled={!canRedo}
                                style={{ flex: 1, justifyContent: 'center', gap: '12px', opacity: canRedo ? 1 : 0.4 }}
                            >
                                <Redo size={18} />
                                Redo (Ctrl+Y)
                            </button>
                        </div>
                    </div>

                    {/* Data Management Section */}
                    <div style={{
                        padding: '16px',
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-md)',
                        marginBottom: '16px'
                    }}>
                        <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>
                            Data Management
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <button
                                className="btn-secondary"
                                onClick={() => {
                                    onProfiles();
                                    onClose();
                                }}
                                style={{ width: '100%', justifyContent: 'center', gap: '12px' }}
                            >
                                <FolderOpen size={18} />
                                Manage Profiles
                            </button>
                            <button
                                className="btn-secondary"
                                onClick={() => {
                                    onBackups();
                                    onClose();
                                }}
                                style={{ width: '100%', justifyContent: 'center', gap: '12px' }}
                            >
                                <HardDrive size={18} />
                                Manage Backups
                            </button>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button
                                    className="btn-secondary"
                                    onClick={() => {
                                        onImport();
                                        onClose();
                                    }}
                                    style={{ flex: 1, justifyContent: 'center', gap: '12px' }}
                                >
                                    <Upload size={18} />
                                    Import
                                </button>
                                <button
                                    className="btn-secondary"
                                    onClick={() => {
                                        onExport();
                                        onClose();
                                    }}
                                    style={{ flex: 1, justifyContent: 'center', gap: '12px' }}
                                >
                                    <Download size={18} />
                                    Export
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Danger Zone */}

                    <div style={{
                        padding: '16px',
                        background: 'var(--danger-bg)',
                        border: '1px solid var(--danger-color)',
                        borderRadius: 'var(--radius-md)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '12px' }}>
                            <AlertTriangle size={20} style={{ color: 'var(--danger-color)', flexShrink: 0, marginTop: '2px' }} />
                            <div>
                                <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--danger-color)', marginBottom: '4px' }}>
                                    Danger Zone
                                </h3>
                                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                                    Reset hosts file to Windows default. This will remove all custom entries.
                                </p>

                                {!showResetConfirm ? (
                                    <button
                                        className="btn-secondary"
                                        onClick={() => setShowResetConfirm(true)}
                                        style={{
                                            borderColor: 'var(--danger-color)',
                                            color: 'var(--danger-color)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px'
                                        }}
                                    >
                                        <RotateCcw size={16} />
                                        Reset to Default
                                    </button>
                                ) : (
                                    <div>
                                        <p style={{
                                            fontSize: '13px',
                                            fontWeight: 600,
                                            color: 'var(--danger-color)',
                                            marginBottom: '12px'
                                        }}>
                                            Are you sure? This action cannot be undone!
                                        </p>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button
                                                className="btn-secondary"
                                                onClick={() => setShowResetConfirm(false)}
                                                style={{ flex: 1 }}
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                className="btn-primary"
                                                onClick={handleReset}
                                                disabled={resetting}
                                                style={{
                                                    flex: 1,
                                                    background: 'var(--danger-color)',
                                                    borderColor: 'var(--danger-color)'
                                                }}
                                            >
                                                {resetting ? 'Resetting...' : 'Yes, Reset'}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="modal-actions">
                    <button className="btn-secondary" onClick={onClose}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};
