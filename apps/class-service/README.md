# Class Service

Microservicio para la gestión de clases grupales y reservas en RatGym.

## Características

- Gestión de clases grupales (crear, actualizar, eliminar)
- Sistema de reservas con capacidad limitada
- Calendario de clases
- Seguimiento de asistencia
- Filtrado por categoría, instructor y fecha
- Estadísticas de uso

## Endpoints

### Clases

- `GET /classes` - Obtener todas las clases
- `GET /classes/:id` - Obtener una clase específica
- `POST /classes` - Crear una nueva clase
- `PUT /classes/:id` - Actualizar una clase
- `DELETE /classes/:id` - Eliminar una clase
- `GET /classes/date/:date` - Obtener clases por fecha
- `GET /classes/instructor/:instructor` - Obtener clases por instructor

### Reservas

- `GET /classes/:classId/bookings` - Obtener todas las reservas de una clase
- `POST /classes/:classId/book` - Reservar una clase
- `DELETE /classes/:classId/cancel` - Cancelar una reserva
- `GET /classes/user/:userId/bookings` - Obtener todas las reservas de un usuario

## Tecnologías

- NestJS
- TypeScript
- Class-validator & Class-transformer

## Configuración

1. Copiar `.env.example` a `.env`
2. Configurar variables de entorno
3. Instalar dependencias: `npm install`
4. Ejecutar: `npm run start:dev`
