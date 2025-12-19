import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { SagaModule } from './saga/saga.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ClientsModule.register([
      {
        name: 'USER_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL || 'amqp://localhost:5672'],
          queue: process.env.USER_SERVICE_QUEUE || 'user_service_queue',
          queueOptions: {
            durable: true,
          },
        },
      },
      {
        name: 'ROUTINE_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL || 'amqp://localhost:5672'],
          queue: process.env.ROUTINE_SERVICE_QUEUE || 'routine_service_queue',
          queueOptions: {
            durable: true,
          },
        },
      },
      {
        name: 'NUTRITION_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL || 'amqp://localhost:5672'],
          queue: process.env.NUTRITION_SERVICE_QUEUE || 'nutrition_service_queue',
          queueOptions: {
            durable: true,
          },
        },
      },
      {
        name: 'CLASS_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL || 'amqp://localhost:5672'],
          queue: process.env.CLASS_SERVICE_QUEUE || 'class_service_queue',
          queueOptions: {
            durable: true,
          },
        },
      },
      {
        name: 'NOTIFICATION_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL || 'amqp://localhost:5672'],
          queue: process.env.NOTIFICATION_SERVICE_QUEUE || 'notifications_queue',
          queueOptions: {
            durable: false,
          },
        },
      },
    ]),
    SagaModule,
  ],
})
export class AppModule {}
