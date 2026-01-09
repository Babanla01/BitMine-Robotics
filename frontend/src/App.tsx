import { Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import type { ReactNode } from 'react';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';

// Public pages - eager loaded (show immediately)
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';

// Public pages - lazy loaded (load on demand)
const ShopPage = lazy(() => import('./pages/ShopPage'));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'));
const CartPage = lazy(() => import('./pages/CartPage'));
const PaymentCallbackPage = lazy(() => import('./pages/PaymentCallbackPage'));
const TutorPage = lazy(() => import('./pages/TutorPage'));
const BecomeATutorPage = lazy(() => import('./pages/BecomeATutorPage'));
const BookClassPage = lazy(() => import('./pages/BookClassPage'));
const PartnerPage = lazy(() => import('./pages/PartnerPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const UserOrdersPage = lazy(() => import('./pages/OrdersPage'));

// Dashboard pages - lazy loaded (load only when admin accesses)
const DashboardLayout = lazy(() => import('./components/dashboard/DashboardLayout'));
const DashboardHome = lazy(() => import('./pages/dashboard/DashboardHome'));
const UsersPage = lazy(() => import('./pages/dashboard/UsersPage'));
const CategoriesPage = lazy(() => import('./pages/dashboard/CategoriesPage'));
const ProductsPage = lazy(() => import('./pages/dashboard/ProductsPage'));
const DashboardOrdersPage = lazy(() => import('./pages/dashboard/OrdersPage'));
const ClassesPage = lazy(() => import('./pages/dashboard/ClassesPage'));
const TutorsPage = lazy(() => import('./pages/dashboard/TutorsPage'));
const PartnersPage = lazy(() => import('./pages/dashboard/PartnersPage'));
const AnalyticsPage = lazy(() => import('./pages/dashboard/AnalyticsPage'));

// Loading component
const LoadingSpinner = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '400px'
  }}>
    <div className="spinner-border" role="status">
      <span className="visually-hidden">Loading...</span>
    </div>
  </div>
);

// Protected Route Component
const ProtectedRoute = ({ children }: { children: ReactNode }): ReactNode => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Role-Protected Route Component (admin only)
const RoleProtectedRoute = ({ children, requiredRole = 'admin' }: { children: ReactNode; requiredRole?: 'admin' | 'user' }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== requiredRole) {
    // Non-admin trying to access admin route - silently redirect without error notification
    return <Navigate to="/" replace />;
  }
  
  return children;
};

// Public Route with Admin Redirect
const PublicRoute = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, isAdmin } = useAuth();

  // If user is authenticated and is admin, redirect to dashboard
  if (isAuthenticated && isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

function App() {
  return (
    <Routes>
      {/* Public Routes - Admin users are redirected to dashboard */}
      <Route path="/" element={<PublicRoute><Layout><HomePage /></Layout></PublicRoute>} />
      <Route path="/about" element={<PublicRoute><Layout><AboutPage /></Layout></PublicRoute>} />
      <Route path="/contact" element={<PublicRoute><Layout><ContactPage /></Layout></PublicRoute>} />
      <Route path="/shop" element={<PublicRoute><Layout><Suspense fallback={<LoadingSpinner />}><ShopPage /></Suspense></Layout></PublicRoute>} />
      <Route path="/product/:id" element={<PublicRoute><Layout><Suspense fallback={<LoadingSpinner />}><ProductDetailPage /></Suspense></Layout></PublicRoute>} />
      <Route path="/cart" element={<PublicRoute><Layout><Suspense fallback={<LoadingSpinner />}><CartPage /></Suspense></Layout></PublicRoute>} />
      <Route path="/payment/callback" element={<PublicRoute><Layout><Suspense fallback={<LoadingSpinner />}><PaymentCallbackPage /></Suspense></Layout></PublicRoute>} />
      <Route path="/login" element={<PublicRoute><Layout><LoginPage /></Layout></PublicRoute>} />
      <Route path="/signup" element={<PublicRoute><Layout><SignupPage /></Layout></PublicRoute>} />
      <Route path="/forgot-password" element={<PublicRoute><Layout><ForgotPasswordPage /></Layout></PublicRoute>} />
      <Route path="/tutoring" element={<PublicRoute><Layout><Suspense fallback={<LoadingSpinner />}><TutorPage /></Suspense></Layout></PublicRoute>} />
      <Route path="/tutor" element={<PublicRoute><Layout><Suspense fallback={<LoadingSpinner />}><TutorPage /></Suspense></Layout></PublicRoute>} />
      <Route path="/become-tutor" element={<PublicRoute><Layout><Suspense fallback={<LoadingSpinner />}><BecomeATutorPage /></Suspense></Layout></PublicRoute>} />
      <Route path="/book-class" element={<PublicRoute><Layout><Suspense fallback={<LoadingSpinner />}><BookClassPage /></Suspense></Layout></PublicRoute>} />
      <Route path="/partner" element={<PublicRoute><Layout><Suspense fallback={<LoadingSpinner />}><PartnerPage /></Suspense></Layout></PublicRoute>} />
      
      {/* Protected Profile Route */}
      <Route 
        path="/profile" 
        element={
          <ProtectedRoute>
            <Layout><Suspense fallback={<LoadingSpinner />}><ProfilePage /></Suspense></Layout>
          </ProtectedRoute>
        } 
      />
      
      {/* Protected User Orders Route */}
      <Route 
        path="/orders" 
        element={
          <ProtectedRoute>
            <Layout><Suspense fallback={<LoadingSpinner />}><UserOrdersPage /></Suspense></Layout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/dashboard" 
        element={
          <RoleProtectedRoute requiredRole="admin">
            <Suspense fallback={<LoadingSpinner />}>
              <DashboardLayout><DashboardHome /></DashboardLayout>
            </Suspense>
          </RoleProtectedRoute>
        } 
      />
      <Route 
        path="/dashboard/users" 
        element={
          <RoleProtectedRoute requiredRole="admin">
            <Suspense fallback={<LoadingSpinner />}>
              <DashboardLayout><UsersPage /></DashboardLayout>
            </Suspense>
          </RoleProtectedRoute>
        } 
      />
      <Route 
        path="/dashboard/categories" 
        element={
          <RoleProtectedRoute requiredRole="admin">
            <Suspense fallback={<LoadingSpinner />}>
              <DashboardLayout><CategoriesPage /></DashboardLayout>
            </Suspense>
          </RoleProtectedRoute>
        } 
      />
      <Route 
        path="/dashboard/products" 
        element={
          <RoleProtectedRoute requiredRole="admin">
            <Suspense fallback={<LoadingSpinner />}>
              <DashboardLayout><ProductsPage /></DashboardLayout>
            </Suspense>
          </RoleProtectedRoute>
        } 
      />
      <Route 
        path="/dashboard/orders" 
        element={
          <RoleProtectedRoute requiredRole="admin">
            <Suspense fallback={<LoadingSpinner />}>
              <DashboardLayout><DashboardOrdersPage /></DashboardLayout>
            </Suspense>
          </RoleProtectedRoute>
        } 
      />
      <Route 
        path="/dashboard/classes" 
        element={
          <RoleProtectedRoute requiredRole="admin">
            <Suspense fallback={<LoadingSpinner />}>
              <DashboardLayout><ClassesPage /></DashboardLayout>
            </Suspense>
          </RoleProtectedRoute>
        } 
      />
      <Route 
        path="/dashboard/tutors" 
        element={
          <RoleProtectedRoute requiredRole="admin">
            <Suspense fallback={<LoadingSpinner />}>
              <DashboardLayout><TutorsPage /></DashboardLayout>
            </Suspense>
          </RoleProtectedRoute>
        } 
      />
      <Route 
        path="/dashboard/partners" 
        element={
          <RoleProtectedRoute requiredRole="admin">
            <Suspense fallback={<LoadingSpinner />}>
              <DashboardLayout><PartnersPage /></DashboardLayout>
            </Suspense>
          </RoleProtectedRoute>
        } 
      />
      <Route 
        path="/dashboard/analytics" 
        element={
          <RoleProtectedRoute requiredRole="admin">
            <Suspense fallback={<LoadingSpinner />}>
              <DashboardLayout><AnalyticsPage /></DashboardLayout>
            </Suspense>
          </RoleProtectedRoute>
        } 
      />
      
      {/* 404 Route */}
      <Route path="*" element={<div>404 Not Found</div>} />
    </Routes>
  );
}

export default App;
