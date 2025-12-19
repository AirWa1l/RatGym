import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { Exercise, MuscleGroup, Difficulty, Equipment } from './interfaces/exercise.interface';
import { CreateExerciseDto, UpdateExerciseDto } from './dto/exercise.dto';

@Injectable()
export class ExerciseService {
  private readonly logger = new Logger(ExerciseService.name);
  private exercises: Map<string, Exercise> = new Map();

  constructor() {
    this.seedExercises();
  }

  /**
   * Seed de ejercicios predefinidos
   */
  private seedExercises(): void {
    const seedData: Omit<Exercise, 'id' | 'createdAt' | 'updatedAt'>[] = [
      // Pecho
      {
        name: 'Press de Banca',
        description: 'Ejercicio básico para desarrollo del pecho con barra',
        muscleGroup: 'chest',
        difficulty: 'intermediate',
        equipment: 'barbell',
        instructions: [
          'Acuéstate en el banco con los pies firmes en el suelo',
          'Agarra la barra con las manos más anchas que los hombros',
          'Baja la barra controladamente hasta el pecho',
          'Empuja la barra hacia arriba hasta extender los brazos',
        ],
      },
      {
        name: 'Flexiones',
        description: 'Ejercicio de peso corporal para pecho y tríceps',
        muscleGroup: 'chest',
        difficulty: 'beginner',
        equipment: 'none',
        instructions: [
          'Colócate en posición de plancha con las manos al ancho de los hombros',
          'Baja el cuerpo flexionando los codos',
          'Mantén el core apretado durante todo el movimiento',
          'Empuja hacia arriba hasta la posición inicial',
        ],
      },
      {
        name: 'Aperturas con Mancuernas',
        description: 'Ejercicio de aislamiento para pecho',
        muscleGroup: 'chest',
        difficulty: 'intermediate',
        equipment: 'dumbbells',
        instructions: [
          'Acuéstate en el banco con una mancuerna en cada mano',
          'Extiende los brazos sobre el pecho con los codos ligeramente flexionados',
          'Abre los brazos en arco hasta sentir estiramiento en el pecho',
          'Vuelve a la posición inicial apretando el pecho',
        ],
      },
      // Espalda
      {
        name: 'Dominadas',
        description: 'Ejercicio compuesto para espalda y bíceps',
        muscleGroup: 'back',
        difficulty: 'intermediate',
        equipment: 'none',
        instructions: [
          'Cuelga de la barra con agarre prono más ancho que los hombros',
          'Tira del cuerpo hacia arriba llevando el pecho hacia la barra',
          'Aprieta los dorsales en la parte superior',
          'Baja controladamente hasta la posición inicial',
        ],
      },
      {
        name: 'Remo con Barra',
        description: 'Ejercicio compuesto para espalda media',
        muscleGroup: 'back',
        difficulty: 'intermediate',
        equipment: 'barbell',
        instructions: [
          'Inclínate hacia adelante con la espalda recta',
          'Agarra la barra con las manos al ancho de los hombros',
          'Tira de la barra hacia el abdomen',
          'Aprieta los omóplatos en la parte superior',
        ],
      },
      {
        name: 'Jalón al Pecho',
        description: 'Ejercicio de máquina para dorsales',
        muscleGroup: 'back',
        difficulty: 'beginner',
        equipment: 'machine',
        instructions: [
          'Siéntate en la máquina con los muslos asegurados',
          'Agarra la barra con agarre ancho',
          'Tira de la barra hacia el pecho superior',
          'Controla el movimiento al volver arriba',
        ],
      },
      // Piernas
      {
        name: 'Sentadilla',
        description: 'Rey de los ejercicios de piernas',
        muscleGroup: 'legs',
        difficulty: 'intermediate',
        equipment: 'barbell',
        instructions: [
          'Coloca la barra en la parte superior de la espalda',
          'Pies al ancho de los hombros, puntas ligeramente hacia afuera',
          'Baja flexionando rodillas y caderas hasta que los muslos estén paralelos al suelo',
          'Empuja a través de los talones para volver arriba',
        ],
      },
      {
        name: 'Peso Muerto',
        description: 'Ejercicio compuesto para cadena posterior',
        muscleGroup: 'legs',
        difficulty: 'advanced',
        equipment: 'barbell',
        instructions: [
          'Párate con los pies al ancho de las caderas, barra sobre los pies',
          'Flexiona las rodillas y agarra la barra',
          'Mantén la espalda recta y el core apretado',
          'Levanta la barra extendiendo caderas y rodillas',
        ],
      },
      {
        name: 'Zancadas',
        description: 'Ejercicio unilateral para cuádriceps y glúteos',
        muscleGroup: 'legs',
        difficulty: 'beginner',
        equipment: 'dumbbells',
        instructions: [
          'Párate con los pies juntos, mancuernas a los lados',
          'Da un paso largo hacia adelante',
          'Baja hasta que ambas rodillas formen 90 grados',
          'Empuja con el pie delantero para volver',
        ],
      },
      // Hombros
      {
        name: 'Press Militar',
        description: 'Ejercicio básico para hombros',
        muscleGroup: 'shoulders',
        difficulty: 'intermediate',
        equipment: 'barbell',
        instructions: [
          'Párate o siéntate con la barra a la altura de los hombros',
          'Agarra la barra con las manos más anchas que los hombros',
          'Empuja la barra sobre la cabeza',
          'Baja controladamente hasta los hombros',
        ],
      },
      {
        name: 'Elevaciones Laterales',
        description: 'Ejercicio de aislamiento para deltoides laterales',
        muscleGroup: 'shoulders',
        difficulty: 'beginner',
        equipment: 'dumbbells',
        instructions: [
          'Párate con mancuernas a los lados',
          'Levanta los brazos hacia los lados hasta la altura de los hombros',
          'Mantén una ligera flexión en los codos',
          'Baja controladamente',
        ],
      },
      // Brazos
      {
        name: 'Curl de Bíceps',
        description: 'Ejercicio clásico para bíceps',
        muscleGroup: 'arms',
        difficulty: 'beginner',
        equipment: 'dumbbells',
        instructions: [
          'Párate con mancuernas a los lados, palmas hacia adelante',
          'Flexiona los codos llevando las mancuernas hacia los hombros',
          'Aprieta el bíceps en la parte superior',
          'Baja controladamente',
        ],
      },
      {
        name: 'Fondos en Paralelas',
        description: 'Ejercicio compuesto para tríceps y pecho',
        muscleGroup: 'arms',
        difficulty: 'intermediate',
        equipment: 'none',
        instructions: [
          'Sujétate de las barras paralelas con los brazos extendidos',
          'Baja el cuerpo flexionando los codos',
          'Mantén los codos cerca del cuerpo para enfatizar tríceps',
          'Empuja hacia arriba hasta la posición inicial',
        ],
      },
      {
        name: 'Press Francés',
        description: 'Ejercicio de aislamiento para tríceps',
        muscleGroup: 'arms',
        difficulty: 'intermediate',
        equipment: 'barbell',
        instructions: [
          'Acuéstate en el banco con la barra sobre el pecho',
          'Mantén los brazos extendidos verticalmente',
          'Flexiona los codos bajando la barra hacia la frente',
          'Extiende los codos para volver a la posición inicial',
        ],
      },
      // Core
      {
        name: 'Plancha',
        description: 'Ejercicio isométrico para core',
        muscleGroup: 'core',
        difficulty: 'beginner',
        equipment: 'none',
        instructions: [
          'Colócate en posición de flexión apoyado en los antebrazos',
          'Mantén el cuerpo en línea recta',
          'Aprieta el core y los glúteos',
          'Mantén la posición el tiempo indicado',
        ],
      },
      {
        name: 'Crunches Abdominales',
        description: 'Ejercicio básico para abdominales',
        muscleGroup: 'core',
        difficulty: 'beginner',
        equipment: 'none',
        instructions: [
          'Acuéstate boca arriba con las rodillas flexionadas',
          'Coloca las manos detrás de la cabeza',
          'Eleva los hombros del suelo apretando el abdomen',
          'Baja controladamente',
        ],
      },
    ];

    seedData.forEach((exerciseData) => {
      const id = uuidv4();
      const now = new Date();
      this.exercises.set(id, {
        id,
        ...exerciseData,
        createdAt: now,
        updatedAt: now,
      } as Exercise);
    });

    this.logger.log(`✅ Seeded ${seedData.length} exercises`);
  }

  /**
   * Obtener todos los ejercicios
   */
  findAll(): Exercise[] {
    return Array.from(this.exercises.values());
  }

  /**
   * Obtener ejercicio por ID
   */
  findById(id: string): Exercise {
    const exercise = this.exercises.get(id);
    if (!exercise) {
      throw new NotFoundException(`Ejercicio con ID ${id} no encontrado`);
    }
    return exercise;
  }

  /**
   * Filtrar ejercicios por grupo muscular
   */
  findByMuscleGroup(muscleGroup: MuscleGroup): Exercise[] {
    return Array.from(this.exercises.values()).filter(
      (exercise) => exercise.muscleGroup === muscleGroup,
    );
  }

  /**
   * Filtrar ejercicios por dificultad
   */
  findByDifficulty(difficulty: Difficulty): Exercise[] {
    return Array.from(this.exercises.values()).filter(
      (exercise) => exercise.difficulty === difficulty,
    );
  }

  /**
   * Filtrar ejercicios por equipamiento
   */
  findByEquipment(equipment: Equipment): Exercise[] {
    return Array.from(this.exercises.values()).filter(
      (exercise) => exercise.equipment === equipment,
    );
  }

  /**
   * Crear nuevo ejercicio
   */
  create(createExerciseDto: CreateExerciseDto): Exercise {
    const id = uuidv4();
    const now = new Date();

    const exercise: Exercise = {
      id,
      ...createExerciseDto,
      createdAt: now,
      updatedAt: now,
    } as Exercise;

    this.exercises.set(id, exercise);
    this.logger.log(`Created exercise: ${exercise.name}`);

    return exercise;
  }

  /**
   * Actualizar ejercicio
   */
  update(id: string, updateExerciseDto: UpdateExerciseDto): Exercise {
    const exercise = this.findById(id);

    const updatedExercise = {
      ...exercise,
      ...updateExerciseDto,
      updatedAt: new Date(),
    } as Exercise;

    this.exercises.set(id, updatedExercise);
    this.logger.log(`Updated exercise: ${updatedExercise.name}`);

    return updatedExercise;
  }

  /**
   * Eliminar ejercicio
   */
  delete(id: string): boolean {
    const exercise = this.findById(id);
    this.exercises.delete(id);
    this.logger.log(`Deleted exercise: ${exercise.name}`);
    return true;
  }

  /**
   * Buscar ejercicios por nombre
   */
  search(query: string): Exercise[] {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.exercises.values()).filter(
      (exercise) =>
        exercise.name.toLowerCase().includes(lowerQuery) ||
        exercise.description.toLowerCase().includes(lowerQuery),
    );
  }
}
