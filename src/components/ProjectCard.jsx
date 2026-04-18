import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import CountdownTimer from './CountdownTimer';
import { getFulfillmentInfo } from './FulfillmentSelector';

export default function ProjectCard({ project, actions }) {
    const fulfillment = getFulfillmentInfo(project.fulfillmentType);

    return (
        <div className="project-card">
            <div className="project-card-header">
                <Link to={`/project/${project._id || project.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <h3 className="project-card-title">{project.title}</h3>
                </Link>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    {project.category && (
                        <span className="badge" style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)', fontSize: '0.75rem' }}>
                            {project.category}
                        </span>
                    )}
                    {fulfillment && (
                        <span className="badge badge-fulfillment" style={{ borderColor: fulfillment.color, color: fulfillment.color, background: `${fulfillment.color}15` }}>
                            {fulfillment.icon} {fulfillment.label}
                        </span>
                    )}
                    <StatusBadge status={project.status} />
                </div>
            </div>

            <div className="project-card-body">
                <p className="project-card-description">{project.description}</p>
            </div>

            <div className="project-card-meta">
                <div className="project-card-meta-item">
                    💰 Budget: <span>₹{project.budget?.toLocaleString()}</span>
                </div>
                <div className="project-card-meta-item">
                    📅 Deadline: <span>{new Date(project.deadline).toLocaleDateString()}</span>
                </div>
                {project.estimatedDelivery && (
                    <div className="project-card-meta-item">
                        🚚 Est. Delivery: <span style={{ color: 'var(--accent-primary)' }}>{project.estimatedDelivery.label}</span>
                    </div>
                )}
                {(project.status === 'in-progress' || project.status === 'open') && (
                    <div className="project-card-meta-item">
                        <CountdownTimer deadline={project.deadline} />
                    </div>
                )}
                {project.sellerName && (
                    <div className="project-card-meta-item">
                        🏪 Seller: <span>{project.sellerName}</span>
                    </div>
                )}
                {project.userName && (
                    <div className="project-card-meta-item">
                        👤 Posted by: <span>{project.userName}</span>
                    </div>
                )}
                {project.bids && project.bids.length > 0 && (
                    <div className="project-card-meta-item">
                        💬 Bids: <span style={{ color: 'var(--accent-primary)' }}>{project.bids.length}</span>
                    </div>
                )}
                {project.partsList && project.partsList.length > 0 && (
                    <div className="project-card-meta-item">
                        📋 Parts: <span>{project.partsList.length} items</span>
                    </div>
                )}
            </div>

            {actions && (
                <div className="project-card-actions">
                    {actions}
                </div>
            )}
        </div>
    );
}
