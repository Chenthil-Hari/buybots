import { useState } from 'react';

export default function StarRating({ rating, setRating, readonly = false }) {
    const [hover, setHover] = useState(0);

    return (
        <div className="star-rating" style={{ display: 'flex', gap: '4px' }}>
            {[1, 2, 3, 4, 5].map((star) => {
                const isActive = star <= (hover || rating);
                return (
                    <button
                        type="button"
                        key={star}
                        disabled={readonly}
                        onClick={() => !readonly && setRating(star)}
                        onMouseEnter={() => !readonly && setHover(star)}
                        onMouseLeave={() => !readonly && setHover(0)}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: readonly ? 'default' : 'pointer',
                            fontSize: '1.5rem',
                            padding: 0,
                            color: isActive ? '#fbbf24' : 'var(--border-color)', // Gold if active, grey if not
                            transition: 'color 0.2s',
                        }}
                    >
                        ★
                    </button>
                );
            })}
        </div>
    );
}
