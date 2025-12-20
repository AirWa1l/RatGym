import { Injectable } from '@nestjs/common';
import { RabbitMQService } from '../rabbitmq/rabbitmq.service';

@Injectable()
export class NutritionService {
  constructor(private readonly rabbitMQService: RabbitMQService) {}

  calculatePlan(user: any) {
    const tmb =
      10 * user.weight +
      6.25 * user.height -
      5 * user.age +
      5;

    let calories = tmb;

    if (user.objective === 'LOSE_WEIGHT') calories *= 0.8;
    if (user.objective === 'GAIN_MUSCLE') calories *= 1.2;

    const plan = {
      calories: Math.round(calories),
      protein: Math.round((calories * 0.3) / 4),
      carbs: Math.round((calories * 0.4) / 4),
      fat: Math.round((calories * 0.3) / 9),
      objective: user.objective,
    };

    // Emitir evento de plan nutricional creado
    if (user.user_id) {
      this.rabbitMQService.publishEvent('nutrition.plan_created', {
        user_id: user.user_id,
        calories: plan.calories,
        protein: plan.protein,
        carbs: plan.carbs,
        fat: plan.fat,
        objective: user.objective,
        weight: user.weight,
        height: user.height,
        age: user.age,
      });
    }

    return plan;
  }
}
