import React, { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { HostEntry } from '../types';
import { Search } from 'lucide-react';

interface AddEntryModalProps {
    isOpen: boolean;
    entry?: HostEntry;
    onClose: () => void;
    onSave: (entry: HostEntry) => void;
}

export const AddEntryModal: React.FC<AddEntryModalProps> = ({
    isOpen,
    entry,
    onClose,
    onSave
}) => {
    const [ip, setIp] = useState(entry?.ip || '');
    const [domains, setDomains] = useState(entry?.domains.join(' ') || '');
    const [comment, setComment] = useState(entry?.comment || '');
    const [tags, setTags] = useState(entry?.tags?.join(', ') || '');
    const [errors, setErrors] = useState<{ ip?: string; domains?: string }>({});
    const [lookingUp, setLookingUp] = useState(false);

    const validateIp = (ip: string): boolean => {
        // Basic IPv4 validation
        const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
        if (ipv4Regex.test(ip)) {
            const parts = ip.split('.');
            return parts.every(part => parseInt(part) >= 0 && parseInt(part) <= 255);
        }

        // Basic IPv6 validation (simplified)
        const ipv6Regex = /^([0-9a-fA-F]{0,4}:){2,7}[0-9a-fA-F]{0,4}$/;
        return ipv6Regex.test(ip);
    };

    const validateDomains = (domains: string): boolean => {
        if (!domains.trim()) return false;

        const domainList = domains.trim().split(/\s+/);
        const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

        return domainList.every(domain => domain.length > 0 && domain.length < 253 && domainRegex.test(domain));
    };

    const handleDnsLookup = async () => {
        const domainList = domains.trim().split(/\s+/);
        if (domainList.length === 0 || !domainList[0]) {
            setErrors({ ...errors, domains: 'Please enter a domain first' });
            return;
        }

        setLookingUp(true);
        try {
            const result = await invoke<string>('lookup_dns', { domain: domainList[0] });
            setIp(result);
            setErrors({ ...errors, ip: undefined });
        } catch (error) {
            setErrors({ ...errors, ip: 'DNS lookup failed: ' + error });
        } finally {
            setLookingUp(false);
        }
    };

    const handleSave = () => {
        const newErrors: { ip?: string; domains?: string } = {};

        if (!validateIp(ip)) {
            newErrors.ip = 'Please enter a valid IP address';
        }

        if (!validateDomains(domains)) {
            newErrors.domains = 'Please enter valid domain name(s)';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        const domainList = domains.trim().split(/\s+/);
        const tagList = tags.trim()
            ? tags.split(',').map(t => t.trim()).filter(t => t.length > 0)
            : undefined;

        onSave({
            enabled: entry?.enabled ?? true,
            ip,
            domains: domainList,
            comment: comment.trim() || undefined,
            tags: tagList,
        });

        // Reset form
        setIp('');
        setDomains('');
        setComment('');
        setTags('');
        setErrors({});
        onClose();
    };

    const handleClose = () => {
        setErrors({});
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
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{entry ? 'Edit Entry' : 'Add New Entry'}</h2>
                    <p>Configure your hosts file entry</p>
                </div>

                <div className="form-group">
                    <label className="form-label">IP Address</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <input
                            type="text"
                            className={`form-input ${errors.ip ? 'error' : ''}`}
                            placeholder="127.0.0.1 or ::1"
                            value={ip}
                            onChange={(e) => {
                                setIp(e.target.value);
                                setErrors({ ...errors, ip: undefined });
                            }}
                            style={{ flex: 1 }}
                        />
                        <button
                            type="button"
                            className="btn-secondary"
                            onClick={handleDnsLookup}
                            disabled={lookingUp}
                            title="Lookup IP from domain"
                            style={{ padding: '0 16px', minWidth: 'auto', opacity: lookingUp ? 0.4 : 1 }}
                        >
                            {lookingUp ? (
                                <span>...</span>
                            ) : (
                                <Search size={18} />
                            )}
                        </button>
                    </div>
                    {errors.ip && <div className="error-message">{errors.ip}</div>}
                    <div style={{ fontSize: '13px', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                        Enter domain below, then click lookup to auto-fill IP (Domain → IP)
                    </div>
                </div>

                <div className="form-group">
                    <label className="form-label">Domain(s)</label>
                    <input
                        type="text"
                        className={`form-input ${errors.domains ? 'error' : ''}`}
                        placeholder="example.com or multiple.com domains.com"
                        value={domains}
                        onChange={(e) => {
                            setDomains(e.target.value);
                            setErrors({ ...errors, domains: undefined });
                        }}
                    />
                    {errors.domains && <div className="error-message">{errors.domains}</div>}
                    <div style={{ fontSize: '13px', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                        Separate multiple domains with spaces
                    </div>
                </div>

                <div className="form-group">
                    <label className="form-label">Comment (Optional)</label>
                    <input
                        type="text"
                        className="form-input"
                        placeholder="Local development server"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Tags (Optional)</label>
                    <input
                        type="text"
                        className="form-input"
                        placeholder="dev, api, frontend"
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                    />
                    <div style={{ fontSize: '13px', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                        Separate multiple tags with commas
                    </div>
                </div>

                <div className="modal-actions">
                    <button className="btn-secondary" onClick={handleClose}>
                        Cancel
                    </button>
                    <button className="btn-primary" onClick={handleSave}>
                        {entry ? 'Save Changes' : 'Add Entry'}
                    </button>
                </div>
            </div>
        </div>
    );
};
