import React from 'react';
import { Search, Plus, X } from 'lucide-react';

interface SearchBarProps {
    searchQuery: string;
    onSearchChange: (value: string) => void;
    onAddEntry: () => void;
    allTags: string[];
    selectedTags: string[];
    onToggleTag: (tag: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
    searchQuery,
    onSearchChange,
    onAddEntry,
    allTags,
    selectedTags,
    onToggleTag
}) => {
    return (
        <div style={{ marginBottom: '20px' }}>
            <div className="search-bar">
                <div className="search-input-wrapper">
                    <span className="search-icon">
                        <Search size={18} />
                    </span>
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Search IP or domain..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                    />
                </div>
                <button className="btn-primary" onClick={onAddEntry}>
                    <Plus size={18} />
                    <span>Add Entry</span>
                </button>
            </div>

            {allTags.length > 0 && (
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    flexWrap: 'wrap',
                    marginTop: '12px',
                    padding: '12px',
                    background: 'var(--bg-card)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)'
                }}>
                    <span style={{
                        fontSize: '13px',
                        color: 'var(--text-tertiary)',
                        fontWeight: 600,
                        marginRight: '4px'
                    }}>
                        Filter by tags:
                    </span>
                    {allTags.map(tag => {
                        const isSelected = selectedTags.includes(tag);
                        const isEtc = tag === 'etc';
                        return (
                            <button
                                key={tag}
                                onClick={() => onToggleTag(tag)}
                                style={{
                                    padding: '6px 12px',
                                    background: isSelected
                                        ? (isEtc ? 'var(--text-tertiary)' : 'var(--accent-blue)')
                                        : 'var(--bg-input)',
                                    color: isSelected
                                        ? 'white'
                                        : (isEtc ? 'var(--text-tertiary)' : 'var(--text-primary)'),
                                    border: `1px solid ${isSelected
                                        ? (isEtc ? 'var(--text-tertiary)' : 'var(--accent-blue)')
                                        : 'var(--border-color)'}`,
                                    borderRadius: 'var(--radius-sm)',
                                    fontSize: '12px',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    transition: 'var(--transition)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                }}
                                title={isEtc ? 'Untagged entries (auto-generated)' : undefined}
                            >
                                {tag}
                                {isSelected && <X size={14} />}
                            </button>
                        );
                    })}
                    {selectedTags.length > 0 && (
                        <button
                            onClick={() => selectedTags.forEach(tag => onToggleTag(tag))}
                            style={{
                                padding: '6px 12px',
                                background: 'transparent',
                                color: 'var(--text-tertiary)',
                                border: '1px solid var(--border-color)',
                                borderRadius: 'var(--radius-sm)',
                                fontSize: '12px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'var(--transition)'
                            }}
                        >
                            Clear filters
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};
