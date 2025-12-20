# 🎭 Saga Orchestrator - RatGym

Orquestador de transacciones distribuidas para el ecosistema RatGym.

## 🎯 Propósito

Coordina operaciones complejas que involucran múltiples servicios, garantizando consistencia eventual mediante el patrón Saga.

## ✨ Características

- ✅ **Transacciones Distribuidas**: Coordina operaciones across múltiples servicios
- ✅ **Compensación Automática**: Rollback automático cuando algo falla
- ✅ **Múltiples Sagas**: User Onboarding, Class Booking, Routine Assignment
- ✅ **Reintentos**: Capacidad de reintentar sagas fallidos
- ✅ **Observabilidad**: Logs detallados de cada paso
- ✅ **HTTP + RabbitMQ**: Comunicación síncrona y asíncrona

## 🚀 Instalación y Ejecución

### Prerrequisitos
- Node.js 18+
- RabbitMQ corriendo
- Servicios de RatGym (user, routine, nutrition, class, notification)

### Desarrollo Local

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env

# Iniciar en modo desarrollo
npm run start:dev
```

El servicio estará disponible en: **http://localhost:3005**

### Producción

```bash
# Build
npm run build

# Iniciar
npm run start:prod
```

### Docker

```bash
# Build image
docker build -t ratgym/saga-orchestrator .

# Run
docker run -p 3005:3005 \
  -e RABBITMQ_URL=amqp://rabbitmq:5672 \
  ratgym/saga-orchestrator
```

## 📋 Sagas Disponibles

### 1. User Registration
Registro simple de usuario + notificación.

```bash
POST /saga/user-registration
{
  "username": "juan.perez",
  "email": "juan@example.com"
}
```

### 2. User Onboarding ⭐
Onboarding completo: usuario + nutrición + rutina.

```bash
POST /saga/user-onboarding
{
  "username": "maria.garcia",
  "email": "maria@example.com",
  "weight": 65,
  "height": 168,
  "age": 28,
  "objective": "LOSE_WEIGHT",
  "fitnessLevel": "intermedio"
}
```

### 3. Class Booking
Reserva de clase + notificación.

```bash
POST /saga/class-booking
{
  "userId": "user-123",
  "userName": "Juan Pérez",
  "classId": "class-456",
  "className": "Yoga Matutino"
}
```

### 4. Routine Assignment
Asignación de rutina + notificación.

```bash
POST /saga/routine-assignment
{
  "userId": "user-123",
  "routineName": "Full Body",
  "difficulty": "intermedio",
  "category": "fuerza"
}
```

## 🔍 Endpoints de Consulta

```bash
# Estado de un saga
GET /saga/status/:sagaId

# Listar todos
GET /saga/all

# Filtrar por tipo
GET /saga/all?type=USER_ONBOARDING

# Filtrar por estado
GET /saga/all?status=COMPLETED

# Reintentar fallido
POST /saga/retry/:sagaId

# Limpiar antiguos
POST /saga/cleanup
{ "hoursOld": 24 }

# Health check
GET /saga/health
```

## 🔧 Configuración

### Variables de Entorno

```env
PORT=3005
RABBITMQ_URL=amqp://guest:guest@localhost:5672

# Service Queues
USER_SERVICE_QUEUE=user_service_queue
ROUTINE_SERVICE_QUEUE=routine_service_queue
NUTRITION_SERVICE_QUEUE=nutrition_service_queue
CLASS_SERVICE_QUEUE=class_service_queue
NOTIFICATION_SERVICE_QUEUE=notifications_queue
```

## 📊 Estados de Saga

| Estado | Descripción |
|--------|-------------|
| `PENDING` | Creado, no iniciado |
| `IN_PROGRESS` | Ejecutando pasos |
| `COMPLETED` | Exitoso |
| `FAILED` | Falló algún paso |
| `COMPENSATING` | Ejecutando rollback |
| `COMPENSATED` | Rollback completado |

## 🧪 Testing

```bash
# Prueba rápida
curl -X POST http://localhost:3005/saga/user-registration \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@test.com"}'

# Ver estado
curl http://localhost:3005/saga/all
```

## 📚 Documentación Completa

Ver [docs/sagas.md](../../docs/sagas.md) para documentación detallada sobre:
- Arquitectura del patrón Saga
- Flujo de compensación
- Ejemplos de uso
- Mejores prácticas

## 🛠️ Estructura del Proyecto

```
src/
├── app.module.ts          # Módulo principal con ClientsModule
├── main.ts                # Bootstrap de la aplicación
└── saga/
    ├── saga.module.ts     # Módulo de sagas
    ├── saga.controller.ts # Endpoints HTTP y MessagePatterns
    ├── saga.service.ts    # Lógica de orquestación
    └── types/
        └── saga.types.ts  # Definiciones de tipos
```

## 🔗 Integraciones

El Saga Orchestrator se comunica con:
- **user-service**: Gestión de usuarios
- **routine-service**: Rutinas de entrenamiento  
- **nutrition-service**: Planes nutricionales
- **class-service**: Reservas de clases
- **notification-service**: Notificaciones

## ⚡ Performance

- **Timeout por paso**: 5 segundos (configurable)
- **Memoria**: 256Mi request, 512Mi limit
- **CPU**: 250m request, 500m limit
- **Replicas**: 1 (puede escalar horizontalmente)

## 📝 Logs

Cada saga genera logs estructurados:

```
[SAGA 550e8400] Started USER_ONBOARDING
[SAGA 550e8400] Step 1/4: REGISTER_USER
[SAGA 550e8400] ✓ REGISTER_USER completed
[SAGA 550e8400] Step 2/4: CREATE_NUTRITION_PLAN
[SAGA 550e8400] ✓ CREATE_NUTRITION_PLAN completed
[SAGA 550e8400] ✓ Completed successfully
```

## 🐛 Troubleshooting

### Saga se queda en PENDING
- Verificar que RabbitMQ está corriendo
- Verificar conectividad con servicios

### Compensación falla
- Revisar logs del servicio específico
- Los servicios deben implementar acciones de compensación

### Timeout frecuente
- Ajustar timeout en saga.service.ts
- Verificar performance de servicios downstream

## 🚢 Deployment

Ver [infra/k8s/deployments/saga-orchestrator.yaml](../../infra/k8s/deployments/saga-orchestrator.yaml)

```bash
kubectl apply -f infra/k8s/deployments/saga-orchestrator.yaml
```

## 🤝 Contribuir

Al agregar nuevos sagas:
1. Define el tipo en `saga.types.ts`
2. Implementa el método en `saga.service.ts`
3. Agrega endpoint en `saga.controller.ts`
4. Documenta en `docs/sagas.md`

## 📄 Licencia

MIT
