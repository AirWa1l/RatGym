import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import {
  Class,
  Booking,
  ClassCategory,
  ClassDifficulty,
  ClassStatus,
  UserBookingStats,
} from './interfaces/class.interface';
import {
  CreateClassDto,
  UpdateClassDto,
  BookClassDto,
  CancelBookingDto,
  MarkAttendanceDto,
} from './dto/class.dto';

@Injectable()
export class ClassService {
  private readonly logger = new Logger(ClassService.name);
  private classes: Map<string, Class> = new Map();
  private bookings: Map<string, Booking> = new Map();

  constructor() {
    this.seedClasses();
  }

  /**
   * Seed de clases de ejemplo
   */
  private seedClasses(): void {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const seedData: Array<Omit<Class, 'id' | 'currentBookings' | 'createdAt' | 'updatedAt'>> = [
      {
        name: 'Yoga Matutino',
        description: 'Clase de yoga para comenzar el día con energía. Nivel principiante.',
        instructor: 'María González',
        category: ClassCategory.YOGA,
        difficulty: ClassDifficulty.PRINCIPIANTE,
        duration: 60,
        capacity: 15,
        date: today,
        startTime: '07:00',
        endTime: '08:00',
        status: ClassStatus.SCHEDULED,
        imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b',
      },
      {
        name: 'Spinning Intenso',
        description: 'Sesión de spinning de alta intensidad. Quemar calorías al máximo.',
        instructor: 'Carlos Ruiz',
        category: ClassCategory.SPINNING,
        difficulty: ClassDifficulty.AVANZADO,
        duration: 45,
        capacity: 20,
        date: today,
        startTime: '09:00',
        endTime: '09:45',
        status: ClassStatus.SCHEDULED,
        imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48',
      },
      {
        name: 'CrossFit WOD',
        description: 'Workout of the Day - Entrenamiento funcional de alta intensidad.',
        instructor: 'Pedro Martínez',
        category: ClassCategory.CROSSFIT,
        difficulty: ClassDifficulty.INTERMEDIO,
        duration: 60,
        capacity: 12,
        date: today,
        startTime: '18:00',
        endTime: '19:00',
        status: ClassStatus.SCHEDULED,
        imageUrl: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438',
      },
      {
        name: 'Pilates Reformer',
        description: 'Clase de pilates con reformer para fortalecer el core.',
        instructor: 'Ana López',
        category: ClassCategory.PILATES,
        difficulty: ClassDifficulty.INTERMEDIO,
        duration: 50,
        capacity: 10,
        date: today,
        startTime: '10:00',
        endTime: '10:50',
        status: ClassStatus.SCHEDULED,
        imageUrl: 'https://images.unsplash.com/photo-1518611012118-696072aa579a',
      },
      {
        name: 'Zumba Party',
        description: 'Baila y quema calorías con ritmos latinos. Diversión garantizada.',
        instructor: 'Sofía Ramírez',
        category: ClassCategory.ZUMBA,
        difficulty: ClassDifficulty.PRINCIPIANTE,
        duration: 60,
        capacity: 25,
        date: today,
        startTime: '19:00',
        endTime: '20:00',
        status: ClassStatus.SCHEDULED,
        imageUrl: 'https://images.unsplash.com/photo-1518611012118-696072aa579a',
      },
      {
        name: 'Boxing Técnico',
        description: 'Entrenamiento de boxeo enfocado en técnica y acondicionamiento.',
        instructor: 'Miguel Torres',
        category: ClassCategory.BOXING,
        difficulty: ClassDifficulty.INTERMEDIO,
        duration: 60,
        capacity: 15,
        date: tomorrow,
        startTime: '17:00',
        endTime: '18:00',
        status: ClassStatus.SCHEDULED,
        imageUrl: 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed',
      },
      {
        name: 'HIIT Express',
        description: 'Entrenamiento de alta intensidad en intervalos. 30 minutos de poder.',
        instructor: 'Laura Fernández',
        category: ClassCategory.HIIT,
        difficulty: ClassDifficulty.AVANZADO,
        duration: 30,
        capacity: 20,
        date: tomorrow,
        startTime: '12:00',
        endTime: '12:30',
        status: ClassStatus.SCHEDULED,
        imageUrl: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b',
      },
      {
        name: 'Entrenamiento Funcional',
        description: 'Ejercicios funcionales para mejorar tu día a día.',
        instructor: 'Roberto Díaz',
        category: ClassCategory.FUNCIONAL,
        difficulty: ClassDifficulty.PRINCIPIANTE,
        duration: 45,
        capacity: 18,
        date: tomorrow,
        startTime: '08:00',
        endTime: '08:45',
        status: ClassStatus.SCHEDULED,
        imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b',
      },
    ];

    seedData.forEach((classData) => {
      const newClass: Class = {
        id: uuidv4(),
        ...classData,
        currentBookings: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.classes.set(newClass.id, newClass);
    });

    this.logger.log(`Seeded ${this.classes.size} classes`);
  }

  /**
   * Calcular hora de fin basada en hora de inicio y duración
   */
  private calculateEndTime(startTime: string, duration: number): string {
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + duration;
    const endHours = Math.floor(totalMinutes / 60) % 24;
    const endMinutes = totalMinutes % 60;
    return `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
  }

  /**
   * Crear una nueva clase
   */
  create(createClassDto: CreateClassDto): Class {
    const endTime = this.calculateEndTime(createClassDto.startTime, createClassDto.duration);
    
    const newClass: Class = {
      id: uuidv4(),
      ...createClassDto,
      date: new Date(createClassDto.date),
      endTime,
      currentBookings: 0,
      status: ClassStatus.SCHEDULED,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.classes.set(newClass.id, newClass);
    this.logger.log(`Created class: ${newClass.name} (${newClass.id})`);

    return newClass;
  }

  /**
   * Obtener todas las clases con filtros opcionales
   */
  findAll(filters?: {
    category?: ClassCategory;
    difficulty?: ClassDifficulty;
    instructor?: string;
    status?: ClassStatus;
    date?: string;
  }): Class[] {
    let classes = Array.from(this.classes.values());

    if (filters) {
      if (filters.category) {
        classes = classes.filter((c) => c.category === filters.category);
      }
      if (filters.difficulty) {
        classes = classes.filter((c) => c.difficulty === filters.difficulty);
      }
      if (filters.instructor) {
        classes = classes.filter((c) =>
          c.instructor.toLowerCase().includes(filters.instructor.toLowerCase()),
        );
      }
      if (filters.status) {
        classes = classes.filter((c) => c.status === filters.status);
      }
      if (filters.date) {
        const filterDate = new Date(filters.date).toDateString();
        classes = classes.filter((c) => c.date.toDateString() === filterDate);
      }
    }

    // Ordenar por fecha y hora
    return classes.sort((a, b) => {
      const dateCompare = a.date.getTime() - b.date.getTime();
      if (dateCompare !== 0) return dateCompare;
      return a.startTime.localeCompare(b.startTime);
    });
  }

  /**
   * Obtener una clase por ID
   */
  findOne(id: string): Class {
    const classItem = this.classes.get(id);
    if (!classItem) {
      throw new NotFoundException(`Class with ID ${id} not found`);
    }
    return classItem;
  }

  /**
   * Obtener clases por fecha
   */
  findByDate(date: string): Class[] {
    const targetDate = new Date(date).toDateString();
    return Array.from(this.classes.values())
      .filter((c) => c.date.toDateString() === targetDate)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }

  /**
   * Obtener clases por instructor
   */
  findByInstructor(instructor: string): Class[] {
    return Array.from(this.classes.values())
      .filter((c) => c.instructor.toLowerCase().includes(instructor.toLowerCase()))
      .sort((a, b) => {
        const dateCompare = a.date.getTime() - b.date.getTime();
        if (dateCompare !== 0) return dateCompare;
        return a.startTime.localeCompare(b.startTime);
      });
  }

  /**
   * Actualizar una clase
   */
  update(id: string, updateClassDto: UpdateClassDto): Class {
    const classItem = this.findOne(id);

    const updatedClass: Class = {
      ...classItem,
      ...updateClassDto,
      ...(updateClassDto.date && { date: new Date(updateClassDto.date) }),
      ...(updateClassDto.startTime &&
        updateClassDto.duration && {
          endTime: this.calculateEndTime(updateClassDto.startTime, updateClassDto.duration),
        }),
      ...(updateClassDto.startTime &&
        !updateClassDto.duration && {
          endTime: this.calculateEndTime(updateClassDto.startTime, classItem.duration),
        }),
      updatedAt: new Date(),
    };

    this.classes.set(id, updatedClass);
    this.logger.log(`Updated class: ${id}`);

    return updatedClass;
  }

  /**
   * Eliminar una clase
   */
  remove(id: string): void {
    const classItem = this.findOne(id);

    // Eliminar todas las reservas asociadas
    const classBookings = this.findBookingsByClass(id);
    classBookings.forEach((booking) => {
      this.bookings.delete(booking.id);
    });

    this.classes.delete(id);
    this.logger.log(`Deleted class: ${id} and ${classBookings.length} bookings`);
  }

  /**
   * Reservar una clase
   */
  bookClass(classId: string, bookClassDto: BookClassDto): Booking {
    const classItem = this.findOne(classId);

    // Verificar si la clase está llena
    if (classItem.currentBookings >= classItem.capacity) {
      throw new BadRequestException('Class is full');
    }

    // Verificar si el usuario ya tiene una reserva
    const existingBooking = Array.from(this.bookings.values()).find(
      (b) => b.classId === classId && b.userId === bookClassDto.userId && !b.cancelledAt,
    );

    if (existingBooking) {
      throw new BadRequestException('User already has a booking for this class');
    }

    // Verificar si la clase ya pasó
    const classDateTime = new Date(classItem.date);
    const [hours, minutes] = classItem.startTime.split(':').map(Number);
    classDateTime.setHours(hours, minutes);

    if (classDateTime < new Date()) {
      throw new BadRequestException('Cannot book a class that has already started or passed');
    }

    const booking: Booking = {
      id: uuidv4(),
      classId,
      userId: bookClassDto.userId,
      userName: bookClassDto.userName,
      bookedAt: new Date(),
      attended: false,
    };

    this.bookings.set(booking.id, booking);

    // Actualizar contador de reservas
    classItem.currentBookings += 1;
    classItem.updatedAt = new Date();
    this.classes.set(classId, classItem);

    this.logger.log(`User ${bookClassDto.userId} booked class ${classId}`);

    return booking;
  }

  /**
   * Cancelar una reserva
   */
  cancelBooking(classId: string, cancelBookingDto: CancelBookingDto): void {
    const classItem = this.findOne(classId);

    const booking = Array.from(this.bookings.values()).find(
      (b) => b.classId === classId && b.userId === cancelBookingDto.userId && !b.cancelledAt,
    );

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    booking.cancelledAt = new Date();
    this.bookings.set(booking.id, booking);

    // Actualizar contador de reservas
    classItem.currentBookings = Math.max(0, classItem.currentBookings - 1);
    classItem.updatedAt = new Date();
    this.classes.set(classId, classItem);

    this.logger.log(`User ${cancelBookingDto.userId} cancelled booking for class ${classId}`);
  }

  /**
   * Obtener todas las reservas de una clase
   */
  findBookingsByClass(classId: string): Booking[] {
    this.findOne(classId); // Verificar que la clase existe

    return Array.from(this.bookings.values())
      .filter((b) => b.classId === classId && !b.cancelledAt)
      .sort((a, b) => a.bookedAt.getTime() - b.bookedAt.getTime());
  }

  /**
   * Obtener todas las reservas de un usuario
   */
  findBookingsByUser(userId: string): Array<Booking & { class: Class }> {
    const userBookings = Array.from(this.bookings.values())
      .filter((b) => b.userId === userId && !b.cancelledAt)
      .sort((a, b) => b.bookedAt.getTime() - a.bookedAt.getTime());

    return userBookings.map((booking) => ({
      ...booking,
      class: this.findOne(booking.classId),
    }));
  }

  /**
   * Marcar asistencia a una clase
   */
  markAttendance(classId: string, markAttendanceDto: MarkAttendanceDto): Booking {
    this.findOne(classId); // Verificar que la clase existe

    const booking = Array.from(this.bookings.values()).find(
      (b) => b.classId === classId && b.userId === markAttendanceDto.userId && !b.cancelledAt,
    );

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    booking.attended = markAttendanceDto.attended;
    this.bookings.set(booking.id, booking);

    this.logger.log(
      `Marked attendance for user ${markAttendanceDto.userId} in class ${classId}: ${markAttendanceDto.attended}`,
    );

    return booking;
  }

  /**
   * Obtener estadísticas de un usuario
   */
  getUserStats(userId: string): UserBookingStats {
    const userBookings = Array.from(this.bookings.values()).filter((b) => b.userId === userId);

    const totalBookings = userBookings.filter((b) => !b.cancelledAt).length;
    const totalAttended = userBookings.filter((b) => b.attended).length;
    const totalCancelled = userBookings.filter((b) => b.cancelledAt).length;

    // Calcular categoría favorita
    const categoryCount = new Map<string, number>();
    userBookings
      .filter((b) => !b.cancelledAt)
      .forEach((booking) => {
        const classItem = this.classes.get(booking.classId);
        if (classItem) {
          const count = categoryCount.get(classItem.category) || 0;
          categoryCount.set(classItem.category, count + 1);
        }
      });

    let favoriteCategory = 'Ninguna';
    let maxCount = 0;
    categoryCount.forEach((count, category) => {
      if (count > maxCount) {
        maxCount = count;
        favoriteCategory = category;
      }
    });

    // Contar clases próximas
    const now = new Date();
    const upcomingClasses = userBookings.filter((booking) => {
      if (booking.cancelledAt) return false;
      const classItem = this.classes.get(booking.classId);
      if (!classItem) return false;
      const classDateTime = new Date(classItem.date);
      const [hours, minutes] = classItem.startTime.split(':').map(Number);
      classDateTime.setHours(hours, minutes);
      return classDateTime > now;
    }).length;

    return {
      totalBookings,
      totalAttended,
      totalCancelled,
      favoriteCategory,
      upcomingClasses,
    };
  }

  /**
   * Obtener clases disponibles del día (con cupos disponibles)
   */
  getAvailableClassesToday(): Class[] {
    const today = new Date().toDateString();
    return Array.from(this.classes.values())
      .filter(
        (c) =>
          c.date.toDateString() === today &&
          c.currentBookings < c.capacity &&
          c.status === ClassStatus.SCHEDULED,
      )
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }
}
