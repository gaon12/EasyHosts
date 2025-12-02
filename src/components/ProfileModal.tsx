import React, { useState, useEffect } from 'react';
import { Profile, HostsData } from '../types';
import { Plus, Check, Trash2, FileText } from 'lucide-react';

interface ProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentData: HostsData;
    onProfileLoad: (profile: Profile) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
    isOpen,
    onClose,
    currentData,
    onProfileLoad
}) => {
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [activeProfileId, setActiveProfileId] = useState<string | null>(null);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newProfileName, setNewProfileName] = useState('');
    const [newProfileDescription, setNewProfileDescription] = useState('');

    useEffect(() => {
        if (isOpen) {
            loadProfiles();
        }
    }, [isOpen]);

    const loadProfiles = async () => {
        try {
            const raw = localStorage.getItem('profiles');
            if (raw) {
                const parsed: Profile[] = JSON.parse(raw);
                setProfiles(parsed);
            } else {
                setProfiles([]);
            }
            const activeId = localStorage.getItem('activeProfileId');
            setActiveProfileId(activeId);
        } catch (error) {
            console.error('Failed to load profiles from localStorage:', error);
            setProfiles([]);
            setActiveProfileId(null);
        }
    };

    const handleCreateProfile = async () => {
        if (!newProfileName.trim()) return;

        try {
            const id =
                typeof crypto !== 'undefined' && 'randomUUID' in crypto
                    ? crypto.randomUUID()
                    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

            const now = new Date().toISOString();
            const newProfile: Profile = {
                id,
                name: newProfileName.trim(),
                description: newProfileDescription.trim() || undefined,
                hostsData: JSON.parse(JSON.stringify(currentData)),
                createdAt: now,
                updatedAt: now,
            };

            const nextProfiles = [...profiles, newProfile];
            setProfiles(nextProfiles);
            localStorage.setItem('profiles', JSON.stringify(nextProfiles));

            setNewProfileName('');
            setNewProfileDescription('');
            setShowCreateForm(false);
        } catch (error) {
            alert('Failed to create profile: ' + error);
        }
    };

    const handleActivateProfile = async (profile: Profile) => {
        try {
            setActiveProfileId(profile.id);
            localStorage.setItem('activeProfileId', profile.id);
            onProfileLoad(profile);
            onClose();
        } catch (error) {
            alert('Failed to activate profile: ' + error);
        }
    };

    const handleDeleteProfile = async (profileId: string) => {
        if (!confirm('Are you sure you want to delete this profile?')) return;

        try {
            const nextProfiles = profiles.filter(p => p.id !== profileId);
            setProfiles(nextProfiles);
            localStorage.setItem('profiles', JSON.stringify(nextProfiles));

            if (activeProfileId === profileId) {
                setActiveProfileId(null);
                localStorage.removeItem('activeProfileId');
            }
        } catch (error) {
            alert('Failed to delete profile: ' + error);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" style={{ maxWidth: '600px' }} onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Profile Management</h2>
                    <p>Save and switch between different host configurations</p>
                </div>

                <div style={{ marginBottom: '20px' }}>
                    {!showCreateForm ? (
                        <button
                            className="btn-primary"
                            onClick={() => setShowCreateForm(true)}
                            style={{ width: '100%', justifyContent: 'center' }}
                        >
                            <Plus size={18} style={{ marginRight: '8px' }} />
                            Create New Profile
                        </button>
                    ) : (
                        <div style={{
                            padding: '16px',
                            background: 'var(--bg-input)',
                            borderRadius: 'var(--radius-md)',
                            marginBottom: '12px'
                        }}>
                            <div className="form-group">
                                <label className="form-label">Profile Name</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="e.g., Development, Production"
                                    value={newProfileName}
                                    onChange={(e) => setNewProfileName(e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Description (optional)</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Brief description"
                                    value={newProfileDescription}
                                    onChange={(e) => setNewProfileDescription(e.target.value)}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button
                                    className="btn-secondary"
                                    onClick={() => {
                                        setShowCreateForm(false);
                                        setNewProfileName('');
                                        setNewProfileDescription('');
                                    }}
                                    style={{ flex: 1 }}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="btn-primary"
                                    onClick={handleCreateProfile}
                                    disabled={!newProfileName.trim()}
                                    style={{ flex: 1 }}
                                >
                                    Create
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    {profiles.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-tertiary)' }}>
                            <FileText size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
                            <p>No profiles yet. Create one to get started!</p>
                        </div>
                    ) : (
                        profiles.map((profile) => (
                            <div
                                key={profile.id}
                                style={{
                                    padding: '16px',
                                    background: activeProfileId === profile.id ? 'var(--accent-bg)' : 'var(--bg-card)',
                                    border: `1px solid ${activeProfileId === profile.id ? 'var(--accent-blue)' : 'var(--border-color)'}`,
                                    borderRadius: 'var(--radius-md)',
                                    marginBottom: '12px',
                                    cursor: 'pointer',
                                    transition: 'var(--transition)'
                                }}
                                onClick={() => handleActivateProfile(profile)}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    {activeProfileId === profile.id && (
                                        <Check size={20} style={{ color: 'var(--accent-blue)', flexShrink: 0 }} />
                                    )}
                                    <div style={{ flex: 1 }}>
                                        <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '4px' }}>
                                            {profile.name}
                                        </h3>
                                        {profile.description && (
                                            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                                                {profile.description}
                                            </p>
                                        )}
                                        <p style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
                                            {profile.hostsData.entries.length} entries · Updated {new Date(profile.updatedAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <button
                                        className="btn-icon delete"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteProfile(profile.id);
                                        }}
                                        title="Delete profile"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="modal-actions" style={{ marginTop: '20px' }}>
                    <button className="btn-secondary" onClick={onClose}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};
