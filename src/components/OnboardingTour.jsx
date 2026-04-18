import { useState, useEffect } from 'react';
import { Joyride, STATUS } from 'react-joyride';

export default function OnboardingTour({ steps, tourKey }) {
    const [run, setRun] = useState(false);

    useEffect(() => {
        // Check if the user has already completed this specific tour
        const hasCompletedTour = localStorage.getItem(`tour_completed_${tourKey}`);
        if (!hasCompletedTour) {
            // Small delay to ensure all DOM elements are mounted before starting
            const timer = setTimeout(() => {
                setRun(true);
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [tourKey]);

    const handleJoyrideCallback = (data) => {
        const { status } = data;
        const finishedStatuses = [STATUS.FINISHED, STATUS.SKIPPED];

        if (finishedStatuses.includes(status)) {
            // Mark tour as completed so it doesn't show again
            localStorage.setItem(`tour_completed_${tourKey}`, 'true');
            setRun(false);
        }
    };

    return (
        <Joyride
            steps={steps}
            run={run}
            continuous={true}
            showSkipButton={true}
            showProgress={true}
            scrollToFirstStep={true}
            callback={handleJoyrideCallback}
            styles={{
                options: {
                    arrowColor: '#1f2937', // dark mode background
                    backgroundColor: '#1f2937',
                    overlayColor: 'rgba(0, 0, 0, 0.7)',
                    primaryColor: '#fcd34d', // amber accent
                    textColor: '#f9fafb',
                    zIndex: 1000,
                },
                tooltipContainer: {
                    textAlign: 'left',
                },
                buttonNext: {
                    backgroundColor: '#fcd34d',
                    color: '#000',
                    fontWeight: 'bold',
                    borderRadius: '4px',
                },
                buttonBack: {
                    color: '#9ca3af',
                    marginRight: '10px',
                },
                buttonSkip: {
                    color: '#9ca3af',
                }
            }}
        />
    );
}
