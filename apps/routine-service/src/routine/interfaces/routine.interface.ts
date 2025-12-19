// Tipos de categoría de rutina
export type RoutineCategory = 'fuerza' | 'cardio' | 'flexibilidad' | 'hiit' | 'crossfit' | 'musculacion';

// Tipos de dificultad
export type RoutineDifficulty = 'principiante' | 'intermedio' | 'avanzado';

// Ejercicio dentro de una rutina
export interface RoutineExercise {
  exerciseId: string;
  exerciseName?: string; // Nombre del ejercicio (para referencia rápida)
  sets: number;
  reps: number;
  weight?: number; // Peso en kg (opcional)
  restTime: number; // Segundos de descanso
  order: number;
  notes?: string; // Notas adicionales
}

// Interfaz de Rutina
export interface Routine {
  id: string;
  name: string;
  description: string;
  userId: string;
  exercises: RoutineExercise[];
  difficulty: RoutineDifficulty;
  category: RoutineCategory;
  estimatedDuration: number; // En minutos
  isPublic: boolean; // Si la rutina es pública o privada
  tags?: string[];
  timesCompleted: number; // Contador de veces completada
  lastCompletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Estadísticas de rutina del usuario
export interface UserRoutineStats {
  totalRoutines: number;
  totalExercisesCompleted: number;
  totalWorkouts: number;
  favoriteCategory: string;
  lastWorkoutDate?: Date;
}
