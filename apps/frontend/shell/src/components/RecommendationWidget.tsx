import React from 'react';

type RecommendationWidgetProps = {
  userId: string;
};

const RECOMMENDATION_URL = 'http://recommendation-service:3007';

export default function RecommendationWidget({
  userId,
}: RecommendationWidgetProps) {
  const redirectToService = () => {
    window.location.href = `${RECOMMENDATION_URL}?user=${userId}`;
  };

  return (
    <div
      onClick={redirectToService}
      style={{
        width: '100%',
        maxWidth: '420px',
        background: '#fff',
        borderRadius: '16px',
        boxShadow: '0 10px 24px rgba(0,0,0,0.08)',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow =
          '0 16px 36px rgba(0,0,0,0.14)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow =
          '0 10px 24px rgba(0,0,0,0.08)';
      }}
    >
      {/* HEADER */}
      <div
        style={{
          background: 'linear-gradient(135deg, #111, #333)',
          color: '#fff',
          padding: '18px',
        }}
      >
        <h3 style={{ margin: 0, fontSize: '18px' }}>
          🤖 Recomendaciones con IA
        </h3>
        <p
          style={{
            margin: '6px 0 0',
            fontSize: '13px',
            opacity: 0.85,
          }}
        >
          Entrenamiento y nutrición personalizados
        </p>
      </div>

      {/* BODY */}
      <div style={{ padding: '18px' }}>
        <p
          style={{
            fontSize: '14px',
            color: '#444',
            lineHeight: 1.6,
            marginBottom: '18px',
          }}
        >
          Descubre rutinas de entrenamiento y recomendaciones nutricionales
          generadas con inteligencia artificial, adaptadas a tus metas y
          preferencias.
        </p>

        {/* CTA */}
        <div
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '12px',
            background: '#000',
            color: '#fff',
            fontWeight: 600,
            textAlign: 'center',
            fontSize: '14px',
            letterSpacing: '0.3px',
          }}
        >
          Ver recomendaciones →
        </div>
      </div>
    </div>
  );
}


/* ---------- */
const inputStyle: React.CSSProperties = {
  padding: '8px',
  borderRadius: '8px',
  border: '1px solid #ddd',
  fontSize: '13px',
  background: '#fafafa',
  color: '#666',
};
