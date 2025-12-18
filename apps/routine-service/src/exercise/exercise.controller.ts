import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Logger,
} from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ExerciseService } from './exercise.service';
import { CreateExerciseDto, UpdateExerciseDto } from './dto/exercise.dto';
import { MuscleGroup, Difficulty, Equipment } from './interfaces/exercise.interface';

@Controller('exercises')
export class ExerciseController {
  private readonly logger = new Logger(ExerciseController.name);

  constructor(private readonly exerciseService: ExerciseService) {}

  /**
   * GET /exercises - Listar todos los ejercicios
   */
  @Get()
  findAll(@Query('search') search?: string) {
    if (search) {
      return {
        success: true,
        data: this.exerciseService.search(search),
      };
    }
    return {
      success: true,
      data: this.exerciseService.findAll(),
    };
  }

  /**
   * GET /exercises/:id - Obtener ejercicio por ID
   */
  @Get(':id')
  findById(@Param('id') id: string) {
    return {
      success: true,
      data: this.exerciseService.findById(id),
    };
  }

  /**
   * GET /exercises/muscle/:group - Filtrar por grupo muscular
   */
  @Get('muscle/:group')
  findByMuscleGroup(@Param('group') group: MuscleGroup) {
    return {
      success: true,
      data: this.exerciseService.findByMuscleGroup(group),
    };
  }

  /**
   * GET /exercises/difficulty/:level - Filtrar por dificultad
   */
  @Get('difficulty/:level')
  findByDifficulty(@Param('level') level: Difficulty) {
    return {
      success: true,
      data: this.exerciseService.findByDifficulty(level),
    };
  }

  /**
   * GET /exercises/equipment/:type - Filtrar por equipamiento
   */
  @Get('equipment/:type')
  findByEquipment(@Param('type') type: Equipment) {
    return {
      success: true,
      data: this.exerciseService.findByEquipment(type),
    };
  }

  /**
   * POST /exercises - Crear ejercicio
   */
  @Post()
  create(@Body() createExerciseDto: CreateExerciseDto) {
    this.logger.log(`Creating exercise: ${createExerciseDto.name}`);
    return {
      success: true,
      data: this.exerciseService.create(createExerciseDto),
      message: 'Ejercicio creado exitosamente',
    };
  }

  /**
   * PUT /exercises/:id - Actualizar ejercicio
   */
  @Put(':id')
  update(@Param('id') id: string, @Body() updateExerciseDto: UpdateExerciseDto) {
    this.logger.log(`Updating exercise: ${id}`);
    return {
      success: true,
      data: this.exerciseService.update(id, updateExerciseDto),
      message: 'Ejercicio actualizado exitosamente',
    };
  }

  /**
   * DELETE /exercises/:id - Eliminar ejercicio
   */
  @Delete(':id')
  delete(@Param('id') id: string) {
    this.logger.log(`Deleting exercise: ${id}`);
    this.exerciseService.delete(id);
    return {
      success: true,
      message: 'Ejercicio eliminado exitosamente',
    };
  }

  // ==================== MESSAGE PATTERNS (RabbitMQ) ====================

  /**
   * Message pattern para obtener todos los ejercicios
   */
  @MessagePattern('exercise.getAll')
  handleGetAllExercises() {
    this.logger.log('Received message: exercise.getAll');
    return {
      success: true,
      data: this.exerciseService.findAll(),
    };
  }

  /**
   * Message pattern para obtener ejercicio por ID
   */
  @MessagePattern('exercise.getById')
  handleGetExerciseById(@Payload() data: { id: string }) {
    this.logger.log(`Received message: exercise.getById - ${data.id}`);
    return {
      success: true,
      data: this.exerciseService.findById(data.id),
    };
  }

  /**
   * Message pattern para obtener ejercicios por grupo muscular
   */
  @MessagePattern('exercise.getByMuscleGroup')
  handleGetByMuscleGroup(@Payload() data: { muscleGroup: MuscleGroup }) {
    this.logger.log(`Received message: exercise.getByMuscleGroup - ${data.muscleGroup}`);
    return {
      success: true,
      data: this.exerciseService.findByMuscleGroup(data.muscleGroup),
    };
  }
}
