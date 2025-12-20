import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ExerciseModule } from './exercise/exercise.module';
import { RoutineModule } from './routine/routine.module';
import { HealthModule } from './health/health.module';
import { RabbitMQModule } from './rabbitmq/rabbitmq.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    RabbitMQModule,
    ExerciseModule,
    RoutineModule,
    HealthModule,
  ],
})
export class AppModule {}
