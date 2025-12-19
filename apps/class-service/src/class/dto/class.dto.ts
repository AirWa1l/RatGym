import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsNumber,
  IsDateString,
  IsOptional,
  Min,
  Max,
  Matches,
} from 'class-validator';
import { ClassCategory, ClassDifficulty, ClassStatus } from '../interfaces/class.interface';

export class CreateClassDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  instructor: string;

  @IsEnum(ClassCategory)
  category: ClassCategory;

  @IsEnum(ClassDifficulty)
  difficulty: ClassDifficulty;

  @IsNumber()
  @Min(15)
  @Max(180)
  duration: number;

  @IsNumber()
  @Min(1)
  @Max(50)
  capacity: number;

  @IsDateString()
  date: string;

  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'startTime must be in HH:mm format',
  })
  startTime: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;
}

export class UpdateClassDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  instructor?: string;

  @IsOptional()
  @IsEnum(ClassCategory)
  category?: ClassCategory;

  @IsOptional()
  @IsEnum(ClassDifficulty)
  difficulty?: ClassDifficulty;

  @IsOptional()
  @IsNumber()
  @Min(15)
  @Max(180)
  duration?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(50)
  capacity?: number;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
  startTime?: string;

  @IsOptional()
  @IsEnum(ClassStatus)
  status?: ClassStatus;

  @IsOptional()
  @IsString()
  imageUrl?: string;
}

export class BookClassDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  userName: string;
}

export class CancelBookingDto {
  @IsString()
  @IsNotEmpty()
  userId: string;
}

export class MarkAttendanceDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsNotEmpty()
  attended: boolean;
}
