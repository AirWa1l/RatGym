import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClassModule } from './class/class.module';
import { HealthModule } from './health/health.module';
import { RabbitMQModule } from './rabbitmq/rabbitmq.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    RabbitMQModule,
    ClassModule,
    HealthModule,
  ],
})
export class AppModule {}
