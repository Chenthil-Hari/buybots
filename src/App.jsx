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
            <Routes>
                <Route path="/" element={<LandingPage />} />

                <Route path="/login" element={<Navigate to="/login/buyer" />} />
                <Route path="/login/buyer" element={
                    <GuestRoute><LoginPage role="user" /></GuestRoute>
                } />
                <Route path="/login/seller" element={
                    <GuestRoute><LoginPage role="seller" /></GuestRoute>
                } />

                <Route path="/register" element={<Navigate to="/register/buyer" />} />
                <Route path="/register/buyer" element={
                    <GuestRoute><RegisterPage role="user" /></GuestRoute>
                } />
                <Route path="/register/seller" element={
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
                    <ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>
                } />

                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </BrowserRouter>
    );
}
