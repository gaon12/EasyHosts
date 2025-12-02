import React, { useState, useEffect, useRef } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { HostEntry } from '../types';
import { Search } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

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
    const { t } = useLanguage();
    const [ip, setIp] = useState(entry?.ip || '');
    const [domains, setDomains] = useState(entry?.domains.join(' ') || '');
    const [comment, setComment] = useState(entry?.comment || '');
    const [tags, setTags] = useState(entry?.tags?.join(', ') || '');
    const [errors, setErrors] = useState<{ ip?: string; domains?: string; tags?: string }>({});
    const [lookingUp, setLookingUp] = useState(false);
    const ipInputRef = useRef<HTMLInputElement>(null);

    // Auto-focus first input when modal opens
    useEffect(() => {
        if (isOpen && ipInputRef.current) {
            setTimeout(() => ipInputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    // Keyboard shortcuts
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                handleClose();
            } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                handleSave();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, ip, domains, comment, tags]);

    const sanitizeInput = (input: string): string => {
        // Remove any potentially dangerous characters while preserving valid input
        return input.trim().replace(/[<>'"]/g, '');
    };

    const validateIp = (ip: string): boolean => {
        const sanitized = sanitizeInput(ip);

        // IPv4 validation with strict checks
        const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
        if (ipv4Regex.test(sanitized)) {
            const parts = sanitized.split('.');
            return parts.every(part => {
                const num = parseInt(part, 10);
                return !isNaN(num) && num >= 0 && num <= 255;
            });
        }

        // IPv6 validation (improved)
        const ipv6Regex = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|::([fF]{4}(:0{1,4})?:)?((25[0-5]|(2[0-4]|1?[0-9])?[0-9])\.){3}(25[0-5]|(2[0-4]|1?[0-9])?[0-9]))$/;
        return ipv6Regex.test(sanitized);
    };

    const validateDomains = (domains: string): boolean => {
        const sanitized = sanitizeInput(domains);
        if (!sanitized) return false;

        const domainList = sanitized.split(/\s+/);
        // Improved domain validation regex
        const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

        return domainList.every(domain => {
            // Check length constraints
            if (domain.length === 0 || domain.length > 253) return false;
            // Check each label (part between dots) is valid
            const labels = domain.split('.');
            return labels.every(label => label.length > 0 && label.length <= 63) && domainRegex.test(domain);
        });
    };

    const handleDnsLookup = async () => {
        const domainList = domains.trim().split(/\s+/);
        if (domainList.length === 0 || !domainList[0]) {
            setErrors({ ...errors, domains: t('addEntry.errors.enterDomainFirst') });
            return;
        }

        setLookingUp(true);
        try {
            const result = await invoke<string>('lookup_dns', { domain: domainList[0] });
            setIp(result);
            setErrors({ ...errors, ip: undefined });
        } catch (error) {
            setErrors({ ...errors, ip: t('addEntry.errors.dnsLookupFailed') + ' ' + error });
        } finally {
            setLookingUp(false);
        }
    };

    const handleSave = () => {
        const newErrors: { ip?: string; domains?: string } = {};

        // Sanitize all inputs
        const sanitizedIp = sanitizeInput(ip);
        const sanitizedDomains = sanitizeInput(domains);
        const sanitizedComment = sanitizeInput(comment);
        const sanitizedTags = sanitizeInput(tags);

        if (!validateIp(sanitizedIp)) {
            newErrors.ip = t('addEntry.errors.invalidIp');
        }

        if (!validateDomains(sanitizedDomains)) {
            newErrors.domains = t('addEntry.errors.invalidDomains');
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        const domainList = sanitizedDomains.split(/\s+/).filter(d => d.length > 0);
        const tagList = sanitizedTags
            ? sanitizedTags.split(',').map(t => t.trim()).filter(t => t.length > 0 && t.length <= 50)
            : undefined;

        // Additional security: Limit array sizes
        if (domainList.length > 100) {
            setErrors({ domains: t('addEntry.errors.tooManyDomains') });
            return;
        }

        if (tagList && tagList.length > 20) {
            setErrors({ tags: t('addEntry.errors.tooManyTags') });
            return;
        }

        onSave({
            enabled: entry?.enabled ?? true,
            ip: sanitizedIp,
            domains: domainList,
            comment: sanitizedComment || undefined,
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
                    <h2>{entry ? t('addEntry.editTitle') : t('addEntry.title')}</h2>
                    <p>{t('addEntry.subtitle')}</p>
                </div>

                <div className="form-group">
                    <label className="form-label">{t('addEntry.ipAddress')}</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <input
                            ref={ipInputRef}
                            type="text"
                            className={`form-input ${errors.ip ? 'error' : ''}`}
                            placeholder={t('addEntry.ipPlaceholder')}
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
                        {t('addEntry.lookupHelp')}
                    </div>
                </div>

                <div className="form-group">
                    <label className="form-label">{t('addEntry.domains')}</label>
                    <input
                        type="text"
                        className={`form-input ${errors.domains ? 'error' : ''}`}
                        placeholder={t('addEntry.domainsPlaceholder')}
                        value={domains}
                        onChange={(e) => {
                            setDomains(e.target.value);
                            setErrors({ ...errors, domains: undefined });
                        }}
                    />
                    {errors.domains && <div className="error-message">{errors.domains}</div>}
                    <div style={{ fontSize: '13px', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                        {t('addEntry.domainsHelp')}
                    </div>
                </div>

                <div className="form-group">
                    <label className="form-label">{t('addEntry.comment')}</label>
                    <input
                        type="text"
                        className="form-input"
                        placeholder={t('addEntry.commentPlaceholder')}
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">{t('addEntry.tags')}</label>
                    <input
                        type="text"
                        className={`form-input ${errors.tags ? 'error' : ''}`}
                        placeholder={t('addEntry.tagsPlaceholder')}
                        value={tags}
                        onChange={(e) => {
                            setTags(e.target.value);
                            setErrors({ ...errors, tags: undefined });
                        }}
                    />
                    {errors.tags && <div className="error-message">{errors.tags}</div>}
                    <div style={{ fontSize: '13px', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                        {t('addEntry.tagsHelp')}
                    </div>
                </div>

                <div className="modal-actions">
                    <button className="btn-secondary" onClick={handleClose}>
                        {t('common.cancel')}
                    </button>
                    <button className="btn-primary" onClick={handleSave}>
                        {entry ? t('addEntry.saveChanges') : t('addEntry.addEntry')}
                    </button>
                </div>
            </div>
        </div>
    );
};
