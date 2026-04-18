import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import SetupProfile from './pages/SetupProfile';
import UserDashboard from './pages/UserDashboard';
import SellerDashboard from './pages/SellerDashboard';
import ProjectDetailPage from './pages/ProjectDetailPage';
import AdminDashboard from './pages/AdminDashboard';
import AdminLogin from './pages/AdminLogin';
import MaintenancePage from './pages/MaintenancePage';
import { useState, useEffect } from 'react';

function AdminGuard() {
    const [isAuthenticated, setIsAuthenticated] = useState(!!sessionStorage.getItem('admin_auth'));

    if (!isAuthenticated) {
        return <AdminLogin onLoginSuccess={() => setIsAuthenticated(true)} />;
    }

    return <AdminDashboard onLogout={() => setIsAuthenticated(false)} />;
}

function MaintenanceWrapper({ children }) {
    const [isMaintenance, setIsMaintenance] = useState(false);
    const [loading, setLoading] = useState(true);
    const [hasChecked, setHasChecked] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const checkMaintenance = async () => {
            try {
                const res = await fetch('/api/settings/maintenanceMode');
                if (res.ok) {
                    const data = await res.json();
                    setIsMaintenance(data.value);
                }
            } catch (err) {
                console.error("Maintenance check failed", err);
            } finally {
                setLoading(false);
                setHasChecked(true);
            }
        };

        // Skip maintenance check for admin routes
        if (location.pathname.startsWith('/admin')) {
            setLoading(false);
            setHasChecked(true);
            return;
        }

        // Only block initial load
        if (!hasChecked) {
            checkMaintenance();
        } else {
            // Background check for other navigations
            checkMaintenance();
        }
    }, [location.pathname, hasChecked]);

    // Only return null on the very first load to prevent flickering
    if (loading && !hasChecked) return null;

    if (isMaintenance && !location.pathname.startsWith('/admin')) {
        return <MaintenancePage />;
    }

    return children;
}

function ProtectedRoute({ children, role }) {
    const { user, isLoaded, isSignedIn } = useAuth();
    const location = useLocation();

    if (!isLoaded) return <div className="loading-screen">Loading...</div>;
    
    if (!isSignedIn) return <Navigate to="/login" state={{ from: location }} />;
    
    // Redirect to setup if no role is defined (except when already on setup page)
    if (isSignedIn && !user?.role && location.pathname !== '/setup-profile') {
        return <Navigate to="/setup-profile" />;
    }

    if (role && user?.role !== role) {
        const fallbackRoute = user?.role === 'admin' ? '/admin' : (user?.role === 'user' ? '/dashboard' : '/seller-dashboard');
        return <Navigate to={fallbackRoute} />;
    }
    
    return children;
}

function GuestRoute({ children }) {
    const { user, isLoaded, isSignedIn } = useAuth();
    
    if (!isLoaded) return <div className="loading-screen">Loading...</div>;
    
    if (isSignedIn) {
        if (!user?.role) return <Navigate to="/setup-profile" />;
        const fallbackRoute = user.role === 'admin' ? '/admin' : (user.role === 'user' ? '/dashboard' : '/seller-dashboard');
        return <Navigate to={fallbackRoute} />;
    }
    return children;
}

export default function App() {
    return (
        <BrowserRouter>
            <MaintenanceWrapper>
                <Routes>
                <Route path="/" element={<LandingPage />} />

                <Route path="/login" element={<Navigate to="/login/buyer" />} />
                <Route path="/login/buyer/*" element={
                    <GuestRoute><LoginPage role="user" /></GuestRoute>
                } />
                <Route path="/login/seller/*" element={
                    <GuestRoute><LoginPage role="seller" /></GuestRoute>
                } />

                <Route path="/register" element={<Navigate to="/register/buyer" />} />
                <Route path="/register/buyer/*" element={
                    <GuestRoute><RegisterPage role="user" /></GuestRoute>
                } />
                <Route path="/register/seller/*" element={
                    <GuestRoute><RegisterPage role="seller" /></GuestRoute>
                } />

                <Route path="/setup-profile" element={
                    <ProtectedRoute><SetupProfile /></ProtectedRoute>
                } />

                <Route path="/dashboard" element={
                    <ProtectedRoute role="user"><UserDashboard /></ProtectedRoute>
                } />

                <Route path="/seller-dashboard" element={
                    <ProtectedRoute role="seller"><SellerDashboard /></ProtectedRoute>
                } />

                <Route path="/project/:id" element={
                    <ProtectedRoute><ProjectDetailPage /></ProtectedRoute>
                } />

                <Route path="/admin" element={
                    <AdminGuard />
                } />

                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
            </MaintenanceWrapper>
        </BrowserRouter>
    );
}
