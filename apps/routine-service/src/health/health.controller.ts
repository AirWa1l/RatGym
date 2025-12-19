import { Controller, Get } from '@nestjs/common';

@Controller()
export class HealthController {
  @Get()
  root() {
    return {
      servicio: 'routine-service',
      version: '1.0.0',
      estado: 'activo',
      endpoints: {
        rutinas: '/routines',
        ejercicios: '/exercises',
        salud: '/health',
      },
      timestamp: new Date().toISOString(),
    };
  }

  @Get('health')
  check() {
    return {
      status: 'ok',
      servicio: 'routine-service',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memoria: process.memoryUsage(),
    };
  }
}
