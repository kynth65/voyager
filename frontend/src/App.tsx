import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import UsersPage from './pages/UsersPage';
import CreateUserPage from './pages/CreateUserPage';
import EditUserPage from './pages/EditUserPage';
// Admin pages
import VesselsPage from './pages/admin/VesselsPage';
import VesselFormPage from './pages/admin/VesselFormPage';
import RoutesPage from './pages/admin/RoutesPage';
import RouteFormPage from './pages/admin/RouteFormPage';
import AdminBookingsPage from './pages/admin/AdminBookingsPage';
import AdminCreateBookingPage from './pages/admin/AdminCreateBookingPage';
import CustomersPage from './pages/admin/CustomersPage';
import CustomerDetailsPage from './pages/admin/CustomerDetailsPage';
import PaymentsPage from './pages/admin/PaymentsPage';
import RefundsPage from './pages/admin/RefundsPage';
import AnalyticsPage from './pages/admin/AnalyticsPage';
import AccountingPage from './pages/admin/AccountingPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
// Customer pages
import LandingPage from './pages/LandingPage';
import BrowseRoutesPage from './pages/customer/BrowseRoutesPage';
import BookingPage from './pages/customer/BookingPage';
import MyBookingsPage from './pages/customer/MyBookingsPage';
import MyRefundsPage from './pages/customer/MyRefundsPage';
import BookingDetailsPage from './pages/customer/BookingDetailsPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Protected Route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

// Public Route wrapper (redirect to dashboard if already logged in)
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

// Role-based Route wrapper
function RoleBasedRoute({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles: string[];
}) {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes - Landing page redirects to dashboard if authenticated */}
      <Route
        path="/"
        element={
          <PublicRoute>
            <LandingPage />
          </PublicRoute>
        }
      />

      {/* Auth routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        }
      />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* Protected routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />

      {/* Customer routes */}
      <Route
        path="/browse-routes"
        element={
          <ProtectedRoute>
            <BrowseRoutesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/booking/:routeId"
        element={
          <ProtectedRoute>
            <BookingPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-bookings"
        element={
          <ProtectedRoute>
            <MyBookingsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-refunds"
        element={
          <ProtectedRoute>
            <MyRefundsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/bookings/:id"
        element={
          <ProtectedRoute>
            <BookingDetailsPage />
          </ProtectedRoute>
        }
      />

      {/* User Management routes (superadmin only) */}
      <Route
        path="/users"
        element={
          <RoleBasedRoute allowedRoles={['superadmin']}>
            <UsersPage />
          </RoleBasedRoute>
        }
      />
      <Route
        path="/users/create"
        element={
          <RoleBasedRoute allowedRoles={['superadmin']}>
            <CreateUserPage />
          </RoleBasedRoute>
        }
      />
      <Route
        path="/users/:id/edit"
        element={
          <RoleBasedRoute allowedRoles={['superadmin']}>
            <EditUserPage />
          </RoleBasedRoute>
        }
      />

      {/* Vessel Management routes (superadmin only) */}
      <Route
        path="/admin/vessels"
        element={
          <RoleBasedRoute allowedRoles={['superadmin']}>
            <VesselsPage />
          </RoleBasedRoute>
        }
      />
      <Route
        path="/admin/vessels/create"
        element={
          <RoleBasedRoute allowedRoles={['superadmin']}>
            <VesselFormPage />
          </RoleBasedRoute>
        }
      />
      <Route
        path="/admin/vessels/:id/edit"
        element={
          <RoleBasedRoute allowedRoles={['superadmin']}>
            <VesselFormPage />
          </RoleBasedRoute>
        }
      />

      {/* Route Management routes (superadmin only) */}
      <Route
        path="/admin/routes"
        element={
          <RoleBasedRoute allowedRoles={['superadmin']}>
            <RoutesPage />
          </RoleBasedRoute>
        }
      />
      <Route
        path="/admin/routes/create"
        element={
          <RoleBasedRoute allowedRoles={['superadmin']}>
            <RouteFormPage />
          </RoleBasedRoute>
        }
      />
      <Route
        path="/admin/routes/:id/edit"
        element={
          <RoleBasedRoute allowedRoles={['superadmin']}>
            <RouteFormPage />
          </RoleBasedRoute>
        }
      />

      {/* Admin Dashboard (superadmin and admin) */}
      <Route
        path="/admin/dashboard"
        element={
          <RoleBasedRoute allowedRoles={['superadmin', 'admin']}>
            <AdminDashboardPage />
          </RoleBasedRoute>
        }
      />

      {/* Admin Bookings (superadmin and admin) */}
      <Route
        path="/admin/bookings"
        element={
          <RoleBasedRoute allowedRoles={['superadmin', 'admin']}>
            <AdminBookingsPage />
          </RoleBasedRoute>
        }
      />
      <Route
        path="/admin/bookings/create"
        element={
          <RoleBasedRoute allowedRoles={['superadmin', 'admin']}>
            <AdminCreateBookingPage />
          </RoleBasedRoute>
        }
      />

      {/* Customer Management (superadmin and admin) */}
      <Route
        path="/admin/customers"
        element={
          <RoleBasedRoute allowedRoles={['superadmin', 'admin']}>
            <CustomersPage />
          </RoleBasedRoute>
        }
      />
      <Route
        path="/admin/customers/:id"
        element={
          <RoleBasedRoute allowedRoles={['superadmin', 'admin']}>
            <CustomerDetailsPage />
          </RoleBasedRoute>
        }
      />

      {/* Payments Management (superadmin and admin) */}
      <Route
        path="/admin/payments"
        element={
          <RoleBasedRoute allowedRoles={['superadmin', 'admin']}>
            <PaymentsPage />
          </RoleBasedRoute>
        }
      />

      {/* Refunds Management (superadmin and admin) */}
      <Route
        path="/admin/refunds"
        element={
          <RoleBasedRoute allowedRoles={['superadmin', 'admin']}>
            <RefundsPage />
          </RoleBasedRoute>
        }
      />

      {/* Analytics (superadmin and admin) */}
      <Route
        path="/admin/analytics"
        element={
          <RoleBasedRoute allowedRoles={['superadmin', 'admin']}>
            <AnalyticsPage />
          </RoleBasedRoute>
        }
      />

      {/* Accounting (superadmin and admin) */}
      <Route
        path="/admin/accounting"
        element={
          <RoleBasedRoute allowedRoles={['superadmin', 'admin']}>
            <AccountingPage />
          </RoleBasedRoute>
        }
      />

      {/* Catch all - redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
