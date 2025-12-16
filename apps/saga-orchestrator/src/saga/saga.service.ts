import { Injectable, Logger, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { 
  SagaTransaction, 
  SagaStatus, 
  SagaStepDefinition,
  SagaStep 
} from './types/saga.types';

@Injectable()
export class SagaService {
  private readonly logger = new Logger(SagaService.name);
  private transactions: Map<string, SagaTransaction> = new Map();

  constructor(
    @Inject('USER_SERVICE') private userServiceClient: ClientProxy,
    @Inject('NOTIFICATION_SERVICE') private notificationServiceClient: ClientProxy,
  ) {}

  async startUserRegistrationSaga(registrationData: any): Promise<SagaTransaction> {
    const sagaId = uuidv4();
    
    const steps: SagaStepDefinition[] = [
      {
        name: SagaStep.REGISTER_USER,
        service: 'USER_SERVICE',
        action: 'user.login',
        compensationAction: 'user.delete',
        executed: false,
        compensated: false,
      },
      {
        name: SagaStep.SEND_WELCOME_EMAIL,
        service: 'NOTIFICATION_SERVICE',
        action: 'notification.sendWelcomeEmail',
        executed: false,
        compensated: false,
      },
    ];

    const transaction: SagaTransaction = {
      id: sagaId,
      type: 'USER_REGISTRATION',
      status: SagaStatus.PENDING,
      currentStep: 0,
      steps,
      data: registrationData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.transactions.set(sagaId, transaction);
    this.logger.log(`Started user registration saga: ${sagaId}`);

    // Execute saga
    await this.executeSaga(sagaId);

    return this.transactions.get(sagaId)!;
  }

  private async executeSaga(sagaId: string): Promise<void> {
    const transaction = this.transactions.get(sagaId);
    if (!transaction) {
      throw new Error(`Transaction ${sagaId} not found`);
    }

    transaction.status = SagaStatus.IN_PROGRESS;
    transaction.updatedAt = new Date();

    try {
      // Execute each step
      for (let i = 0; i < transaction.steps.length; i++) {
        const step = transaction.steps[i];
        transaction.currentStep = i;
        
        this.logger.log(`Executing step ${i + 1}/${transaction.steps.length}: ${step.name}`);

        try {
          const result = await this.executeStep(step, transaction.data);
          step.executed = true;
          step.result = result;
          
          this.logger.log(`Step ${step.name} completed successfully`);
        } catch (error) {
          this.logger.error(`Step ${step.name} failed: ${error.message}`);
          step.error = error.message;
          
          // Compensation
          await this.compensate(transaction, i);
          throw error;
        }
      }

      transaction.status = SagaStatus.COMPLETED;
      transaction.updatedAt = new Date();
      this.logger.log(`Saga ${sagaId} completed successfully`);
    } catch (error) {
      transaction.status = SagaStatus.FAILED;
      transaction.error = error.message;
      transaction.updatedAt = new Date();
      this.logger.error(`Saga ${sagaId} failed: ${error.message}`);
      throw error;
    }
  }

  private async executeStep(
    step: SagaStepDefinition, 
    data: any
  ): Promise<any> {
    let client: ClientProxy;

    switch (step.service) {
      case 'USER_SERVICE':
        client = this.userServiceClient;
        break;
      case 'NOTIFICATION_SERVICE':
        client = this.notificationServiceClient;
        break;
      default:
        throw new Error(`Unknown service: ${step.service}`);
    }

    try {
      const result = await lastValueFrom(
        client.send(step.action, data)
      );
      return result;
    } catch (error) {
      this.logger.error(`Error executing ${step.action}: ${error.message}`);
      throw error;
    }
  }

  private async compensate(
    transaction: SagaTransaction, 
    failedStepIndex: number
  ): Promise<void> {
    this.logger.log(`Starting compensation for saga ${transaction.id}`);
    transaction.status = SagaStatus.COMPENSATING;

    // Compensate in reverse order
    for (let i = failedStepIndex - 1; i >= 0; i--) {
      const step = transaction.steps[i];
      
      if (step.executed && !step.compensated && step.compensationAction) {
        this.logger.log(`Compensating step: ${step.name}`);
        
        try {
          await this.executeCompensation(step, transaction.data);
          step.compensated = true;
          this.logger.log(`Step ${step.name} compensated successfully`);
        } catch (error) {
          this.logger.error(`Compensation failed for ${step.name}: ${error.message}`);
          // Continue compensating other steps even if one fails
        }
      }
    }

    transaction.status = SagaStatus.COMPENSATED;
    transaction.updatedAt = new Date();
    this.logger.log(`Compensation completed for saga ${transaction.id}`);
  }

  private async executeCompensation(
    step: SagaStepDefinition,
    data: any
  ): Promise<void> {
    if (!step.compensationAction) {
      return;
    }

    let client: ClientProxy;

    switch (step.service) {
      case 'USER_SERVICE':
        client = this.userServiceClient;
        break;
      case 'NOTIFICATION_SERVICE':
        client = this.notificationServiceClient;
        break;
      default:
        throw new Error(`Unknown service: ${step.service}`);
    }

    // Use result from the original execution for compensation
    const compensationData = {
      ...data,
      ...step.result,
    };

    await lastValueFrom(
      client.send(step.compensationAction, compensationData)
    );
  }

  getSagaStatus(sagaId: string): SagaTransaction | undefined {
    return this.transactions.get(sagaId);
  }

  getAllSagas(): SagaTransaction[] {
    return Array.from(this.transactions.values());
  }
}
