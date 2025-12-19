import React, { useState } from 'react';
import { RoutineWidget } from '../components/RoutineWidget';
import NutritionWidget from '../components/NutritionWidget';


type Section = 'dashboard' | 'rutinas' | 'clases' | 'nutricion' | 'progreso' | 'notificaciones' | 'configuracion';

export const HomePage: React.FC = () => {
  const [username, setUsername] = useState<string>('');
  const [currentUser, setCurrentUser] = useState<string | null>(
    localStorage.getItem('ratgym_username')
  );
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState<Section>('dashboard');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      localStorage.setItem('ratgym_username', username.trim());
      setCurrentUser(username.trim());
      setUsername('');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('ratgym_username');
    setCurrentUser(null);
  };

  // Pantalla de login
  if (!currentUser) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#000',
      }}>
        <div style={{
          maxWidth: '450px',
          width: '100%',
          padding: '50px 40px',
          backgroundColor: '#fff',
          borderRadius: '8px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
        }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <div style={{
              width: '80px',
              height: '80px',
              backgroundColor: '#000',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '40px',
              margin: '0 auto 20px',
            }}>
              🐀
            </div>
            <h1 style={{
              fontSize: '32px',
              fontWeight: '700',
              color: '#000',
              marginBottom: '10px',
              letterSpacing: '-0.5px',
            }}>
              RATGYM
            </h1>
            <p style={{
              fontSize: '14px',
              color: '#666',
            }}>
              Ingresa tu nombre para continuar
            </p>
          </div>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Nombre de usuario"
              required
              autoFocus
              style={{
                width: '100%',
                padding: '16px',
                fontSize: '15px',
                border: '2px solid #e0e0e0',
                borderRadius: '4px',
                marginBottom: '20px',
                outline: 'none',
                transition: 'border-color 0.2s',
                fontWeight: '500',
              }}
              onFocus={(e) => e.target.style.borderColor = '#000'}
              onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
            />
            <button
              type="submit"
              style={{
                width: '100%',
                padding: '16px',
                fontSize: '16px',
                fontWeight: '700',
                color: '#fff',
                backgroundColor: '#000',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
                textTransform: 'uppercase',
                letterSpacing: '1px',
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#333'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#000'}
            >
              Ingresar
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Dashboard principal
  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      {/* Sidebar */}
      <div style={{
        width: sidebarOpen ? '280px' : '80px',
        backgroundColor: '#000',
        color: '#fff',
        transition: 'width 0.3s ease',
        position: 'fixed',
        height: '100vh',
        overflowY: 'auto',
        zIndex: 1000,
      }}>
        {/* Header del Sidebar */}
        <div style={{
          padding: '24px 20px',
          borderBottom: '1px solid #333',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          {sidebarOpen ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  backgroundColor: '#fff',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                }}>
                  🐀
                </div>
                <span style={{ fontSize: '20px', fontWeight: '700', letterSpacing: '1px' }}>RATGYM</span>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: '20px',
                }}
              >
                ←
              </button>
            </>
          ) : (
            <button
              onClick={() => setSidebarOpen(true)}
              style={{
                background: 'none',
                border: 'none',
                color: '#fff',
                cursor: 'pointer',
                fontSize: '24px',
                margin: '0 auto',
              }}
            >
              →
            </button>
          )}
        </div>

        {/* Usuario */}
        <div style={{
          padding: '20px',
          borderBottom: '1px solid #333',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}>
            <div style={{
              width: '50px',
              height: '50px',
              backgroundColor: '#333',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
              flexShrink: 0,
            }}>
              👤
            </div>
            {sidebarOpen && (
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontWeight: '600',
                  fontSize: '16px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}>
                  {currentUser}
                </div>
                <div style={{
                  fontSize: '12px',
                  color: '#999',
                  marginTop: '2px',
                }}>
                  Usuario activo
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Menú */}
        <nav style={{ padding: '20px 0' }}>
          {menuItems.map((item, index) => (
            <div
              key={index}
              onClick={() => setActiveSection(item.section)}
              style={{
                padding: sidebarOpen ? '14px 20px' : '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
                backgroundColor: activeSection === item.section ? '#1a1a1a' : 'transparent',
                borderLeft: activeSection === item.section ? '4px solid #fff' : '4px solid transparent',
              }}
              onMouseEnter={(e) => {
                if (activeSection !== item.section) e.currentTarget.style.backgroundColor = '#1a1a1a';
              }}
              onMouseLeave={(e) => {
                if (activeSection !== item.section) e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <span style={{ fontSize: '20px', flexShrink: 0 }}>{item.icon}</span>
              {sidebarOpen && (
                <span style={{ fontSize: '15px', fontWeight: '500' }}>{item.label}</span>
              )}
            </div>
          ))}
        </nav>

        {/* Botón de cerrar sesión */}
        {sidebarOpen && (
          <div style={{ padding: '20px', position: 'absolute', bottom: 0, width: '100%' }}>
            <button
              onClick={handleLogout}
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '14px',
                fontWeight: '600',
                color: '#fff',
                backgroundColor: '#333',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#444'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#333'}
            >
              Cambiar Usuario
            </button>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div style={{
        flex: 1,
        marginLeft: sidebarOpen ? '280px' : '80px',
        transition: 'margin-left 0.3s ease',
        padding: '40px',
      }}>
        {/* Renderizar según la sección activa */}
        {activeSection === 'dashboard' && renderDashboard()}
        {activeSection === 'rutinas' && renderRutinas()}
        {activeSection === 'clases' && renderComingSoon('Clases', '🎯', 'Próximas sesiones grupales')}
        {activeSection === 'nutricion' && renderNutricion()}
        {activeSection === 'progreso' && renderComingSoon('Progreso', '📊', 'Tu rendimiento y estadísticas')}
        {activeSection === 'notificaciones' && renderComingSoon('Notificaciones', '🔔', 'Alertas y recordatorios')}
        {activeSection === 'configuracion' && renderComingSoon('Configuración', '⚙️', 'Ajustes de tu cuenta')}
      </div>
    </div>
  );

  // Renderizar Dashboard
  function renderDashboard() {
    return (
      <>
        {/* Header */}
        <div style={{ marginBottom: '40px' }}>
          <h1 style={{
            fontSize: '32px',
            fontWeight: '700',
            color: '#000',
            marginBottom: '8px',
            letterSpacing: '-0.5px',
          }}>
            Dashboard
          </h1>
          <p style={{ fontSize: '16px', color: '#666' }}>
            Bienvenido de nuevo, {currentUser}
          </p>
        </div>

        {/* Stats Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '20px',
          marginBottom: '40px',
        }}>
          {statsCards.map((card, index) => (
            <div
              key={index}
              style={{
                backgroundColor: '#fff',
                padding: '24px',
                borderRadius: '8px',
                border: '1px solid #e0e0e0',
                transition: 'box-shadow 0.2s',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'}
              onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
            >
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>{card.icon}</div>
              <div style={{ fontSize: '28px', fontWeight: '700', color: '#000', marginBottom: '4px' }}>
                {card.value}
              </div>
              <div style={{ fontSize: '14px', color: '#666', fontWeight: '500' }}>
                {card.label}
              </div>
            </div>
          ))}
        </div>

        {/* Quick Access Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '20px',
        }}>
          {/* Widget completo de Rutinas */}
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '8px',
            border: '1px solid #e0e0e0',
            overflow: 'hidden',
            cursor: 'pointer',
          }}
            onClick={() => setActiveSection('rutinas')}
          >
            <RoutineWidget userId={currentUser || 'guest'} compact={true} />
          </div>

          <div
            onClick={() => setActiveSection('clases')}
            style={{
              backgroundColor: '#fff',
              borderRadius: '8px',
              padding: '24px',
              border: '1px solid #e0e0e0',
              cursor: 'pointer',
              transition: 'box-shadow 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'}
            onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
          >
            <div style={{ fontSize: '40px', marginBottom: '16px' }}>🎯</div>
            <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px', color: '#000' }}>Clases</h3>
            <p style={{ color: '#666', margin: 0 }}>Reserva sesiones grupales</p>
          </div>

          <div
            onClick={() => setActiveSection('nutricion')}
            style={{
              backgroundColor: '#fff',
              borderRadius: '8px',
              padding: '24px',
              border: '1px solid #e0e0e0',
              cursor: 'pointer',
              transition: 'box-shadow 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'}
            onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
          >
            <div style={{ fontSize: '40px', marginBottom: '16px' }}>🥗</div>
            <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px', color: '#000' }}>Nutrición</h3>
            <p style={{ color: '#666', margin: 0 }}>Tu plan alimenticio</p>
          </div>
        </div>
      </>
    );
  }

  // Renderizar página completa de Rutinas
  function renderRutinas() {
    return (
      <>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{
            fontSize: '32px',
            fontWeight: '700',
            color: '#000',
            marginBottom: '8px',
          }}>
            Mis Rutinas
          </h1>
          <p style={{ fontSize: '16px', color: '#666' }}>
            Gestiona tus rutinas de entrenamiento
          </p>
        </div>

        <div style={{
          backgroundColor: '#fff',
          borderRadius: '12px',
          border: '1px solid #e0e0e0',
          overflow: 'hidden',
          minHeight: '600px',
        }}>
          <RoutineWidget userId={currentUser || 'guest'} />
        </div>
      </>
    );
  }

  function renderNutricion() {
    return (
      <>
        <div style={{ marginBottom: '32px' }}>
          <h1
            style={{
              fontSize: '32px',
              fontWeight: '700',
              color: '#000',
              marginBottom: '8px',
            }}
          >
            Nutrición
          </h1>
          <p style={{ fontSize: '16px', color: '#666' }}>
            Tu plan alimenticio personalizado
          </p>
        </div>

        <div
          style={{
            backgroundColor: '#fff',
            borderRadius: '12px',
            border: '1px solid #e0e0e0',
            padding: '24px',
          }}
        >
          <NutritionWidget userId={currentUser || 'guest'} />
        </div>
      </>
    );
  }


  // Renderizar páginas "Próximamente"
  function renderComingSoon(title: string, icon: string, description: string) {
    return (
      <>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{
            fontSize: '32px',
            fontWeight: '700',
            color: '#000',
            marginBottom: '8px',
          }}>
            {title}
          </h1>
          <p style={{ fontSize: '16px', color: '#666' }}>
            {description}
          </p>
        </div>

        <div style={{
          backgroundColor: '#fff',
          borderRadius: '12px',
          border: '1px solid #e0e0e0',
          padding: '80px 40px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '80px', marginBottom: '24px', opacity: 0.3 }}>{icon}</div>
          <h2 style={{ fontSize: '24px', color: '#333', marginBottom: '12px' }}>
            Próximamente
          </h2>
          <p style={{ color: '#666', maxWidth: '400px', margin: '0 auto' }}>
            Esta sección está en desarrollo. Pronto podrás acceder a todas las funcionalidades de {title.toLowerCase()}.
          </p>
        </div>
      </>
    );
  }
};

// Datos del menú
const menuItems: { icon: string; label: string; section: Section }[] = [
  { icon: '🏠', label: 'Dashboard', section: 'dashboard' },
  { icon: '💪', label: 'Mis Rutinas', section: 'rutinas' },
  { icon: '🎯', label: 'Clases', section: 'clases' },
  { icon: '🥗', label: 'Nutrición', section: 'nutricion' },
  { icon: '📊', label: 'Progreso', section: 'progreso' },
  { icon: '🔔', label: 'Notificaciones', section: 'notificaciones' },
  { icon: '⚙️', label: 'Configuración', section: 'configuracion' },
];

// Tarjetas de estadísticas
const statsCards = [
  { icon: '🔥', value: '0', label: 'Entrenamientos' },
  { icon: '⏱️', value: '0h', label: 'Tiempo Total' },
  { icon: '🎯', value: '0', label: 'Objetivos' },
  { icon: '📈', value: '0%', label: 'Progreso' },
];
