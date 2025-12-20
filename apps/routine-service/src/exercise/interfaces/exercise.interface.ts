// Tipos de grupo muscular
export type MuscleGroup = 'chest' | 'back' | 'legs' | 'shoulders' | 'arms' | 'core' | 'full_body';

// Tipos de dificultad
export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

// Tipos de equipamiento
export type Equipment = 'none' | 'dumbbells' | 'barbell' | 'machine' | 'cables' | 'kettlebell' | 'resistance_bands';

// Interfaz de Ejercicio
export interface Exercise {
  id: string;
  name: string;
  description: string;
  muscleGroup: MuscleGroup;
  difficulty: Difficulty;
  equipment: Equipment;
  instructions?: string[];
  videoUrl?: string;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}
