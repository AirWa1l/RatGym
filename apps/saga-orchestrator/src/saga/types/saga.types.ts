export enum SagaStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  COMPENSATING = 'COMPENSATING',
  COMPENSATED = 'COMPENSATED',
}

export enum SagaStep {
  // User steps
  REGISTER_USER = 'REGISTER_USER',
  CREATE_USER_PROFILE = 'CREATE_USER_PROFILE',
  DELETE_USER = 'DELETE_USER',
  
  // Routine steps
  CREATE_ROUTINE = 'CREATE_ROUTINE',
  DELETE_ROUTINE = 'DELETE_ROUTINE',
  ASSIGN_ROUTINE = 'ASSIGN_ROUTINE',
  
  // Nutrition steps
  CREATE_NUTRITION_PLAN = 'CREATE_NUTRITION_PLAN',
  DELETE_NUTRITION_PLAN = 'DELETE_NUTRITION_PLAN',
  
  // Class steps
  RESERVE_CLASS = 'RESERVE_CLASS',
  CANCEL_CLASS_RESERVATION = 'CANCEL_CLASS_RESERVATION',
  
  // Notification steps
  SEND_WELCOME_EMAIL = 'SEND_WELCOME_EMAIL',
  SEND_ROUTINE_NOTIFICATION = 'SEND_ROUTINE_NOTIFICATION',
  SEND_NUTRITION_NOTIFICATION = 'SEND_NUTRITION_NOTIFICATION',
  SEND_CLASS_NOTIFICATION = 'SEND_CLASS_NOTIFICATION',
}

export enum SagaType {
  USER_REGISTRATION = 'USER_REGISTRATION',
  USER_ONBOARDING = 'USER_ONBOARDING',
  CLASS_BOOKING = 'CLASS_BOOKING',
  ROUTINE_ASSIGNMENT = 'ROUTINE_ASSIGNMENT',
}

export interface SagaTransaction {
  id: string;
  type: SagaType | string;
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
  timeout?: number; // Timeout en milisegundos
}
