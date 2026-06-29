import React, { useState } from 'react';
import { apiRequest } from '../utils/api';

export default function Register({ onRegisterSuccess, onNavigateToLogin, addAlert }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!username || !password || !confirmPassword) {
            addAlert('Please fill in all fields.', 'error');
            return;
        }

        if (password !== confirmPassword) {
            addAlert('Passwords do not match.', 'error');
            return;
        }

        setLoading(true);
        try {
            const data = await apiRequest('/api/register/', 'POST', { 
                username, 
                password,
                password_confirm: confirmPassword
            });
            addAlert('Account created successfully! Logging you in.', 'success');
            onRegisterSuccess(data.user || { username });
        } catch (err) {
            addAlert(err.message || 'Registration failed.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-header">
                    <div className="auth-logo">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="2" y="2" width="20" height="20" rx="2" ry="2"></rect>
                            <path d="M12 2v20"></path>
                            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                        </svg>
                        <span>Teyzix Procure</span>
                    </div>
                    <p>Create an administrator account (React Version)</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group" style={{ textAlign: 'left' }}>
                        <label className="form-label">Username</label>
                        <input 
                            type="text" 
                            className="form-control" 
                            placeholder="Choose username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group" style={{ textAlign: 'left' }}>
                        <label className="form-label">Password</label>
                        <input 
                            type="password" 
                            className="form-control" 
                            placeholder="Enter password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group" style={{ textAlign: 'left' }}>
                        <label className="form-label">Confirm Password</label>
                        <input 
                            type="password" 
                            className="form-control" 
                            placeholder="Re-enter password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            disabled={loading}
                        />
                    </div>

                    <button 
                        type="submit" 
                        className="btn btn-primary" 
                        style={{ width: '100%', marginTop: '12px', height: '44px' }}
                        disabled={loading}
                    >
                        {loading ? 'Creating Account...' : 'Create Account'}
                    </button>
                </form>

                <div className="auth-footer">
                    Already have an account? <a onClick={onNavigateToLogin}>Sign In</a>
                </div>
            </div>
        </div>
    );
}
