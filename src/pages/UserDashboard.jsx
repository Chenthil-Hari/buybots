import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useProjects } from '../context/ProjectContext';
import Navbar from '../components/Navbar';
import WelcomeModal from '../components/WelcomeModal';
import ProjectCard from '../components/ProjectCard';
import FulfillmentSelector from '../components/FulfillmentSelector';

// Category-specific field configs
const CATEGORY_FIELDS = {
    'Website': {
        label: '🌐 Website Details',
        fields: [
            { key: 'techStack', label: 'Preferred Tech Stack', type: 'text', placeholder: 'e.g. React, Node.js, WordPress' },
            { key: 'pages', label: 'Number of Pages', type: 'number', placeholder: 'e.g. 5' },
            { key: 'hosting', label: 'Hosting Requirement', type: 'select', options: ['No preference', 'Vercel', 'Netlify', 'AWS', 'Self-hosted', 'Other'] },
            { key: 'hasDesign', label: 'Design Ready?', type: 'select', options: ['No, need design too', 'Yes, I have Figma/mockups', 'Partial design'] },
        ],
    },
    'Software Bot': {
        label: '🤖 Bot Details',
        fields: [
            { key: 'platform', label: 'Platform', type: 'select', options: ['Discord', 'Telegram', 'Slack', 'WhatsApp', 'Twitter/X', 'Custom', 'Other'] },
            { key: 'language', label: 'Preferred Language', type: 'text', placeholder: 'e.g. Python, Node.js' },
            { key: 'integrations', label: 'Integrations Needed', type: 'text', placeholder: 'e.g. OpenAI API, Database, Payments' },
        ],
    },
    'Automation Script': {
        label: '⚙️ Automation Details',
        fields: [
            { key: 'targetApp', label: 'Target Application', type: 'text', placeholder: 'e.g. Excel, Google Sheets, Salesforce' },
            { key: 'frequency', label: 'Run Frequency', type: 'select', options: ['One-time', 'Hourly', 'Daily', 'Weekly', 'On-demand'] },
            { key: 'inputFormat', label: 'Input Data Format', type: 'text', placeholder: 'e.g. CSV, JSON, API' },
        ],
    },
};

export default function UserDashboard() {
    const { user, isLoaded } = useAuth();
    const { createProject, getUserProjects, completeProject, deleteProject, acceptBid } = useProjects();

    // All state MUST be declared before any conditional return (React Rules of Hooks)
    const [showForm, setShowForm] = useState(false);
    const [toast, setToast] = useState(null);
    const [showBidsFor, setShowBidsFor] = useState(null);
    const [showWelcome, setShowWelcome] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [budget, setBudget] = useState('');
    const [category, setCategory] = useState('');
    const [fulfillmentType, setFulfillmentType] = useState('');
    const [deadline, setDeadline] = useState('');
    const [partsList, setPartsList] = useState([{ name: '', qty: 1 }]);
    const [shippingAddress, setShippingAddress] = useState('');
    const [categoryFieldValues, setCategoryFieldValues] = useState({});

    useEffect(() => {
        if (!user) return;
        const checkFirstVisit = async () => {
            const hasSeenWelcome = localStorage.getItem('has_seen_welcome');
            if (!hasSeenWelcome) {
                setShowWelcome(true);
                localStorage.setItem('has_seen_welcome', 'true');
                
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

    // Guard: wait for auth to load
    if (!isLoaded || !user) return null;

    const myProjects = getUserProjects(user.id);
    const openCount = myProjects.filter(p => p.status === 'open').length;
    const inProgressCount = myProjects.filter(p => p.status === 'in-progress').length;
    const deliveredCount = myProjects.filter(p => p.status === 'delivered').length;
    const completedCount = myProjects.filter(p => p.status === 'completed').length;

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleCategoryChange = (newCategory) => {
        setCategory(newCategory);
        if (newCategory !== 'Physical Robot') {
            setFulfillmentType('');
            setPartsList([{ name: '', qty: 1 }]);
            setShippingAddress('');
        }
        setCategoryFieldValues({});
    };

    const addPart = () => setPartsList(prev => [...prev, { name: '', qty: 1 }]);
    const removePart = (index) => setPartsList(prev => prev.filter((_, i) => i !== index));
    const updatePart = (index, field, value) => {
        setPartsList(prev => prev.map((p, i) => i === index ? { ...p, [field]: value } : p));
    };

    const handleCategoryFieldChange = (key, value) => {
        setCategoryFieldValues(prev => ({ ...prev, [key]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const cleanParts = partsList.filter(p => p.name.trim());

        createProject({
            title,
            description,
            budget,
            category: category || 'Other',
            fulfillmentType: category === 'Physical Robot' ? fulfillmentType : null,
            deadline: new Date(deadline).toISOString(),
            userId: user.id,
            userName: user.name,
            partsList: category === 'Physical Robot' ? cleanParts : [],
            shippingAddress: category === 'Physical Robot' ? shippingAddress : null,
            categoryFields: CATEGORY_FIELDS[category] ? categoryFieldValues : null,
        });
        // Reset form
        setTitle('');
        setDescription('');
        setBudget('');
        setCategory('');
        setFulfillmentType('');
        setDeadline('');
        setPartsList([{ name: '', qty: 1 }]);
        setShippingAddress('');
        setCategoryFieldValues({});
        setShowForm(false);
        showToast('Project posted successfully! Sellers can now see it.');
    };

    const handleComplete = (projectId) => {
        completeProject(projectId);
        showToast('Project marked as completed! 🎉');
    };

    const handleDelete = (projectId) => {
        if (window.confirm('Are you sure you want to delete this open project?')) {
            deleteProject(projectId);
            showToast('Project deleted successfully.', 'info');
        }
    };

    const handleAcceptBid = (projectId, bidId) => {
        acceptBid(projectId, bidId);
        setShowBidsFor(null);
        showToast('Bid accepted! The seller will begin work. 🎉');
    };

    // Minimum date for deadline (tomorrow)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const minDate = tomorrow.toISOString().split('T')[0];

    const catConfig = CATEGORY_FIELDS[category];

    return (
        <>
            <Navbar />
            <WelcomeModal 
                isOpen={showWelcome} 
                onClose={() => setShowWelcome(false)} 
                userName={user?.name} 
                onStartTour={() => setShowWelcome(false)} 
            />

            {/* Toast */}
            {toast && (
                <div className={`toast toast-${toast.type}`}>
                    {toast.message}
                </div>
            )}
            <div className="page">
                <div className="container">
                    <div className="dashboard-header tour-buyer-welcome">
                        <h1>Welcome back, <span className="text-gradient">{user.name}</span></h1>
                        <p className="text-secondary">Manage your projects and track their progress.</p>
                    </div>

                    {/* Stats */}
                    <div className="dashboard-stats tour-buyer-stats">
                        <div className="dashboard-stat-card">
                            <div className="dashboard-stat-icon" style={{ background: 'var(--info-bg)', color: 'var(--info)' }}>
                                📋
                            </div>
                            <div className="dashboard-stat-info">
                                <h3>{openCount}</h3>
                                <p>Open</p>
                            </div>
                        </div>
                        <div className="dashboard-stat-card">
                            <div className="dashboard-stat-icon" style={{ background: 'var(--warning-bg)', color: 'var(--warning)' }}>
                                ⚡
                            </div>
                            <div className="dashboard-stat-info">
                                <h3>{inProgressCount}</h3>
                                <p>In Progress</p>
                            </div>
                        </div>
                        <div className="dashboard-stat-card">
                            <div className="dashboard-stat-icon" style={{ background: 'rgba(139,92,246,0.12)', color: '#a78bfa' }}>
                                📦
                            </div>
                            <div className="dashboard-stat-info">
                                <h3>{deliveredCount}</h3>
                                <p>Delivered</p>
                            </div>
                        </div>
                        <div className="dashboard-stat-card">
                            <div className="dashboard-stat-icon" style={{ background: 'var(--success-bg)', color: 'var(--success)' }}>
                                ✅
                            </div>
                            <div className="dashboard-stat-info">
                                <h3>{completedCount}</h3>
                                <p>Completed</p>
                            </div>
                        </div>
                    </div>

                    {/* Post Project Section */}
                    <div className="section-header">
                        <h2>My Projects</h2>
                        <button className="btn btn-primary tour-buyer-post" onClick={() => setShowForm(true)}>
                            + Post New Project
                        </button>
                    </div>

                    {/* Project Form Modal */}
                    {showForm && (
                        <div className="modal-overlay" onClick={() => setShowForm(false)}>
                            <div className="modal" onClick={(e) => e.stopPropagation()}>
                                <div className="modal-header">
                                    <h2>Post a New Project</h2>
                                    <button className="modal-close" onClick={() => setShowForm(false)}>✕</button>
                                </div>
                                <form onSubmit={handleSubmit}>
                                    <div className="form-group">
                                        <label className="form-label">Project Title</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            placeholder="e.g. Build a Landing Page"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Description</label>
                                        <textarea
                                            className="form-textarea"
                                            placeholder="Describe your project in detail..."
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            required
                                            rows={4}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Category</label>
                                        <select
                                            className="form-input"
                                            value={category}
                                            onChange={(e) => handleCategoryChange(e.target.value)}
                                            required
                                            style={{ cursor: 'pointer', appearance: 'auto' }}
                                        >
                                            <option value="" disabled>Select a category</option>
                                            <option value="Website">Website</option>
                                            <option value="Physical Robot">Physical Robot</option>
                                            <option value="Software Bot">Software Bot</option>
                                            <option value="Automation Script">Automation Script</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>

                                    {/* Category-Specific Fields */}
                                    {catConfig && (
                                        <div className="adaptive-fields">
                                            <div className="adaptive-fields-header">{catConfig.label}</div>
                                            <div className="adaptive-fields-grid">
                                                {catConfig.fields.map(field => (
                                                    <div className="form-group" key={field.key}>
                                                        <label className="form-label">{field.label}</label>
                                                        {field.type === 'select' ? (
                                                            <select
                                                                className="form-input"
                                                                value={categoryFieldValues[field.key] || ''}
                                                                onChange={(e) => handleCategoryFieldChange(field.key, e.target.value)}
                                                                style={{ cursor: 'pointer', appearance: 'auto' }}
                                                            >
                                                                <option value="">Select...</option>
                                                                {field.options.map(opt => (
                                                                    <option key={opt} value={opt}>{opt}</option>
                                                                ))}
                                                            </select>
                                                        ) : (
                                                            <input
                                                                type={field.type}
                                                                className="form-input"
                                                                placeholder={field.placeholder}
                                                                value={categoryFieldValues[field.key] || ''}
                                                                onChange={(e) => handleCategoryFieldChange(field.key, e.target.value)}
                                                            />
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Fulfillment selector for Physical Robot */}
                                    {category === 'Physical Robot' && (
                                        <>
                                            <FulfillmentSelector
                                                value={fulfillmentType}
                                                onChange={setFulfillmentType}
                                            />

                                            {/* Parts List / BOM */}
                                            <div className="bom-section">
                                                <div className="bom-header">
                                                    <label className="form-label" style={{ margin: 0 }}>📋 Parts List (BOM)</label>
                                                    <button type="button" className="btn btn-sm btn-secondary" onClick={addPart}>+ Add Part</button>
                                                </div>
                                                <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)', marginBottom: 'var(--space-3)' }}>
                                                    List the components needed. This helps us source the cheapest parts.
                                                </p>
                                                {partsList.map((part, i) => (
                                                    <div className="bom-row" key={i}>
                                                        <input
                                                            type="text"
                                                            className="form-input"
                                                            placeholder={`Part name (e.g. Arduino Uno${i === 1 ? ', IR sensor' : i === 2 ? ', Motor Driver L298N' : ''})`}
                                                            value={part.name}
                                                            onChange={(e) => updatePart(i, 'name', e.target.value)}
                                                        />
                                                        <input
                                                            type="number"
                                                            className="form-input bom-qty"
                                                            placeholder="Qty"
                                                            min="1"
                                                            value={part.qty}
                                                            onChange={(e) => updatePart(i, 'qty', e.target.value)}
                                                        />
                                                        {partsList.length > 1 && (
                                                            <button type="button" className="bom-remove" onClick={() => removePart(i)}>✕</button>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Shipping Address */}
                                            <div className="form-group">
                                                <label className="form-label">📍 Shipping Address</label>
                                                <textarea
                                                    className="form-textarea"
                                                    placeholder="Full shipping address for physical delivery..."
                                                    value={shippingAddress}
                                                    onChange={(e) => setShippingAddress(e.target.value)}
                                                    rows={2}
                                                    required
                                                />
                                            </div>
                                        </>
                                    )}

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                                        <div className="form-group">
                                            <label className="form-label">Seller Budget (₹)</label>
                                            <input
                                                type="number"
                                                className="form-input"
                                                placeholder="500"
                                                value={budget}
                                                onChange={(e) => setBudget(e.target.value)}
                                                required
                                                min="1"
                                            />
                                            {budget && !isNaN(budget) && (
                                                <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                                    <div>Seller Payout: ₹{parseFloat(budget).toFixed(2)}</div>
                                                    <div>Platform Fee (10%): ₹{(parseFloat(budget) * 0.1).toFixed(2)}</div>
                                                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: '0.25rem' }}>
                                                        Total Cost: ₹{(parseFloat(budget) * 1.1).toFixed(2)}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Deadline</label>
                                            <input
                                                type="date"
                                                className="form-input"
                                                value={deadline}
                                                onChange={(e) => setDeadline(e.target.value)}
                                                required
                                                min={minDate}
                                            />
                                        </div>
                                    </div>
                                    <button
                                        type="submit"
                                        className="btn btn-primary btn-block btn-lg"
                                        disabled={category === 'Physical Robot' && (!fulfillmentType || !shippingAddress.trim())}
                                    >
                                        Post Project
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* Bids Modal */}
                    {showBidsFor && (() => {
                        const project = myProjects.find(p => p.id === showBidsFor);
                        if (!project) return null;
                        return (
                            <div className="modal-overlay" onClick={() => setShowBidsFor(null)}>
                                <div className="modal" onClick={(e) => e.stopPropagation()}>
                                    <div className="modal-header">
                                        <h2>Bids for "{project.title}"</h2>
                                        <button className="modal-close" onClick={() => setShowBidsFor(null)}>✕</button>
                                    </div>
                                    {project.bids.length === 0 ? (
                                        <div className="empty-state" style={{ padding: 'var(--space-8)' }}>
                                            <div className="empty-state-icon">💬</div>
                                            <h3>No bids yet</h3>
                                            <p>Sellers will place bids on your project soon.</p>
                                        </div>
                                    ) : (
                                        <div className="bids-list">
                                            {project.bids.map(bid => (
                                                <div className="bid-card" key={bid.id}>
                                                    <div className="bid-card-header">
                                                        <div>
                                                            <div className="bid-seller-name">{bid.sellerName}</div>
                                                            <div className="bid-date">
                                                                {new Date(bid.createdAt).toLocaleString()}
                                                            </div>
                                                        </div>
                                                        <div className="bid-amount">₹{bid.bidAmount.toLocaleString()}</div>
                                                    </div>
                                                    {bid.message && (
                                                        <p className="bid-message">"{bid.message}"</p>
                                                    )}
                                                    <div className="bid-card-footer">
                                                        {bid.estimatedDays && (
                                                            <span className="bid-estimate">
                                                                📅 {bid.estimatedDays} days delivery
                                                            </span>
                                                        )}
                                                        <button
                                                            className="btn btn-success btn-sm"
                                                            onClick={() => handleAcceptBid(project.id, bid.id)}
                                                        >
                                                            ✓ Accept Bid
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })()}

                    {/* Project List */}
                    <div className="tour-buyer-projects">
                        {myProjects.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-state-icon">📋</div>
                                <h3>No projects yet</h3>
                                <p>Post your first project and let sellers get to work!</p>
                            </div>
                        ) : (
                            <div className="project-list">
                                {myProjects.map(project => (
                                    <ProjectCard
                                        key={project.id}
                                        project={project}
                                    actions={
                                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                            {project.status === 'open' && project.bids && project.bids.length > 0 && (
                                                <button
                                                    className="btn btn-sm btn-outline"
                                                    onClick={() => setShowBidsFor(project.id)}
                                                >
                                                    💬 View Bids ({project.bids.length})
                                                </button>
                                            )}
                                            {project.status === 'delivered' && (
                                                <button
                                                    className="btn btn-success btn-sm"
                                                    onClick={() => handleComplete(project.id)}
                                                >
                                                    ✓ Mark as Completed
                                                </button>
                                            )}
                                            {project.status === 'open' && (
                                                <button
                                                    className="btn btn-sm"
                                                    style={{ background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca' }}
                                                    onClick={() => handleDelete(project.id)}
                                                >
                                                    🗑️ Delete
                                                </button>
                                            )}
                                        </div>
                                    }
                                />
                            ))}
                        </div>
                    )}
                    </div>
                </div>
            </div>
        </>
    );
}
