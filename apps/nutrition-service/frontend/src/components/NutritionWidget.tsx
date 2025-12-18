import React, { useState } from 'react';
import {
  createNutritionPlan,
  NutritionResponse,
} from '../services/nutrition.service';
import './nutritionWidget.css';

export default function NutritionWidget() {
  const [plan, setPlan] = useState<NutritionResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const [weight, setWeight] = useState(75);
  const [height, setHeight] = useState(175);
  const [age, setAge] = useState(22);
  const [objective, setObjective] =
    useState<'LOSE_WEIGHT' | 'GAIN_MUSCLE' | 'MAINTAIN'>('GAIN_MUSCLE');

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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="nutrition-card">
      <div className="nutrition-header">
        <span>🍎</span>
        <span className="nutrition-title">Nutrición</span>
      </div>
      <div className="nutrition-subtitle">Plan alimenticio personalizado</div>

      <div className="nutrition-form">
        <label>
          Peso (kg)
          <input
            type="number"
            value={weight}
            onChange={(e) => setWeight(+e.target.value)}
          />
        </label>

        <label>
          Altura (cm)
          <input
            type="number"
            value={height}
            onChange={(e) => setHeight(+e.target.value)}
          />
        </label>

        <label>
          Edad
          <input
            type="number"
            value={age}
            onChange={(e) => setAge(+e.target.value)}
          />
        </label>

        <label>
          Objetivo
          <select
            value={objective}
            onChange={(e) => setObjective(e.target.value as any)}
          >
            <option value="LOSE_WEIGHT">Bajar de peso</option>
            <option value="GAIN_MUSCLE">Ganar músculo</option>
            <option value="MAINTAIN">Mantener</option>
          </select>
        </label>
      </div>

      <button
        className="nutrition-button"
        onClick={handleGenerate}
        disabled={loading}
      >
        {loading ? 'Generando...' : 'Generar plan'}
      </button>

      {plan && (
        <div className="nutrition-result">
          <div className="nutrition-metric">
            <span>Calorías</span>
            <b>{plan.calories} kcal</b>
          </div>
          <div className="nutrition-metric">
            <span>Proteínas</span>
            <b>{plan.protein} g</b>
          </div>
          <div className="nutrition-metric">
            <span>Carbohidratos</span>
            <b>{plan.carbs} g</b>
          </div>
          <div className="nutrition-metric">
            <span>Grasas</span>
            <b>{plan.fat} g</b>
          </div>

          <div className="nutrition-recommendation">
            {plan.recommendation}
          </div>
        </div>
      )}
    </div>
  );
}
