import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useProjects } from '../context/ProjectContext';
import Navbar from '../components/Navbar';
import ProjectCard from '../components/ProjectCard';
import WelcomeModal from '../components/WelcomeModal';
import OnboardingTour from '../components/OnboardingTour';

export default function SellerDashboard() {
    const { user, isLoaded } = useAuth();
    const { getOpenProjects, getSellerProjects, acceptProject, submitProject, placeBid } = useProjects();

    if (!isLoaded || !user) return null;
    const [activeTab, setActiveTab] = useState('open');
    const [submitModalProject, setSubmitModalProject] = useState(null);
    const [bidModalProject, setBidModalProject] = useState(null);
    const [showWelcome, setShowWelcome] = useState(false);
    const [deliverable, setDeliverable] = useState('');
    const [toast, setToast] = useState(null);
    
    // Bid form
    const [bidAmount, setBidAmount] = useState('');
    const [bidMessage, setBidMessage] = useState('');
    const [bidDays, setBidDays] = useState('');

    const [startTourManual, setStartTourManual] = useState(false);

    useEffect(() => {
        const checkFirstVisit = async () => {
            const hasSeenWelcome = localStorage.getItem('has_seen_welcome_seller');
            if (!hasSeenWelcome && user) {
                setShowWelcome(true);
                localStorage.setItem('has_seen_welcome_seller', 'true');
                
                // Trigger Welcome Email
                try {
                    await fetch('/api/users/welcome-email', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email: user.email, name: user.name })
                    });
                } catch (err) {
                    console.error("Failed to send welcome email", err);
                }
            }
        };
        checkFirstVisit();
    }, [user]);

    const handleStartTour = () => {
        setShowWelcome(false);
        setStartTourManual(true);
    };

    const [searchQuery, setSearchQuery] = useState('');
    const [filterCategory, setFilterCategory] = useState('');

    const capabilities = user.capabilities || {};

    // Filter open projects based on seller capabilities
    const openProjects = getOpenProjects().filter(p => {
        const matchesSearch = (p.title + ' ' + p.description).toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = filterCategory ? p.category === filterCategory : true;

        // Capability-based filtering for robot projects
        if (p.category === 'Physical Robot' && p.fulfillmentType) {
            if (p.fulfillmentType === 'source-and-assemble' && !capabilities.canAssemble) return false;
            if (p.fulfillmentType === 'seller-direct' && (!capabilities.canAssemble || !capabilities.hasPartsInStock)) return false;
            // parts-only: visible to all sellers (no assembly needed)
        }

        return matchesSearch && matchesCategory;
    });
    
    const myProjects = getSellerProjects(user.id);
    const inProgressProjects = myProjects.filter(p => p.status === 'in-progress');
    const deliveredProjects = myProjects.filter(p => p.status === 'delivered');
    const completedProjects = myProjects.filter(p => p.status === 'completed');

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleAccept = (projectId) => {
        acceptProject(projectId, user.id, user.name);
        showToast('Project accepted! Get working on it! 💪');
    };

    const handlePlaceBid = (e) => {
        e.preventDefault();
        if (bidModalProject) {
            placeBid(bidModalProject.id, user.id, user.name, bidAmount, bidMessage, bidDays);
            setBidModalProject(null);
            setBidAmount('');
            setBidMessage('');
            setBidDays('');
            showToast('Bid placed successfully! Waiting for user to accept. 🎯');
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (submitModalProject) {
            submitProject(submitModalProject.id, deliverable);
            setSubmitModalProject(null);
            setDeliverable('');
            showToast('Work submitted successfully! Waiting for user review. 🎉');
        }
    };

    // Check if seller already bid on a project
    const hasBid = (project) => {
        return project.bids && project.bids.some(b => b.sellerId === user.id);
    };

    // Determine if project should use bidding (Physical Robot projects)
    const shouldBid = (project) => {
        return project.category === 'Physical Robot' && project.fulfillmentType;
    };

    const renderProjects = () => {
        switch (activeTab) {
            case 'open':
                return (
                    <div className="tab-pane">
                        <div className="filters-bar tour-seller-filters" style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Search projects by keyword..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                style={{ flex: 1 }}
                            />
                            <select
                                className="form-input"
                                value={filterCategory}
                                onChange={e => setFilterCategory(e.target.value)}
                                style={{ width: '200px', cursor: 'pointer', appearance: 'auto' }}
                            >
                                <option value="">All Categories</option>
                                <option value="Website">Website</option>
                                <option value="Physical Robot">Physical Robot</option>
                                <option value="Software Bot">Software Bot</option>
                                <option value="Automation Script">Automation Script</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        {/* Capability notice */}
                        {(!capabilities.canAssemble || !capabilities.hasPartsInStock) && (
                            <div className="capability-notice">
                                <span>ℹ️</span>
                                <span>
                                    Some robot projects are hidden because they require capabilities you haven't registered.
                                    {!capabilities.canAssemble && ' You haven\'t enabled "Can Assemble".'}
                                    {!capabilities.hasPartsInStock && ' You haven\'t enabled "Parts In Stock".'}
                                </span>
                            </div>
                        )}

                        <div className="tour-seller-projects">
                            {openProjects.length === 0 ? (
                                <div className="empty-state">
                                    <div className="empty-state-icon">📭</div>
                                    <h3>No open projects found</h3>
                                    <p>Check back later or adjust your filters!</p>
                                </div>
                            ) : (
                                <div className="project-list">
                                    {[...openProjects]
                                        .sort((a, b) => {
                                            if (a.isPinned && !b.isPinned) return -1;
                                            if (!a.isPinned && b.isPinned) return 1;
                                            return new Date(b.createdAt) - new Date(a.createdAt);
                                        })
                                        .map(project => (
                                            <ProjectCard
                                                key={project.id}
                                                project={project}
                                                badge={project.isPinned ? { text: '📌 FEATURED', color: '#fcd34d' } : null}
                                                actions={
                                                    shouldBid(project) ? (
                                                        hasBid(project) ? (
                                                            <span className="badge badge-completed" style={{ fontSize: 'var(--fs-xs)' }}>
                                                                ✓ Bid Placed
                                                            </span>
                                                        ) : (
                                                            <button
                                                                className="btn btn-primary btn-sm"
                                                                onClick={() => setBidModalProject(project)}
                                                                style={{ background: project.isPinned ? '#fcd34d' : '', color: project.isPinned ? '#000' : '' }}
                                                            >
                                                                {project.isPinned ? '📌 Place Priority Bid' : '💰 Place Bid'}
                                                            </button>
                                                        )
                                                    ) : (
                                                        <button
                                                            className="btn btn-primary btn-sm"
                                                            onClick={() => handleAccept(project.id)}
                                                            style={{ background: project.isPinned ? '#fcd34d' : '', color: project.isPinned ? '#000' : '' }}
                                                        >
                                                            {project.isPinned ? '📌 Accept Featured' : '✋ Accept Project'}
                                                        </button>
                                                    )
                                                }
                                            />
                                        ))}
                                </div>
                            )}
                        </div>
                    </div>
                );

            case 'in-progress':
                return inProgressProjects.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">⚡</div>
                        <h3>No active projects</h3>
                        <p>Accept open projects to start working!</p>
                    </div>
                ) : (
                    <div className="project-list">
                        {inProgressProjects.map(project => (
                            <ProjectCard
                                key={project.id}
                                project={project}
                                actions={
                                    <button
                                        className="btn btn-success btn-sm"
                                        onClick={() => setSubmitModalProject(project)}
                                    >
                                        📤 Submit Work
                                    </button>
                                }
                            />
                        ))}
                    </div>
                );

            case 'delivered':
                return deliveredProjects.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">📦</div>
                        <h3>No delivered projects</h3>
                        <p>Submit your work on active projects to see them here.</p>
                    </div>
                ) : (
                    <div className="project-list">
                        {deliveredProjects.map(project => (
                            <ProjectCard key={project.id} project={project} />
                        ))}
                    </div>
                );

            case 'completed':
                return completedProjects.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">✅</div>
                        <h3>No completed projects yet</h3>
                        <p>Completed projects will appear here after user approval.</p>
                    </div>
                ) : (
                    <div className="project-list">
                        {completedProjects.map(project => (
                            <ProjectCard key={project.id} project={project} />
                        ))}
                    </div>
                );

            default:
                return null;
        }
    };

    const sellerTourSteps = [
        {
            target: '.dashboard-header',
            content: 'Welcome to the Seller Dashboard! Here you can find work and manage your active jobs.',
            disableBeacon: true,
        },
        {
            target: '.tour-seller-stats',
            content: 'Track the number of projects available to you, and those you are currently working on.',
        },
        {
            target: '.tour-seller-tabs',
            content: 'Switch between Open projects to bid on, and projects you are currently delivering.',
        },
        {
            target: '.tour-seller-filters',
            content: 'Use these filters to find projects that perfectly match your skill set.',
        },
        {
            target: '.tour-seller-projects',
            content: 'Browse open projects here. Click "Place Bid" or "Accept Project" to get started!',
        }
    ];

    return (
        <div className="seller-theme">
            <Navbar />
            <OnboardingTour steps={sellerTourSteps} tourKey="seller_v1" run={startTourManual} />
            <WelcomeModal 
                isOpen={showWelcome} 
                onClose={() => setShowWelcome(false)} 
                userName={user?.name} 
                onStartTour={handleStartTour} 
            />
            
            {toast && (
                <div className={`toast toast-${toast.type}`}>
                    {toast.message}
                </div>
            )}
            
            <div className="page">
                <div className="container">
                    <div className="dashboard-header">
                        <h1>Seller Dashboard</h1>
                        <p className="text-secondary">Browse open projects and manage your accepted work.</p>
                        {/* Capability badges */}
                        {(capabilities.canAssemble || capabilities.hasPartsInStock) && (
                            <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-3)' }}>
                                {capabilities.canAssemble && (
                                    <span className="badge" style={{ background: 'rgba(16,185,129,0.12)', color: 'var(--success)', border: '1px solid rgba(16,185,129,0.2)' }}>
                                        🔧 Can Assemble
                                    </span>
                                )}
                                {capabilities.hasPartsInStock && (
                                    <span className="badge" style={{ background: 'rgba(59,130,246,0.12)', color: 'var(--info)', border: '1px solid rgba(59,130,246,0.2)' }}>
                                        📦 Parts In Stock
                                    </span>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Stats */}
                    <div className="dashboard-stats tour-seller-stats">
                        <div className="dashboard-stat-card">
                            <div className="dashboard-stat-icon" style={{ background: 'var(--info-bg)', color: 'var(--info)' }}>
                                📋
                            </div>
                            <div className="dashboard-stat-info">
                                <h3>{openProjects.length}</h3>
                                <p>Available</p>
                            </div>
                        </div>
                        <div className="dashboard-stat-card">
                            <div className="dashboard-stat-icon" style={{ background: 'var(--warning-bg)', color: 'var(--warning)' }}>
                                ⚡
                            </div>
                            <div className="dashboard-stat-info">
                                <h3>{inProgressProjects.length}</h3>
                                <p>In Progress</p>
                            </div>
                        </div>
                        <div className="dashboard-stat-card">
                            <div className="dashboard-stat-icon" style={{ background: 'rgba(139,92,246,0.12)', color: '#a78bfa' }}>
                                📦
                            </div>
                            <div className="dashboard-stat-info">
                                <h3>{deliveredProjects.length}</h3>
                                <p>Delivered</p>
                            </div>
                        </div>
                        <div className="dashboard-stat-card">
                            <div className="dashboard-stat-icon" style={{ background: 'var(--success-bg)', color: 'var(--success)' }}>
                                ✅
                            </div>
                            <div className="dashboard-stat-info">
                                <h3>{completedProjects.length}</h3>
                                <p>Completed</p>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="tabs tour-seller-tabs">
                        <button className={`tab ${activeTab === 'open' ? 'active' : ''}`} onClick={() => setActiveTab('open')}>
                            Open Projects ({openProjects.length})
                        </button>
                        <button className={`tab ${activeTab === 'in-progress' ? 'active' : ''}`} onClick={() => setActiveTab('in-progress')}>
                            My Active ({inProgressProjects.length})
                        </button>
                        <button className={`tab ${activeTab === 'delivered' ? 'active' : ''}`} onClick={() => setActiveTab('delivered')}>
                            Delivered ({deliveredProjects.length})
                        </button>
                        <button className={`tab ${activeTab === 'completed' ? 'active' : ''}`} onClick={() => setActiveTab('completed')}>
                            Completed ({completedProjects.length})
                        </button>
                    </div>

                    {renderProjects()}

                    {/* Bid Modal */}
                    {bidModalProject && (
                        <div className="modal-overlay" onClick={() => setBidModalProject(null)}>
                            <div className="modal" onClick={(e) => e.stopPropagation()}>
                                <div className="modal-header">
                                    <h2>Place a Bid</h2>
                                    <button className="modal-close" onClick={() => setBidModalProject(null)}>✕</button>
                                </div>
                                <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--fs-sm)', marginBottom: 'var(--space-4)' }}>
                                    Bidding on: <strong style={{ color: 'var(--text-primary)' }}>{bidModalProject.title}</strong>
                                </p>
                                <div className="bid-reference" style={{ marginBottom: 'var(--space-4)' }}>
                                    <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)' }}>User's budget: </span>
                                    <span style={{ fontSize: 'var(--fs-sm)', fontWeight: 700 }}>₹{bidModalProject.budget?.toLocaleString()}</span>
                                </div>
                                <form onSubmit={handlePlaceBid}>
                                    <div className="form-group">
                                        <label className="form-label">Your Bid Amount (₹)</label>
                                        <input
                                            type="number"
                                            className="form-input"
                                            placeholder="Enter your price"
                                            value={bidAmount}
                                            onChange={(e) => setBidAmount(e.target.value)}
                                            required
                                            min="1"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Estimated Delivery (days)</label>
                                        <input
                                            type="number"
                                            className="form-input"
                                            placeholder="e.g. 7"
                                            value={bidDays}
                                            onChange={(e) => setBidDays(e.target.value)}
                                            min="1"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Message to Buyer</label>
                                        <textarea
                                            className="form-textarea"
                                            placeholder="Explain why you're the right seller for this project..."
                                            value={bidMessage}
                                            onChange={(e) => setBidMessage(e.target.value)}
                                            rows={3}
                                        />
                                    </div>
                                    <button type="submit" className="btn btn-primary btn-block btn-lg">
                                        💰 Place Bid
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* Submit Modal */}
                    {submitModalProject && (
                        <div className="modal-overlay" onClick={() => setSubmitModalProject(null)}>
                            <div className="modal" onClick={(e) => e.stopPropagation()}>
                                <div className="modal-header">
                                    <h2>Submit Work</h2>
                                    <button className="modal-close" onClick={() => setSubmitModalProject(null)}>✕</button>
                                </div>
                                <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--fs-sm)', marginBottom: 'var(--space-4)' }}>
                                    Submitting for: <strong style={{ color: 'var(--text-primary)' }}>{submitModalProject.title}</strong>
                                </p>
                                <form onSubmit={handleSubmit}>
                                    <div className="form-group">
                                        <label className="form-label">Deliverable / Work Description</label>
                                        <textarea
                                            className="form-textarea"
                                            placeholder="Describe what you've completed, include links to files, repos, etc..."
                                            value={deliverable}
                                            onChange={(e) => setDeliverable(e.target.value)}
                                            required
                                            rows={6}
                                        />
                                    </div>
                                    <button type="submit" className="btn btn-success btn-block btn-lg">
                                        📤 Submit Deliverable
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
