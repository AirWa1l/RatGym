export enum ClassCategory {
  YOGA = 'yoga',
  SPINNING = 'spinning',
  CROSSFIT = 'crossfit',
  PILATES = 'pilates',
  ZUMBA = 'zumba',
  BOXING = 'boxing',
  HIIT = 'hiit',
  FUNCIONAL = 'funcional',
}

export enum ClassDifficulty {
  PRINCIPIANTE = 'principiante',
  INTERMEDIO = 'intermedio',
  AVANZADO = 'avanzado',
}

export enum ClassStatus {
  SCHEDULED = 'scheduled',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export interface Class {
  id: string;
  name: string;
  description: string;
  instructor: string;
  category: ClassCategory;
  difficulty: ClassDifficulty;
  duration: number; // en minutos
  capacity: number;
  currentBookings: number;
  date: Date;
  startTime: string; // HH:mm formato
  endTime: string; // HH:mm formato
  status: ClassStatus;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Booking {
  id: string;
  classId: string;
  userId: string;
  userName: string;
  bookedAt: Date;
  attended: boolean;
  cancelledAt?: Date;
}

export interface UserBookingStats {
  totalBookings: number;
  totalAttended: number;
  totalCancelled: number;
  favoriteCategory: string;
  upcomingClasses: number;
}
