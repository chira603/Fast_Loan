import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

// Layout Components
import Header from './components/common/Header';
import Footer from './components/common/Footer';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import LoanApplication from './pages/LoanApplication';
import LoanDetails from './pages/LoanDetails';
import Contact from './pages/Contact';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import Recharge from './pages/Recharge';
import BillPayment from './pages/BillPayment';
import NotFound from './pages/NotFound';

// Protected Route Component
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  // Fallback to localStorage user to avoid race conditions right after login
  const storedUser = (() => {
    try {
      return JSON.parse(localStorage.getItem('user')) || null;
    } catch {
      return null;
    }
  })();
  const effectiveUser = user || storedUser;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && effectiveUser?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Public Route Component (redirect if already logged in)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  if (isAuthenticated) {
    // Redirect authenticated users based on role
    if (user?.role === 'admin') {
      return <Navigate to="/admin" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  // Global redirect guard: if authenticated and on public entry points, send to role dashboard
  useEffect(() => {
    if (!isAuthenticated) return;
    const publicEntrypoints = ['/', '/login', '/register'];
    if (publicEntrypoints.includes(location.pathname)) {
      if (user?.role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [isAuthenticated, user, location.pathname, navigate]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/contact" element={<Contact />} />
          
          {/* Auth Routes */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recharge"
            element={
              <ProtectedRoute>
                <Recharge />
              </ProtectedRoute>
            }
          />
          <Route
            path="/bills"
            element={
              <ProtectedRoute>
                <BillPayment />
              </ProtectedRoute>
            }
          />
          <Route
            path="/loan/apply"
            element={
              <ProtectedRoute>
                <LoanApplication />
              </ProtectedRoute>
            }
          />
          <Route
            path="/loan/:id"
            element={
              <ProtectedRoute>
                <LoanDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
