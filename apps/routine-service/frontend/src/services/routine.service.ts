// Interfaces
export interface RoutineExercise {
  exerciseId: string;
  exerciseName?: string;
  sets: number;
  reps: number;
  restTime: number;
  order: number;
}

export interface Routine {
  id: string;
  name: string;
  description: string;
  userId: string;
  exercises: RoutineExercise[];
  difficulty: string;
  category: string;
  estimatedDuration: number;
  timesCompleted: number;
  lastCompletedAt?: string;
}

export interface UserStats {
  totalRoutines: number;
  totalExercisesCompleted: number;
  totalWorkouts: number;
  favoriteCategory: string;
  lastWorkoutDate?: string;
}

export interface Exercise {
  id: string;
  name: string;
  description: string;
  muscleGroup: string;
  difficulty: string;
}

export interface CreateRoutineDto {
  name: string;
  description: string;
  userId: string;
  difficulty: string;
  category: string;
  estimatedDuration: number;
  exercises: RoutineExercise[];
}

export interface AddExerciseDto {
  exerciseId: string;
  exerciseName: string;
  sets: number;
  reps: number;
  restTime: number;
  order: number;
}

// API Base URL
const BASE_URL = 'http://localhost:3002';

// API Response wrapper
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// Routines API
export async function getRoutines(): Promise<Routine[]> {
  const response = await fetch(`${BASE_URL}/routines`);
  if (!response.ok) throw new Error('Error fetching routines');
  const data: ApiResponse<Routine[]> = await response.json();
  return data.data;
}

export async function getRoutineById(id: string): Promise<Routine> {
  const response = await fetch(`${BASE_URL}/routines/${id}`);
  if (!response.ok) throw new Error('Error fetching routine');
  const data: ApiResponse<Routine> = await response.json();
  return data.data;
}

export async function getUserRoutines(userId: string): Promise<Routine[]> {
  const response = await fetch(`${BASE_URL}/routines/user/${userId}`);
  if (!response.ok) throw new Error('Error fetching user routines');
  const data: ApiResponse<Routine[]> = await response.json();
  return data.data;
}

export async function getUserStats(userId: string): Promise<UserStats> {
  const response = await fetch(`${BASE_URL}/routines/user/${userId}/stats`);
  if (!response.ok) throw new Error('Error fetching user stats');
  const data: ApiResponse<UserStats> = await response.json();
  return data.data;
}

export async function createRoutine(routine: CreateRoutineDto): Promise<Routine> {
  const response = await fetch(`${BASE_URL}/routines`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(routine),
  });
  if (!response.ok) throw new Error('Error creating routine');
  const data: ApiResponse<Routine> = await response.json();
  return data.data;
}

export async function updateRoutine(id: string, routine: Partial<CreateRoutineDto>): Promise<Routine> {
  const response = await fetch(`${BASE_URL}/routines/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(routine),
  });
  if (!response.ok) throw new Error('Error updating routine');
  const data: ApiResponse<Routine> = await response.json();
  return data.data;
}

export async function deleteRoutine(id: string): Promise<void> {
  const response = await fetch(`${BASE_URL}/routines/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Error deleting routine');
}

export async function completeRoutine(routineId: string, userId: string): Promise<Routine> {
  const response = await fetch(`${BASE_URL}/routines/${routineId}/complete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  });
  if (!response.ok) throw new Error('Error completing routine');
  const data: ApiResponse<Routine> = await response.json();
  return data.data;
}

export async function duplicateRoutine(routineId: string, userId: string): Promise<Routine> {
  const response = await fetch(`${BASE_URL}/routines/${routineId}/duplicate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  });
  if (!response.ok) throw new Error('Error duplicating routine');
  const data: ApiResponse<Routine> = await response.json();
  return data.data;
}

export async function addExerciseToRoutine(routineId: string, exercise: AddExerciseDto): Promise<Routine> {
  const response = await fetch(`${BASE_URL}/routines/${routineId}/exercises`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(exercise),
  });
  if (!response.ok) throw new Error('Error adding exercise to routine');
  const data: ApiResponse<Routine> = await response.json();
  return data.data;
}

export async function removeExerciseFromRoutine(routineId: string, exerciseId: string): Promise<Routine> {
  const response = await fetch(`${BASE_URL}/routines/${routineId}/exercises/${exerciseId}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Error removing exercise from routine');
  const data: ApiResponse<Routine> = await response.json();
  return data.data;
}

// Exercises API
export async function getExercises(): Promise<Exercise[]> {
  const response = await fetch(`${BASE_URL}/exercises`);
  if (!response.ok) throw new Error('Error fetching exercises');
  const data: ApiResponse<Exercise[]> = await response.json();
  return data.data;
}

export async function getExerciseById(id: string): Promise<Exercise> {
  const response = await fetch(`${BASE_URL}/exercises/${id}`);
  if (!response.ok) throw new Error('Error fetching exercise');
  const data: ApiResponse<Exercise> = await response.json();
  return data.data;
}

export async function getExercisesByMuscleGroup(muscleGroup: string): Promise<Exercise[]> {
  const response = await fetch(`${BASE_URL}/exercises/muscle/${muscleGroup}`);
  if (!response.ok) throw new Error('Error fetching exercises by muscle group');
  const data: ApiResponse<Exercise[]> = await response.json();
  return data.data;
}

// Utility functions
export function getMuscleGroupLabel(group: string): string {
  const labels: Record<string, string> = {
    chest: 'Pecho',
    back: 'Espalda',
    shoulders: 'Hombros',
    biceps: 'Bíceps',
    triceps: 'Tríceps',
    legs: 'Piernas',
    core: 'Core',
    glutes: 'Glúteos',
    full_body: 'Cuerpo Completo',
  };
  return labels[group] || group;
}

export function getDifficultyColor(difficulty: string): string {
  switch (difficulty) {
    case 'principiante': return '#4CAF50';
    case 'intermedio': return '#FF9800';
    case 'avanzado': return '#f44336';
    default: return '#666';
  }
}

export function getDifficultyLabel(difficulty: string): string {
  switch (difficulty) {
    case 'principiante': return 'Principiante';
    case 'intermedio': return 'Intermedio';
    case 'avanzado': return 'Avanzado';
    default: return difficulty;
  }
}

export function getCategoryIcon(category: string): string {
  switch (category) {
    case 'fuerza': return '💪';
    case 'cardio': return '🏃';
    case 'flexibilidad': return '🧘';
    case 'hiit': return '⚡';
    case 'musculacion': return '🏋️';
    case 'crossfit': return '🔥';
    default: return '💪';
  }
}
