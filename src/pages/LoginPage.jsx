import { useNavigate } from 'react-router-dom';
import { SignIn } from '@clerk/clerk-react';
import { motion } from 'framer-motion';

export default function LoginPage({ role = 'user' }) {
    const navigate = useNavigate();
    const isSeller = role === 'seller';

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
                        {isSeller ? 'Seller Login' : 'Buyer Login'}
                    </h1>
                    <p style={{ color: '#9ca3af' }}>
                        Access your {isSeller ? 'store' : 'projects'} on Buy-Bots
                    </p>
                </div>

                <SignIn 
                    routing="path" 
                    path={isSeller ? "/login/seller" : "/login/buyer"} 
                    signUpUrl={isSeller ? "/register/seller" : "/register/buyer"}
                    fallbackRedirectUrl="/dashboard"
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
