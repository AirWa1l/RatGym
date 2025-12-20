import React from 'react';
import { useNavigate } from 'react-router-dom';
import NutritionWidget from '../components/NutritionWidget';

export const NutritionPage: React.FC = () => {
  const navigate = useNavigate();
  const currentUser = localStorage.getItem('ratgym_username') || 'guest';

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      {/* Header */}
      <div style={{
        backgroundColor: '#000',
        color: '#fff',
        padding: '20px 40px',
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
      }}>
        <button
          onClick={() => navigate('/')}
          style={{
            background: 'none',
            border: 'none',
            color: '#fff',
            fontSize: '24px',
            cursor: 'pointer',
          }}
        >
          ←
        </button>
        <div>
          <h1 style={{ margin: 0, fontSize: '24px' }}>🥗 Nutrición</h1>
          <p style={{ margin: '4px 0 0', opacity: 0.7, fontSize: '14px' }}>
            Plan alimenticio personalizado con IA
          </p>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '40px', display: 'flex', justifyContent: 'center' }}>
        <NutritionWidget 
          userId={currentUser} 
          compact={false}
          onNavigate={() => navigate('/')}
        />
      </div>
    </div>
  );
};
