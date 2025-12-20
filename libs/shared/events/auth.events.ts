export interface BaseEvent {
  eventId: string;
  eventType: string;
  timestamp: Date;
  version: string;
  payload: any;
}

export interface UserRegisteredEvent extends BaseEvent {
  eventType: 'USER_REGISTERED';
  payload: {
    uid: string;
    email: string;
    displayName: string;
  };
}

export interface UserLoggedInEvent extends BaseEvent {
  eventType: 'USER_LOGGED_IN';
  payload: {
    uid: string;
    email: string;
  };
}

export interface UserLoggedOutEvent extends BaseEvent {
  eventType: 'USER_LOGGED_OUT';
  payload: {
    uid: string;
  };
}

export interface UserDeletedEvent extends BaseEvent {
  eventType: 'USER_DELETED';
  payload: {
    uid: string;
  };
}

export type AuthEvent = 
  | UserRegisteredEvent 
  | UserLoggedInEvent 
  | UserLoggedOutEvent 
  | UserDeletedEvent;
