import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Connect RabbitMQ
  const rabbitmqUrl = configService.get<string>('RABBITMQ_URL');
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [rabbitmqUrl],
      queue: 'saga_orchestrator_queue',
      queueOptions: {
        durable: true,
      },
    },
  });

  await app.startAllMicroservices();

  const port = configService.get<number>('PORT', 3010);
  await app.listen(port);
  
  console.log(`🎭 Saga Orchestrator is running on: http://localhost:${port}`);
  console.log(`📨 RabbitMQ connected to: ${rabbitmqUrl}`);
}

bootstrap();
