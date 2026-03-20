import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Browse from './pages/Browse';
import PostRequest from './pages/PostRequest';
import ProjectBoard from './pages/ProjectBoard';
import ProjectDetail from './pages/ProjectDetail';
import Profile from './pages/Profile';
import Wall from './pages/Wall';
import Bookmarks from './pages/Bookmarks';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <div className="w-10 h-10 border-4 border-gold-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  return user ? children : <Navigate to="/login" replace />;
};

const AppRoutes = () => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <div className="w-10 h-10 border-4 border-gold-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  return (
    <div className="min-h-screen bg-cream-100">
      {user && <Navbar />}
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
