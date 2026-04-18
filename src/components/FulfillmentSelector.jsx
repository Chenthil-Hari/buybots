import { DELIVERY_ESTIMATES } from '../context/ProjectContext';

const FULFILLMENT_OPTIONS = [
    {
        id: 'parts-only',
        icon: '🔩',
        title: 'Parts Only',
        subtitle: 'Cheapest Option',
        description:
            'We source the cheapest parts across all websites and ship them directly to you. No assembly included — perfect if you want to build it yourself.',
        pros: ['Lowest cost', 'Fastest shipping', 'Full control over assembly'],
        cons: ['You assemble it yourself'],
        speedLabel: 'Fast',
        costLabel: 'Low',
        speedColor: 'var(--success)',
        costColor: 'var(--success)',
        priceRange: '₹1,000 – ₹5,000',
    },
    {
        id: 'source-and-assemble',
        icon: '🏭',
        title: 'We Source + Seller Assembles',
        subtitle: 'Best Value',
        description:
            'We find the cheapest parts from all websites and send them to the seller. The seller assembles the robot and ships it to you.',
        pros: ['Cheapest parts sourced for you', 'Professional assembly', 'Quality checked'],
        cons: ['Takes longer (sourcing → shipping → assembly → delivery)'],
        speedLabel: 'Slow',
        costLabel: 'Medium',
        speedColor: 'var(--warning)',
        costColor: 'var(--warning)',
        priceRange: '₹3,000 – ₹10,000',
    },
    {
        id: 'seller-direct',
        icon: '🚀',
        title: 'Seller Builds & Ships',
        subtitle: 'Fastest Delivery',
        description:
            'The seller already has all the parts in stock. They assemble the robot and ship it directly to you — the quickest option.',
        pros: ['Fastest delivery', 'Seller uses trusted parts', 'Ready-to-go'],
        cons: ['Higher cost (seller stocks parts)'],
        speedLabel: 'Fastest',
        costLabel: 'Higher',
        speedColor: '#10b981',
        costColor: 'var(--danger)',
        priceRange: '₹5,000 – ₹20,000',
    },
];

export default function FulfillmentSelector({ value, onChange }) {
    return (
        <div className="fulfillment-selector">
            <div className="fulfillment-selector-header">
                <h4 className="fulfillment-selector-title">
                    <span className="fulfillment-selector-icon">🤖</span>
                    Choose Fulfillment Method
                </h4>
                <p className="fulfillment-selector-desc">
                    How do you want your robot delivered?
                </p>
            </div>

            <div className="fulfillment-options-grid">
                {FULFILLMENT_OPTIONS.map((opt) => {
                    const delivery = DELIVERY_ESTIMATES[opt.id];
                    return (
                        <button
                            key={opt.id}
                            type="button"
                            className={`fulfillment-option ${value === opt.id ? 'selected' : ''}`}
                            onClick={() => onChange(opt.id)}
                        >
                            {/* Recommended badge for option 2 */}
                            {opt.id === 'source-and-assemble' && (
                                <div className="fulfillment-recommended">Recommended</div>
                            )}

                            <div className="fulfillment-option-icon">{opt.icon}</div>
                            <div className="fulfillment-option-title">{opt.title}</div>
                            <div className="fulfillment-option-subtitle">{opt.subtitle}</div>

                            <p className="fulfillment-option-desc">{opt.description}</p>

                            {/* Estimated price range */}
                            <div className="fulfillment-price-range">
                                <span className="fulfillment-price-label">Est. Price</span>
                                <span className="fulfillment-price-value">{opt.priceRange}</span>
                            </div>

                            {/* Speed, Cost & Delivery indicators */}
                            <div className="fulfillment-indicators">
                                <div className="fulfillment-indicator">
                                    <span className="fulfillment-indicator-label">Speed</span>
                                    <span
                                        className="fulfillment-indicator-value"
                                        style={{ color: opt.speedColor }}
                                    >
                                        {opt.speedLabel}
                                    </span>
                                </div>
                                <div className="fulfillment-indicator">
                                    <span className="fulfillment-indicator-label">Cost</span>
                                    <span
                                        className="fulfillment-indicator-value"
                                        style={{ color: opt.costColor }}
                                    >
                                        {opt.costLabel}
                                    </span>
                                </div>
                                {delivery && (
                                    <div className="fulfillment-indicator">
                                        <span className="fulfillment-indicator-label">Delivery</span>
                                        <span className="fulfillment-indicator-value" style={{ color: 'var(--accent-primary)' }}>
                                            {delivery.label}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Pros */}
                            <ul className="fulfillment-pros">
                                {opt.pros.map((pro, i) => (
                                    <li key={i}>
                                        <span className="fulfillment-check">✓</span> {pro}
                                    </li>
                                ))}
                            </ul>

                            {/* Selection indicator */}
                            <div className="fulfillment-radio">
                                <div className="fulfillment-radio-dot" />
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

// Helper to get display info for a fulfillment type
export function getFulfillmentInfo(type) {
    const map = {
        'parts-only': { icon: '🔩', label: 'Parts Only', color: 'var(--info)' },
        'source-and-assemble': { icon: '🏭', label: 'Sourced + Assembled', color: 'var(--warning)' },
        'seller-direct': { icon: '🚀', label: 'Seller Direct', color: 'var(--success)' },
    };
    return map[type] || null;
}

// Fulfillment-specific timeline steps
export function getFulfillmentTimeline(fulfillmentType, project) {
    const base = {
        'parts-only': [
            { label: 'Project Posted', date: project.createdAt, active: true },
            { label: 'Parts Sourced', date: project.acceptedAt, active: !!project.acceptedAt },
            { label: 'Parts Shipped to Buyer', date: project.deliveredAt, active: !!project.deliveredAt },
            { label: 'Received by Buyer', date: project.completedAt, active: !!project.completedAt },
        ],
        'source-and-assemble': [
            { label: 'Project Posted', date: project.createdAt, active: true },
            { label: 'Seller Accepted', date: project.acceptedAt, active: !!project.acceptedAt },
            { label: 'Parts Sourced & Shipped to Seller', date: project.acceptedAt ? new Date(new Date(project.acceptedAt).getTime() + 3 * 86400000).toISOString() : null, active: !!project.acceptedAt },
            { label: 'Assembly In Progress', date: project.acceptedAt ? new Date(new Date(project.acceptedAt).getTime() + 6 * 86400000).toISOString() : null, active: !!project.acceptedAt },
            { label: 'Assembled & Shipped', date: project.deliveredAt, active: !!project.deliveredAt },
            { label: 'Received & Completed', date: project.completedAt, active: !!project.completedAt },
        ],
        'seller-direct': [
            { label: 'Project Posted', date: project.createdAt, active: true },
            { label: 'Seller Accepted', date: project.acceptedAt, active: !!project.acceptedAt },
            { label: 'Assembly In Progress', date: project.acceptedAt, active: !!project.acceptedAt },
            { label: 'Assembled & Shipped', date: project.deliveredAt, active: !!project.deliveredAt },
            { label: 'Received & Completed', date: project.completedAt, active: !!project.completedAt },
        ],
    };

    if (fulfillmentType && base[fulfillmentType]) {
        return base[fulfillmentType];
    }

    // Default timeline for non-robot projects
    return [
        { label: 'Project Posted', date: project.createdAt, active: true },
        { label: 'Seller Accepted', date: project.acceptedAt, active: !!project.acceptedAt },
        { label: 'Work Delivered', date: project.deliveredAt, active: !!project.deliveredAt },
        { label: 'Project Completed', date: project.completedAt, active: !!project.completedAt },
    ];
}
