import { useState, useEffect } from 'react';

export default function CountdownTimer({ deadline }) {
    const [timeLeft, setTimeLeft] = useState(getTimeLeft(deadline));

    useEffect(() => {
        const interval = setInterval(() => {
            setTimeLeft(getTimeLeft(deadline));
        }, 1000);
        return () => clearInterval(interval);
    }, [deadline]);

    if (!deadline) return null;

    const totalMs = new Date(deadline) - Date.now();
    let className = 'countdown countdown-normal';
    if (totalMs < 0) className = 'countdown countdown-danger';
    else if (totalMs < 24 * 60 * 60 * 1000) className = 'countdown countdown-danger';
    else if (totalMs < 3 * 24 * 60 * 60 * 1000) className = 'countdown countdown-warning';

    return (
        <span className={className}>
            ⏱ {timeLeft}
        </span>
    );
}

function getTimeLeft(deadline) {
    const diff = new Date(deadline) - Date.now();
    if (diff <= 0) return 'Overdue';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const mins = Math.floor((diff / (1000 * 60)) % 60);
    const secs = Math.floor((diff / 1000) % 60);

    if (days > 0) return `${days}d ${hours}h ${mins}m`;
    if (hours > 0) return `${hours}h ${mins}m ${secs}s`;
    return `${mins}m ${secs}s`;
}
