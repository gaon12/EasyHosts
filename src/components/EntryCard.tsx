import React, { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { HostEntry, PingResult } from '../types';
import { ChevronRight, ChevronDown, Edit2, Trash2, Hash, Radio, Tag } from 'lucide-react';

interface EntryCardProps {
    entry: HostEntry;
    onToggle: () => void;
    onEdit: () => void;
    onDelete: () => void;
}

export const EntryCard: React.FC<EntryCardProps> = ({
    entry,
    onToggle,
    onEdit,
    onDelete
}) => {
    const [pingResult, setPingResult] = useState<PingResult | null>(null);
    const [pinging, setPinging] = useState(false);
    const [expanded, setExpanded] = useState(false);

    const handlePing = async () => {
        if (entry.domains.length === 0) return;

        setPinging(true);
        try {
            const result = await invoke<PingResult>('ping_host', {
                domain: entry.domains[0]
            });

            // Treat unknown RTT as failure
            if (result.success && !result.avg_rtt) {
                setPingResult({
                    success: false,
                    message: 'Timeout',
                });
            } else {
                setPingResult(result);
            }
        } catch (error) {
            setPingResult({
                success: false,
                message: 'Error: ' + error,
            });
        } finally {
            setPinging(false);
        }
    };

    const displayDomain = entry.domains.length > 0
        ? (entry.domains[0].length > 30
            ? entry.domains[0].substring(0, 27) + '...'
            : entry.domains[0])
        : 'No domain';

    return (
        <div className="entry-card">
            <div
                className="entry-header"
                style={{ cursor: 'pointer' }}
                onClick={() => setExpanded(!expanded)}
            >
                <button
                    className={`entry-toggle ${!entry.enabled ? 'disabled' : ''}`}
                    onClick={(e) => {
                        e.stopPropagation();
                        onToggle();
                    }}
                />
                <div className="entry-domain">
                    <span style={{ marginRight: '4px', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center' }}>
                        {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </span>
                    <span>{displayDomain}</span>
                </div>
                <span className="entry-ip">{entry.ip}</span>
                <div className="entry-actions" onClick={(e) => e.stopPropagation()}>
                    <button className="btn-icon" onClick={onEdit} title="Edit">
                        <Edit2 size={16} />
                    </button>
                    <button className="btn-icon delete" onClick={onDelete} title="Delete">
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>

            {expanded && (
                <>
                    {entry.domains.length > 1 && (
                        <div className="entry-comment">
                            <span className="comment-icon">
                                <Hash size={16} />
                            </span>
                            <div className="comment-text">
                                <strong>All domains:</strong> {entry.domains.join(', ')}
                            </div>
                        </div>
                    )}

                    {entry.comment && (
                        <div className="entry-comment">
                            <span className="comment-icon">
                                <Hash size={16} />
                            </span>
                            <div className="comment-text">{entry.comment}</div>
                        </div>
                    )}

                    {(() => {
                        const displayTags = entry.tags && entry.tags.length > 0 ? entry.tags : ['etc'];
                        return (
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                marginBottom: '12px',
                                flexWrap: 'wrap'
                            }}>
                                <Tag size={16} style={{ color: 'var(--text-tertiary)' }} />
                                {displayTags.map((tag, idx) => (
                                    <span
                                        key={idx}
                                        style={{
                                            padding: '4px 10px',
                                            background: tag === 'etc' ? 'var(--bg-input)' : 'var(--accent-bg)',
                                            color: tag === 'etc' ? 'var(--text-tertiary)' : 'var(--accent-blue)',
                                            borderRadius: 'var(--radius-sm)',
                                            fontSize: '12px',
                                            fontWeight: 600
                                        }}
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        );
                    })()}

                    <div className="ping-test">
                        <span className="ping-icon">
                            <Radio size={18} />
                        </span>
                        <span className="ping-label">Ping Test</span>
                        {pinging ? (
                            <span className="ping-result pending">Testing...</span>
                        ) : pingResult ? (
                            <span className={`ping-result ${pingResult.success ? 'success' : 'error'}`}>
                                {pingResult.message}
                            </span>
                        ) : (
                            <button className="btn-primary" style={{ padding: '6px 16px', fontSize: '13px' }} onClick={handlePing}>
                                Test
                            </button>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};
