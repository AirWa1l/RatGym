import { IsNotEmpty, IsString, IsOptional, IsArray, IsEnum } from 'class-validator';

export class CreateExerciseDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  @IsEnum(['chest', 'back', 'legs', 'shoulders', 'arms', 'core', 'full_body'])
  muscleGroup: string;

  @IsString()
  @IsNotEmpty()
  @IsEnum(['beginner', 'intermediate', 'advanced'])
  difficulty: string;

  @IsString()
  @IsNotEmpty()
  @IsEnum(['none', 'dumbbells', 'barbell', 'machine', 'cables', 'kettlebell', 'resistance_bands'])
  equipment: string;

  @IsArray()
  @IsOptional()
  instructions?: string[];

  @IsString()
  @IsOptional()
  videoUrl?: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;
}

export class UpdateExerciseDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  @IsEnum(['chest', 'back', 'legs', 'shoulders', 'arms', 'core', 'full_body'])
  muscleGroup?: string;

  @IsString()
  @IsOptional()
  @IsEnum(['beginner', 'intermediate', 'advanced'])
  difficulty?: string;

  @IsString()
  @IsOptional()
  @IsEnum(['none', 'dumbbells', 'barbell', 'machine', 'cables', 'kettlebell', 'resistance_bands'])
  equipment?: string;

  @IsArray()
  @IsOptional()
  instructions?: string[];

  @IsString()
  @IsOptional()
  videoUrl?: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;
}
