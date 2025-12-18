# 🏋️ Routine Service - RatGym

Microservicio de gestión de rutinas y ejercicios para el sistema RatGym.

## 📋 Descripción

El Routine Service es responsable de:
- Gestión de ejercicios (CRUD completo)
- Gestión de rutinas de entrenamiento
- Seguimiento de entrenamientos completados
- Estadísticas de usuario
- Comunicación asíncrona con otros microservicios via RabbitMQ

## 🚀 Inicio Rápido

### Requisitos Previos
- Node.js 18+
- RabbitMQ corriendo en `localhost:5672`
- npm o yarn

### Instalación

```bash
# Desde el directorio apps/routine-service
npm install
```

### Configuración

Copia el archivo de ejemplo y configura las variables:

```bash
cp .env.example .env
```

Variables de entorno:
```env
PORT=3002
RABBITMQ_URL=amqp://guest:guest@localhost:5672
RABBITMQ_QUEUE=routine_service_queue
USER_SERVICE_URL=http://localhost:3001
```

### Ejecución

```bash
# Desarrollo (con hot reload)
npm run start:dev

# Producción
npm run build
npm run start:prod
```

## 📡 API Endpoints

### Health Check
```bash
GET /health
```

### Ejercicios

```bash
# Listar todos los ejercicios
GET /exercises

# Buscar ejercicios
GET /exercises?search=press

# Obtener ejercicio por ID
GET /exercises/:id

# Filtrar por grupo muscular
GET /exercises/muscle/:group
# Grupos: chest, back, legs, shoulders, arms, core, full_body

# Filtrar por dificultad
GET /exercises/difficulty/:level
# Niveles: beginner, intermediate, advanced

# Filtrar por equipamiento
GET /exercises/equipment/:type
# Tipos: none, dumbbells, barbell, machine, cables, kettlebell, resistance_bands

# Crear ejercicio (admin)
POST /exercises
Content-Type: application/json
{
  "name": "Press de Banca Inclinado",
  "description": "Ejercicio para pecho superior",
  "muscleGroup": "chest",
  "difficulty": "intermediate",
  "equipment": "barbell",
  "instructions": ["Paso 1", "Paso 2"]
}
```

### Rutinas

```bash
# Listar rutinas públicas
GET /routines

# Buscar rutinas
GET /routines?search=principiante

# Obtener todas las rutinas (admin)
GET /routines/all

# Obtener rutina por ID
GET /routines/:id

# Obtener rutinas de un usuario
GET /routines/user/:userId

# Obtener estadísticas de usuario
GET /routines/user/:userId/stats

# Filtrar por categoría
GET /routines/category/:category
# Categorías: strength, cardio, flexibility, hiit, crossfit, bodybuilding

# Filtrar por dificultad
GET /routines/difficulty/:level

# Crear rutina
POST /routines
Content-Type: application/json
{
  "name": "Mi Rutina de Fuerza",
  "description": "Rutina para ganar fuerza",
  "userId": "user_123",
  "difficulty": "intermediate",
  "category": "strength",
  "estimatedDuration": 60,
  "isPublic": false,
  "exercises": [
    {
      "exerciseId": "uuid-del-ejercicio",
      "sets": 4,
      "reps": 8,
      "restTime": 90,
      "order": 1
    }
  ]
}

# Actualizar rutina
PUT /routines/:id
Content-Type: application/json
{
  "name": "Rutina Actualizada",
  "estimatedDuration": 75
}

# Eliminar rutina
DELETE /routines/:id

# Agregar ejercicio a rutina
POST /routines/:id/exercises
Content-Type: application/json
{
  "exerciseId": "uuid-del-ejercicio",
  "sets": 3,
  "reps": 12,
  "restTime": 60,
  "order": 5
}

# Remover ejercicio de rutina
DELETE /routines/:id/exercises/:exerciseId

# Marcar rutina como completada
POST /routines/:id/complete
Content-Type: application/json
{
  "userId": "user_123"
}

# Duplicar rutina
POST /routines/:id/duplicate
Content-Type: application/json
{
  "userId": "user_456"
}
```

## 📨 Message Patterns (RabbitMQ)

El servicio escucha y responde a los siguientes patrones:

| Pattern | Descripción | Payload |
|---------|-------------|---------|
| `routine.create` | Crear rutina desde Saga | `CreateRoutineDto` |
| `routine.getByUser` | Obtener rutinas de usuario | `{ userId: string }` |
| `routine.addExercise` | Agregar ejercicio a rutina | `{ routineId, exercise }` |
| `routine.complete` | Marcar rutina completada | `{ routineId, userId }` |
| `routine.delete` | Eliminar rutina (compensación) | `{ routineId: string }` |
| `routine.getUserStats` | Estadísticas de usuario | `{ userId: string }` |
| `exercise.getAll` | Listar ejercicios | - |
| `exercise.getById` | Obtener ejercicio | `{ id: string }` |
| `exercise.getByMuscleGroup` | Filtrar por músculo | `{ muscleGroup: string }` |

## 🏗️ Arquitectura

```
routine-service/
├── src/
│   ├── main.ts                 # Bootstrap de la aplicación
│   ├── app.module.ts           # Módulo principal
│   ├── exercise/
│   │   ├── exercise.module.ts
│   │   ├── exercise.controller.ts
│   │   ├── exercise.service.ts
│   │   ├── dto/
│   │   │   └── exercise.dto.ts
│   │   └── interfaces/
│   │       └── exercise.interface.ts
│   ├── routine/
│   │   ├── routine.module.ts
│   │   ├── routine.controller.ts
│   │   ├── routine.service.ts
│   │   ├── dto/
│   │   │   └── routine.dto.ts
│   │   └── interfaces/
│   │       └── routine.interface.ts
│   └── health/
│       ├── health.module.ts
│       └── health.controller.ts
├── Dockerfile
├── package.json
├── tsconfig.json
└── nest-cli.json
```

## 🧪 Ejemplos con cURL

### Crear ejercicio
```bash
curl -X POST http://localhost:3002/exercises \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Sentadilla Búlgara",
    "description": "Ejercicio unilateral para piernas",
    "muscleGroup": "legs",
    "difficulty": "intermediate",
    "equipment": "dumbbells"
  }'
```

### Crear rutina
```bash
curl -X POST http://localhost:3002/routines \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Rutina Full Body",
    "description": "Entrenamiento completo",
    "userId": "user_test",
    "difficulty": "beginner",
    "category": "strength",
    "estimatedDuration": 45,
    "exercises": []
  }'
```

### Completar rutina
```bash
curl -X POST http://localhost:3002/routines/{routineId}/complete \
  -H "Content-Type: application/json" \
  -d '{"userId": "user_test"}'
```

### Obtener estadísticas
```bash
curl http://localhost:3002/routines/user/user_test/stats
```

## 🐳 Docker

### Construir imagen
```bash
docker build -t ratgym/routine-service:latest .
```

### Ejecutar contenedor
```bash
docker run -d \
  --name routine-service \
  -p 3002:3002 \
  -e RABBITMQ_URL=amqp://rabbitmq:5672 \
  ratgym/routine-service:latest
```

## 📊 Datos de Ejemplo

El servicio incluye datos seed al iniciar:

### Ejercicios (16 ejercicios predefinidos)
- **Pecho**: Press de Banca, Flexiones, Aperturas
- **Espalda**: Dominadas, Remo con Barra, Jalón al Pecho
- **Piernas**: Sentadilla, Peso Muerto, Zancadas
- **Hombros**: Press Militar, Elevaciones Laterales
- **Brazos**: Curl de Bíceps, Fondos, Press Francés
- **Core**: Plancha, Crunches Abdominales

### Rutinas (4 rutinas de ejemplo)
1. **Rutina Principiante - Cuerpo Completo** (beginner, 45 min)
2. **Rutina Intermedia - Push/Pull** (intermediate, 60 min)
3. **Rutina Avanzada - Fuerza Total** (advanced, 90 min)
4. **Core Destroyer** (intermediate, 30 min)

## 🔗 Integración con otros servicios

### User Service
- Validación de usuarios
- Obtención de perfiles

### Saga Orchestrator
- Transacciones distribuidas para creación de rutinas
- Compensación en caso de fallos

### Notification Service (futuro)
- Notificaciones de entrenamientos completados
- Recordatorios de rutinas

## 📝 Tecnologías

- **Framework**: NestJS 10
- **Lenguaje**: TypeScript 5.3
- **Message Broker**: RabbitMQ
- **Validación**: class-validator, class-transformer
- **Almacenamiento**: In-memory (Map) - extensible a base de datos

## 🛡️ Health Check

El endpoint `/health` devuelve:

```json
{
  "status": "ok",
  "service": "routine-service",
  "timestamp": "2024-12-18T10:30:00.000Z",
  "uptime": 3600,
  "memory": {
    "heapUsed": 50000000,
    "heapTotal": 100000000
  }
}
```

---

**Puerto**: 3002  
**Cola RabbitMQ**: routine_service_queue  
**Equipo**: PC
