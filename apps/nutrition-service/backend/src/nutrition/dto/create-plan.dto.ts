import { IsNumber, IsIn } from 'class-validator';

export class CreatePlanDto {
  @IsNumber()
  weight: number;

  @IsNumber()
  height: number;

  @IsNumber()
  age: number;

  @IsIn(['LOSE_WEIGHT', 'GAIN_MUSCLE', 'MAINTAIN'])
  objective: string;
}
