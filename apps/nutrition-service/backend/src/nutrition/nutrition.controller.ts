import { Controller, Get, Post, Body } from '@nestjs/common';
import { NutritionService } from './nutrition.service';
import { AiService } from './ai.service';
import { CreatePlanDto } from './dto/create-plan.dto';

@Controller()
export class NutritionController {
  constructor(
    private readonly nutritionService: NutritionService,
    private readonly aiService: AiService,
  ) {}

  // ✅ Health check
  @Get('health')
  health() {
    return {
      status: 'ok',
      service: 'nutrition',
    };
  }

  // ✅ Crear plan nutricional
  @Post('plan')
  async createPlan(@Body() createPlanDto: CreatePlanDto) {
    const plan =
      this.nutritionService.calculatePlan(createPlanDto);

    const recommendation =
      await this.aiService.generateRecommendation(plan);

    return {
      ...plan,
      recommendation,
    };
  }
}
