import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('user');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Seller capabilities
    const [canAssemble, setCanAssemble] = useState(false);
    const [hasPartsInStock, setHasPartsInStock] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');

        if (password.length < 4) {
            setError('Password must be at least 4 characters.');
            return;
        }

        setLoading(true);
        try {
            const user = register(name, email, password, role, {
                canAssemble,
                hasPartsInStock,
            });
            navigate(user.role === 'user' ? '/dashboard' : '/seller-dashboard');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-header">
                    <div className="brand-icon">⚡</div>
                    <h1>Create Account</h1>
                    <p>Join Buy-Bots and start today</p>
                </div>

                {error && (
                    <div style={{
                        padding: 'var(--space-3) var(--space-4)',
                        background: 'var(--danger-bg)',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        borderRadius: 'var(--radius-md)',
                        color: 'var(--danger)',
                        fontSize: 'var(--fs-sm)',
                        marginBottom: 'var(--space-5)',
                    }}>
                        {error}
                    </div>
                )}

                {/* Role Selector */}
                <div className="role-selector">
                    <button
                        type="button"
                        className={`role-option ${role === 'user' ? 'active' : ''}`}
                        onClick={() => setRole('user')}
                    >
                        <div className="role-option-icon">👤</div>
                        <div className="role-option-label">User</div>
                        <div className="role-option-desc">Post projects</div>
                    </button>
                    <button
                        type="button"
                        className={`role-option ${role === 'seller' ? 'active' : ''}`}
                        onClick={() => setRole('seller')}
                    >
                        <div className="role-option-icon">🏪</div>
                        <div className="role-option-label">Seller</div>
                        <div className="role-option-desc">Accept & deliver</div>
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Full Name</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="John Doe"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <input
                            type="email"
                            className="form-input"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input
                            type="password"
                            className="form-input"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={4}
                        />
                    </div>

                    {/* Seller Capabilities */}
                    {role === 'seller' && (
                        <div className="capabilities-section">
                            <label className="form-label" style={{ marginBottom: 'var(--space-3)' }}>
                                🤖 Robot Capabilities
                            </label>
                            <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)', marginBottom: 'var(--space-4)' }}>
                                Select what you can do for physical robot projects. This determines which projects you'll see.
                            </p>
                            <label className="capability-toggle">
                                <input
                                    type="checkbox"
                                    checked={canAssemble}
                                    onChange={(e) => setCanAssemble(e.target.checked)}
                                />
                                <span className="capability-toggle-slider" />
                                <span className="capability-toggle-content">
                                    <span className="capability-toggle-icon">🔧</span>
                                    <span>
                                        <strong>Can Assemble Robots</strong>
                                        <small>I can receive parts and build/assemble robots</small>
                                    </span>
                                </span>
                            </label>
                            <label className="capability-toggle">
                                <input
                                    type="checkbox"
                                    checked={hasPartsInStock}
                                    onChange={(e) => setHasPartsInStock(e.target.checked)}
                                />
                                <span className="capability-toggle-slider" />
                                <span className="capability-toggle-content">
                                    <span className="capability-toggle-icon">📦</span>
                                    <span>
                                        <strong>Parts In Stock</strong>
                                        <small>I have robot parts/components ready to use</small>
                                    </span>
                                </span>
                            </label>
                        </div>
                    )}

                    <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
                        {loading ? 'Creating account...' : `Create ${role === 'user' ? 'User' : 'Seller'} Account`}
                    </button>
                </form>

                <div className="auth-footer">
                    Already have an account?{' '}
                    <Link to="/login">Sign in</Link>
                </div>
            </div>
        </div>
    );
}
