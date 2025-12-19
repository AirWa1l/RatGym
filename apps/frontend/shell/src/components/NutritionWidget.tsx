import React, { useState } from 'react';

const NUTRITION_API = 'http://localhost:3004/nutrition';

type Objective = 'LOSE_WEIGHT' | 'MAINTAIN' | 'GAIN_MUSCLE';

type NutritionWidgetProps = {
  userId: string;
  compact?: boolean;
  onNavigate?: () => void;
};

export default function NutritionWidget({ userId, compact = false, onNavigate }: NutritionWidgetProps) {
  const [weight, setWeight] = useState(75);
  const [height, setHeight] = useState(175);
  const [age, setAge] = useState(22);
  const [objective, setObjective] = useState<Objective>('LOSE_WEIGHT');

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const generatePlan = async () => {
    setLoading(true);

    const res = await fetch(`${NUTRITION_API}/plan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ weight, height, age, objective }),
    });

    const data = await res.json();
    setResult(data);
    setLoading(false);
  };

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '420px',
        background: '#fff',
        borderRadius: '14px',
        boxShadow: '0 8px 20px rgba(0,0,0,0.08)',
        overflow: 'hidden',
      }}
    >
      {/* HEADER */}
      <div
        style={{
          background: '#111',
          color: '#fff',
          padding: '16px',
        }}
      >
        <h3 style={{ margin: 0 }}>🥗 Nutrición</h3>
        <p style={{ margin: '4px 0 0', fontSize: '13px', opacity: 0.8 }}>
          Plan alimenticio personalizado
        </p>
      </div>

      {/* BODY */}
      <div style={{ padding: '16px' }}>
        {/* INPUTS */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '10px',
            marginBottom: '12px',
          }}
        >
          <input
            type="number"
            value={weight}
            onChange={(e) => setWeight(Number(e.target.value))}
            placeholder="Peso (kg)"
            style={inputStyle}
          />
          <input
            type="number"
            value={height}
            onChange={(e) => setHeight(Number(e.target.value))}
            placeholder="Altura (cm)"
            style={inputStyle}
          />
          <input
            type="number"
            value={age}
            onChange={(e) => setAge(Number(e.target.value))}
            placeholder="Edad"
            style={inputStyle}
          />
          <select
            value={objective}
            onChange={(e) => setObjective(e.target.value as Objective)}
            style={inputStyle}
          >
            <option value="LOSE_WEIGHT">Bajar peso</option>
            <option value="MAINTAIN">Mantener</option>
            <option value="GAIN_MUSCLE">Ganar músculo</option>
          </select>
        </div>

        {/* BOTÓN */}
        <button
          onClick={generatePlan}
          disabled={loading}
          style={{
            width: '100%',
            padding: '10px',
            borderRadius: '10px',
            border: 'none',
            background: '#4caf50',
            color: '#fff',
            fontWeight: 'bold',
            cursor: 'pointer',
          }}
        >
          {loading ? 'Generando...' : 'Generar plan'}
        </button>

        {/* RESULTADO */}
        {result && (
          <div style={{ marginTop: '16px' }}>
            {/* MACROS */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '12px',
                fontSize: '13px',
                fontWeight: 'bold',
              }}
            >
              <span>🔥 {result.calories}</span>
              <span>🥩 {result.protein}g</span>
              <span>🍞 {result.carbs}g</span>
              <span>🥑 {result.fat}g</span>
            </div>

            {/* IA TEXT */}
            <div
              style={{
                fontSize: '13px',
                background: '#f6f8fa',
                padding: '12px',
                borderRadius: '10px',
                whiteSpace: 'pre-wrap',
                lineHeight: 1.5,
              }}
            >
              {result.recommendation}
            </div>
          </div>
        )}
      </div>

      {/* Widget Footer - Solo en modo compacto */}
      {compact && (
        <div style={{
          padding: '16px 24px',
          backgroundColor: '#f8f9fa',
          borderTop: '1px solid #f0f0f0',
        }}>
          <button
            style={{
              width: '100%',
              padding: '10px',
              fontSize: '14px',
              fontWeight: '600',
              color: '#000',
              backgroundColor: 'transparent',
              border: '1px solid #e0e0e0',
              borderRadius: '4px',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#000';
              e.currentTarget.style.color = '#fff';
              e.currentTarget.style.borderColor = '#000';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#000';
              e.currentTarget.style.borderColor = '#e0e0e0';
            }}
            onClick={(e) => {
              e.stopPropagation();
              onNavigate?.();
            }}
          >
            Ver más →
          </button>
        </div>
      )}
    </div>
  );
}

/* -------- */
const inputStyle: React.CSSProperties = {
  padding: '8px',
  borderRadius: '8px',
  border: '1px solid #ddd',
  fontSize: '13px',
};
