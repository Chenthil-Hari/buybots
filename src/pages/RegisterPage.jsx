import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SignUp } from '@clerk/clerk-react';
import { motion } from 'framer-motion';

export default function RegisterPage({ role = 'user' }) {
    const navigate = useNavigate();
    const isSeller = role === 'seller';

    // Store intended role for post-signup onboarding
    useEffect(() => {
        localStorage.setItem('intended_role', role);
    }, [role]);

    return (
        <div className="auth-page" style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            minHeight: '100vh',
            background: isSeller 
                ? 'radial-gradient(circle at center, #064e3b 0%, #022c22 100%)' // Dark emerald for sellers
                : 'radial-gradient(circle at center, #111827 0%, #030712 100%)'
        }}>
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="auth-header" style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div className="brand-icon" style={{ fontSize: '3rem', marginBottom: '1rem' }}>
                        {isSeller ? '🏪' : '👤'}
                    </div>
                    <h1 style={{ color: isSeller ? '#34d399' : '#fcd34d' }}>
                        {isSeller ? 'Become a Seller' : 'Create Buyer Account'}
                    </h1>
                    <p style={{ color: '#9ca3af' }}>
                        Join the Buy-Bots network as a {isSeller ? 'Seller' : 'Buyer'}
                    </p>
                </div>

                <SignUp 
                    routing="path" 
                    path={isSeller ? "/register/seller" : "/register/buyer"} 
                    signInUrl={isSeller ? "/login/seller" : "/login/buyer"}
                    fallbackRedirectUrl="/setup-profile" 
                />

                <div className="auth-footer" style={{ marginTop: '2rem', textAlign: 'center' }}>
                    <button 
                        onClick={() => navigate('/')}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#9ca3af',
                            cursor: 'pointer',
                            textDecoration: 'underline'
                        }}
                    >
                        Back to Home
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
