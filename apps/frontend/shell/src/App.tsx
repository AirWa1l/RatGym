import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { HomePage } from './pages/HomePage';

// Lazy load microfrontends
const LoginPage = lazy(() => import('authMf/LoginPage'));

// Loading component
const Loading = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    fontSize: '18px',
    color: '#667eea',
  }}>
    Cargando...
  </div>
);

// Protected Route wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode; user: any }> = ({ 
  children, 
  user 
}) => {
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const App: React.FC = () => {
  const [user, setUser] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    // Initialize auth from localStorage
    const initAuth = async () => {
      try {
        const savedUser = localStorage.getItem('ratgym_user');
        const savedToken = localStorage.getItem('ratgym_token');
        
        if (savedUser && savedToken) {
          setUser(JSON.parse(savedUser));
          setUser({ email: 'user@example.com' });
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('ratgym_user');
    localStorage.removeItem('ratgym_token');
    setUser(null);
  };

  const handleLoginSuccess = () => {
    // Reload to get user data
    window.location.href = '/';
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <Router>
      <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
        <Navbar user={user} onLogout={handleLogout} />
        
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            
            <Route 
              path="/login" 
              element={
                user ? (
                  <Navigate to="/" replace />
                ) : (
                  <LoginPage 
                    onLoginSuccess={handleLoginSuccess}
                  />
                )
              } 
            />

            {/* Protected routes - to be implemented */}
            <Route 
              path="/routines" 
              element={
                <ProtectedRoute user={user}>
                  <div style={{ padding: '40px', textAlign: 'center' }}>
                    <h1>Rutinas (Próximamente)</h1>
                  </div>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/classes" 
              element={
                <ProtectedRoute user={user}>
                  <div style={{ padding: '40px', textAlign: 'center' }}>
                    <h1>Clases (Próximamente)</h1>
                  </div>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/nutrition" 
              element={
                <ProtectedRoute user={user}>
                  <div style={{ padding: '40px', textAlign: 'center' }}>
                    <h1>Nutrición (Próximamente)</h1>
                  </div>
                </ProtectedRoute>
              } 
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </div>
    </Router>
  );
};

export default App;
