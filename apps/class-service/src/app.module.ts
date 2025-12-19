import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClassModule } from './class/class.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ClassModule,
    HealthModule,
  ],
})
export class AppModule {}
