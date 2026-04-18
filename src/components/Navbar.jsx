import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const isActive = (path) => location.pathname === path ? 'nav-active' : '';

    return (
        <nav className="navbar">
            <div className="container">
                <Link to="/" className="navbar-brand">
                    <div className="brand-icon">⚡</div>
                    Buy-Bots
                </Link>

                <ul className="navbar-links">
                    <li>
                        <Link to="/" className={isActive('/')}>Home</Link>
                    </li>

                    {!user && (
                        <>
                            <li>
                                <Link to="/login" className={`btn btn-secondary btn-sm ${isActive('/login')}`}>
                                    Sign In
                                </Link>
                            </li>
                            <li>
                                <Link to="/register" className={`btn btn-primary btn-sm ${isActive('/register')}`}>
                                    Get Started
                                </Link>
                            </li>
                        </>
                    )}

                    {user && (
                        <>
                            <li>
                                <Link
                                    to={user.role === 'user' ? '/dashboard' : '/seller-dashboard'}
                                    className={isActive(user.role === 'user' ? '/dashboard' : '/seller-dashboard')}
                                >
                                    Dashboard
                                </Link>
                            </li>
                            <li>
                                <div className="navbar-user">
                                    <div className="navbar-avatar">
                                        {user.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <div className="navbar-username">{user.name}</div>
                                        <div className="navbar-role">{user.role}</div>
                                    </div>
                                </div>
                            </li>
                            <li>
                                <button onClick={handleLogout} className="btn btn-secondary btn-sm">
                                    Logout
                                </button>
                            </li>
                        </>
                    )}
                </ul>
            </div>
        </nav>
    );
}
