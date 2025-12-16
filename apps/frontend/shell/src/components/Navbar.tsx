import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

interface NavbarProps {
  user: any;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ user, onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <nav style={styles.navbar}>
      <div style={styles.container}>
        <Link to="/" style={styles.logo}>
          🐀 RatGym
        </Link>
        
        <div style={styles.navLinks}>
          {user ? (
            <>
              <Link to="/routines" style={styles.link}>
                Rutinas
              </Link>
              <Link to="/classes" style={styles.link}>
                Clases
              </Link>
              <Link to="/nutrition" style={styles.link}>
                Nutrición
              </Link>
              <div style={styles.userSection}>
                <span style={styles.userName}>
                  👤 {user.displayName || user.email}
                </span>
                <button onClick={handleLogout} style={styles.logoutButton}>
                  Cerrar sesión
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" style={styles.link}>
                Iniciar sesión
              </Link>
              <Link to="/register" style={styles.linkButton}>
                Registrarse
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

const styles = {
  navbar: {
    backgroundColor: '#fff',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    position: 'sticky' as const,
    top: 0,
    zIndex: 1000,
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '16px 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#667eea',
    textDecoration: 'none',
  },
  navLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
  },
  link: {
    color: '#333',
    textDecoration: 'none',
    fontSize: '16px',
    fontWeight: '500',
    transition: 'color 0.2s',
  },
  linkButton: {
    color: '#fff',
    backgroundColor: '#667eea',
    textDecoration: 'none',
    fontSize: '16px',
    fontWeight: '600',
    padding: '8px 20px',
    borderRadius: '6px',
    transition: 'background-color 0.2s',
  },
  userSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  userName: {
    color: '#666',
    fontSize: '14px',
  },
  logoutButton: {
    color: '#666',
    backgroundColor: 'transparent',
    border: '1px solid #ddd',
    padding: '6px 16px',
    borderRadius: '6px',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
};
