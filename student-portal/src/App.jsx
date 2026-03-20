import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';

// React 19 best practice: lazy load all pages for code splitting
const Login = lazy(() => import('./pages/Login'));
const Browse = lazy(() => import('./pages/Browse'));
const PostRequest = lazy(() => import('./pages/PostRequest'));
const ProjectBoard = lazy(() => import('./pages/ProjectBoard'));
const ProjectDetail = lazy(() => import('./pages/ProjectDetail'));
const Profile = lazy(() => import('./pages/Profile'));
const Wall = lazy(() => import('./pages/Wall'));
const Bookmarks = lazy(() => import('./pages/Bookmarks'));

// Spinner shown during Suspense boundaries
const PageSpinner = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="w-10 h-10 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin" />
  </div>
);

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <PageSpinner />;
  return user ? children : <Navigate to="/login" replace />;
};

const AppRoutes = () => {
  const { user, loading } = useAuth();
  if (loading) return <PageSpinner />;

  return (
    <div className="min-h-screen bg-cream-100">
      {user && <Navbar />}
      {/* Suspense wraps all lazy routes — no per-route loading needed */}
      <Suspense fallback={<PageSpinner />}>
        <Routes>
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/browse" replace />} />
          <Route path="/wall" element={<Wall />} />
          <Route path="/browse" element={<ProtectedRoute><Browse /></ProtectedRoute>} />
          <Route path="/post" element={<ProtectedRoute><PostRequest /></ProtectedRoute>} />
          <Route path="/board" element={<ProtectedRoute><ProjectBoard /></ProtectedRoute>} />
          <Route path="/project/:id" element={<ProtectedRoute><ProjectDetail /></ProtectedRoute>} />
          <Route path="/profile/:id" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/bookmarks" element={<ProtectedRoute><Bookmarks /></ProtectedRoute>} />
          <Route path="/" element={<Navigate to={user ? '/browse' : '/login'} replace />} />
          <Route path="*" element={<Navigate to={user ? '/browse' : '/login'} replace />} />
        </Routes>
      </Suspense>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter basename={import.meta.env.PROD ? '/student' : '/'}>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
