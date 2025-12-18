import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiClient } from '../utils/api.js';
import { useAuth } from '../contexts/AuthContext';
import '../App.css';
import './Profile.css';

function Profile() {
    const { userId } = useParams();
    const { user: currentUser } = useAuth();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchProfile();
    }, [userId]);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get(`/api/users/${userId}`);
            setProfile(response.data.user);
        } catch (error) {
            console.error('Failed to fetch profile:', error);
            setError('Failed to load profile information');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="loading">Loading profile...</div>;
    }

    if (error || !profile) {
        return (
            <div>
                <h1>Profile Not Found</h1>
                <div className="container">
                    <div className="error-message">
                        <p>{error || 'User not found'}</p>
                        <button onClick={() => navigate('/dashboard')} className="btn btn-primary">
                            Go to Dashboard
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const isOwnProfile = currentUser?._id === profile._id;

    return (
        <div className="profile-page">
            <h1>{isOwnProfile ? 'My Profile' : `${profile.username}'s Profile`}</h1>

            {/* Profile Header */}
            <div className="container profile-header-section">
                <div className="profile-header-content">
                    <div className="profile-avatar-section">
                        {profile.avatar ? (
                            <img
                                src={profile.avatar}
                                alt={profile.username}
                                className="profile-avatar-large"
                            />
                        ) : (
                            <div className="profile-avatar-large placeholder">
                                {profile.username?.charAt(0).toUpperCase() || '?'}
                            </div>
                        )}
                    </div>
                    <div className="profile-info-section">
                        <h2 className="profile-username">{profile.username}</h2>
                        {profile.email && isOwnProfile && (
                            <p className="profile-email">{profile.email}</p>
                        )}
                        {profile.role === 'admin' && (
                            <span className="profile-badge admin-badge">👑 Admin</span>
                        )}
                    </div>
                </div>

                {/* Profile Stats */}
                <div className="profile-stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon">🏆</div>
                        <div className="stat-content">
                            <div className="stat-value-large">{profile.score || 0}</div>
                            <div className="stat-label-large">Total Score</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">🎯</div>
                        <div className="stat-content">
                            <div className="stat-value-large">{profile.solvedChallenges?.length || 0}</div>
                            <div className="stat-label-large">Challenges Solved</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">📅</div>
                        <div className="stat-content">
                            <div className="stat-value-large">
                                {new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                            </div>
                            <div className="stat-label-large">Member Since</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Team Information */}
            {profile.teamId && (
                <div className="container">
                    <h3 className="section-title">Team</h3>
                    <div className="team-info-card">
                        <div className="info-row">
                            <span className="info-label">Team:</span>
                            <button
                                onClick={() => navigate('/team')}
                                className="btn btn-link"
                            >
                                View Team Details →
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Additional Information */}
            <div className="container">
                <h3 className="section-title">Account Information</h3>
                <div className="profile-info-card">
                    <div className="info-row">
                        <span className="info-label">Username:</span>
                        <span className="info-value">{profile.username}</span>
                    </div>
                    {isOwnProfile && profile.email && (
                        <div className="info-row">
                            <span className="info-label">Email:</span>
                            <span className="info-value">{profile.email}</span>
                        </div>
                    )}
                    <div className="info-row">
                        <span className="info-label">Role:</span>
                        <span className="info-value">{profile.role === 'admin' ? 'Administrator' : 'User'}</span>
                    </div>
                    <div className="info-row">
                        <span className="info-label">Joined:</span>
                        <span className="info-value">{new Date(profile.createdAt).toLocaleDateString()}</span>
                    </div>
                </div>
            </div>

            {/* Actions */}
            {isOwnProfile && (
                <div className="container">
                    <div className="profile-actions">
                        <button onClick={() => navigate('/dashboard')} className="btn btn-secondary">
                            Go to Dashboard
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Profile;
