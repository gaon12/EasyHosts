import React from 'react';
import { Settings } from 'lucide-react';

interface HeaderProps {
    onSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onSettings }) => {
    return (
        <header className="app-header">
            <div className="header-content">
                <h1>Easy Hosts</h1>
                <p>Manage your local hosts entries efficiently</p>
            </div>
            <div className="header-actions">
                <button
                    className="icon-button"
                    onClick={onSettings}
                    title="Settings"
                >
                    <Settings size={20} />
                </button>
            </div>
        </header>
    );
};
