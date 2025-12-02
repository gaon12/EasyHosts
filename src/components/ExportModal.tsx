import React, { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { save } from '@tauri-apps/plugin-dialog';
import { HostsData } from '../types';
import { Package, FileText } from 'lucide-react';

interface ExportModalProps {
    isOpen: boolean;
    hostsData: HostsData;
    onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, hostsData, onClose }) => {
    const [exporting, setExporting] = useState(false);

    const handleExportJSON = async () => {
        setExporting(true);
        try {
            const jsonStr = await invoke<string>('export_to_json', { data: hostsData });

            const filePath = await save({
                filters: [{
                    name: 'JSON',
                    extensions: ['json']
                }],
                defaultPath: `hosts_backup_${new Date().toISOString().split('T')[0]}.json`
            });

            if (filePath) {
                // Write to file using File System API
                await writeTextFile(filePath, jsonStr);
                alert('Exported successfully to JSON!');
                onClose();
            }
        } catch (error) {
            alert('Failed to export: ' + error);
        } finally {
            setExporting(false);
        }
    };

    const handleExportHosts = async () => {
        setExporting(true);
        try {
            const hostsContent = await invoke<string>('export_to_hosts_format', { data: hostsData });

            const filePath = await save({
                filters: [{
                    name: 'Hosts File',
                    extensions: ['txt', 'hosts']
                }],
                defaultPath: `hosts_${new Date().toISOString().split('T')[0]}.txt`
            });

            if (filePath) {
                await writeTextFile(filePath, hostsContent);
                alert('Exported successfully to hosts format!');
                onClose();
            }
        } catch (error) {
            alert('Failed to export: ' + error);
        } finally {
            setExporting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Export Hosts Configuration</h2>
                    <p>Choose export format</p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <button
                        className="btn-primary"
                        onClick={handleExportJSON}
                        disabled={exporting}
                        style={{ width: '100%', justifyContent: 'center' }}
                    >
                        <Package size={18} />
                        Export as JSON
                    </button>
                    <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', marginTop: '-8px' }}>
                        Recommended for backup and import later
                    </p>

                    <button
                        className="btn-secondary"
                        onClick={handleExportHosts}
                        disabled={exporting}
                        style={{ width: '100%', justifyContent: 'center', display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                        <FileText size={18} />
                        Export as Hosts File
                    </button>
                    <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', marginTop: '-8px' }}>
                        Standard hosts file format
                    </p>
                </div>

                <div className="modal-actions" style={{ marginTop: '24px' }}>
                    <button className="btn-secondary" onClick={onClose}>
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

// Helper function to write text file
async function writeTextFile(path: string, contents: string) {
    const { writeTextFile: tauriWriteTextFile } = await import('@tauri-apps/plugin-fs');
    await tauriWriteTextFile(path, contents);
}
