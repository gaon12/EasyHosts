import React from 'react';

interface PermissionModalProps {
    isOpen: boolean;
    onContinueAnyway: () => void;
}

export const PermissionModal: React.FC<PermissionModalProps> = ({
    isOpen,
    onContinueAnyway
}) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h2>⚠️ Administrator Privileges Required</h2>
                    <p>EasyHosts needs administrator access to modify the hosts file</p>
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
                        The hosts file is a system file that requires administrator/root permissions to modify.
                    </p>
                    <p style={{
                        fontSize: '14px',
                        color: 'var(--text-primary)',
                        fontWeight: 600,
                        lineHeight: '1.6',
                        marginBottom: '12px'
                    }}>
                        To edit the hosts file, please restart this application as Administrator:
                    </p>
                    <ul style={{
                        fontSize: '14px',
                        color: 'var(--text-secondary)',
                        marginLeft: '20px',
                        lineHeight: '1.8'
                    }}>
                        <li>Close this application</li>
                        <li>Right-click on EasyHosts</li>
                        <li>Select "Run as administrator"</li>
                        <li>Click "Yes" on the UAC prompt</li>
                    </ul>
                    <p style={{
                        fontSize: '13px',
                        color: 'var(--text-tertiary)',
                        marginTop: '12px',
                        fontStyle: 'italic'
                    }}>
                        Without admin privileges, you can view entries and test ping, but cannot save changes.
                    </p>
                </div>

                <div className="modal-actions">
                    <button className="btn-primary" onClick={onContinueAnyway} style={{ flex: 1 }}>
                        OK, I Understand
                    </button>
                </div>
            </div>
        </div>
    );
};
