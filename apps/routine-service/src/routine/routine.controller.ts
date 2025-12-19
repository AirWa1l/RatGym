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
import { RoutineService } from './routine.service';
import {
  CreateRoutineDto,
  UpdateRoutineDto,
  RoutineExerciseDto,
} from './dto/routine.dto';
import { RoutineCategory, RoutineDifficulty } from './interfaces/routine.interface';

@Controller('routines')
export class RoutineController {
  private readonly logger = new Logger(RoutineController.name);

  constructor(private readonly routineService: RoutineService) {}

  // ==================== REST ENDPOINTS ====================

  /**
   * GET /routines - Listar todas las rutinas (públicas)
   */
  @Get()
  findAll(@Query('search') search?: string) {
    if (search) {
      return {
        success: true,
        data: this.routineService.search(search),
      };
    }
    return {
      success: true,
      data: this.routineService.findPublic(),
    };
  }

  /**
   * GET /routines/all - Listar todas las rutinas (admin)
   */
  @Get('all')
  findAllAdmin() {
    return {
      success: true,
      data: this.routineService.findAll(),
    };
  }

  /**
   * GET /routines/:id - Obtener rutina por ID
   */
  @Get(':id')
  findById(@Param('id') id: string) {
    return {
      success: true,
      data: this.routineService.findById(id),
    };
  }

  /**
   * GET /routines/user/:userId - Obtener rutinas de un usuario
   */
  @Get('user/:userId')
  findByUserId(@Param('userId') userId: string) {
    return {
      success: true,
      data: this.routineService.findByUserId(userId),
    };
  }

  /**
   * GET /routines/user/:userId/stats - Obtener estadísticas del usuario
   */
  @Get('user/:userId/stats')
  getUserStats(@Param('userId') userId: string) {
    return {
      success: true,
      data: this.routineService.getUserStats(userId),
    };
  }

  /**
   * GET /routines/category/:category - Filtrar por categoría
   */
  @Get('category/:category')
  findByCategory(@Param('category') category: RoutineCategory) {
    return {
      success: true,
      data: this.routineService.findByCategory(category),
    };
  }

  /**
   * GET /routines/difficulty/:level - Filtrar por dificultad
   */
  @Get('difficulty/:level')
  findByDifficulty(@Param('level') level: RoutineDifficulty) {
    return {
      success: true,
      data: this.routineService.findByDifficulty(level),
    };
  }

  /**
   * POST /routines - Crear nueva rutina
   */
  @Post()
  create(@Body() createRoutineDto: CreateRoutineDto) {
    this.logger.log(`Creating routine: ${createRoutineDto.name}`);
    return {
      success: true,
      data: this.routineService.create(createRoutineDto),
      message: 'Rutina creada exitosamente',
    };
  }

  /**
   * PUT /routines/:id - Actualizar rutina
   */
  @Put(':id')
  update(@Param('id') id: string, @Body() updateRoutineDto: UpdateRoutineDto) {
    this.logger.log(`Updating routine: ${id}`);
    return {
      success: true,
      data: this.routineService.update(id, updateRoutineDto),
      message: 'Rutina actualizada exitosamente',
    };
  }

  /**
   * DELETE /routines/:id - Eliminar rutina
   */
  @Delete(':id')
  delete(@Param('id') id: string) {
    this.logger.log(`Deleting routine: ${id}`);
    this.routineService.delete(id);
    return {
      success: true,
      message: 'Rutina eliminada exitosamente',
    };
  }

  /**
   * POST /routines/:id/exercises - Agregar ejercicio a rutina
   */
  @Post(':id/exercises')
  addExercise(
    @Param('id') id: string,
    @Body() exerciseDto: RoutineExerciseDto,
  ) {
    this.logger.log(`Adding exercise to routine: ${id}`);
    return {
      success: true,
      data: this.routineService.addExercise(id, exerciseDto),
      message: 'Ejercicio agregado exitosamente',
    };
  }

  /**
   * DELETE /routines/:id/exercises/:exerciseId - Remover ejercicio de rutina
   */
  @Delete(':id/exercises/:exerciseId')
  removeExercise(
    @Param('id') id: string,
    @Param('exerciseId') exerciseId: string,
  ) {
    this.logger.log(`Removing exercise ${exerciseId} from routine: ${id}`);
    return {
      success: true,
      data: this.routineService.removeExercise(id, exerciseId),
      message: 'Ejercicio eliminado de la rutina exitosamente',
    };
  }

  /**
   * POST /routines/:id/complete - Marcar rutina como completada
   */
  @Post(':id/complete')
  completeRoutine(
    @Param('id') id: string,
    @Body() body: { userId: string },
  ) {
    this.logger.log(`Routine ${id} completed by user ${body.userId}`);
    return {
      success: true,
      data: this.routineService.completeRoutine(id, body.userId),
      message: '¡Rutina completada exitosamente!',
    };
  }

  /**
   * POST /routines/:id/duplicate - Duplicar rutina para un usuario
   */
  @Post(':id/duplicate')
  duplicateRoutine(
    @Param('id') id: string,
    @Body() body: { userId: string },
  ) {
    this.logger.log(`Duplicating routine ${id} for user ${body.userId}`);
    return {
      success: true,
      data: this.routineService.duplicate(id, body.userId),
      message: 'Rutina duplicada exitosamente',
    };
  }

  // ==================== MESSAGE PATTERNS (RabbitMQ) ====================

  /**
   * Message pattern para crear rutina (desde Saga)
   */
  @MessagePattern('routine.create')
  handleCreateRoutine(@Payload() data: CreateRoutineDto) {
    this.logger.log(`Received message: routine.create - ${data.name}`);
    try {
      const routine = this.routineService.create(data);
      return {
        success: true,
        data: routine,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Message pattern para obtener rutinas de usuario
   */
  @MessagePattern('routine.getByUser')
  handleGetByUser(@Payload() data: { userId: string }) {
    this.logger.log(`Received message: routine.getByUser - ${data.userId}`);
    return {
      success: true,
      data: this.routineService.findByUserId(data.userId),
    };
  }

  /**
   * Message pattern para agregar ejercicio a rutina
   */
  @MessagePattern('routine.addExercise')
  handleAddExercise(@Payload() data: { routineId: string; exercise: RoutineExerciseDto }) {
    this.logger.log(`Received message: routine.addExercise - ${data.routineId}`);
    try {
      const routine = this.routineService.addExercise(data.routineId, data.exercise);
      return {
        success: true,
        data: routine,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Message pattern para marcar rutina como completada
   */
  @MessagePattern('routine.complete')
  handleCompleteRoutine(@Payload() data: { routineId: string; userId: string }) {
    this.logger.log(`Received message: routine.complete - ${data.routineId}`);
    try {
      const routine = this.routineService.completeRoutine(data.routineId, data.userId);
      return {
        success: true,
        data: routine,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Message pattern para eliminar rutina (compensación de Saga)
   */
  @MessagePattern('routine.delete')
  handleDeleteRoutine(@Payload() data: { routineId: string }) {
    this.logger.log(`Received message: routine.delete - ${data.routineId}`);
    try {
      this.routineService.delete(data.routineId);
      return {
        success: true,
        message: 'Rutina eliminada',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Message pattern para obtener estadísticas de usuario
   */
  @MessagePattern('routine.getUserStats')
  handleGetUserStats(@Payload() data: { userId: string }) {
    this.logger.log(`Received message: routine.getUserStats - ${data.userId}`);
    return {
      success: true,
      data: this.routineService.getUserStats(data.userId),
    };
  }
}
