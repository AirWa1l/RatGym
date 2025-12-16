import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import { useAuth } from './hooks/useAuth';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<'login' | 'register'>('login');
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
                  onNavigateToRegister={() => window.location.href = '/register'}
                  onLoginSuccess={() => window.location.href = '/'}
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
                  onRegisterSuccess={() => window.location.href = '/'}
                />
              )
            } 
          />
          <Route 
            path="/" 
            element={
              currentPage === 'login' ? (
                <LoginPage 
                  onNavigateToRegister={() => setCurrentPage('register')}
                />
              ) : (
                <RegisterPage 
                  onNavigateToLogin={() => setCurrentPage('login')}
                />
              )
            } 
          />
        </Routes>
      </Router>
    );
  }

  // For module federation integration
  return currentPage === 'login' ? (
    <LoginPage 
      onNavigateToRegister={() => setCurrentPage('register')}
    />
  ) : (
    <RegisterPage 
      onNavigateToLogin={() => setCurrentPage('login')}
    />
  );
};

export default App;
