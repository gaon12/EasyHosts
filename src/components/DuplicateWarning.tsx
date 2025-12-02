import React from 'react';
import { DuplicateEntry } from '../types';
import { AlertTriangle } from 'lucide-react';

interface DuplicateWarningProps {
    duplicates: DuplicateEntry[];
    onViewEntry: (index: number) => void;
}

export const DuplicateWarning: React.FC<DuplicateWarningProps> = ({ duplicates, onViewEntry }) => {
    if (duplicates.length === 0) return null;

    return (
        <div style={{
            background: 'var(--danger-bg)',
            border: '1px solid var(--danger-color)',
            borderRadius: 'var(--radius-md)',
            padding: '16px',
            marginBottom: '24px'
        }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <AlertTriangle size={20} style={{ color: 'var(--danger-color)', flexShrink: 0, marginTop: '2px' }} />
                <div style={{ flex: 1 }}>
                    <h3 style={{
                        fontSize: '15px',
                        fontWeight: 600,
                        color: 'var(--danger-color)',
                        marginBottom: '8px'
                    }}>
                        Duplicate Domain Detected
                    </h3>
                    <p style={{
                        fontSize: '14px',
                        color: 'var(--text-secondary)',
                        marginBottom: '12px'
                    }}>
                        {duplicates.length} domain(s) have multiple IP assignments:
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {duplicates.map((dup, idx) => (
                            <div
                                key={idx}
                                style={{
                                    background: 'var(--bg-card)',
                                    padding: '12px',
                                    borderRadius: 'var(--radius-sm)',
                                    border: '1px solid var(--border-color)'
                                }}
                            >
                                <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '6px' }}>
                                    {dup.domain}
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    {dup.entries.map((entry, entryIdx) => (
                                        <div
                                            key={entryIdx}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                fontSize: '13px'
                                            }}
                                        >
                                            <span style={{
                                                padding: '4px 8px',
                                                background: 'var(--accent-bg)',
                                                color: 'var(--accent-blue)',
                                                borderRadius: 'var(--radius-sm)',
                                                fontFamily: 'monospace',
                                                fontWeight: 600
                                            }}>
                                                {entry.ip}
                                            </span>
                                            <button
                                                onClick={() => onViewEntry(entry.index)}
                                                style={{
                                                    fontSize: '12px',
                                                    color: 'var(--accent-blue)',
                                                    background: 'none',
                                                    border: 'none',
                                                    cursor: 'pointer',
                                                    textDecoration: 'underline',
                                                    padding: 0
                                                }}
                                            >
                                                View entry
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
