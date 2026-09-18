import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import ProtectedRoute from './routes/ProtectedRoute';
import AdminLayout from './layouts/AdminLayout';
import Loader from './components/shared/Loader';
import { NotificationProvider } from './hooks/useNotifications';

// Lazy load pages
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Events = lazy(() => import('./pages/Events'));
const Programs = lazy(() => import('./pages/Programs'));
const Enquiries = lazy(() => import('./pages/Enquiries'));
const SiteImages = lazy(() => import('./pages/SiteImages'));
const Gallery = lazy(() => import('./pages/Gallery'));
const Admins = lazy(() => import('./pages/Admins'));
const Profile = lazy(() => import('./pages/Profile'));
const Reviews = lazy(() => import('./pages/Reviews'));
const Reservations = lazy(() => import('./pages/Reservations'));

function App() {
  return (
    <BrowserRouter>
      <NotificationProvider>
        <Suspense fallback={<Loader fullScreen />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Admin Routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="programs" element={<Programs />} />
              <Route path="events" element={<Events />} />
              <Route path="gallery" element={<Gallery />} />
              <Route path="reviews" element={<Reviews />} />
              <Route path="reservations" element={<Reservations />} />
              <Route path="enquiries" element={<Enquiries />} />
              <Route path="site-images" element={<SiteImages />} />
              <Route path="admins" element={<Admins />} />
              <Route path="profile" element={<Profile />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Suspense>
      </NotificationProvider>
    </BrowserRouter>
  );
}

export default App;
