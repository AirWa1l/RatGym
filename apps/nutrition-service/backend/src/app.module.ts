import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NutritionModule } from './nutrition/nutrition.module';
import { RabbitMQModule } from './rabbitmq/rabbitmq.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    RabbitMQModule,
    NutritionModule,
  ],
})
export class AppModule {}
