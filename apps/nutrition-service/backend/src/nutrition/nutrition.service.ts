import { Injectable } from '@nestjs/common';

@Injectable()
export class NutritionService {

  calculatePlan(user: any) {
    const tmb =
      10 * user.weight +
      6.25 * user.height -
      5 * user.age +
      5;

    let calories = tmb;

    if (user.objective === 'LOSE_WEIGHT') calories *= 0.8;
    if (user.objective === 'GAIN_MUSCLE') calories *= 1.2;

    return {
      calories: Math.round(calories),
      protein: Math.round((calories * 0.3) / 4),
      carbs: Math.round((calories * 0.4) / 4),
      fat: Math.round((calories * 0.3) / 9),
      objective: user.objective,
    };
  }
}
