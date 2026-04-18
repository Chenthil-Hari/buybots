import { useNavigate } from 'react-router-dom';
import { SignIn } from '@clerk/clerk-react';
import { motion } from 'framer-motion';

export default function LoginPage() {
    const navigate = useNavigate();

    return (
        <div className="auth-page" style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            minHeight: '100vh',
            background: 'radial-gradient(circle at center, #111827 0%, #030712 100%)'
        }}>
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="auth-header" style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div className="brand-icon" style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚡</div>
                    <h1 style={{ color: '#fcd34d' }}>Welcome Back</h1>
                    <p style={{ color: '#9ca3af' }}>Sign in to your Buy-Bots account</p>
                </div>

                <SignIn 
                    routing="path" 
                    path="/login" 
                    signUpUrl="/register"
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
