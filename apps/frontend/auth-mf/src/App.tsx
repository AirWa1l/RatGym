import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import { useAuth } from './hooks/useAuth';

const App: React.FC = () => {
  const { user } = useAuth();

  // If running standalone, use router
  // If integrated with shell, these props will be passed
  const isStandalone = !window.location.pathname.includes('/shell');

  if (isStandalone) {
    return (
      <Router>
        <Routes>
          <Route 
            path="/login" 
            element={
              user ? (
                <Navigate to="/" replace />
              ) : (
                <LoginPage 
                  onLoginSuccess={() => window.location.href = '/'}
                />
              )
            } 
          />
          <Route 
            path="/" 
            element={
              user ? (
                <div style={{ padding: '40px', textAlign: 'center' }}>
                  <h1>Bienvenido, {user.username}!</h1>
                  <p>Has iniciado sesión correctamente.</p>
                </div>
              ) : (
                <LoginPage />
              )
            } 
          />
        </Routes>
      </Router>
    );
  }

  // For module federation integration
  return <LoginPage />;
};

export default App;
