import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqp from 'amqplib';

@Injectable()
export class RabbitMQService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RabbitMQService.name);
  private connection: amqp.Connection;
  private channel: amqp.Channel;
  private readonly exchangeName = 'nutrition';

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    await this.connect();
  }

  async onModuleDestroy() {
    await this.disconnect();
  }

  private async connect() {
    try {
      const rabbitmqUrl = this.configService.get<string>('RABBITMQ_URL') || 'amqp://localhost:5672';
      
      this.connection = await amqp.connect(rabbitmqUrl);
      this.channel = await this.connection.createChannel();
      
      await this.channel.assertExchange(this.exchangeName, 'topic', { durable: false });
      
      this.logger.log(`✅ Connected to RabbitMQ: ${rabbitmqUrl}`);
      this.logger.log(`✅ Exchange '${this.exchangeName}' created`);
    } catch (error) {
      this.logger.error(`❌ Failed to connect to RabbitMQ: ${error.message}`);
    }
  }

  private async disconnect() {
    try {
      if (this.channel) {
        await this.channel.close();
      }
      if (this.connection) {
        await this.connection.close();
      }
      this.logger.log('🔌 RabbitMQ connection closed');
    } catch (error) {
      this.logger.error(`Error closing RabbitMQ connection: ${error.message}`);
    }
  }

  async publishEvent(eventType: string, data: any) {
    if (!this.channel) {
      this.logger.warn('⚠️ RabbitMQ channel not available, skipping event publish');
      return;
    }

    try {
      const event = {
        type: eventType,
        data,
        timestamp: new Date().toISOString(),
      };

      const routingKey = eventType.replace('.', '_');
      
      this.channel.publish(
        this.exchangeName,
        routingKey,
        Buffer.from(JSON.stringify(event)),
      );

      this.logger.log(`📤 Event published: ${eventType}`);
    } catch (error) {
      this.logger.error(`Error publishing event ${eventType}: ${error.message}`);
    }
  }
}
