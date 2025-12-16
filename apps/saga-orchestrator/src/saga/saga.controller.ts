import { Controller, Get, Post, Body, Param, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { SagaService } from './saga.service';

@Controller('saga')
export class SagaController {
  private readonly logger = new Logger(SagaController.name);

  constructor(private readonly sagaService: SagaService) {}

  @Post('user-registration')
  async startUserRegistration(@Body() data: any) {
    this.logger.log(`Starting user registration saga for: ${data.email}`);
    try {
      const saga = await this.sagaService.startUserRegistrationSaga(data);
      return {
        success: true,
        sagaId: saga.id,
        status: saga.status,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Get('status/:sagaId')
  getSagaStatus(@Param('sagaId') sagaId: string) {
    const saga = this.sagaService.getSagaStatus(sagaId);
    if (!saga) {
      return {
        success: false,
        error: 'Saga not found',
      };
    }
    return {
      success: true,
      saga,
    };
  }

  @Get('all')
  getAllSagas() {
    return {
      success: true,
      sagas: this.sagaService.getAllSagas(),
    };
  }

  // Message patterns for async communication
  @MessagePattern('saga.user.registration')
  async handleUserRegistration(@Payload() data: any) {
    this.logger.log(`Received user registration saga request: ${data.email}`);
    return this.sagaService.startUserRegistrationSaga(data);
  }
}
