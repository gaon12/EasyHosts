import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { getPlatform, getHostsFilePath } from '../utils/platform';

interface PermissionModalProps {
    isOpen: boolean;
    onContinueAnyway: () => void;
}

export const PermissionModal: React.FC<PermissionModalProps> = ({
    isOpen,
    onContinueAnyway
}) => {
    const { t } = useLanguage();
    const platform = getPlatform();
    const hostsPath = getHostsFilePath(platform);

    if (!isOpen) return null;

    // Get platform-specific description
    const getDescription = () => {
        switch (platform) {
            case 'windows':
                return t('permission.descriptionWindows');
            case 'linux':
                return t('permission.descriptionLinux');
            case 'macos':
                return t('permission.descriptionMac');
            default:
                return t('permission.description');
        }
    };

    // Get platform-specific requirement message
    const getRequirement = () => {
        switch (platform) {
            case 'windows':
                return t('permission.requirementAdminWindows');
            case 'linux':
                return t('permission.requirementAdminLinux');
            case 'macos':
                return t('permission.requirementAdminMac');
            default:
                return t('permission.requirementAdmin');
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h2>⚠️ {t('permission.title')}</h2>
                    <p>{getDescription()}</p>
                </div>

                <div style={{
                    padding: '20px',
                    background: 'var(--bg-input)',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: '24px'
                }}>
                    <p style={{
                        fontSize: '14px',
                        color: 'var(--text-secondary)',
                        lineHeight: '1.6',
                        marginBottom: '12px'
                    }}>
                        {t('permission.hostsFilePath')} <code style={{
                            background: 'var(--bg-card)',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontFamily: 'monospace'
                        }}>{hostsPath}</code>
                    </p>
                    <p style={{
                        fontSize: '14px',
                        color: 'var(--text-primary)',
                        fontWeight: 600,
                        lineHeight: '1.6',
                        marginBottom: '8px'
                    }}>
                        {t('permission.requirements')}
                    </p>
                    <ul style={{
                        fontSize: '14px',
                        color: 'var(--text-secondary)',
                        marginLeft: '20px',
                        lineHeight: '1.8'
                    }}>
                        <li>{getRequirement()}</li>
                        <li>{t('permission.requirementRead')}</li>
                    </ul>
                </div>

                <div className="modal-actions">
                    <button className="btn-primary" onClick={onContinueAnyway} style={{ flex: 1 }}>
                        {t('permission.continueReadOnly')}
                    </button>
                </div>
            </div>
        </div>
    );
};
