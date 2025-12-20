import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { RabbitMQService } from '../rabbitmq/rabbitmq.service';
import {
  Routine,
  RoutineExercise,
  RoutineCategory,
  RoutineDifficulty,
  UserRoutineStats,
} from './interfaces/routine.interface';
import { CreateRoutineDto, UpdateRoutineDto, RoutineExerciseDto } from './dto/routine.dto';
import { ExerciseService } from '../exercise/exercise.service';

@Injectable()
export class RoutineService {
  private readonly logger = new Logger(RoutineService.name);
  private routines: Map<string, Routine> = new Map();
  private completionHistory: Map<string, { date: Date; routineId: string }[]> = new Map();

  constructor(
    private readonly exerciseService: ExerciseService,
    private readonly rabbitMQService: RabbitMQService,
  ) {
    this.seedRoutines();
  }

  /**
   * Seed de rutinas de ejemplo
   */
  private seedRoutines(): void {
    const exercises = this.exerciseService.findAll();

    // Mapear ejercicios por nombre para referencia
    const exerciseMap = new Map(exercises.map((e) => [e.name, e]));

    const seedData: Array<{
      name: string;
      description: string;
      difficulty: RoutineDifficulty;
      category: RoutineCategory;
      estimatedDuration: number;
      exerciseNames: string[];
    }> = [
      {
        name: 'Rutina Principiante - Cuerpo Completo',
        description: 'Rutina ideal para comenzar en el gimnasio. Trabaja todos los grupos musculares básicos.',
        difficulty: 'principiante',
        category: 'fuerza',
        estimatedDuration: 45,
        exerciseNames: ['Flexiones', 'Sentadilla', 'Plancha', 'Zancadas', 'Crunches Abdominales'],
      },
      {
        name: 'Rutina Intermedia - Push/Pull',
        description: 'Rutina dividida para desarrollo muscular intermedio. Combina ejercicios de empuje y tirón.',
        difficulty: 'intermedio',
        category: 'musculacion',
        estimatedDuration: 60,
        exerciseNames: [
          'Press de Banca',
          'Dominadas',
          'Press Militar',
          'Remo con Barra',
          'Curl de Bíceps',
          'Fondos en Paralelas',
        ],
      },
      {
        name: 'Rutina Avanzada - Fuerza Total',
        description: 'Rutina de alta intensidad para atletas experimentados. Enfocada en los movimientos compuestos.',
        difficulty: 'avanzado',
        category: 'fuerza',
        estimatedDuration: 90,
        exerciseNames: [
          'Peso Muerto',
          'Sentadilla',
          'Press de Banca',
          'Dominadas',
          'Press Militar',
          'Remo con Barra',
        ],
      },
      {
        name: 'Core Destroyer',
        description: 'Rutina enfocada en fortalecer el core. Ideal para mejorar estabilidad y definición.',
        difficulty: 'intermedio',
        category: 'fuerza',
        estimatedDuration: 30,
        exerciseNames: ['Plancha', 'Crunches Abdominales'],
      },
    ];

    seedData.forEach((routineData, index) => {
      const id = uuidv4();
      const now = new Date();

      const routineExercises: RoutineExercise[] = routineData.exerciseNames
        .map((name, i) => {
          const exercise = exerciseMap.get(name);
          if (!exercise) return null;

          return {
            exerciseId: exercise.id,
            exerciseName: exercise.name,
            sets: routineData.difficulty === 'principiante' ? 3 : routineData.difficulty === 'intermedio' ? 4 : 5,
            reps: routineData.category === 'fuerza' ? 8 : 12,
            restTime: routineData.difficulty === 'principiante' ? 90 : 60,
            order: i + 1,
          };
        })
        .filter(Boolean) as RoutineExercise[];

      const routine: Routine = {
        id,
        name: routineData.name,
        description: routineData.description,
        userId: 'system', // Rutinas del sistema
        exercises: routineExercises,
        difficulty: routineData.difficulty,
        category: routineData.category,
        estimatedDuration: routineData.estimatedDuration,
        isPublic: true,
        tags: [routineData.difficulty, routineData.category],
        timesCompleted: 0,
        createdAt: now,
        updatedAt: now,
      };

      this.routines.set(id, routine);
    });

    this.logger.log(`✅ Seeded ${seedData.length} routines`);
  }

  /**
   * Obtener todas las rutinas
   */
  findAll(): Routine[] {
    return Array.from(this.routines.values());
  }

  /**
   * Obtener rutinas públicas
   */
  findPublic(): Routine[] {
    return Array.from(this.routines.values()).filter((r) => r.isPublic);
  }

  /**
   * Obtener rutina por ID
   */
  findById(id: string): Routine {
    const routine = this.routines.get(id);
    if (!routine) {
      throw new NotFoundException(`Rutina con ID ${id} no encontrada`);
    }
    return routine;
  }

  /**
   * Obtener rutinas de un usuario
   */
  findByUserId(userId: string): Routine[] {
    return Array.from(this.routines.values()).filter((r) => r.userId === userId);
  }

  /**
   * Filtrar rutinas por categoría
   */
  findByCategory(category: RoutineCategory): Routine[] {
    return Array.from(this.routines.values()).filter((r) => r.category === category && r.isPublic);
  }

  /**
   * Filtrar rutinas por dificultad
   */
  findByDifficulty(difficulty: RoutineDifficulty): Routine[] {
    return Array.from(this.routines.values()).filter((r) => r.difficulty === difficulty && r.isPublic);
  }

  /**
   * Crear nueva rutina
   */
  create(createRoutineDto: CreateRoutineDto): Routine {
    const id = uuidv4();
    const now = new Date();

    // Enriquecer ejercicios con nombres
    const enrichedExercises = createRoutineDto.exercises.map((ex) => {
      try {
        const exercise = this.exerciseService.findById(ex.exerciseId);
        return { ...ex, exerciseName: exercise.name };
      } catch {
        return ex;
      }
    });

    const routine: Routine = {
      id,
      name: createRoutineDto.name,
      description: createRoutineDto.description,
      userId: createRoutineDto.userId,
      exercises: enrichedExercises as RoutineExercise[],
      difficulty: createRoutineDto.difficulty as RoutineDifficulty,
      category: createRoutineDto.category as RoutineCategory,
      estimatedDuration: createRoutineDto.estimatedDuration,
      isPublic: createRoutineDto.isPublic ?? false,
      tags: createRoutineDto.tags ?? [],
      timesCompleted: 0,
      createdAt: now,
      updatedAt: now,
    };

    this.routines.set(id, routine);
    this.logger.log(`Created routine: ${routine.name} for user ${routine.userId}`);

    // Emitir evento de rutina creada
    this.rabbitMQService.publishEvent('routine.created', {
      user_id: routine.userId,
      routine_id: routine.id,
      routine_name: routine.name,
      difficulty: routine.difficulty,
      category: routine.category,
      duration_minutes: routine.estimatedDuration,
      exercises_count: routine.exercises.length,
    });

    return routine;
  }

  /**
   * Actualizar rutina
   */
  update(id: string, updateRoutineDto: UpdateRoutineDto): Routine {
    const routine = this.findById(id);

    // Enriquecer ejercicios si se actualizan
    let exercises = routine.exercises;
    if (updateRoutineDto.exercises) {
      exercises = updateRoutineDto.exercises.map((ex) => {
        try {
          const exercise = this.exerciseService.findById(ex.exerciseId);
          return { ...ex, exerciseName: exercise.name } as RoutineExercise;
        } catch {
          return ex as RoutineExercise;
        }
      });
    }

    const updatedRoutine: Routine = {
      ...routine,
      ...updateRoutineDto,
      exercises,
      updatedAt: new Date(),
    } as Routine;

    this.routines.set(id, updatedRoutine);
    this.logger.log(`Updated routine: ${updatedRoutine.name}`);

    return updatedRoutine;
  }

  /**
   * Eliminar rutina
   */
  delete(id: string): boolean {
    const routine = this.findById(id);
    this.routines.delete(id);
    this.logger.log(`Deleted routine: ${routine.name}`);
    return true;
  }

  /**
   * Agregar ejercicio a una rutina
   */
  addExercise(routineId: string, exerciseDto: RoutineExerciseDto): Routine {
    const routine = this.findById(routineId);

    // Verificar que el ejercicio existe
    const exercise = this.exerciseService.findById(exerciseDto.exerciseId);

    const newExercise: RoutineExercise = {
      ...exerciseDto,
      exerciseName: exercise.name,
      order: routine.exercises.length + 1,
    };

    routine.exercises.push(newExercise);
    routine.updatedAt = new Date();

    this.routines.set(routineId, routine);
    this.logger.log(`Added exercise ${exercise.name} to routine ${routine.name}`);

    return routine;
  }

  /**
   * Remover ejercicio de una rutina
   */
  removeExercise(routineId: string, exerciseId: string): Routine {
    const routine = this.findById(routineId);

    routine.exercises = routine.exercises.filter((e) => e.exerciseId !== exerciseId);

    // Reordenar ejercicios
    routine.exercises.forEach((ex, index) => {
      ex.order = index + 1;
    });

    routine.updatedAt = new Date();
    this.routines.set(routineId, routine);

    this.logger.log(`Removed exercise from routine ${routine.name}`);
    return routine;
  }

  /**
   * Marcar rutina como completada
   */
  completeRoutine(routineId: string, userId: string): Routine {
    const routine = this.findById(routineId);

    routine.timesCompleted += 1;
    routine.lastCompletedAt = new Date();
    routine.updatedAt = new Date();

    this.routines.set(routineId, routine);

    // Guardar en historial
    const userHistory = this.completionHistory.get(userId) || [];
    userHistory.push({ date: new Date(), routineId });
    this.completionHistory.set(userId, userHistory);

    this.logger.log(`Routine ${routine.name} completed by user ${userId}`);

    // Emitir evento de rutina completada
    this.rabbitMQService.publishEvent('routine.completed', {
      user_id: userId,
      routine_id: routine.id,
      routine_name: routine.name,
      difficulty: routine.difficulty,
      category: routine.category,
      times_completed: routine.timesCompleted,
      exercises_count: routine.exercises.length,
    });

    return routine;
  }

  /**
   * Obtener estadísticas de un usuario
   */
  getUserStats(userId: string): UserRoutineStats {
    const userRoutines = this.findByUserId(userId);
    const userHistory = this.completionHistory.get(userId) || [];

    // Calcular categoría favorita
    const categoryCount = new Map<string, number>();
    userRoutines.forEach((r) => {
      categoryCount.set(r.category, (categoryCount.get(r.category) || 0) + 1);
    });

    let favoriteCategory = 'fuerza';
    let maxCount = 0;
    categoryCount.forEach((count, category) => {
      if (count > maxCount) {
        maxCount = count;
        favoriteCategory = category;
      }
    });

    // Calcular total de ejercicios completados
    const totalExercisesCompleted = userHistory.reduce((total, h) => {
      const routine = this.routines.get(h.routineId);
      return total + (routine?.exercises.length || 0);
    }, 0);

    return {
      totalRoutines: userRoutines.length,
      totalExercisesCompleted,
      totalWorkouts: userHistory.length,
      favoriteCategory,
      lastWorkoutDate: userHistory.length > 0 ? userHistory[userHistory.length - 1].date : undefined,
    };
  }

  /**
   * Buscar rutinas por nombre o descripción
   */
  search(query: string): Routine[] {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.routines.values()).filter(
      (routine) =>
        routine.isPublic &&
        (routine.name.toLowerCase().includes(lowerQuery) ||
          routine.description.toLowerCase().includes(lowerQuery) ||
          routine.tags?.some((tag) => tag.toLowerCase().includes(lowerQuery))),
    );
  }

  /**
   * Duplicar una rutina para un usuario
   */
  duplicate(routineId: string, userId: string): Routine {
    const original = this.findById(routineId);

    const createDto: CreateRoutineDto = {
      name: `${original.name} (copia)`,
      description: original.description,
      userId,
      exercises: original.exercises.map((ex) => ({
        exerciseId: ex.exerciseId,
        exerciseName: ex.exerciseName,
        sets: ex.sets,
        reps: ex.reps,
        weight: ex.weight,
        restTime: ex.restTime,
        order: ex.order,
        notes: ex.notes,
      })),
      difficulty: original.difficulty,
      category: original.category,
      estimatedDuration: original.estimatedDuration,
      isPublic: false,
      tags: original.tags,
    };

    return this.create(createDto);
  }
}
