import { Module } from '@nestjs/common';
import { NutritionController } from './nutrition.controller';
import { NutritionService } from './nutrition.service';
import { AiService } from './ai.service';

@Module({
  controllers: [NutritionController],
  providers: [NutritionService, AiService],
})
export class NutritionModule {}
