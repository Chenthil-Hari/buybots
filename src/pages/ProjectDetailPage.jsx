import { useParams, Link, useNavigate } from 'react-router-dom';
import { useProjects } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import Navbar from '../components/Navbar';
import StatusBadge from '../components/StatusBadge';
import CountdownTimer from '../components/CountdownTimer';
import StarRating from '../components/StarRating';
import { getFulfillmentInfo, getFulfillmentTimeline } from '../components/FulfillmentSelector';

export default function ProjectDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { getProjectById, acceptProject, completeProject, deleteProject, addReview, acceptBid, loading } = useProjects();
    const project = getProjectById(id);

    if (loading) {
        return (
            <>
                <Navbar />
                <div className="page">
                    <div className="container">
                        <div className="empty-state">
                            <div className="loading-spinner" />
                            <p>Loading project details...</p>
                        </div>
                    </div>
                </div>
            </>
        );
    }
    const [reviewRating, setReviewRating] = useState(0);
    const [reviewText, setReviewText] = useState('');

    if (!project) {
        return (
            <>
                <Navbar />
                <div className="page">
                    <div className="container">
                        <div className="empty-state">
                            <div className="empty-state-icon">🔍</div>
                            <h3>Project not found</h3>
                            <p>This project doesn't exist or has been removed.</p>
                            <Link to="/" className="btn btn-primary mt-4">Go Home</Link>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    const isOwner = user && user.id === project.userId;
    const isSeller = user && user.role === 'seller';
    const fulfillment = getFulfillmentInfo(project.fulfillmentType);

    const handleAccept = () => {
        acceptProject(project._id || project.id, user.id, user.name);
    };

    const handleComplete = () => {
        completeProject(project._id || project.id);
    };

    const handleDelete = () => {
        if (window.confirm('Are you sure you want to delete this project?')) {
            deleteProject(project._id || project.id);
            navigate('/dashboard');
        }
    };

    const handleAcceptBid = (bidId) => {
        acceptBid(project._id || project.id, bidId);
    };

    const handleReviewSubmit = (e) => {
        e.preventDefault();
        addReview(project._id || project.id, reviewRating, reviewText);
    };

    // Use fulfillment-specific timeline
    const timelineSteps = getFulfillmentTimeline(project.fulfillmentType, project);

    return (
        <>
            <Navbar />
            <div className="page">
                <div className="container">
                    <div className="project-detail">
                        {/* Back button */}
                        <button
                            onClick={() => navigate(-1)}
                            className="btn btn-secondary btn-sm mb-6"
                        >
                            ← Back
                        </button>

                        {/* Header */}
                        <div className="project-detail-header">
                            <div className="flex-between" style={{ marginBottom: 'var(--space-4)' }}>
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                                    <StatusBadge status={project.status} />
                                    {project.category && (
                                        <span className="badge" style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}>
                                            {project.category}
                                        </span>
                                    )}
                                    {fulfillment && (
                                        <span className="badge badge-fulfillment" style={{ borderColor: fulfillment.color, color: fulfillment.color, background: `${fulfillment.color}15` }}>
                                            {fulfillment.icon} {fulfillment.label}
                                        </span>
                                    )}
                                    {project.estimatedDelivery && (
                                        <span className="badge" style={{ background: 'rgba(99,102,241,0.12)', color: 'var(--accent-primary)', border: '1px solid rgba(99,102,241,0.2)' }}>
                                            📅 Est. {project.estimatedDelivery.label}
                                        </span>
                                    )}
                                </div>
                                {(project.status === 'open' || project.status === 'in-progress') && (
                                    <CountdownTimer deadline={project.deadline} />
                                )}
                            </div>
                            <h1 className="project-detail-title">{project.title}</h1>
                        </div>

                        {/* Info Cards */}
                        <div className="grid-2 mb-6">
                            <div className="card">
                                <div className="text-muted text-sm" style={{ marginBottom: 'var(--space-2)' }}>Budget</div>
                                <div style={{ fontSize: 'var(--fs-2xl)', fontWeight: 800 }}>
                                    ₹{(isOwner ? (project.totalCost || project.budget) : project.budget)?.toLocaleString()}
                                </div>
                                {isOwner && project.platformFee > 0 && (
                                    <div style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-secondary)' }}>
                                        (Includes ₹{(project.platformFee).toLocaleString()} platform fee)
                                    </div>
                                )}
                            </div>
                            <div className="card">
                                <div className="text-muted text-sm" style={{ marginBottom: 'var(--space-2)' }}>Deadline</div>
                                <div style={{ fontSize: 'var(--fs-2xl)', fontWeight: 800 }}>
                                    {new Date(project.deadline).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric',
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="project-detail-section">
                            <h3>Description</h3>
                            <div className="card">
                                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
                                    {project.description}
                                </p>
                            </div>
                        </div>

                        {/* Category-Specific Fields */}
                        {project.categoryFields && Object.keys(project.categoryFields).length > 0 && (
                            <div className="project-detail-section">
                                <h3>
                                    {project.category === 'Website' && '🌐 '}
                                    {project.category === 'Software Bot' && '🤖 '}
                                    {project.category === 'Automation Script' && '⚙️ '}
                                    {project.category} Details
                                </h3>
                                <div className="card">
                                    <div className="category-fields-display">
                                        {Object.entries(project.categoryFields).map(([key, value]) => (
                                            value && (
                                                <div className="category-field-item" key={key}>
                                                    <span className="category-field-label">
                                                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}
                                                    </span>
                                                    <span className="category-field-value">{value}</span>
                                                </div>
                                            )
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Fulfillment Method */}
                        {project.fulfillmentType && (() => {
                            const fl = getFulfillmentInfo(project.fulfillmentType);
                            if (!fl) return null;

                            const detailMap = {
                                'parts-only': {
                                    explanation: 'The cheapest parts will be sourced from across all websites and shipped directly to you. No assembly is included — you build it yourself.',
                                    steps: ['Parts sourced from cheapest suppliers', 'Shipped directly to you', 'You assemble the robot'],
                                },
                                'source-and-assemble': {
                                    explanation: 'We find the cheapest parts from all websites and send them to the seller. The seller will professionally assemble the robot and ship the finished product to you.',
                                    steps: ['Parts sourced from cheapest suppliers', 'Parts shipped to seller', 'Seller assembles the robot', 'Finished robot shipped to you'],
                                },
                                'seller-direct': {
                                    explanation: 'The seller already has all the parts in stock. They will assemble the robot and ship it directly to you — the fastest option available.',
                                    steps: ['Seller uses in-stock parts', 'Seller assembles the robot', 'Shipped directly to you'],
                                },
                            };
                            const detail = detailMap[project.fulfillmentType];

                            return (
                                <div className="project-detail-section">
                                    <h3>Fulfillment Method</h3>
                                    <div className="card fulfillment-detail-card" style={{ borderLeft: `3px solid ${fl.color}` }}>
                                        <div className="fulfillment-detail-header">
                                            <span className="fulfillment-detail-icon">{fl.icon}</span>
                                            <div>
                                                <div className="fulfillment-detail-label">{fl.label}</div>
                                                <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--fs-sm)', marginTop: 'var(--space-1)' }}>
                                                    {detail.explanation}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="fulfillment-detail-steps">
                                            {detail.steps.map((step, i) => (
                                                <div className="fulfillment-step" key={i}>
                                                    <div className="fulfillment-step-number">{i + 1}</div>
                                                    <span>{step}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}

                        {/* Parts List / BOM */}
                        {project.partsList && project.partsList.length > 0 && (
                            <div className="project-detail-section">
                                <h3>📋 Parts List (BOM)</h3>
                                <div className="card">
                                    <div className="bom-display">
                                        <div className="bom-display-header">
                                            <span>Component</span>
                                            <span>Qty</span>
                                        </div>
                                        {project.partsList.map((part, i) => (
                                            <div className="bom-display-row" key={i}>
                                                <span>{part.name}</span>
                                                <span className="bom-display-qty">×{part.qty}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Shipping Address */}
                        {project.shippingAddress && (
                            <div className="project-detail-section">
                                <h3>📍 Shipping Address</h3>
                                <div className="card">
                                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
                                        {project.shippingAddress}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Bids Section */}
                        {project.bids && project.bids.length > 0 && (
                            <div className="project-detail-section">
                                <h3>💰 Seller Bids ({project.bids.length})</h3>
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
                                                {isOwner && project.status === 'open' && (
                                                    <button
                                                        className="btn btn-success btn-sm"
                                                        onClick={() => handleAcceptBid(bid.id)}
                                                    >
                                                        ✓ Accept Bid
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* People */}
                        <div className="project-detail-section">
                            <h3>People</h3>
                            <div className="grid-2">
                                <div className="card">
                                    <div className="text-muted text-sm" style={{ marginBottom: 'var(--space-2)' }}>Posted by</div>
                                    <div className="font-bold">{project.userName}</div>
                                    <span className="badge badge-user" style={{ marginTop: 'var(--space-2)' }}>User</span>
                                </div>
                                <div className="card">
                                    <div className="text-muted text-sm" style={{ marginBottom: 'var(--space-2)' }}>Assigned Seller</div>
                                    <div className="font-bold">{project.sellerName || '—'}</div>
                                    {project.sellerName && (
                                        <span className="badge badge-seller" style={{ marginTop: 'var(--space-2)' }}>Seller</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Deliverable */}
                        {project.deliverable && (
                            <div className="project-detail-section">
                                <h3>Deliverable</h3>
                                <div className="card" style={{ borderLeft: '3px solid var(--success)' }}>
                                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
                                        {project.deliverable}
                                    </p>
                                    <div className="text-muted text-sm" style={{ marginTop: 'var(--space-3)' }}>
                                        Submitted on {new Date(project.deliveredAt).toLocaleString()}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Timeline */}
                        <div className="project-detail-section">
                            <h3>Timeline</h3>
                            <div className="card">
                                <div className="project-timeline">
                                    {timelineSteps.map((step, i) => (
                                        <div className="timeline-item" key={i}>
                                            <div className={`timeline-dot ${step.active ? 'active' : ''}`} />
                                            <div className="timeline-label">{step.label}</div>
                                            <div className="timeline-date">
                                                {step.date
                                                    ? new Date(step.date).toLocaleString()
                                                    : 'Pending'}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div style={{ display: 'flex', gap: 'var(--space-4)', marginTop: 'var(--space-8)' }}>
                            {project.status === 'open' && isSeller && !project.fulfillmentType && (
                                <button className="btn btn-primary btn-lg" onClick={handleAccept}>
                                    ✋ Accept This Project
                                </button>
                            )}
                            {project.status === 'open' && isOwner && (
                                <button className="btn btn-lg" style={{ background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca' }} onClick={handleDelete}>
                                    🗑️ Delete Project
                                </button>
                            )}
                            {project.status === 'delivered' && isOwner && (
                                <button className="btn btn-success btn-lg" onClick={handleComplete}>
                                    ✓ Mark as Completed
                                </button>
                            )}
                        </div>

                        {/* Reviews */}
                        {project.status === 'completed' && (
                            <div className="project-detail-section" style={{ marginTop: 'var(--space-8)' }}>
                                <h3>Review & Feedback</h3>
                                {project.rating ? (
                                    <div className="card" style={{ borderTop: '3px solid #fbbf24' }}>
                                        <StarRating rating={project.rating} readonly />
                                        {project.reviewText && (
                                            <p style={{ marginTop: 'var(--space-3)', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                                                "{project.reviewText}"
                                            </p>
                                        )}
                                    </div>
                                ) : isOwner ? (
                                    <div className="card">
                                        <h4>Leave a review for {project.sellerName}</h4>
                                        <form onSubmit={handleReviewSubmit} style={{ marginTop: 'var(--space-4)' }}>
                                            <div className="form-group">
                                                <label className="form-label">Rating</label>
                                                <StarRating rating={reviewRating} setRating={setReviewRating} />
                                            </div>
                                            <div className="form-group">
                                                <label className="form-label">Review Comment</label>
                                                <textarea
                                                    className="form-textarea"
                                                    placeholder="How did the seller do?"
                                                    value={reviewText}
                                                    onChange={(e) => setReviewText(e.target.value)}
                                                    required
                                                    rows={3}
                                                />
                                            </div>
                                            <button type="submit" className="btn btn-primary" disabled={!reviewRating}>
                                                Submit Review
                                            </button>
                                        </form>
                                    </div>
                                ) : (
                                    <div className="card">
                                        <p className="text-secondary text-sm">Waiting for the buyer to leave a review...</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
