import { Injectable, Logger, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom, timeout } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { 
  SagaTransaction, 
  SagaStatus, 
  SagaStepDefinition,
  SagaStep,
  SagaType
} from './types/saga.types';

@Injectable()
export class SagaService {
  private readonly logger = new Logger(SagaService.name);
  private transactions: Map<string, SagaTransaction> = new Map();

  constructor(
    @Inject('USER_SERVICE') private userServiceClient: ClientProxy,
    @Inject('ROUTINE_SERVICE') private routineServiceClient: ClientProxy,
    @Inject('NUTRITION_SERVICE') private nutritionServiceClient: ClientProxy,
    @Inject('CLASS_SERVICE') private classServiceClient: ClientProxy,
    @Inject('NOTIFICATION_SERVICE') private notificationServiceClient: ClientProxy,
  ) {}

  /**
   * Saga de registro de usuario con notificación de bienvenida
   */
  async startUserRegistrationSaga(userData: { username: string; email: string }): Promise<SagaTransaction> {
    const sagaId = uuidv4();
    
    const steps: SagaStepDefinition[] = [
      {
        name: SagaStep.REGISTER_USER,
        service: 'USER_SERVICE',
        action: 'user.register',
        compensationAction: 'user.delete',
        executed: false,
        compensated: false,
        timeout: 5000,
      },
      {
        name: SagaStep.SEND_WELCOME_EMAIL,
        service: 'NOTIFICATION_SERVICE',
        action: 'notification.sendWelcome',
        executed: false,
        compensated: false,
        timeout: 3000,
      },
    ];

    return this.createAndExecuteSaga(sagaId, SagaType.USER_REGISTRATION, steps, userData);
  }

  /**
   * Saga completo de onboarding: usuario + rutina + nutrición
   */
  async startUserOnboardingSaga(userData: {
    username: string;
    email: string;
    weight: number;
    height: number;
    age: number;
    objective: string;
    fitnessLevel: string;
  }): Promise<SagaTransaction> {
    const sagaId = uuidv4();
    
    const steps: SagaStepDefinition[] = [
      {
        name: SagaStep.REGISTER_USER,
        service: 'USER_SERVICE',
        action: 'user.register',
        compensationAction: 'user.delete',
        executed: false,
        compensated: false,
        timeout: 5000,
      },
      {
        name: SagaStep.CREATE_NUTRITION_PLAN,
        service: 'NUTRITION_SERVICE',
        action: 'nutrition.createPlan',
        compensationAction: 'nutrition.deletePlan',
        executed: false,
        compensated: false,
        timeout: 5000,
      },
      {
        name: SagaStep.CREATE_ROUTINE,
        service: 'ROUTINE_SERVICE',
        action: 'routine.create',
        compensationAction: 'routine.delete',
        executed: false,
        compensated: false,
        timeout: 5000,
      },
      {
        name: SagaStep.SEND_WELCOME_EMAIL,
        service: 'NOTIFICATION_SERVICE',
        action: 'notification.sendOnboarding',
        executed: false,
        compensated: false,
        timeout: 3000,
      },
    ];

    return this.createAndExecuteSaga(sagaId, SagaType.USER_ONBOARDING, steps, userData);
  }

  /**
   * Saga de reserva de clase
   */
  async startClassBookingSaga(bookingData: {
    userId: string;
    userName: string;
    classId: string;
    className: string;
  }): Promise<SagaTransaction> {
    const sagaId = uuidv4();
    
    const steps: SagaStepDefinition[] = [
      {
        name: SagaStep.RESERVE_CLASS,
        service: 'CLASS_SERVICE',
        action: 'class.book',
        compensationAction: 'class.cancel',
        executed: false,
        compensated: false,
        timeout: 5000,
      },
      {
        name: SagaStep.SEND_CLASS_NOTIFICATION,
        service: 'NOTIFICATION_SERVICE',
        action: 'notification.sendClassBooking',
        executed: false,
        compensated: false,
        timeout: 3000,
      },
    ];

    return this.createAndExecuteSaga(sagaId, SagaType.CLASS_BOOKING, steps, bookingData);
  }

  /**
   * Saga de asignación de rutina a usuario
   */
  async startRoutineAssignmentSaga(assignmentData: {
    userId: string;
    routineName: string;
    difficulty: string;
    category: string;
  }): Promise<SagaTransaction> {
    const sagaId = uuidv4();
    
    const steps: SagaStepDefinition[] = [
      {
        name: SagaStep.ASSIGN_ROUTINE,
        service: 'ROUTINE_SERVICE',
        action: 'routine.assign',
        compensationAction: 'routine.unassign',
        executed: false,
        compensated: false,
        timeout: 5000,
      },
      {
        name: SagaStep.SEND_ROUTINE_NOTIFICATION,
        service: 'NOTIFICATION_SERVICE',
        action: 'notification.sendRoutineAssigned',
        executed: false,
        compensated: false,
        timeout: 3000,
      },
    ];

    return this.createAndExecuteSaga(sagaId, SagaType.ROUTINE_ASSIGNMENT, steps, assignmentData);
  }

  /**
   * Crea y ejecuta un saga
   */
  private async createAndExecuteSaga(
    sagaId: string,
    type: SagaType,
    steps: SagaStepDefinition[],
    data: any,
  ): Promise<SagaTransaction> {
    const transaction: SagaTransaction = {
      id: sagaId,
      type,
      status: SagaStatus.PENDING,
      currentStep: 0,
      steps,
      data,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.transactions.set(sagaId, transaction);
    this.logger.log(`[SAGA ${sagaId}] Started ${type}`);

    // Ejecutar saga de forma asíncrona
    this.executeSaga(sagaId).catch((error) => {
      this.logger.error(`[SAGA ${sagaId}] Execution failed: ${error.message}`);
    });

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
      const client = this.getServiceClient(step.service);
      const stepTimeout = step.timeout || 5000;

      // Enviar mensaje y esperar respuesta con timeout
      const response$ = client.send(step.action, data).pipe(
        timeout(stepTimeout)
      );
      
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
    transaction.status = SagaStatus.COMPENSATING;

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
      const client = this.getServiceClient(step.service);
      const stepTimeout = step.timeout || 5000;

      const response$ = client.send(step.compensationAction!, data).pipe(
        timeout(stepTimeout)
      );
      
      await lastValueFrom(response$);
    } catch (error) {
      this.logger.error(`Compensation execution error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Obtiene el cliente del servicio correspondiente
   */
  private getServiceClient(serviceName: string): ClientProxy {
    switch (serviceName) {
      case 'USER_SERVICE':
        return this.userServiceClient;
      case 'ROUTINE_SERVICE':
        return this.routineServiceClient;
      case 'NUTRITION_SERVICE':
        return this.nutritionServiceClient;
      case 'CLASS_SERVICE':
        return this.classServiceClient;
      case 'NOTIFICATION_SERVICE':
        return this.notificationServiceClient;
      default:
        throw new Error(`Unknown service: ${serviceName}`);
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
   * Lista transacciones por tipo
   */
  getSagasByType(type: SagaType): SagaTransaction[] {
    return Array.from(this.transactions.values()).filter((t) => t.type === type);
  }

  /**
   * Lista transacciones por estado
   */
  getSagasByStatus(status: SagaStatus): SagaTransaction[] {
    return Array.from(this.transactions.values()).filter((t) => t.status === status);
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

  /**
   * Reintenta un saga fallido
   */
  async retrySaga(sagaId: string): Promise<SagaTransaction> {
    const transaction = this.transactions.get(sagaId);
    
    if (!transaction) {
      throw new Error(`Transaction ${sagaId} not found`);
    }

    if (transaction.status !== SagaStatus.FAILED && transaction.status !== SagaStatus.COMPENSATED) {
      throw new Error(`Cannot retry saga in status: ${transaction.status}`);
    }

    // Resetear todos los pasos
    transaction.steps.forEach((step) => {
      step.executed = false;
      step.compensated = false;
      step.result = undefined;
      step.error = undefined;
    });

    transaction.status = SagaStatus.PENDING;
    transaction.currentStep = 0;
    transaction.error = undefined;
    transaction.updatedAt = new Date();

    this.logger.log(`[SAGA ${sagaId}] Retrying saga`);
    
    // Ejecutar de nuevo
    this.executeSaga(sagaId).catch((error) => {
      this.logger.error(`[SAGA ${sagaId}] Retry failed: ${error.message}`);
    });

    return transaction;
  }
}
