import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ProjectContext = createContext(null);

const PROJECTS_KEY = 'buybots_projects';

function getStoredProjects() {
    try {
        return JSON.parse(localStorage.getItem(PROJECTS_KEY)) || [];
    } catch {
        return [];
    }
}

function saveProjects(projects) {
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
}

// Estimated delivery days per fulfillment type
export const DELIVERY_ESTIMATES = {
    'parts-only': { min: 3, max: 5, label: '3–5 days' },
    'source-and-assemble': { min: 10, max: 15, label: '10–15 days' },
    'seller-direct': { min: 5, max: 7, label: '5–7 days' },
};

export function ProjectProvider({ children }) {
    const [projects, setProjects] = useState(getStoredProjects);

    useEffect(() => {
        saveProjects(projects);
    }, [projects]);

    const createProject = useCallback(({
        title, description, budget, deadline, userId, userName,
        category, fulfillmentType, partsList, shippingAddress, categoryFields
    }) => {
        const parsedBudget = parseFloat(budget);
        const platformFee = parsedBudget * 0.10;
        const totalCost = parsedBudget + platformFee;

        const project = {
            id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
            title,
            description,
            budget: parsedBudget,
            platformFee,
            totalCost,
            deadline,
            status: 'open',
            userId,
            userName,
            category: category || 'Other',
            fulfillmentType: fulfillmentType || null,
            // Parts list / BOM for Physical Robot
            partsList: partsList || [],
            // Shipping address for physical deliveries
            shippingAddress: shippingAddress || null,
            // Category-specific fields
            categoryFields: categoryFields || null,
            // Estimated delivery
            estimatedDelivery: fulfillmentType ? DELIVERY_ESTIMATES[fulfillmentType] || null : null,
            // Seller bids (for bidding system)
            bids: [],
            // Seller info
            sellerId: null,
            sellerName: null,
            deliverable: null,
            createdAt: new Date().toISOString(),
            acceptedAt: null,
            deliveredAt: null,
            completedAt: null,
            rating: null,
            reviewText: null,
        };
        setProjects(prev => [project, ...prev]);
        return project;
    }, []);

    const acceptProject = useCallback((projectId, sellerId, sellerName) => {
        setProjects(prev =>
            prev.map(p =>
                p.id === projectId
                    ? {
                        ...p,
                        status: 'in-progress',
                        sellerId,
                        sellerName,
                        acceptedAt: new Date().toISOString(),
                    }
                    : p
            )
        );
    }, []);

    const placeBid = useCallback((projectId, sellerId, sellerName, bidAmount, message, estimatedDays) => {
        setProjects(prev =>
            prev.map(p => {
                if (p.id !== projectId) return p;
                // Prevent duplicate bids from same seller
                if (p.bids.some(b => b.sellerId === sellerId)) return p;
                return {
                    ...p,
                    bids: [
                        ...p.bids,
                        {
                            id: Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
                            sellerId,
                            sellerName,
                            bidAmount: parseFloat(bidAmount),
                            message,
                            estimatedDays: parseInt(estimatedDays) || null,
                            createdAt: new Date().toISOString(),
                        },
                    ],
                };
            })
        );
    }, []);

    const acceptBid = useCallback((projectId, bidId) => {
        setProjects(prev =>
            prev.map(p => {
                if (p.id !== projectId) return p;
                const bid = p.bids.find(b => b.id === bidId);
                if (!bid) return p;
                return {
                    ...p,
                    status: 'in-progress',
                    sellerId: bid.sellerId,
                    sellerName: bid.sellerName,
                    budget: bid.bidAmount,
                    platformFee: bid.bidAmount * 0.10,
                    totalCost: bid.bidAmount * 1.10,
                    acceptedAt: new Date().toISOString(),
                };
            })
        );
    }, []);

    const submitProject = useCallback((projectId, deliverable) => {
        setProjects(prev =>
            prev.map(p =>
                p.id === projectId
                    ? {
                        ...p,
                        status: 'delivered',
                        deliverable,
                        deliveredAt: new Date().toISOString(),
                    }
                    : p
            )
        );
    }, []);

    const completeProject = useCallback((projectId) => {
        setProjects(prev =>
            prev.map(p =>
                p.id === projectId
                    ? {
                        ...p,
                        status: 'completed',
                        completedAt: new Date().toISOString(),
                    }
                    : p
            )
        );
    }, []);

    const deleteProject = useCallback((projectId) => {
        setProjects(prev => prev.filter(p => p.id !== projectId));
    }, []);

    const addReview = useCallback((projectId, rating, reviewText) => {
        setProjects(prev =>
            prev.map(p =>
                p.id === projectId
                    ? { ...p, rating, reviewText }
                    : p
            )
        );
    }, []);

    const getProjectById = useCallback((id) => {
        return projects.find(p => p.id === id) || null;
    }, [projects]);

    const getUserProjects = useCallback((userId) => {
        return projects.filter(p => p.userId === userId);
    }, [projects]);

    const getSellerProjects = useCallback((sellerId) => {
        return projects.filter(p => p.sellerId === sellerId);
    }, [projects]);

    const getOpenProjects = useCallback(() => {
        return projects.filter(p => p.status === 'open');
    }, [projects]);

    return (
        <ProjectContext.Provider
            value={{
                projects,
                createProject,
                acceptProject,
                placeBid,
                acceptBid,
                submitProject,
                completeProject,
                deleteProject,
                addReview,
                getProjectById,
                getUserProjects,
                getSellerProjects,
                getOpenProjects,
            }}
        >
            {children}
        </ProjectContext.Provider>
    );
}

export function useProjects() {
    const ctx = useContext(ProjectContext);
    if (!ctx) throw new Error('useProjects must be used within ProjectProvider');
    return ctx;
}
