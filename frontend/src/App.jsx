import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Landing from './pages/Landing';
import BlogDetail from './pages/BlogDetail';
import Reviews from './pages/Reviews';
import NewsFeed from './pages/NewsFeed';
import Dashboard from './pages/Dashboard';
import Challenges from './pages/Challenges';
import ChallengeDetail from './pages/ChallengeDetail';
import Leaderboard from './pages/Leaderboard';
import AdminPanel from './pages/AdminPanel';
import Tutorials from './pages/Tutorials';
import Navbar from './components/Navbar';
import { HiddenElementFlag, Base64Flag, initializeHiddenFlags } from './components/HiddenFlags';
import { WebSocketFlag } from './components/WebSocketFlag';
import './App.css';

// Initialize hidden flags
if (typeof window !== 'undefined') {
  initializeHiddenFlags();
}

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="loading">Loading...</div>;
  }
  
  return user ? children : <Navigate to="/login" />;
}

function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="loading">Loading...</div>;
  }
  
  return user?.role === 'admin' ? children : <Navigate to="/dashboard" />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/blog/:slug" element={<BlogDetail />} />
      <Route path="/reviews" element={<Reviews />} />
      <Route path="/news" element={<NewsFeed />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/tutorials" element={<Tutorials />} />
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/challenges"
        element={
          <PrivateRoute>
            <Challenges />
          </PrivateRoute>
        }
      />
      <Route
        path="/challenges/:id"
        element={
          <PrivateRoute>
            <ChallengeDetail />
          </PrivateRoute>
        }
      />
      <Route
        path="/leaderboard"
        element={
          <PrivateRoute>
            <Leaderboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminPanel />
          </AdminRoute>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID || 'dummy-client-id'}>
      <AuthProvider>
        <Router
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <div className="app">
            <Navbar />
            <main className="main-content">
              <HiddenElementFlag />
              <Base64Flag />
              <WebSocketFlag />
              <AppRoutes />
            </main>
          </div>
        </Router>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;

