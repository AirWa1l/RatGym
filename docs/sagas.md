# 🎭 Saga Orchestrator - RatGym

Orquestador de transacciones distribuidas usando el patrón Saga para mantener la consistencia de datos entre microservicios.

## 📚 ¿Qué es un Saga?

Un **Saga** es un patrón de diseño para manejar transacciones distribuidas en arquitecturas de microservicios. En lugar de una única transacción ACID, un saga coordina una secuencia de transacciones locales. Si algo falla, ejecuta **compensaciones** (rollback) para deshacer los cambios.

### Ventajas del Patrón Saga

- ✅ **Consistencia eventual**: Mantiene la consistencia de datos sin transacciones distribuidas
- ✅ **Resiliencia**: Maneja fallos de servicios individuales
- ✅ **Escalabilidad**: Permite que los servicios operen independientemente
- ✅ **Compensación**: Deshace cambios cuando algo falla

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                    Saga Orchestrator                        │
│                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │  Step 1  │─▶│  Step 2  │─▶│  Step 3  │─▶│  Step 4  │  │
│  │  User    │  │ Nutrition│  │ Routine  │  │Notification│ │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
│       │             │             │             │         │
│       ▼             ▼             ▼             ▼         │
└───────┼─────────────┼─────────────┼─────────────┼─────────┘
        │             │             │             │
  ┌─────▼─────┐ ┌────▼─────┐ ┌────▼──────┐ ┌────▼──────┐
  │   User    │ │ Nutrition│ │  Routine  │ │Notification│
  │  Service  │ │  Service │ │  Service  │ │  Service  │
  └───────────┘ └──────────┘ └───────────┘ └───────────┘
```

## 🔄 Sagas Implementados

### 1. **User Registration Saga**
Registra un nuevo usuario y envía notificación de bienvenida.

**Pasos:**
1. Registrar usuario en user-service
2. Enviar notificación de bienvenida

**Compensación:**
- Si falla el paso 2: El usuario ya está creado (no crítico)
- Si falla el paso 1: No hay compensación necesaria

**Endpoint:**
```http
POST /saga/user-registration
Content-Type: application/json

{
  "username": "juan.perez",
  "email": "juan@example.com"
}
```

---

### 2. **User Onboarding Saga** ⭐
Proceso completo de onboarding: crea usuario, plan nutricional y rutina.

**Pasos:**
1. Registrar usuario
2. Crear plan nutricional personalizado
3. Crear rutina de entrenamiento
4. Enviar notificación de bienvenida completa

**Compensación:**
- Si falla en paso 4: Elimina rutina (paso 3), elimina plan nutricional (paso 2), elimina usuario (paso 1)
- Si falla en paso 3: Elimina plan nutricional (paso 2), elimina usuario (paso 1)
- Si falla en paso 2: Elimina usuario (paso 1)

**Endpoint:**
```http
POST /saga/user-onboarding
Content-Type: application/json

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

---

### 3. **Class Booking Saga**
Reserva una clase y notifica al usuario.

**Pasos:**
1. Reservar clase en class-service
2. Enviar notificación de confirmación

**Compensación:**
- Si falla paso 2: Cancela la reserva (paso 1)

**Endpoint:**
```http
POST /saga/class-booking
Content-Type: application/json

{
  "userId": "user-123",
  "userName": "Juan Pérez",
  "classId": "class-456",
  "className": "Yoga Matutino"
}
```

---

### 4. **Routine Assignment Saga**
Asigna una rutina a un usuario y lo notifica.

**Pasos:**
1. Asignar rutina en routine-service
2. Enviar notificación de rutina asignada

**Compensación:**
- Si falla paso 2: Desasigna la rutina (paso 1)

**Endpoint:**
```http
POST /saga/routine-assignment
Content-Type: application/json

{
  "userId": "user-123",
  "routineName": "Full Body Workout",
  "difficulty": "intermedio",
  "category": "fuerza"
}
```

## 📊 Estados de un Saga

| Estado | Descripción |
|--------|-------------|
| `PENDING` | Saga creado pero no iniciado |
| `IN_PROGRESS` | Ejecutando pasos |
| `COMPLETED` | Todos los pasos completados exitosamente |
| `FAILED` | Algún paso falló |
| `COMPENSATING` | Ejecutando compensaciones (rollback) |
| `COMPENSATED` | Compensaciones completadas |

## 🔍 Endpoints de Consulta

### Obtener estado de un saga
```http
GET /saga/status/:sagaId
```

**Respuesta:**
```json
{
  "success": true,
  "saga": {
    "id": "saga-uuid",
    "type": "USER_ONBOARDING",
    "status": "COMPLETED",
    "currentStep": 3,
    "steps": [
      {
        "name": "REGISTER_USER",
        "executed": true,
        "compensated": false,
        "result": { "userId": "user-123" }
      },
      {
        "name": "CREATE_NUTRITION_PLAN",
        "executed": true,
        "compensated": false
      },
      {
        "name": "CREATE_ROUTINE",
        "executed": true,
        "compensated": false
      },
      {
        "name": "SEND_WELCOME_EMAIL",
        "executed": true,
        "compensated": false
      }
    ],
    "createdAt": "2025-12-19T10:00:00Z",
    "updatedAt": "2025-12-19T10:00:15Z"
  }
}
```

### Listar todos los sagas
```http
GET /saga/all
```

**Con filtros:**
```http
GET /saga/all?type=USER_ONBOARDING
GET /saga/all?status=COMPLETED
GET /saga/all?type=CLASS_BOOKING&status=FAILED
```

### Reintentar un saga fallido
```http
POST /saga/retry/:sagaId
```

### Limpiar sagas antiguos
```http
POST /saga/cleanup
Content-Type: application/json

{
  "hoursOld": 24  // Elimina sagas completados con más de 24 horas
}
```

### Health Check
```http
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

### Kubernetes ConfigMap

El saga-orchestrator utiliza el `ConfigMap` de RatGym para obtener las URLs de RabbitMQ y las colas de servicio:

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: ratgym-config
data:
  RABBITMQ_URL: "amqp://guest:guest@rabbitmq:5672"
  USER_SERVICE_QUEUE: "user_service_queue"
  ROUTINE_SERVICE_QUEUE: "routine_service_queue"
  # ...
```

## 🚀 Cómo Ejecutar

### Desarrollo Local

```bash
cd apps/saga-orchestrator
npm install
npm run start:dev
```

El servicio estará disponible en: **http://localhost:3005**

### Con Docker

```bash
docker build -t ratgym/saga-orchestrator .
docker run -p 3005:3005 \
  -e RABBITMQ_URL=amqp://rabbitmq:5672 \
  ratgym/saga-orchestrator
```

### En Kubernetes

```bash
kubectl apply -f infra/k8s/configmap.yaml
kubectl apply -f infra/k8s/deployments/saga-orchestrator.yaml
kubectl apply -f infra/k8s/services/rabbitmq.yaml
```

## 📝 Ejemplo de Uso Completo

### Escenario: Nuevo usuario se registra en RatGym

```javascript
// 1. Iniciar saga de onboarding
const response = await fetch('http://localhost:3005/saga/user-onboarding', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'carlos.rodriguez',
    email: 'carlos@example.com',
    weight: 80,
    height: 180,
    age: 35,
    objective: 'GAIN_MUSCLE',
    fitnessLevel: 'avanzado'
  })
});

const { sagaId } = await response.json();
// sagaId: "550e8400-e29b-41d4-a716-446655440000"

// 2. Consultar estado del saga
const statusResponse = await fetch(`http://localhost:3005/saga/status/${sagaId}`);
const { saga } = await statusResponse.json();

console.log(saga.status); // "IN_PROGRESS" o "COMPLETED"
console.log(saga.currentStep); // 2 (de 4)

// 3. Si falló, reintentar
if (saga.status === 'FAILED') {
  await fetch(`http://localhost:3005/saga/retry/${sagaId}`, {
    method: 'POST'
  });
}
```

## 🔐 Manejo de Errores

### Timeout por Servicio
Cada paso tiene un timeout configurable (default: 5000ms). Si un servicio no responde a tiempo, el paso falla y se ejecutan las compensaciones.

### Fallos en Compensación
Si una compensación falla, el saga se marca como `COMPENSATED` pero registra el error. Las compensaciones continúan ejecutándose para minimizar inconsistencias.

### Logs
El saga-orchestrator registra cada paso detalladamente:

```
[SAGA 550e8400-e29b-41d4-a716-446655440000] Started USER_ONBOARDING
[SAGA 550e8400-e29b-41d4-a716-446655440000] Step 1/4: REGISTER_USER
[SAGA 550e8400-e29b-41d4-a716-446655440000] ✓ REGISTER_USER completed
[SAGA 550e8400-e29b-41d4-a716-446655440000] Step 2/4: CREATE_NUTRITION_PLAN
[SAGA 550e8400-e29b-41d4-a716-446655440000] ✗ CREATE_NUTRITION_PLAN failed: Service timeout
[SAGA 550e8400-e29b-41d4-a716-446655440000] Starting compensation from step 2
[SAGA 550e8400-e29b-41d4-a716-446655440000] Compensating step: REGISTER_USER
[SAGA 550e8400-e29b-41d4-a716-446655440000] ✓ REGISTER_USER compensated
[SAGA 550e8400-e29b-41d4-a716-446655440000] ✗ Failed: Service timeout
```

## 🧪 Testing

### Prueba de Saga Exitoso
```bash
curl -X POST http://localhost:3005/saga/user-registration \
  -H "Content-Type: application/json" \
  -d '{"username":"test.user","email":"test@example.com"}'
```

### Prueba de Compensación
Para simular un fallo, detén temporalmente uno de los servicios y ejecuta un saga.

## 🎯 Mejores Prácticas

1. **Idempotencia**: Las acciones y compensaciones deben ser idempotentes
2. **Timeouts**: Configura timeouts apropiados para cada servicio
3. **Logging**: Registra todos los pasos para debugging
4. **Retry Logic**: Implementa reintentos automáticos para fallos transitorios
5. **Cleanup**: Limpia sagas antiguos periódicamente

## 📚 Referencias

- [Saga Pattern - Microservices.io](https://microservices.io/patterns/data/saga.html)
- [NestJS Microservices](https://docs.nestjs.com/microservices/basics)
- [RabbitMQ Documentation](https://www.rabbitmq.com/documentation.html)
