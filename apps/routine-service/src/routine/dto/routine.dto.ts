import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsArray,
  IsEnum,
  IsNumber,
  IsBoolean,
  ValidateNested,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

export class RoutineExerciseDto {
  @IsString()
  @IsNotEmpty()
  exerciseId: string;

  @IsString()
  @IsOptional()
  exerciseName?: string;

  @IsNumber()
  @Min(1)
  @Max(20)
  sets: number;

  @IsNumber()
  @Min(1)
  @Max(100)
  reps: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  weight?: number;

  @IsNumber()
  @Min(0)
  @Max(600)
  restTime: number;

  @IsNumber()
  @Min(1)
  order: number;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class CreateRoutineDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RoutineExerciseDto)
  exercises: RoutineExerciseDto[];

  @IsString()
  @IsNotEmpty()
  @IsEnum(['principiante', 'intermedio', 'avanzado'])
  difficulty: string;

  @IsString()
  @IsNotEmpty()
  @IsEnum(['fuerza', 'cardio', 'flexibilidad', 'hiit', 'crossfit', 'musculacion'])
  category: string;

  @IsNumber()
  @Min(5)
  @Max(180)
  estimatedDuration: number;

  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;

  @IsArray()
  @IsOptional()
  tags?: string[];
}

export class UpdateRoutineDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RoutineExerciseDto)
  @IsOptional()
  exercises?: RoutineExerciseDto[];

  @IsString()
  @IsOptional()
  @IsEnum(['principiante', 'intermedio', 'avanzado'])
  difficulty?: string;

  @IsString()
  @IsOptional()
  @IsEnum(['fuerza', 'cardio', 'flexibilidad', 'hiit', 'crossfit', 'musculacion'])
  category?: string;

  @IsNumber()
  @IsOptional()
  @Min(5)
  @Max(180)
  estimatedDuration?: number;

  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;

  @IsArray()
  @IsOptional()
  tags?: string[];
}

export class AddExerciseToRoutineDto {
  @IsString()
  @IsNotEmpty()
  routineId: string;

  @ValidateNested()
  @Type(() => RoutineExerciseDto)
  exercise: RoutineExerciseDto;
}
