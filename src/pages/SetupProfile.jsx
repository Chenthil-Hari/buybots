import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

export default function SetupProfile() {
    const { user, updateMetadata, syncUserWithDatabase, isLoaded, isSignedIn } = useAuth();
    const navigate = useNavigate();
    const [role, setRole] = useState('user');
    const [canAssemble, setCanAssemble] = useState(false);
    const [hasPartsInStock, setHasPartsInStock] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isLoaded && !isSignedIn) {
            navigate('/login');
        }
        if (isLoaded && user?.role && user.role !== 'user') {
            // If they already have a role, send them to their dashboard
            navigate(user.role === 'seller' ? '/seller-dashboard' : '/dashboard');
        }
    }, [isLoaded, isSignedIn, user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const metadata = {
                role: role,
                capabilities: role === 'seller' ? {
                    canAssemble,
                    hasPartsInStock,
                } : null
            };

            // 1. Update Clerk Metadata
            await updateMetadata(metadata);

            // 2. Sync with MongoDB
            await syncUserWithDatabase(metadata);

            // Force a small delay to ensure metadata is synced
            setTimeout(() => {
                navigate(role === 'user' ? '/dashboard' : '/seller-dashboard');
            }, 1000);
        } catch (err) {
            console.error(err);
            alert("Failed to save profile. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (!isLoaded) return <div className="loading-screen">Loading...</div>;

    return (
        <div className="auth-page" style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            minHeight: '100vh',
            background: 'radial-gradient(circle at center, #111827 0%, #030712 100%)',
            padding: '2rem'
        }}>
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="auth-card"
                style={{
                    background: '#1f2937',
                    padding: '2.5rem',
                    borderRadius: '1rem',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                    maxWidth: '500px',
                    width: '100%',
                    border: '1px solid #374151'
                }}
            >
                <div className="auth-header" style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div className="brand-icon" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>⚡</div>
                    <h1 style={{ color: '#fcd34d', fontSize: '1.8rem', marginBottom: '0.5rem' }}>Setup Your Profile</h1>
                    <p style={{ color: '#9ca3af' }}>Choose how you'll use Buy-Bots</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="role-selector" style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                        <button
                            type="button"
                            className={`role-option ${role === 'user' ? 'active' : ''}`}
                            onClick={() => setRole('user')}
                            style={{
                                flex: 1,
                                padding: '1.5rem',
                                borderRadius: '0.75rem',
                                border: `2px solid ${role === 'user' ? '#fcd34d' : '#374151'}`,
                                background: role === 'user' ? 'rgba(252, 211, 77, 0.1)' : 'transparent',
                                color: '#fff',
                                cursor: 'pointer',
                                textAlign: 'center',
                                transition: 'all 0.2s'
                            }}
                        >
                            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>👤</div>
                            <div style={{ fontWeight: 'bold' }}>User</div>
                            <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>I want to post projects</div>
                        </button>
                        <button
                            type="button"
                            className={`role-option ${role === 'seller' ? 'active' : ''}`}
                            onClick={() => setRole('seller')}
                            style={{
                                flex: 1,
                                padding: '1.5rem',
                                borderRadius: '0.75rem',
                                border: `2px solid ${role === 'seller' ? '#fcd34d' : '#374151'}`,
                                background: role === 'seller' ? 'rgba(252, 211, 77, 0.1)' : 'transparent',
                                color: '#fff',
                                cursor: 'pointer',
                                textAlign: 'center',
                                transition: 'all 0.2s'
                            }}
                        >
                            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🏪</div>
                            <div style={{ fontWeight: 'bold' }}>Seller</div>
                            <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>I want to complete projects</div>
                        </button>
                    </div>

                    {role === 'seller' && (
                        <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            style={{ marginBottom: '2rem' }}
                        >
                            <label style={{ display: 'block', color: '#f3f4f6', marginBottom: '1rem', fontSize: '0.875rem' }}>
                                Robot Capabilities
                            </label>
                            
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', cursor: 'pointer' }}>
                                <input 
                                    type="checkbox" 
                                    checked={canAssemble}
                                    onChange={(e) => setCanAssemble(e.target.checked)}
                                    style={{ width: '1.25rem', height: '1.25rem' }}
                                />
                                <div>
                                    <div style={{ color: '#fff', fontSize: '0.875rem' }}>Can Assemble Robots</div>
                                    <div style={{ color: '#9ca3af', fontSize: '0.75rem' }}>I can build/assemble robot kits</div>
                                </div>
                            </label>

                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                                <input 
                                    type="checkbox" 
                                    checked={hasPartsInStock}
                                    onChange={(e) => setHasPartsInStock(e.target.checked)}
                                    style={{ width: '1.25rem', height: '1.25rem' }}
                                />
                                <div>
                                    <div style={{ color: '#fff', fontSize: '0.875rem' }}>Parts In Stock</div>
                                    <div style={{ color: '#9ca3af', fontSize: '0.75rem' }}>I have common robot parts ready</div>
                                </div>
                            </label>
                        </motion.div>
                    )}

                    <button 
                        type="submit" 
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '1rem',
                            borderRadius: '0.5rem',
                            background: '#fcd34d',
                            color: '#111827',
                            fontWeight: 'bold',
                            border: 'none',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            opacity: loading ? 0.7 : 1
                        }}
                    >
                        {loading ? 'Saving Profile...' : 'Complete Setup'}
                    </button>
                </form>
            </motion.div>
        </div>
    );
}
