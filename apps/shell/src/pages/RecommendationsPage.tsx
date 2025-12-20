import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const RECOMMENDATION_API = 'http://localhost:3007';

export const RecommendationsPage: React.FC = () => {
  const navigate = useNavigate();
  const currentUser = localStorage.getItem('ratgym_username') || 'guest';
  
  const [tipo, setTipo] = useState<'rutina' | 'nutricion'>('rutina');
  const [metas, setMetas] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const getRecommendation = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(`${RECOMMENDATION_API}/recomendacion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo,
          metas: metas.split(',').map(m => m.trim()).filter(m => m),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setResult(data);
      } else {
        setError('Error al obtener recomendación');
      }
    } catch (err) {
      setError('No se pudo conectar con el servicio de IA');
    } finally {
      setLoading(false);
    }
  };

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
          <h1 style={{ margin: 0, fontSize: '24px' }}>✨ Recomendaciones IA</h1>
          <p style={{ margin: '4px 0 0', opacity: 0.7, fontSize: '14px' }}>
            Sugerencias personalizadas con inteligencia artificial
          </p>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
        <div style={{
          backgroundColor: '#fff',
          borderRadius: '16px',
          padding: '32px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        }}>
          <h2 style={{ margin: '0 0 24px', fontSize: '20px' }}>
            ¿Qué tipo de recomendación necesitas?
          </h2>

          {/* Tipo selector */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
            <button
              onClick={() => setTipo('rutina')}
              style={{
                flex: 1,
                padding: '16px',
                borderRadius: '12px',
                border: tipo === 'rutina' ? '2px solid #000' : '2px solid #e0e0e0',
                backgroundColor: tipo === 'rutina' ? '#000' : '#fff',
                color: tipo === 'rutina' ? '#fff' : '#000',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              💪 Rutina de Ejercicio
            </button>
            <button
              onClick={() => setTipo('nutricion')}
              style={{
                flex: 1,
                padding: '16px',
                borderRadius: '12px',
                border: tipo === 'nutricion' ? '2px solid #000' : '2px solid #e0e0e0',
                backgroundColor: tipo === 'nutricion' ? '#000' : '#fff',
                color: tipo === 'nutricion' ? '#fff' : '#000',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              🥗 Plan Nutricional
            </button>
          </div>

          {/* Metas input */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
              Tus metas (separadas por coma)
            </label>
            <input
              type="text"
              value={metas}
              onChange={(e) => setMetas(e.target.value)}
              placeholder="ej: perder peso, ganar músculo, más energía"
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '8px',
                border: '2px solid #e0e0e0',
                fontSize: '14px',
                outline: 'none',
              }}
            />
          </div>

          {/* Submit button */}
          <button
            onClick={getRecommendation}
            disabled={loading}
            style={{
              width: '100%',
              padding: '16px',
              borderRadius: '12px',
              border: 'none',
              backgroundColor: loading ? '#ccc' : '#000',
              color: '#fff',
              fontSize: '16px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Generando recomendación...' : '🤖 Obtener Recomendación'}
          </button>

          {/* Error */}
          {error && (
            <div style={{
              marginTop: '20px',
              padding: '16px',
              borderRadius: '8px',
              backgroundColor: '#fee2e2',
              color: '#dc2626',
            }}>
              {error}
            </div>
          )}

          {/* Result */}
          {result && (
            <div style={{
              marginTop: '24px',
              padding: '24px',
              borderRadius: '12px',
              backgroundColor: '#f0fdf4',
              border: '1px solid #86efac',
            }}>
              <h3 style={{ margin: '0 0 16px', color: '#166534' }}>
                ✅ Recomendación Generada
              </h3>
              <div style={{ 
                whiteSpace: 'pre-wrap', 
                fontSize: '14px', 
                lineHeight: '1.6',
                color: '#333',
              }}>
                {result.recomendacion || result.recommendation || JSON.stringify(result, null, 2)}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
