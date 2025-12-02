import React from 'react';
import { Section } from '../types';
import { Hash } from 'lucide-react';

interface SectionHeaderProps {
    section: Section;
    onToggle: () => void;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ section, onToggle }) => {
    return (
        <div className="section-header">
            <button
                className={`section-toggle ${!section.enabled ? 'disabled' : ''}`}
                onClick={onToggle}
            />
            <div className="section-title">
                <span className="section-icon">
                    <Hash size={18} />
                </span>
                <span>{section.title}</span>
            </div>
        </div>
    );
};
