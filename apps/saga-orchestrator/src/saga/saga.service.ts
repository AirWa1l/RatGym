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

  /**
   * Saga simplificado para registro de usuario
   * Solo registra el usuario y envía notificación de bienvenida
   */
  async startUserRegistrationSaga(userData: { username: string }): Promise<SagaTransaction> {
    const sagaId = uuidv4();
    
    const steps: SagaStepDefinition[] = [
      {
        name: SagaStep.REGISTER_USER,
        service: 'USER_SERVICE',
        action: 'user.register',
        compensationAction: 'user.delete',
        executed: false,
        compensated: false,
      },
      {
        name: SagaStep.SEND_WELCOME_EMAIL,
        service: 'NOTIFICATION_SERVICE',
        action: 'notification.sendWelcome',
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
      data: userData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.transactions.set(sagaId, transaction);
    this.logger.log(`[SAGA ${sagaId}] Started user registration for: ${userData.username}`);

    // Ejecutar saga de forma asíncrona
    await this.executeSaga(sagaId);

    return this.transactions.get(sagaId)!;
  }

  /**
   * Ejecuta todos los pasos del saga
   */
  private async executeSaga(sagaId: string): Promise<void> {
    const transaction = this.transactions.get(sagaId);
    if (!transaction) {
      throw new Error(`Transaction ${sagaId} not found`);
    }

    transaction.status = SagaStatus.IN_PROGRESS;
    transaction.updatedAt = new Date();

    try {
      // Ejecutar cada paso secuencialmente
      for (let i = 0; i < transaction.steps.length; i++) {
        const step = transaction.steps[i];
        transaction.currentStep = i;
        
        this.logger.log(`[SAGA ${sagaId}] Step ${i + 1}/${transaction.steps.length}: ${step.name}`);

        try {
          const result = await this.executeStep(step, transaction.data);
          step.executed = true;
          step.result = result;
          
          this.logger.log(`[SAGA ${sagaId}] ✓ ${step.name} completed`);
        } catch (error) {
          this.logger.error(`[SAGA ${sagaId}] ✗ ${step.name} failed: ${error.message}`);
          step.error = error.message;
          
          // Compensar pasos anteriores
          await this.compensate(transaction, i);
          throw error;
        }
      }

      transaction.status = SagaStatus.COMPLETED;
      transaction.updatedAt = new Date();
      this.logger.log(`[SAGA ${sagaId}] ✓ Completed successfully`);
    } catch (error) {
      transaction.status = SagaStatus.FAILED;
      transaction.error = error.message;
      transaction.updatedAt = new Date();
      this.logger.error(`[SAGA ${sagaId}] ✗ Failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Ejecuta un paso individual del saga
   */
  private async executeStep(step: SagaStepDefinition, data: any): Promise<any> {
    try {
      let client: ClientProxy;
      
      // Seleccionar el cliente correcto
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

      // Enviar mensaje y esperar respuesta (con timeout de 5 segundos)
      const response$ = client.send(step.action, data);
      const result = await lastValueFrom(response$);
      
      return result;
    } catch (error) {
      this.logger.error(`Step execution error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Compensa (rollback) los pasos ejecutados cuando algo falla
   */
  private async compensate(transaction: SagaTransaction, failedStepIndex: number): Promise<void> {
    this.logger.warn(`[SAGA ${transaction.id}] Starting compensation from step ${failedStepIndex}`);

    // Compensar en orden inverso
    for (let i = failedStepIndex - 1; i >= 0; i--) {
      const step = transaction.steps[i];
      
      // Solo compensar si tiene acción de compensación y fue ejecutado
      if (step.compensationAction && step.executed && !step.compensated) {
        this.logger.log(`[SAGA ${transaction.id}] Compensating step: ${step.name}`);
        
        try {
          await this.executeCompensation(step, transaction.data);
          step.compensated = true;
          this.logger.log(`[SAGA ${transaction.id}] ✓ ${step.name} compensated`);
        } catch (error) {
          this.logger.error(`[SAGA ${transaction.id}] ✗ Compensation failed for ${step.name}: ${error.message}`);
          // Continuar con otras compensaciones aunque una falle
        }
      }
    }

    transaction.status = SagaStatus.COMPENSATED;
    transaction.updatedAt = new Date();
  }

  /**
   * Ejecuta una acción de compensación
   */
  private async executeCompensation(step: SagaStepDefinition, data: any): Promise<void> {
    try {
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

      const response$ = client.send(step.compensationAction!, data);
      await lastValueFrom(response$);
    } catch (error) {
      this.logger.error(`Compensation execution error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Obtiene el estado de una transacción
   */
  getSagaStatus(sagaId: string): SagaTransaction | undefined {
    return this.transactions.get(sagaId);
  }

  /**
   * Lista todas las transacciones
   */
  getAllSagas(): SagaTransaction[] {
    return Array.from(this.transactions.values());
  }

  /**
   * Limpia transacciones completadas más antiguas que X horas
   */
  cleanupOldTransactions(hoursOld: number = 24): number {
    const cutoffTime = new Date(Date.now() - hoursOld * 60 * 60 * 1000);
    let cleaned = 0;

    for (const [id, transaction] of this.transactions.entries()) {
      if (
        (transaction.status === SagaStatus.COMPLETED || 
         transaction.status === SagaStatus.FAILED ||
         transaction.status === SagaStatus.COMPENSATED) &&
        transaction.updatedAt < cutoffTime
      ) {
        this.transactions.delete(id);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      this.logger.log(`Cleaned up ${cleaned} old transactions`);
    }

    return cleaned;
  }
}
