import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useProjects } from '../context/ProjectContext';
import Navbar from '../components/Navbar';
import './AdminDashboard.css';

export default function AdminDashboard({ onLogout }) {
    const { user } = useAuth();
    const { projects, deleteProject } = useProjects();
    const [users, setUsers] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [activeTab, setActiveTab] = useState('analytics');

    const handleLogout = () => {
        sessionStorage.removeItem('admin_auth');
        if (onLogout) onLogout();
    };

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await fetch('/api/users');
                if (res.ok) {
                    const data = await res.json();
                    setUsers(data);
                }
            } catch (err) {
                console.error("Failed to fetch users", err);
            } finally {
                setLoadingUsers(false);
            }
        };
        fetchUsers();
    }, []);

    // Analytics calculations
    const totalRevenue = projects.reduce((sum, p) => sum + (p.platformFee || 0), 0);
    const activeProjectsCount = projects.filter(p => p.status === 'open' || p.status === 'in-progress').length;
    const sellersCount = users.filter(u => u.role === 'seller').length;
    const buyersCount = users.filter(u => u.role === 'user').length;

    const handleDeleteProject = (id) => {
        if (window.confirm("Are you sure you want to delete this project? This cannot be undone.")) {
            deleteProject(id);
        }
    };

    const handleDeleteUser = async (clerkId) => {
        if (window.confirm("Are you sure you want to delete this user from the database?")) {
            try {
                const res = await fetch(`/api/users/${clerkId}`, { method: 'DELETE' });
                if (res.ok) {
                    setUsers(users.filter(u => u.clerkId !== clerkId));
                }
            } catch (err) {
                console.error("Failed to delete user", err);
            }
        }
    };

    return (
        <div className="admin-theme">
            <Navbar />
            <div className="page">
                <div className="container">
                    <div className="admin-header">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <span className="admin-badge">ADMIN</span>
                                <h1>Command Center</h1>
                            </div>
                            <button className="btn btn-outline btn-sm" onClick={handleLogout} style={{ color: '#ef4444', borderColor: '#ef4444' }}>
                                🔓 Terminate Session
                            </button>
                        </div>
                        <p className="text-secondary">Welcome back, {user?.name}. You have full access to platform operations.</p>
                    </div>

                    <div className="admin-tabs">
                        <button className={`admin-tab ${activeTab === 'analytics' ? 'active' : ''}`} onClick={() => setActiveTab('analytics')}>Analytics</button>
                        <button className={`admin-tab ${activeTab === 'projects' ? 'active' : ''}`} onClick={() => setActiveTab('projects')}>Project Moderation</button>
                        <button className={`admin-tab ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>User Management</button>
                    </div>

                    {activeTab === 'analytics' && (
                        <div className="admin-analytics-grid">
                            <div className="admin-stat-card">
                                <div className="stat-label">Total Revenue (Fees)</div>
                                <div className="stat-value text-gradient">₹{totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                            </div>
                            <div className="admin-stat-card">
                                <div className="stat-label">Active Projects</div>
                                <div className="stat-value">{activeProjectsCount}</div>
                                <div className="stat-subtext">out of {projects.length} total</div>
                            </div>
                            <div className="admin-stat-card">
                                <div className="stat-label">Registered Users</div>
                                <div className="stat-value">{users.length}</div>
                                <div className="stat-subtext">{buyersCount} Buyers / {sellersCount} Sellers</div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'projects' && (
                        <div className="admin-table-container">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Title</th>
                                        <th>Category</th>
                                        <th>Budget</th>
                                        <th>Status</th>
                                        <th>Created By</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {projects.map(p => (
                                        <tr key={p.id}>
                                            <td style={{ fontWeight: 600 }}>{p.title}</td>
                                            <td>{p.category}</td>
                                            <td>₹{p.budget?.toLocaleString() || 0}</td>
                                            <td>
                                                <span className={`status-badge status-${p.status}`}>{p.status}</span>
                                            </td>
                                            <td>{p.userName}</td>
                                            <td>
                                                <button className="btn btn-sm" style={{ background: '#ef4444', color: 'white' }} onClick={() => handleDeleteProject(p.id)}>
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {projects.length === 0 && (
                                        <tr>
                                            <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>No projects found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === 'users' && (
                        <div className="admin-table-container">
                            {loadingUsers ? (
                                <p style={{ padding: '2rem', textAlign: 'center' }}>Loading users...</p>
                            ) : (
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Email</th>
                                            <th>Role</th>
                                            <th>Joined Date</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map(u => (
                                            <tr key={u.clerkId}>
                                                <td style={{ fontWeight: 600 }}>{u.name}</td>
                                                <td>{u.email}</td>
                                                <td>
                                                    <span className={`role-badge role-${u.role}`}>{u.role.toUpperCase()}</span>
                                                </td>
                                                <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                                                <td>
                                                    {u.role !== 'admin' && (
                                                        <button className="btn btn-sm" style={{ background: '#ef4444', color: 'white' }} onClick={() => handleDeleteUser(u.clerkId)}>
                                                            Remove DB Entry
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
