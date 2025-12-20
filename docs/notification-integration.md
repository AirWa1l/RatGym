# 🔔 Integración Notification Service - RatGym

## Resumen de la Integración

Se ha completado la integración del **notification-service** con los principales servicios de RatGym:

- ✅ **Class Service** - Notificaciones de clases y reservas
- ✅ **Nutrition Service** - Notificaciones de planes nutricionales
- ✅ **Routine Service** - Notificaciones de rutinas y entrenamientos

## Arquitectura de Mensajería

```
┌─────────────────┐
│  Class Service  │──┐
└─────────────────┘  │
                     │
┌─────────────────┐  │    ┌──────────┐    ┌──────────────────┐
│Nutrition Service│──┼───▶│ RabbitMQ │───▶│Notification      │
└─────────────────┘  │    └──────────┘    │Service           │
                     │                     └──────────────────┘
┌─────────────────┐  │
│ Routine Service │──┘
└─────────────────┘
```

Cada servicio:
1. Emite eventos a RabbitMQ cuando ocurren acciones importantes
2. Los eventos se publican en exchanges específicos (`classes`, `nutrition`, `routines`)
3. Notification-service consume los eventos y crea notificaciones personalizadas

## Eventos Implementados

### 📚 Class Service

#### `class.scheduled`
Emitido cuando se programa una nueva clase.
```json
{
  "type": "class.scheduled",
  "data": {
    "class_id": "uuid",
    "class_name": "Yoga Matutino",
    "instructor": "María González",
    "date": "2025-12-19",
    "start_time": "07:00",
    "duration": 60,
    "category": "YOGA"
  }
}
```

#### `class.booked`
Emitido cuando un usuario reserva una clase.
```json
{
  "type": "class.booked",
  "data": {
    "user_id": "user-123",
    "user_name": "Juan Pérez",
    "class_id": "class-456",
    "class_name": "CrossFit WOD",
    "instructor": "Pedro Martínez",
    "date": "2025-12-20",
    "start_time": "18:00",
    "category": "CROSSFIT"
  }
}
```
**Notificación generada:**
> "Has reservado tu lugar en la clase de CrossFit WOD con Pedro Martínez el 2025-12-20 a las 18:00. ¡Te esperamos!"

#### `class.cancelled`
Emitido cuando un usuario cancela una reserva.
```json
{
  "type": "class.cancelled",
  "data": {
    "user_id": "user-123",
    "class_id": "class-456",
    "class_name": "Spinning Intenso",
    "date": "2025-12-21",
    "start_time": "09:00"
  }
}
```

#### `class.attended`
Emitido cuando se confirma la asistencia de un usuario.
```json
{
  "type": "class.attended",
  "data": {
    "user_id": "user-123",
    "class_id": "class-456",
    "class_name": "HIIT Express",
    "instructor": "Laura Fernández",
    "category": "HIIT",
    "date": "2025-12-19"
  }
}
```
**Notificación generada:**
> "Excelente trabajo en la clase de HIIT Express con Laura Fernández. Sigue así!"

### 🥗 Nutrition Service

#### `nutrition.plan_created`
Emitido cuando se crea un plan nutricional para un usuario.
```json
{
  "type": "nutrition.plan_created",
  "data": {
    "user_id": "user-123",
    "calories": 2200,
    "protein": 165,
    "carbs": 220,
    "fat": 61,
    "objective": "GAIN_MUSCLE",
    "weight": 75,
    "height": 175,
    "age": 28
  }
}
```
**Notificación generada:**
> "Tu plan nutricional está listo: 2200 calorías diarias (165g proteína, 220g carbohidratos, 61g grasas). Objetivo: ganar músculo. ¡A comer saludable!"

### 💪 Routine Service

#### `routine.created`
Emitido cuando se crea una rutina para un usuario.
```json
{
  "type": "routine.created",
  "data": {
    "user_id": "user-123",
    "routine_id": "routine-789",
    "routine_name": "Rutina Full Body",
    "difficulty": "intermedio",
    "category": "fuerza",
    "duration_minutes": 60,
    "exercises_count": 8
  }
}
```
**Notificación generada:**
> "Se ha creado tu rutina 'Rutina Full Body' (intermedio) con 8 ejercicios. Duración estimada: 60 minutos. ¡Es hora de entrenar!"

#### `routine.completed`
Emitido cuando un usuario completa una rutina.
```json
{
  "type": "routine.completed",
  "data": {
    "user_id": "user-123",
    "routine_id": "routine-789",
    "routine_name": "Rutina Full Body",
    "difficulty": "intermedio",
    "category": "fuerza",
    "times_completed": 5,
    "exercises_count": 8
  }
}
```
**Notificación generada:**
> "Excelente trabajo completando la rutina 'Rutina Full Body'. Has completado esta rutina 5 veces. ¡Sigue así!"

## Archivos Modificados/Creados

### Class Service
- ✅ `src/rabbitmq/rabbitmq.service.ts` - Servicio de RabbitMQ
- ✅ `src/rabbitmq/rabbitmq.module.ts` - Módulo de RabbitMQ
- ✅ `src/app.module.ts` - Importar RabbitMQModule
- ✅ `src/class/class.service.ts` - Emitir eventos en create, bookClass, cancelBooking, markAttendance
- ✅ `.env.example` - Variable RABBITMQ_URL

### Nutrition Service
- ✅ `backend/src/rabbitmq/rabbitmq.service.ts` - Servicio de RabbitMQ
- ✅ `backend/src/rabbitmq/rabbitmq.module.ts` - Módulo de RabbitMQ
- ✅ `backend/src/app.module.ts` - Importar ConfigModule y RabbitMQModule
- ✅ `backend/src/nutrition/nutrition.service.ts` - Emitir evento en calculatePlan
- ✅ `backend/.env.example` - Variable RABBITMQ_URL

### Routine Service
- ✅ `src/rabbitmq/rabbitmq.service.ts` - Servicio de RabbitMQ
- ✅ `src/rabbitmq/rabbitmq.module.ts` - Módulo de RabbitMQ
- ✅ `src/app.module.ts` - Importar RabbitMQModule
- ✅ `src/routine/routine.service.ts` - Emitir eventos en create y completeRoutine

### Notification Service
- ✅ `src/domain/event_handlers.py` - Actualizado para manejar todos los eventos

## Pruebas

### Script de Prueba Automático
Se incluye un script `test_integration.py` que emite eventos de prueba para validar la integración:

```bash
cd apps/notification-service
python test_integration.py
```

### Prueba Manual

1. **Iniciar RabbitMQ**
```bash
docker run -d --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:3-management
```

2. **Iniciar Notification Service**
```bash
cd apps/notification-service
uvicorn src.main:app --host 0.0.0.0 --port 3006 --reload
```

3. **Iniciar otros servicios** (class, nutrition, routine)
```bash
# Class Service
cd apps/class-service
npm run start:dev

# Nutrition Service
cd apps/nutrition-service/backend
npm run start:dev

# Routine Service
cd apps/routine-service
npm run start:dev
```

4. **Realizar acciones que generen eventos**
   - Reservar una clase en class-service
   - Crear un plan nutricional en nutrition-service
   - Crear o completar una rutina en routine-service

5. **Verificar notificaciones creadas**
```bash
GET http://localhost:3006/notifications/user/{user_id}
```

## Configuración Requerida

Todos los servicios necesitan la variable de entorno:
```env
RABBITMQ_URL=amqp://guest:guest@localhost:5672/
```

## Tipos de Notificación

- `CLASS_SCHEDULED` - Nueva clase disponible
- `CLASS_BOOKED` - Reserva confirmada
- `CLASS_CANCELLED` - Reserva cancelada
- `CLASS_ATTENDED` - Asistencia registrada
- `NUTRITION_PLAN` - Plan nutricional creado
- `ROUTINE_ASSIGNED` - Nueva rutina asignada
- `ROUTINE_COMPLETED` - Rutina completada

## Prioridades

- **HIGH**: Reservas confirmadas, nuevas rutinas, planes nutricionales
- **MEDIUM**: Rutinas completadas, asistencias, cancelaciones
- **LOW**: Información general

## Próximos Pasos

- [ ] Agregar notificaciones de recordatorio 24h antes de clases reservadas
- [ ] Implementar notificaciones push (Firebase/OneSignal)
- [ ] Agregar preferencias de notificación por usuario
- [ ] Implementar notificaciones de logros y badges
- [ ] Agregar soporte para notificaciones por email
