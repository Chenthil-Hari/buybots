import React from 'react';
import './MaintenancePage.css';

export default function MaintenancePage() {
    return (
        <div className="maintenance-container">
            <div className="maintenance-content">
                <div className="maintenance-icon">🛠️</div>
                <h1>System Under Repair</h1>
                <p>Buy-Bots is currently undergoing scheduled maintenance to improve our robotic matchmaking systems. We'll be back online shortly!</p>
                <div className="maintenance-status">
                    <span className="pulse"></span>
                    MATCHMAKING OFFLINE
                </div>
                <p className="text-muted" style={{ marginTop: '2rem', fontSize: '0.8rem' }}>Estimated return: Within 60 minutes</p>
            </div>
        </div>
    );
}
