# 📡 Configuración RabbitMQ - RatGym

Resumen completo de la configuración de RabbitMQ para la infraestructura de RatGym.

## ✅ Estado de Configuración

### RabbitMQ Infrastructure

- ✅ **Deployment**: [infra/k8s/services/rabbitmq.yaml](../infra/k8s/services/rabbitmq.yaml)
  - Image: `rabbitmq:3.12-management`
  - Puertos: 5672 (AMQP), 15672 (Management UI)
  - Recursos: 512Mi memory, 250m CPU
  - Volumen persistente: emptyDir (puede cambiarse a PVC)

- ✅ **Service**: ClusterIP en puerto 5672
- ✅ **ConfigMap**: Variables globales en [infra/k8s/configmap.yaml](../infra/k8s/configmap.yaml)

### Servicios Configurados

| Servicio | RabbitMQ | Exchange | Variables Env | Estado |
|----------|----------|----------|---------------|--------|
| **class-service** | ✅ | `classes` | `RABBITMQ_URL` | ✅ Configurado |
| **nutrition-service** | ✅ | `nutrition` | `RABBITMQ_URL` | ✅ Configurado |
| **routine-service** | ✅ | `routines` | `RABBITMQ_URL` | ✅ Configurado |
| **notification-service** | ✅ | Escucha todos | `RABBITMQ_URL`, `NOTIFICATIONS_QUEUE` | ✅ Configurado |
| **saga-orchestrator** | ✅ | N/A (consumidor) | `RABBITMQ_URL`, todas las colas | ✅ Configurado |
| **user-service** | ⚠️ | `users` | Pendiente | ⚠️ Por configurar |

## 🏗️ Arquitectura de Mensajería

```
┌──────────────────────────────────────────────────────────────┐
│                         RabbitMQ                             │
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ classes  │  │nutrition │  │ routines │  │  users   │   │
│  │ exchange │  │ exchange │  │ exchange │  │ exchange │   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘   │
│       │             │              │             │         │
│       └─────────────┴──────────────┴─────────────┘         │
│                          │                                  │
│                ┌─────────▼─────────┐                       │
│                │ notifications_queue│                       │
│                └─────────┬─────────┘                       │
└──────────────────────────┼──────────────────────────────────┘
                           │
                  ┌────────▼────────┐
                  │ Notification    │
                  │    Service      │
                  └─────────────────┘
```

## 📋 ConfigMap (infra/k8s/configmap.yaml)

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: ratgym-config
data:
  # RabbitMQ URL
  RABBITMQ_URL: "amqp://guest:guest@rabbitmq:5672"
  
  # Service URLs (HTTP)
  USER_SERVICE_URL: "http://user-service:3001"
  ROUTINE_SERVICE_URL: "http://routine-service:3002"
  CLASS_SERVICE_URL: "http://class-service:3003"
  NUTRITION_SERVICE_URL: "http://nutrition-service:3004"
  SAGA_ORCHESTRATOR_URL: "http://saga-orchestrator:3005"
  NOTIFICATION_SERVICE_URL: "http://notification-service:3006"
  
  # RabbitMQ Queues
  USER_SERVICE_QUEUE: "user_service_queue"
  ROUTINE_SERVICE_QUEUE: "routine_service_queue"
  NUTRITION_SERVICE_QUEUE: "nutrition_service_queue"
  CLASS_SERVICE_QUEUE: "class_service_queue"
  NOTIFICATION_SERVICE_QUEUE: "notifications_queue"
  SAGA_ORCHESTRATOR_QUEUE: "saga_orchestrator_queue"
```

## 🔌 Exchanges y Routing

### Class Service
- **Exchange**: `classes`
- **Tipo**: topic
- **Eventos**:
  - `class.scheduled` → Nueva clase programada
  - `class.booked` → Clase reservada
  - `class.cancelled` → Reserva cancelada
  - `class.attended` → Asistencia confirmada

### Nutrition Service
- **Exchange**: `nutrition`
- **Tipo**: topic
- **Eventos**:
  - `nutrition.plan_created` → Plan nutricional creado

### Routine Service
- **Exchange**: `routines`
- **Tipo**: topic
- **Eventos**:
  - `routine.created` → Rutina creada
  - `routine.completed` → Rutina completada

### User Service (Pendiente)
- **Exchange**: `users`
- **Tipo**: topic
- **Eventos sugeridos**:
  - `user.created` → Usuario registrado
  - `user.updated` → Perfil actualizado
  - `user.deleted` → Usuario eliminado

## 🚀 Deployment en Kubernetes

### 1. Crear ConfigMap
```bash
kubectl apply -f infra/k8s/configmap.yaml
```

### 2. Desplegar RabbitMQ
```bash
kubectl apply -f infra/k8s/services/rabbitmq.yaml
```

### 3. Verificar RabbitMQ
```bash
# Ver pods
kubectl get pods | grep rabbitmq

# Ver logs
kubectl logs -f deployment/rabbitmq

# Port forward para Management UI
kubectl port-forward svc/rabbitmq 15672:15672
```

Acceder a: http://localhost:15672 (usuario: `guest`, password: `guest`)

### 4. Desplegar servicios
```bash
kubectl apply -f infra/k8s/deployments/class-service.yaml
kubectl apply -f infra/k8s/deployments/nutrition-service.yaml
kubectl apply -f infra/k8s/deployments/routine-service.yaml
kubectl apply -f infra/k8s/deployments/notification-service.yaml
kubectl apply -f infra/k8s/deployments/saga-orchestrator.yaml
```

## 🧪 Testing Local (sin Kubernetes)

### 1. Iniciar RabbitMQ con Docker
```bash
docker run -d --name rabbitmq \
  -p 5672:5672 \
  -p 15672:15672 \
  rabbitmq:3.12-management
```

### 2. Configurar variables de entorno
En cada servicio, crear archivo `.env`:

**class-service/.env**
```env
PORT=3003
RABBITMQ_URL=amqp://guest:guest@localhost:5672/
```

**nutrition-service/backend/.env**
```env
PORT=3004
RABBITMQ_URL=amqp://guest:guest@localhost:5672/
```

**routine-service/.env**
```env
PORT=3002
RABBITMQ_URL=amqp://guest:guest@localhost:5672/
```

**notification-service/.env**
```env
PORT=3006
RABBITMQ_URL=amqp://guest:guest@localhost:5672/
NOTIFICATIONS_QUEUE=notifications_queue
STORAGE_PATH=data/notifications.json
```

**saga-orchestrator/.env**
```env
PORT=3005
RABBITMQ_URL=amqp://guest:guest@localhost:5672/
USER_SERVICE_QUEUE=user_service_queue
ROUTINE_SERVICE_QUEUE=routine_service_queue
NUTRITION_SERVICE_QUEUE=nutrition_service_queue
CLASS_SERVICE_QUEUE=class_service_queue
NOTIFICATION_SERVICE_QUEUE=notifications_queue
```

### 3. Iniciar servicios
```bash
# Class Service
cd apps/class-service
npm install
npm run start:dev

# Nutrition Service
cd apps/nutrition-service/backend
npm install
npm run start:dev

# Routine Service
cd apps/routine-service
npm install
npm run start:dev

# Notification Service
cd apps/notification-service
pip install -r requirements.txt
uvicorn src.main:app --port 3006 --reload

# Saga Orchestrator
cd apps/saga-orchestrator
npm install
npm run start:dev
```

## 📊 Monitoreo

### RabbitMQ Management UI
- URL: http://localhost:15672
- Usuario: `guest`
- Password: `guest`

**Puedes ver:**
- Exchanges creados
- Colas y mensajes
- Conexiones activas
- Tasas de mensajes

### Logs de Servicios

**Class Service:**
```
✅ Connected to RabbitMQ: amqp://localhost:5672
✅ Exchange 'classes' created
📤 Event published: class.booked
```

**Notification Service:**
```
[*] Notification Service esperando eventos en la cola: notifications_queue
[✓] Suscrito al exchange: classes
[✓] Suscrito al exchange: nutrition
[✓] Suscrito al exchange: routines
[x] Evento recibido: class.booked
[✓] Notificación creada: abc-123 para usuario user-456
```

## 🔐 Seguridad (Producción)

Para producción, considera:

1. **Credenciales**:
```yaml
# Usar Secrets en lugar de ConfigMap
apiVersion: v1
kind: Secret
metadata:
  name: rabbitmq-secret
type: Opaque
data:
  username: YWRtaW4=  # admin (base64)
  password: c2VjdXJlcGFzcw==  # securepass (base64)
```

2. **TLS/SSL**:
```yaml
RABBITMQ_URL: "amqps://rabbitmq:5671"
```

3. **Virtual Hosts**:
```yaml
RABBITMQ_URL: "amqp://user:pass@rabbitmq:5672/ratgym"
```

## 🔧 Troubleshooting

### Servicios no se conectan a RabbitMQ

```bash
# Verificar que RabbitMQ está corriendo
kubectl get pods -l app=rabbitmq

# Ver logs de RabbitMQ
kubectl logs -f deployment/rabbitmq

# Verificar configuración de red
kubectl get svc rabbitmq
```

### Mensajes no llegan al notification-service

```bash
# Verificar exchanges en RabbitMQ UI
# Verificar bindings de la cola
# Ver logs del notification-service
kubectl logs -f deployment/notification-service
```

### Eventos no se publican

```bash
# Ver logs del servicio emisor
kubectl logs -f deployment/class-service

# Verificar que la conexión RabbitMQ está establecida
# Buscar mensajes: "Connected to RabbitMQ"
```

## 📈 Mejoras Futuras

- [ ] Implementar Dead Letter Queues (DLQ)
- [ ] Agregar retry policy con exponential backoff
- [ ] Implementar message TTL
- [ ] Usar RabbitMQ Cluster para alta disponibilidad
- [ ] Implementar Circuit Breaker pattern
- [ ] Agregar métricas con Prometheus
- [ ] Implementar tracing distribuido

## 📚 Referencias

- [RabbitMQ Documentation](https://www.rabbitmq.com/documentation.html)
- [NestJS Microservices](https://docs.nestjs.com/microservices/rabbitmq)
- [Pika Documentation](https://pika.readthedocs.io/) (Python client)
- [Notification Integration](notification-integration.md)
- [Saga Pattern](sagas.md)

## ✅ Checklist de Configuración

- [x] RabbitMQ desplegado en Kubernetes
- [x] ConfigMap con todas las variables
- [x] class-service conectado
- [x] nutrition-service conectado
- [x] routine-service conectado
- [x] notification-service configurado
- [x] saga-orchestrator configurado
- [ ] user-service por conectar
- [x] Documentación completa
- [x] Scripts de prueba
