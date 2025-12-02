import React, { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { RotateCcw, AlertTriangle, Info, Sun, Moon, Undo, Redo, FolderOpen, HardDrive, Upload, Download, Globe } from 'lucide-react';
import packageJson from '../../package.json';
import { useLanguage } from '../contexts/LanguageContext';
import { Language, languageNames } from '../i18n';
import { getPlatform, getPlatformDisplayName } from '../utils/platform';
import { Profile } from '../types';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onReset: () => void;
    darkMode: boolean;
    onToggleDarkMode: () => void;
    autoFlushDns: boolean;
    onToggleAutoFlushDns: () => void;
    autoSwitchBySsid: boolean;
    onToggleAutoSwitchBySsid: () => void;
    compactView: boolean;
    onToggleCompactView: () => void;
    onOpenRawEditor: () => void;
    onRemoteSources: () => void;
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
    autoFlushDns,
    onToggleAutoFlushDns,
    autoSwitchBySsid,
    onToggleAutoSwitchBySsid,
    compactView,
    onToggleCompactView,
    onOpenRawEditor,
    onRemoteSources,
    onProfiles,
    onBackups,
    onImport,
    onExport,
    onUndo,
    onRedo,
    canUndo,
    canRedo
}) => {
    const { t, language, setLanguage } = useLanguage();
    const [resetting, setResetting] = useState(false);
    const [showResetConfirm, setShowResetConfirm] = useState(false);
    const [ssidRules, setSsidRules] = useState<Array<{ ssid: string; profileId: string }>>([]);
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [newSsid, setNewSsid] = useState('');
    const [newProfileId, setNewProfileId] = useState('');
    const platform = getPlatform();
    const platformName = getPlatformDisplayName(platform);

    useEffect(() => {
        if (!isOpen) return;

        try {
            const rawProfiles = localStorage.getItem('profiles');
            setProfiles(rawProfiles ? JSON.parse(rawProfiles) : []);
        } catch (error) {
            console.error('Failed to load profiles for SSID rules:', error);
            setProfiles([]);
        }

        try {
            const rawRules = localStorage.getItem('ssidProfileRules');
            setSsidRules(rawRules ? JSON.parse(rawRules) : []);
        } catch (error) {
            console.error('Failed to load SSID rules:', error);
            setSsidRules([]);
        }
    }, [isOpen]);

    const saveSsidRules = (rules: Array<{ ssid: string; profileId: string }>) => {
        setSsidRules(rules);
        localStorage.setItem('ssidProfileRules', JSON.stringify(rules));
    };

    const handleAddSsidRule = () => {
        const ssid = newSsid.trim();
        if (!ssid || !newProfileId) return;

        const existingIndex = ssidRules.findIndex(r => r.ssid === ssid);
        let next = [...ssidRules];
        if (existingIndex >= 0) {
            next[existingIndex] = { ssid, profileId: newProfileId };
        } else {
            next.push({ ssid, profileId: newProfileId });
        }
        saveSsidRules(next);
        setNewSsid('');
        setNewProfileId('');
    };

    const handleDeleteSsidRule = (ssid: string) => {
        const next = ssidRules.filter(r => r.ssid !== ssid);
        saveSsidRules(next);
    };

    const handleReset = async () => {
        setResetting(true);
        try {
            await invoke('reset_hosts_to_default');
            alert(t('settings.resetSuccess'));
            onReset();
            onClose();
        } catch (error) {
            alert(t('settings.resetFailed') + ' ' + error);
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
                    <h2>{t('settings.title')}</h2>
                    <p>{t('settings.subtitle')}</p>
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
                                {t('settings.aboutTitle')}
                            </h3>
                            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                                {t('settings.version')} {packageJson.version}
                            </p>
                            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                                {t('settings.platform')} {platformName}
                            </p>
                            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                                {t('settings.description')}
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
                            {t('settings.appearance')}
                        </h3>
                        <button
                            className="btn-secondary"
                            onClick={onToggleDarkMode}
                            style={{ width: '100%', justifyContent: 'center' }}
                        >
                            {darkMode ? <Sun size={18} style={{ marginRight: '8px' }} /> : <Moon size={18} style={{ marginRight: '8px' }} />}
                            {darkMode ? t('settings.switchToLight') : t('settings.switchToDark')}
                        </button>
                        <label
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                cursor: 'pointer',
                                marginTop: '12px',
                            }}
                        >
                            <input
                                type="checkbox"
                                checked={compactView}
                                onChange={onToggleCompactView}
                                style={{ cursor: 'pointer' }}
                            />
                            <span style={{ fontSize: '13px', fontWeight: 500 }}>
                                {t('settings.compactView')}
                            </span>
                        </label>
                        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                            {t('settings.compactViewDescription')}
                        </p>
                    </div>

                    {/* Language Section */}
                    <div style={{
                        padding: '16px',
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-md)',
                        marginBottom: '16px'
                    }}>
                        <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '4px' }}>
                            {t('settings.language')}
                        </h3>
                        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                            {t('settings.languageDescription')}
                        </p>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            {(['en', 'ko'] as Language[]).map((lang) => (
                                <button
                                    key={lang}
                                    className={language === lang ? 'btn-primary' : 'btn-secondary'}
                                    onClick={() => setLanguage(lang)}
                                    style={{ flex: 1, justifyContent: 'center' }}
                                >
                                    <Globe size={18} style={{ marginRight: '8px' }} />
                                    {languageNames[lang]}
                                </button>
                            ))}
                        </div>
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
                            {t('settings.editTools')}
                        </h3>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                                className="btn-secondary"
                                onClick={onUndo}
                                disabled={!canUndo}
                                style={{ flex: 1, justifyContent: 'center', opacity: canUndo ? 1 : 0.4 }}
                            >
                                <Undo size={18} style={{ marginRight: '8px' }} />
                                {t('settings.undo')}
                            </button>
                            <button
                                className="btn-secondary"
                                onClick={onRedo}
                                disabled={!canRedo}
                                style={{ flex: 1, justifyContent: 'center', opacity: canRedo ? 1 : 0.4 }}
                            >
                                <Redo size={18} style={{ marginRight: '8px' }} />
                                {t('settings.redo')}
                            </button>
                        </div>
                        <button
                            className="btn-secondary"
                            onClick={() => {
                                onOpenRawEditor();
                                onClose();
                            }}
                            style={{ width: '100%', justifyContent: 'center', marginTop: '8px' }}
                        >
                            {t('rawEdit.openEditor')}
                        </button>
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
                            {t('settings.dataManagement')}
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <button
                                className="btn-secondary"
                                onClick={() => {
                                    onProfiles();
                                    onClose();
                                }}
                                style={{ width: '100%', justifyContent: 'center' }}
                            >
                                <FolderOpen size={18} style={{ marginRight: '8px' }} />
                                {t('settings.manageProfiles')}
                            </button>
                            <button
                                className="btn-secondary"
                                onClick={() => {
                                    onRemoteSources();
                                    onClose();
                                }}
                                style={{ width: '100%', justifyContent: 'center' }}
                            >
                                <Globe size={18} style={{ marginRight: '8px' }} />
                                {t('settings.manageRemoteSources')}
                            </button>
                            <button
                                className="btn-secondary"
                                onClick={() => {
                                    onBackups();
                                    onClose();
                                }}
                                style={{ width: '100%', justifyContent: 'center' }}
                            >
                                <HardDrive size={18} style={{ marginRight: '8px' }} />
                                {t('settings.manageBackups')}
                            </button>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button
                                    className="btn-secondary"
                                    onClick={() => {
                                        onImport();
                                        onClose();
                                    }}
                                    style={{ flex: 1, justifyContent: 'center' }}
                                >
                                    <Upload size={18} style={{ marginRight: '8px' }} />
                                    {t('common.import')}
                                </button>
                                <button
                                    className="btn-secondary"
                                    onClick={() => {
                                        onExport();
                                        onClose();
                                    }}
                                style={{ flex: 1, justifyContent: 'center' }}
                            >
                                <Download size={18} style={{ marginRight: '8px' }} />
                                {t('common.export')}
                            </button>
                            </div>
                        </div>
                    </div>

                    {/* Network Section */}
                    <div style={{
                        padding: '16px',
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-md)',
                        marginBottom: '16px'
                    }}>
                        <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>
                            {t('settings.network')}
                        </h3>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                checked={autoFlushDns}
                                onChange={onToggleAutoFlushDns}
                                style={{ cursor: 'pointer' }}
                            />
                            <span style={{ fontSize: '13px', fontWeight: 500 }}>
                                {t('settings.autoFlushDns')}
                            </span>
                        </label>
                        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '6px' }}>
                            {t('settings.autoFlushDnsDescription')}
                        </p>

                        <div style={{ marginTop: '12px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    checked={autoSwitchBySsid}
                                    onChange={onToggleAutoSwitchBySsid}
                                    style={{ cursor: 'pointer' }}
                                />
                                <span style={{ fontSize: '13px', fontWeight: 500 }}>
                                    {t('settings.autoSwitchBySsid')}
                                </span>
                            </label>
                            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                                {t('settings.autoSwitchBySsidDescription')}
                            </p>
                        </div>

                        <div style={{ marginTop: '12px' }}>
                            <h4 style={{ fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                                {t('settings.ssidRulesTitle')}
                            </h4>
                            {profiles.length === 0 ? (
                                <p style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
                                    {t('settings.ssidRulesNoProfiles')}
                                </p>
                            ) : (
                                <>
                                    {ssidRules.length === 0 ? (
                                        <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '6px' }}>
                                            {t('settings.ssidRulesEmpty')}
                                        </p>
                                    ) : (
                                        ssidRules.map(rule => {
                                            const profile = profiles.find(p => p.id === rule.profileId);
                                            return (
                                                <div
                                                    key={rule.ssid}
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'space-between',
                                                        fontSize: '12px',
                                                        marginBottom: '4px',
                                                    }}
                                                >
                                                    <span style={{ marginRight: '8px' }}>{rule.ssid}</span>
                                                    <span style={{ flex: 1, color: 'var(--text-secondary)' }}>
                                                        {profile ? profile.name : t('settings.unknownProfile')}
                                                    </span>
                                                    <button
                                                        className="btn-icon delete"
                                                        onClick={() => handleDeleteSsidRule(rule.ssid)}
                                                        title={t('common.delete')}
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            );
                                        })
                                    )}
                                    <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                        <input
                                            type="text"
                                            className="form-input"
                                            placeholder={t('settings.ssidPlaceholder')}
                                            value={newSsid}
                                            onChange={(e) => setNewSsid(e.target.value)}
                                        />
                                        <select
                                            className="form-input"
                                            value={newProfileId}
                                            onChange={(e) => setNewProfileId(e.target.value)}
                                        >
                                            <option value="">{t('settings.ssidProfileSelect')}</option>
                                            {profiles.map(profile => (
                                                <option key={profile.id} value={profile.id}>
                                                    {profile.name}
                                                </option>
                                            ))}
                                        </select>
                                        <button
                                            className="btn-secondary"
                                            onClick={handleAddSsidRule}
                                            disabled={!newSsid.trim() || !newProfileId}
                                            style={{ justifyContent: 'center' }}
                                        >
                                            {t('settings.ssidRulesAdd')}
                                        </button>
                                    </div>
                                </>
                            )}
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
                                    {t('settings.dangerZone')}
                                </h3>
                                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                                    {t('settings.dangerZoneDescription')}
                                </p>

                                {!showResetConfirm ? (
                                    <button
                                        className="btn-secondary"
                                        onClick={() => setShowResetConfirm(true)}
                                        style={{
                                            borderColor: 'var(--danger-color)',
                                            color: 'var(--danger-color)',
                                            display: 'flex',
                                            alignItems: 'center'
                                        }}
                                    >
                                        <RotateCcw size={16} style={{ marginRight: '8px' }} />
                                        {t('settings.resetToDefault')}
                                    </button>
                                ) : (
                                    <div>
                                        <p style={{
                                            fontSize: '13px',
                                            fontWeight: 600,
                                            color: 'var(--danger-color)',
                                            marginBottom: '12px'
                                        }}>
                                            {t('settings.resetConfirm')}
                                        </p>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button
                                                className="btn-secondary"
                                                onClick={() => setShowResetConfirm(false)}
                                                style={{ flex: 1 }}
                                            >
                                                {t('common.cancel')}
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
                                                {resetting ? t('settings.resetting') : t('settings.yesReset')}
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
                        {t('common.close')}
                    </button>
                </div>
            </div>
        </div>
    );
};
