import React, { useState } from 'react';

const NUTRITION_API = 'http://localhost:3004/nutrition';

type Objective = 'LOSE_WEIGHT' | 'MAINTAIN' | 'GAIN_MUSCLE';

type NutritionWidgetProps = {
  userId: string;
};

export default function NutritionWidget({ userId }: NutritionWidgetProps) {
  const [weight, setWeight] = useState(75);
  const [height, setHeight] = useState(175);
  const [age, setAge] = useState(22);
  const [objective, setObjective] = useState<Objective>('GAIN_MUSCLE');

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const generatePlan = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${NUTRITION_API}/plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weight,
          height,
          age,
          objective,
        }),
      });

      if (!res.ok) throw new Error();

      const data = await res.json();
      setResult(data);
    } catch {
      setError('No se pudo generar el plan de nutrición');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        background: '#ffffff',
        borderRadius: '16px',
        padding: '24px',
        maxWidth: '820px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.08)',
      }}
    >
      <h2 style={{ marginBottom: '4px' }}>🍎 Nutrición</h2>
      <p style={{ marginBottom: '20px', color: '#555' }}>
        Tu plan alimenticio personalizado
      </p>

      {/* FORMULARIO */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '16px',
          marginBottom: '20px',
        }}
      >
        {[
          { label: 'Peso (kg)', value: weight, setter: setWeight },
          { label: 'Altura (cm)', value: height, setter: setHeight },
          { label: 'Edad', value: age, setter: setAge },
        ].map(({ label, value, setter }) => (
          <label key={label} style={{ fontWeight: 600, fontSize: '14px' }}>
            {label}
            <input
              type="number"
              value={value}
              onChange={(e) => setter(Number(e.target.value))}
              style={{
                marginTop: '6px',
                width: '100%',
                padding: '10px',
                borderRadius: '8px',
                border: '1px solid #ddd',
              }}
            />
          </label>
        ))}

        <label style={{ fontWeight: 600, fontSize: '14px' }}>
          Objetivo
          <select
            value={objective}
            onChange={(e) => setObjective(e.target.value as Objective)}
            style={{
              marginTop: '6px',
              width: '100%',
              padding: '10px',
              borderRadius: '8px',
              border: '1px solid #ddd',
            }}
          >
            <option value="LOSE_WEIGHT">Bajar de peso</option>
            <option value="MAINTAIN">Mantener</option>
            <option value="GAIN_MUSCLE">Ganar músculo</option>
          </select>
        </label>

        <button
          onClick={generatePlan}
          disabled={loading}
          style={{
            gridColumn: 'span 2',
            padding: '12px',
            borderRadius: '10px',
            border: 'none',
            fontWeight: 'bold',
            background: loading ? '#ccc' : '#4caf50',
            color: 'white',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Generando plan...' : 'Generar plan'}
        </button>
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {result && (
        <>
          {/* MACROS */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: '12px',
              marginBottom: '20px',
            }}
          >
            {[
              { label: '🔥 Calorías', value: `${result.calories} kcal` },
              { label: '🥩 Proteínas', value: `${result.protein} g` },
              { label: '🍞 Carbos', value: `${result.carbs} g` },
              { label: '🥑 Grasas', value: `${result.fat} g` },
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  flex: 1,
                  background: '#f6f8fa',
                  padding: '14px',
                  borderRadius: '12px',
                  textAlign: 'center',
                  fontWeight: 'bold',
                }}
              >
                {item.label}
                <div style={{ marginTop: '6px' }}>{item.value}</div>
              </div>
            ))}
          </div>

          {/* IA */}
          <h3 style={{ marginBottom: '8px' }}>
            🥗 Plan alimenticio generado por IA
          </h3>

          <div
            style={{
              background: '#f9fafb',
              borderLeft: '5px solid #4caf50',
              padding: '20px',
              borderRadius: '12px',
              whiteSpace: 'pre-wrap',
              lineHeight: 1.6,
              fontSize: '14px',
            }}
          >
            {result.recommendation}
          </div>
        </>
      )}
    </div>
  );
}
