import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './WelcomeModal.css';

export default function WelcomeModal({ isOpen, onClose, userName, onStartTour }) {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div 
                className="welcome-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                <motion.div 
                    className="welcome-modal"
                    initial={{ scale: 0.8, y: 20, opacity: 0 }}
                    animate={{ scale: 1, y: 0, opacity: 1 }}
                    exit={{ scale: 0.8, y: 20, opacity: 0 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                >
                    <div className="welcome-robot">🤖</div>
                    <div className="welcome-content">
                        <h1>Welcome to the Universe, {userName}!</h1>
                        <p>Buy-Bots is the world's first elite marketplace for robotics. We're excited to see what you'll build or find today.</p>
                        
                        <div className="welcome-features">
                            <div className="welcome-feature">
                                <span className="feature-icon">🚀</span>
                                <div>
                                    <span className="feature-title">Post Projects</span>
                                    <span className="feature-desc">Get bids from top robot engineers.</span>
                                </div>
                            </div>
                            <div className="welcome-feature">
                                <span className="feature-icon">🛡️</span>
                                <div>
                                    <span className="feature-title">Secure Payments</span>
                                    <span className="feature-desc">Your funds are protected by our escrow system.</span>
                                </div>
                            </div>
                        </div>

                        <div className="welcome-actions">
                            <button className="btn btn-primary" onClick={onStartTour}>
                                Take a Quick Tour 🎥
                            </button>
                            <button className="btn btn-outline" onClick={onClose} style={{ marginLeft: '10px' }}>
                                Skip for now
                            </button>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
