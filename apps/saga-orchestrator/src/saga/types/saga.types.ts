export enum SagaStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  COMPENSATING = 'COMPENSATING',
  COMPENSATED = 'COMPENSATED',
}

export enum SagaStep {
  REGISTER_USER = 'REGISTER_USER',
  SEND_WELCOME_EMAIL = 'SEND_WELCOME_EMAIL',
  CREATE_USER_PROFILE = 'CREATE_USER_PROFILE',
}

export interface SagaTransaction {
  id: string;
  type: string;
  status: SagaStatus;
  currentStep: number;
  steps: SagaStepDefinition[];
  data: any;
  createdAt: Date;
  updatedAt: Date;
  error?: string;
}

export interface SagaStepDefinition {
  name: SagaStep;
  service: string;
  action: string;
  compensationAction?: string;
  executed: boolean;
  compensated: boolean;
  result?: any;
  error?: string;
}
