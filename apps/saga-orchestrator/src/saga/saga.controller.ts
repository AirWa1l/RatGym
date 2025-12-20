import { Controller, Get, Post, Body, Param, Logger, Query } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { SagaService } from './saga.service';
import { SagaStatus, SagaType } from './types/saga.types';

@Controller('saga')
export class SagaController {
  private readonly logger = new Logger(SagaController.name);

  constructor(private readonly sagaService: SagaService) {}

  // ================== HTTP Endpoints ==================

  @Post('user-registration')
  async startUserRegistration(@Body() data: { username: string; email: string }) {
    this.logger.log(`Starting user registration saga for: ${data.username}`);
    try {
      const saga = await this.sagaService.startUserRegistrationSaga(data);
      return {
        success: true,
        sagaId: saga.id,
        status: saga.status,
        message: 'User registration saga started',
      };
    } catch (error) {
      this.logger.error(`Saga failed: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Post('user-onboarding')
  async startUserOnboarding(@Body() data: {
    username: string;
    email: string;
    weight: number;
    height: number;
    age: number;
    objective: string;
    fitnessLevel: string;
  }) {
    this.logger.log(`Starting complete user onboarding saga for: ${data.username}`);
    try {
      const saga = await this.sagaService.startUserOnboardingSaga(data);
      return {
        success: true,
        sagaId: saga.id,
        status: saga.status,
        message: 'User onboarding saga started (user + nutrition + routine)',
      };
    } catch (error) {
      this.logger.error(`Saga failed: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Post('class-booking')
  async startClassBooking(@Body() data: {
    userId: string;
    userName: string;
    classId: string;
    className: string;
  }) {
    this.logger.log(`Starting class booking saga for user: ${data.userId}`);
    try {
      const saga = await this.sagaService.startClassBookingSaga(data);
      return {
        success: true,
        sagaId: saga.id,
        status: saga.status,
        message: 'Class booking saga started',
      };
    } catch (error) {
      this.logger.error(`Saga failed: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Post('routine-assignment')
  async startRoutineAssignment(@Body() data: {
    userId: string;
    routineName: string;
    difficulty: string;
    category: string;
  }) {
    this.logger.log(`Starting routine assignment saga for user: ${data.userId}`);
    try {
      const saga = await this.sagaService.startRoutineAssignmentSaga(data);
      return {
        success: true,
        sagaId: saga.id,
        status: saga.status,
        message: 'Routine assignment saga started',
      };
    } catch (error) {
      this.logger.error(`Saga failed: ${error.message}`);
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
  getAllSagas(@Query('type') type?: SagaType, @Query('status') status?: SagaStatus) {
    let sagas = this.sagaService.getAllSagas();
    
    if (type) {
      sagas = this.sagaService.getSagasByType(type);
    }
    
    if (status) {
      sagas = sagas.filter(s => s.status === status);
    }
    
    return {
      success: true,
      count: sagas.length,
      sagas,
    };
  }

  @Post('cleanup')
  cleanupOldSagas(@Body() data: { hoursOld?: number }) {
    const cleaned = this.sagaService.cleanupOldTransactions(data.hoursOld || 24);
    return {
      success: true,
      cleaned,
      message: `Cleaned ${cleaned} old transactions`,
    };
  }

  @Post('retry/:sagaId')
  async retrySaga(@Param('sagaId') sagaId: string) {
    try {
      const saga = await this.sagaService.retrySaga(sagaId);
      return {
        success: true,
        sagaId: saga.id,
        status: saga.status,
        message: 'Saga retry started',
      };
    } catch (error) {
      this.logger.error(`Retry failed: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Get('health')
  healthCheck() {
    return {
      status: 'ok',
      service: 'saga-orchestrator',
      timestamp: new Date().toISOString(),
    };
  }

  // ================== Message Patterns (Async) ==================

  @MessagePattern('saga.user.registration')
  async handleUserRegistration(@Payload() data: { username: string; email: string }) {
    this.logger.log(`Received async user registration saga request: ${data.username}`);
    return this.sagaService.startUserRegistrationSaga(data);
  }

  @MessagePattern('saga.user.onboarding')
  async handleUserOnboarding(@Payload() data: any) {
    this.logger.log(`Received async user onboarding saga request: ${data.username}`);
    return this.sagaService.startUserOnboardingSaga(data);
  }

  @MessagePattern('saga.class.booking')
  async handleClassBooking(@Payload() data: any) {
    this.logger.log(`Received async class booking saga request`);
    return this.sagaService.startClassBookingSaga(data);
  }

  @MessagePattern('saga.routine.assignment')
  async handleRoutineAssignment(@Payload() data: any) {
    this.logger.log(`Received async routine assignment saga request`);
    return this.sagaService.startRoutineAssignmentSaga(data);
  }
}
