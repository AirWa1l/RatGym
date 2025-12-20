import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  check() {
    return {
      status: 'ok',
      service: 'class-service',
      timestamp: new Date().toISOString(),
    };
  }
}
