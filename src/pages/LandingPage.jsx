import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

export default function LandingPage() {
    const { user } = useAuth();

    return (
        <>
            <Navbar />
            <div className="page">
                {/* Hero */}
                <section className="hero">
                    <div className="container">
                        <div className="hero-badge">🚀 The Future of Project Outsourcing</div>
                        <h1 className="hero-title">
                            Get Your Projects Done<br />
                            by <span className="gradient-text">Expert Sellers</span>
                        </h1>
                        <p className="hero-subtitle">
                            Post your project, set your budget and deadline, and let verified sellers
                            compete to deliver quality work — on time, every time.
                        </p>
                        <div className="hero-actions">
                            {user ? (
                                <Link
                                    to={user.role === 'user' ? '/dashboard' : '/seller-dashboard'}
                                    className="btn btn-primary btn-lg"
                                >
                                    Go to Dashboard →
                                </Link>
                            ) : (
                                <>
                                    <Link to="/register" className="btn btn-primary btn-lg">
                                        Start Posting Projects
                                    </Link>
                                    <Link to="/register" className="btn btn-secondary btn-lg">
                                        Become a Seller
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </section>

                {/* Features */}
                <section className="features">
                    <div className="container">
                        <h2 className="section-title">How It Works</h2>
                        <p className="section-subtitle">
                            A simple, transparent process from project posting to delivery.
                        </p>
                        <div className="grid-3">
                            <div className="card feature-card">
                                <div className="feature-icon">📝</div>
                                <h3>Post a Project</h3>
                                <p>
                                    Describe what you need, set a budget and deadline. Your request
                                    is broadcast to all verified sellers instantly.
                                </p>
                            </div>
                            <div className="card feature-card">
                                <div className="feature-icon">🤝</div>
                                <h3>Seller Accepts</h3>
                                <p>
                                    Expert sellers review your project and accept the ones they can
                                    deliver. You get notified the moment work begins.
                                </p>
                            </div>
                            <div className="card feature-card">
                                <div className="feature-icon">🚀</div>
                                <h3>On-Time Delivery</h3>
                                <p>
                                    Sellers submit completed work before the deadline. Review, approve,
                                    and mark the project as complete.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Stats */}
                <section className="stats">
                    <div className="container">
                        <div className="stats-grid">
                            <div className="stat-item">
                                <div className="stat-value">10K+</div>
                                <div className="stat-label">Projects Completed</div>
                            </div>
                            <div className="stat-item">
                                <div className="stat-value">2.5K+</div>
                                <div className="stat-label">Verified Sellers</div>
                            </div>
                            <div className="stat-item">
                                <div className="stat-value">98%</div>
                                <div className="stat-label">On-Time Rate</div>
                            </div>
                            <div className="stat-item">
                                <div className="stat-value">4.9★</div>
                                <div className="stat-label">Avg. Rating</div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section style={{ padding: 'var(--space-16) 0', textAlign: 'center' }}>
                    <div className="container">
                        <div className="card-glass" style={{ padding: 'var(--space-12)', maxWidth: 700, margin: '0 auto' }}>
                            <h2 style={{ fontSize: 'var(--fs-3xl)', fontWeight: 800, marginBottom: 'var(--space-4)' }}>
                                Ready to Get Started?
                            </h2>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-8)', fontSize: 'var(--fs-base)' }}>
                                Join thousands of users and sellers already using Buy-Bots to get projects done.
                            </p>
                            <div style={{ display: 'flex', gap: 'var(--space-4)', justifyContent: 'center' }}>
                                <Link to="/register" className="btn btn-primary btn-lg">
                                    Create Free Account
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer style={{
                    borderTop: '1px solid var(--border)',
                    padding: 'var(--space-8) 0',
                    textAlign: 'center',
                    color: 'var(--text-muted)',
                    fontSize: 'var(--fs-sm)',
                }}>
                    <div className="container">
                        © 2026 Buy-Bots. All rights reserved. Built with ⚡
                    </div>
                </footer>
            </div>
        </>
    );
}
