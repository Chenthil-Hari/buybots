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
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchOpenProjects = useCallback(async () => {
        try {
            const response = await fetch('/api/projects/open');
            if (response.ok) {
                const data = await response.json();
                setProjects(prev => {
                    const other = prev.filter(p => p.status !== 'open');
                    return [...data, ...other];
                });
            }
        } catch (err) {
            console.error("Failed to fetch open projects:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchUserProjects = useCallback(async (userId) => {
        try {
            const response = await fetch(`/api/projects/user/${userId}`);
            if (response.ok) {
                const data = await response.json();
                setProjects(prev => {
                    const otherIds = new Set(data.map(p => p._id));
                    const other = prev.filter(p => !otherIds.has(p._id));
                    return [...data, ...other];
                });
            }
        } catch (err) {
            console.error("Failed to fetch user projects:", err);
        }
    }, []);

    const fetchSellerProjects = useCallback(async (sellerId) => {
        try {
            const response = await fetch(`/api/projects/seller/${sellerId}`);
            if (response.ok) {
                const data = await response.json();
                setProjects(prev => {
                    const otherIds = new Set(data.map(p => p._id));
                    const other = prev.filter(p => !otherIds.has(p._id));
                    return [...data, ...other];
                });
            }
        } catch (err) {
            console.error("Failed to fetch seller projects:", err);
        }
    }, []);

    // Initial load logic
    useEffect(() => {
        fetchOpenProjects();
    }, [fetchOpenProjects]);

    const createProject = useCallback(async ({
        title, description, budget, deadline, userId, userName,
        category, fulfillmentType, partsList, shippingAddress, categoryFields
    }) => {
        const parsedBudget = parseFloat(budget);
        const platformFee = parsedBudget * 0.10;
        const totalCost = parsedBudget + platformFee;

        const projectData = {
            title,
            description,
            budget: parsedBudget,
            platformFee,
            totalCost,
            deadline,
            userId,
            userName,
            category: category || 'Other',
            fulfillmentType: fulfillmentType || null,
            partsList: partsList || [],
            shippingAddress: shippingAddress || null,
            categoryFields: categoryFields || null,
            estimatedDelivery: fulfillmentType ? DELIVERY_ESTIMATES[fulfillmentType] || null : null,
        };

        try {
            const response = await fetch('/api/projects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(projectData),
            });
            if (response.ok) {
                const savedProject = await response.json();
                setProjects(prev => [savedProject, ...prev]);
                return savedProject;
            }
        } catch (err) {
            console.error("Failed to create project:", err);
        }
    }, []);

    const togglePin = useCallback(async (projectId) => {
        const project = projects.find(p => p._id === projectId || p.id === projectId);
        if (!project) return;
        
        try {
            const response = await fetch(`/api/projects/${project._id || project.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isPinned: !project.isPinned }),
            });
            if (response.ok) {
                const updated = await response.json();
                setProjects(prev => prev.map(p => (p._id === updated._id || p.id === updated.id) ? updated : p));
            }
        } catch (err) {
            console.error("Failed to toggle pin:", err);
        }
    }, [projects]);

    const acceptProject = useCallback(async (projectId, sellerId, sellerName) => {
        const project = projects.find(p => p._id === projectId || p.id === projectId);
        if (!project) return;

        try {
            const response = await fetch(`/api/projects/${project._id || project.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status: 'in-progress',
                    sellerId,
                    sellerName,
                    acceptedAt: new Date().toISOString(),
                }),
            });
            if (response.ok) {
                const updated = await response.json();
                setProjects(prev => prev.map(p => (p._id === updated._id || p.id === updated.id) ? updated : p));
            }
        } catch (err) {
            console.error("Failed to accept project:", err);
        }
    }, [projects]);

    const placeBid = useCallback(async (projectId, sellerId, sellerName, bidAmount, message, estimatedDays) => {
        const project = projects.find(p => p._id === projectId || p.id === projectId);
        if (!project) return;

        const bidData = {
            sellerId,
            sellerName,
            bidAmount: parseFloat(bidAmount),
            message,
            estimatedDays: parseInt(estimatedDays) || null,
        };

        try {
            const response = await fetch(`/api/projects/${project._id || project.id}/bid`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bidData),
            });
            if (response.ok) {
                const updated = await response.json();
                setProjects(prev => prev.map(p => (p._id === updated._id || p.id === updated.id) ? updated : p));
            }
        } catch (err) {
            console.error("Failed to place bid:", err);
        }
    }, [projects]);

    const acceptBid = useCallback(async (projectId, bidId) => {
        const project = projects.find(p => p._id === projectId || p.id === projectId);
        if (!project) return;

        try {
            const response = await fetch(`/api/projects/${project._id || project.id}/accept-bid`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ bidId }),
            });
            if (response.ok) {
                const updated = await response.json();
                setProjects(prev => prev.map(p => (p._id === updated._id || p.id === updated.id) ? updated : p));
            }
        } catch (err) {
            console.error("Failed to accept bid:", err);
        }
    }, [projects]);

    const submitProject = useCallback(async (projectId, deliverable) => {
        const project = projects.find(p => p._id === projectId || p.id === projectId);
        if (!project) return;

        try {
            const response = await fetch(`/api/projects/${project._id || project.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status: 'delivered',
                    deliverable,
                    deliveredAt: new Date().toISOString(),
                }),
            });
            if (response.ok) {
                const updated = await response.json();
                setProjects(prev => prev.map(p => (p._id === updated._id || p.id === updated.id) ? updated : p));
            }
        } catch (err) {
            console.error("Failed to submit work:", err);
        }
    }, [projects]);

    const completeProject = useCallback(async (projectId) => {
        const project = projects.find(p => p._id === projectId || p.id === projectId);
        if (!project) return;

        try {
            const response = await fetch(`/api/projects/${project._id || project.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status: 'completed',
                    completedAt: new Date().toISOString(),
                }),
            });
            if (response.ok) {
                const updated = await response.json();
                setProjects(prev => prev.map(p => (p._id === updated._id || p.id === updated.id) ? updated : p));
            }
        } catch (err) {
            console.error("Failed to complete project:", err);
        }
    }, [projects]);

    const deleteProject = useCallback(async (projectId) => {
        const project = projects.find(p => p._id === projectId || p.id === projectId);
        if (!project) return;

        try {
            const response = await fetch(`/api/projects/${project._id || project.id}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                setProjects(prev => prev.filter(p => (p._id !== (project._id || project.id) && p.id !== (project._id || project.id))));
            }
        } catch (err) {
            console.error("Failed to delete project:", err);
        }
    }, [projects]);

    const addReview = useCallback(async (projectId, rating, reviewText) => {
        const project = projects.find(p => p._id === projectId || p.id === projectId);
        if (!project) return;

        try {
            const response = await fetch(`/api/projects/${project._id || project.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rating, reviewText }),
            });
            if (response.ok) {
                const updated = await response.json();
                setProjects(prev => prev.map(p => (p._id === updated._id || p.id === updated.id) ? updated : p));
            }
        } catch (err) {
            console.error("Failed to add review:", err);
        }
    }, [projects]);

    const getProjectById = useCallback((id) => {
        return projects.find(p => p._id === id || p.id === id) || null;
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
                loading,
                fetchUserProjects,
                fetchSellerProjects,
                fetchOpenProjects,
                createProject,
                acceptProject,
                togglePin,
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
