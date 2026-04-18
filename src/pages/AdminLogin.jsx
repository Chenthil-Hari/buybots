import { useState } from 'react';
import './AdminDashboard.css';

export default function AdminLogin({ onLoginSuccess }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/admin/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await res.json();

            if (res.ok) {
                sessionStorage.setItem('admin_auth', data.token);
                onLoginSuccess();
            } else {
                setError(data.message || 'Login failed');
            }
        } catch (err) {
            setError('Server error. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-theme" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
            <div className="admin-stat-card" style={{ width: '100%', maxWidth: '400px', padding: '3rem' }}>
                <div className="admin-badge" style={{ marginBottom: '1.5rem', display: 'inline-block' }}>SECURE ACCESS</div>
                <h1 style={{ marginBottom: '0.5rem' }}>Admin Portal</h1>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Enter credentials to access the command center.</p>

                {error && (
                    <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                        ⚠️ {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group" style={{ textAlign: 'left', marginBottom: '1.5rem' }}>
                        <label className="form-label" style={{ color: 'var(--text-secondary)' }}>Username</label>
                        <input
                            type="text"
                            className="form-input"
                            style={{ background: '#0f1115', border: '1px solid rgba(255,255,255,0.1)' }}
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group" style={{ textAlign: 'left', marginBottom: '2rem' }}>
                        <label className="form-label" style={{ color: 'var(--text-secondary)' }}>Password</label>
                        <input
                            type="password"
                            className="form-input"
                            style={{ background: '#0f1115', border: '1px solid rgba(255,255,255,0.1)' }}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button 
                        type="submit" 
                        className="btn btn-block btn-lg" 
                        style={{ background: '#ef4444', color: 'white', fontWeight: 'bold' }}
                        disabled={loading}
                    >
                        {loading ? 'Authenticating...' : 'Authorize Session'}
                    </button>
                </form>
            </div>
        </div>
    );
}
