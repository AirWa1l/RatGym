import React, { useState } from 'react';
import {
  createNutritionPlan,
  NutritionResponse,
} from '../services/nutrition.service';

export default function NutritionWidget() {
  const [plan, setPlan] = useState<NutritionResponse | null>(null);
  const [loading, setLoading] = useState(false);

  // 🔹 Inputs
  const [weight, setWeight] = useState(75);
  const [height, setHeight] = useState(175);
  const [age, setAge] = useState(22);
  const [objective, setObjective] = useState<
    'LOSE_WEIGHT' | 'GAIN_MUSCLE' | 'MAINTAIN'
  >('GAIN_MUSCLE');

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const result = await createNutritionPlan({
        weight,
        height,
        age,
        objective,
      });
      setPlan(result);
    } catch (error) {
      alert('Error generating nutrition plan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ border: '1px solid #ccc', padding: '1.5rem' }}>
      <h2>🍎 Nutrición</h2>

      {/* Inputs */}
      <div style={{ display: 'grid', gap: '0.5rem' }}>
        <label>
          Peso (kg):
          <input
            type="number"
            value={weight}
            onChange={(e) => setWeight(Number(e.target.value))}
          />
        </label>

        <label>
          Altura (cm):
          <input
            type="number"
            value={height}
            onChange={(e) => setHeight(Number(e.target.value))}
          />
        </label>

        <label>
          Edad:
          <input
            type="number"
            value={age}
            onChange={(e) => setAge(Number(e.target.value))}
          />
        </label>

        <label>
          Objetivo:
          <select
            value={objective}
            onChange={(e) =>
              setObjective(
                e.target.value as
                  | 'LOSE_WEIGHT'
                  | 'GAIN_MUSCLE'
                  | 'MAINTAIN'
              )
            }
          >
            <option value="LOSE_WEIGHT">Bajar de peso</option>
            <option value="GAIN_MUSCLE">Ganar músculo</option>
            <option value="MAINTAIN">Mantener</option>
          </select>
        </label>
      </div>

      <button
        onClick={handleGenerate}
        disabled={loading}
        style={{ marginTop: '1rem' }}
      >
        {loading ? 'Generando...' : 'Generar plan'}
      </button>

      {/* Resultado */}
      {plan && (
        <div style={{ marginTop: '1rem' }}>
          <p><b>Calorías:</b> {plan.calories}</p>
          <p><b>Proteínas:</b> {plan.protein} g</p>
          <p><b>Carbohidratos:</b> {plan.carbs} g</p>
          <p><b>Grasas:</b> {plan.fat} g</p>
          <p><b>Recomendación:</b> {plan.recommendation}</p>
        </div>
      )}
    </div>
  );
}
