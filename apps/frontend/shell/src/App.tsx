import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { HomePage } from './pages/HomePage';

// Lazy load microfrontends
const LoginPage = lazy(() => import('authMf/LoginPage'));
const RegisterPage = lazy(() => import('authMf/RegisterPage'));
const useAuth = lazy(() => import('authMf/useAuth'));

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
    // Initialize auth
    const initAuth = async () => {
      try {
        // Import useAuth hook from authMf
        const { useAuth: useAuthHook } = await import('authMf/useAuth');
        // In a real implementation, we'd use the hook here
        // For now, check localStorage
        const token = localStorage.getItem('accessToken');
        if (token) {
          // TODO: Validate token and get user
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
    localStorage.removeItem('accessToken');
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
                    onNavigateToRegister={() => window.location.href = '/register'}
                    onLoginSuccess={handleLoginSuccess}
                  />
                )
              } 
            />
            
            <Route 
              path="/register" 
              element={
                user ? (
                  <Navigate to="/" replace />
                ) : (
                  <RegisterPage 
                    onNavigateToLogin={() => window.location.href = '/login'}
                    onRegisterSuccess={handleLoginSuccess}
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
