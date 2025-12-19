export interface NutritionRequest {
  weight: number;
  height: number;
  age: number;
  objective: 'LOSE_WEIGHT' | 'GAIN_MUSCLE' | 'MAINTAIN';
}

export interface NutritionResponse {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  objective: string;
  recommendation: string;
}

const BASE_URL = 'http://localhost:3004/nutrition';

export async function createNutritionPlan(
  data: NutritionRequest
): Promise<NutritionResponse> {
  const response = await fetch(`${BASE_URL}/plan`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Error creating nutrition plan');
  }

  return response.json();
}
