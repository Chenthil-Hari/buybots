export default function StatusBadge({ status }) {
    const labels = {
        open: 'Open',
        'in-progress': 'In Progress',
        delivered: 'Delivered',
        completed: 'Completed',
    };

    const dotColors = {
        open: '#3b82f6',
        'in-progress': '#f59e0b',
        delivered: '#a78bfa',
        completed: '#10b981',
    };

    return (
        <span className={`badge badge-${status}`}>
            <span
                style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: dotColors[status] || '#94a3b8',
                    display: 'inline-block',
                }}
            />
            {labels[status] || status}
        </span>
    );
}
