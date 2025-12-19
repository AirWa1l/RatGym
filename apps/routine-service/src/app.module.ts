import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ExerciseModule } from './exercise/exercise.module';
import { RoutineModule } from './routine/routine.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ExerciseModule,
    RoutineModule,
    HealthModule,
  ],
})
export class AppModule {}
