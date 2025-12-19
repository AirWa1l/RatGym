import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ClassService } from './class.service';
import {
  CreateClassDto,
  UpdateClassDto,
  BookClassDto,
  CancelBookingDto,
  MarkAttendanceDto,
} from './dto/class.dto';
import { ClassCategory, ClassDifficulty, ClassStatus } from './interfaces/class.interface';

@Controller('classes')
export class ClassController {
  private readonly logger = new Logger(ClassController.name);

  constructor(private readonly classService: ClassService) {}

  /**
   * Crear una nueva clase
   */
  @Post()
  create(@Body() createClassDto: CreateClassDto) {
    this.logger.log(`Creating class: ${createClassDto.name}`);
    const newClass = this.classService.create(createClassDto);
    return {
      success: true,
      message: 'Class created successfully',
      data: newClass,
    };
  }

  /**
   * Obtener todas las clases con filtros opcionales
   */
  @Get()
  findAll(
    @Query('category') category?: ClassCategory,
    @Query('difficulty') difficulty?: ClassDifficulty,
    @Query('instructor') instructor?: string,
    @Query('status') status?: ClassStatus,
    @Query('date') date?: string,
  ) {
    const filters = { category, difficulty, instructor, status, date };
    const classes = this.classService.findAll(filters);
    return {
      success: true,
      message: 'Classes retrieved successfully',
      data: classes,
      count: classes.length,
    };
  }

  /**
   * Obtener clases disponibles del día
   */
  @Get('available/today')
  getAvailableToday() {
    const classes = this.classService.getAvailableClassesToday();
    return {
      success: true,
      message: 'Available classes today retrieved successfully',
      data: classes,
      count: classes.length,
    };
  }

  /**
   * Obtener clases por fecha
   */
  @Get('date/:date')
  findByDate(@Param('date') date: string) {
    const classes = this.classService.findByDate(date);
    return {
      success: true,
      message: 'Classes by date retrieved successfully',
      data: classes,
      count: classes.length,
    };
  }

  /**
   * Obtener clases por instructor
   */
  @Get('instructor/:instructor')
  findByInstructor(@Param('instructor') instructor: string) {
    const classes = this.classService.findByInstructor(instructor);
    return {
      success: true,
      message: 'Classes by instructor retrieved successfully',
      data: classes,
      count: classes.length,
    };
  }

  /**
   * Obtener reservas de un usuario
   */
  @Get('user/:userId/bookings')
  getUserBookings(@Param('userId') userId: string) {
    const bookings = this.classService.findBookingsByUser(userId);
    return {
      success: true,
      message: 'User bookings retrieved successfully',
      data: bookings,
      count: bookings.length,
    };
  }

  /**
   * Obtener estadísticas de un usuario
   */
  @Get('user/:userId/stats')
  getUserStats(@Param('userId') userId: string) {
    const stats = this.classService.getUserStats(userId);
    return {
      success: true,
      message: 'User stats retrieved successfully',
      data: stats,
    };
  }

  /**
   * Obtener una clase específica
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    const classItem = this.classService.findOne(id);
    return {
      success: true,
      message: 'Class retrieved successfully',
      data: classItem,
    };
  }

  /**
   * Obtener reservas de una clase
   */
  @Get(':id/bookings')
  getClassBookings(@Param('id') id: string) {
    const bookings = this.classService.findBookingsByClass(id);
    return {
      success: true,
      message: 'Class bookings retrieved successfully',
      data: bookings,
      count: bookings.length,
    };
  }

  /**
   * Reservar una clase
   */
  @Post(':id/book')
  bookClass(@Param('id') id: string, @Body() bookClassDto: BookClassDto) {
    this.logger.log(`User ${bookClassDto.userId} booking class ${id}`);
    const booking = this.classService.bookClass(id, bookClassDto);
    return {
      success: true,
      message: 'Class booked successfully',
      data: booking,
    };
  }

  /**
   * Cancelar una reserva
   */
  @Delete(':id/cancel')
  @HttpCode(HttpStatus.OK)
  cancelBooking(@Param('id') id: string, @Body() cancelBookingDto: CancelBookingDto) {
    this.logger.log(`User ${cancelBookingDto.userId} cancelling booking for class ${id}`);
    this.classService.cancelBooking(id, cancelBookingDto);
    return {
      success: true,
      message: 'Booking cancelled successfully',
    };
  }

  /**
   * Marcar asistencia
   */
  @Post(':id/attendance')
  markAttendance(@Param('id') id: string, @Body() markAttendanceDto: MarkAttendanceDto) {
    const booking = this.classService.markAttendance(id, markAttendanceDto);
    return {
      success: true,
      message: 'Attendance marked successfully',
      data: booking,
    };
  }

  /**
   * Actualizar una clase
   */
  @Put(':id')
  update(@Param('id') id: string, @Body() updateClassDto: UpdateClassDto) {
    this.logger.log(`Updating class ${id}`);
    const updatedClass = this.classService.update(id, updateClassDto);
    return {
      success: true,
      message: 'Class updated successfully',
      data: updatedClass,
    };
  }

  /**
   * Eliminar una clase
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id') id: string) {
    this.logger.log(`Deleting class ${id}`);
    this.classService.remove(id);
    return {
      success: true,
      message: 'Class deleted successfully',
    };
  }
}
