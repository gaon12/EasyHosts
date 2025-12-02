import React from 'react';
import { Settings } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface HeaderProps {
    onSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onSettings }) => {
    const { t } = useLanguage();

    return (
        <header className="app-header">
            <div className="header-content">
                <h1>{t('header.title')}</h1>
                <p>{t('settings.description')}</p>
            </div>
            <div className="header-actions">
                <button
                    className="icon-button"
                    onClick={onSettings}
                    title={t('header.settings')}
                >
                    <Settings size={20} />
                </button>
            </div>
        </header>
    );
};
