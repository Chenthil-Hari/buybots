import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import UserDashboard from './pages/UserDashboard';
import SellerDashboard from './pages/SellerDashboard';
import ProjectDetailPage from './pages/ProjectDetailPage';

function ProtectedRoute({ children, role }) {
    const { user } = useAuth();
    if (!user) return <Navigate to="/login" />;
    if (role && user.role !== role) {
        return <Navigate to={user.role === 'user' ? '/dashboard' : '/seller-dashboard'} />;
    }
    return children;
}

function GuestRoute({ children }) {
    const { user } = useAuth();
    if (user) {
        return <Navigate to={user.role === 'user' ? '/dashboard' : '/seller-dashboard'} />;
    }
    return children;
}

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<LandingPage />} />

                <Route path="/login" element={
                    <GuestRoute><LoginPage /></GuestRoute>
                } />

                <Route path="/register" element={
                    <GuestRoute><RegisterPage /></GuestRoute>
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

                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </BrowserRouter>
    );
}
