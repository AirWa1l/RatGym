# Arquitectura de RatGym

## Visión General

RatGym es un sistema distribuido basado en microservicios y microfrontends diseñado para gestionar un gimnasio digital completo, incluyendo autenticación, rutinas, clases, nutrición y notificaciones.

## Principios de Diseño

1. **Separación de Responsabilidades**: Cada microservicio tiene una única responsabilidad
2. **Autonomía**: Los servicios pueden desplegarse independientemente
3. **Comunicación Asíncrona**: Uso de eventos para desacoplamiento
4. **Consistencia Eventual**: Aceptamos latencia para mejor escalabilidad
5. **Microfronte nds**: Frontend modular con Module Federation

## Arquitectura de Backend

### Patrón de Microservicios

```
┌─────────────┐
│ API Gateway │
└──────┬──────┘
       │
       ├─────────────┬──────────────┬──────────────┬──────────────┐
       │             │              │              │              │
┌──────▼──────┐ ┌───▼────┐  ┌──────▼──────┐ ┌────▼─────┐ ┌─────▼─────┐
│User Service │ │Routine │  │Nutrition    │ │Class     │ │Notification│
│             │ │Service │  │Service      │ │Service   │ │Service    │
└──────┬──────┘ └───┬────┘  └──────┬──────┘ └────┬─────┘ └─────┬─────┘
       │            │              │             │              │
       └────────────┴──────────────┴─────────────┴──────────────┘
                              │
                    ┌─────────▼──────────┐
                    │    RabbitMQ        │
                    │  Message Broker    │
                    └─────────┬──────────┘
                              │
                    ┌─────────▼──────────┐
                    │ Saga Orchestrator  │
                    │  (Transactions)    │
                    └────────────────────┘
```

### Componentes del Backend

#### 1. User Service
**Responsabilidad**: Autenticación y gestión de usuarios

**Tecnologías**:
- NestJS
- Firebase Admin SDK
- JWT
- RabbitMQ

**Endpoints**:
- `POST /auth/register` - Registro de usuarios
- `POST /auth/verify` - Verificación de tokens
- `GET /auth/profile` - Perfil de usuario

**Message Patterns**:
- `user.register` - Registro de usuario (async)
- `user.verify` - Verificación de token (async)
- `user.getById` - Obtener usuario por ID
- `user.delete` - Eliminar usuario (compensación)

#### 2. Saga Orchestrator
**Responsabilidad**: Orquestación de transacciones distribuidas

**Patrón**: Saga Choreography con compensación

**Flujos**:
1. **User Registration Saga**:
   - Registrar usuario en Firebase
   - Crear perfil en base de datos
   - Enviar email de bienvenida
   - **Compensación**: Eliminar usuario si falla

**Estados de Saga**:
- `PENDING` - Creada, no iniciada
- `IN_PROGRESS` - Ejecutando pasos
- `COMPLETED` - Exitosa
- `FAILED` - Falló sin compensación
- `COMPENSATING` - Ejecutando compensaciones
- `COMPENSATED` - Compensación completada

#### 3. RabbitMQ
**Responsabilidad**: Mensajería asíncrona entre servicios

**Colas**:
- `user_service_queue`
- `routine_service_queue`
- `nutrition_service_queue`
- `class_service_queue`
- `notification_service_queue`
- `saga_orchestrator_queue`

**Ventajas**:
- Desacoplamiento de servicios
- Tolerancia a fallos
- Escalabilidad independiente
- Replay de mensajes

## Arquitectura de Frontend

### Patrón de Microfrontends

```
┌─────────────────────────────────────────────┐
│              Shell Application              │
│        (Module Federation Host)             │
│                                             │
│  ┌─────────┐  ┌─────────┐  ┌──────────┐   │
│  │ Auth MF │  │Classes MF│  │Routines MF│   │
│  │(Remote) │  │(Remote)  │  │(Remote)   │   │
│  └─────────┘  └─────────┘  └──────────┘   │
│                                             │
│  ┌─────────┐  ┌──────────┐                │
│  │Shared MF│  │Nutrition │                 │
│  │(Remote) │  │MF(Remote)│                 │
│  └─────────┘  └──────────┘                 │
└─────────────────────────────────────────────┘
```

### Componentes del Frontend

#### 1. Shell
**Responsabilidad**: Aplicación contenedora, routing, navbar

**Tecnologías**:
- React 18
- React Router
- Webpack Module Federation

**Características**:
- Lazy loading de microfrontends
- Routing centralizado
- Gestión de autenticación global
- Navbar compartida

#### 2. Auth MF
**Responsabilidad**: Login y registro

**Exposiciones**:
- `./AuthApp` - Aplicación completa
- `./LoginPage` - Componente de login
- `./RegisterPage` - Componente de registro
- `./useAuth` - Hook de autenticación

**Estado**:
- Zustand para gestión de estado
- Firebase Client SDK
- LocalStorage para tokens

#### 3. Otros Microfrontends (Próximamente)
- **Routines MF**: Gestión de rutinas de ejercicio
- **Classes MF**: Clases grupales
- **Nutrition MF**: Planes nutricionales
- **Shared MF**: Componentes compartidos

## Flujos de Datos

### Flujo de Registro de Usuario

```
1. Usuario → Shell → Auth MF (LoginPage)
2. Auth MF → Firebase Client SDK (createUser)
3. Auth MF → User Service (POST /auth/verify)
4. User Service → Firebase Admin (verifyToken)
5. User Service → Saga Orchestrator (user.register event)
6. Saga Orchestrator:
   a. Ejecuta paso 1: Crear usuario en Firebase ✓
   b. Ejecuta paso 2: Enviar email de bienvenida ✓
   c. Si falla: Compensa pasos anteriores ✗
7. User Service → Auth MF (JWT token)
8. Auth MF → LocalStorage (guardar token)
9. Auth MF → Shell (redirect to home)
```

### Flujo de Login

```
1. Usuario → Shell → Auth MF (LoginPage)
2. Auth MF → Firebase Client SDK (signIn)
3. Firebase → Auth MF (idToken)
4. Auth MF → User Service (POST /auth/verify)
5. User Service → Firebase Admin (verifyIdToken)
6. User Service → Auth MF (JWT token)
7. Auth MF → LocalStorage (guardar token)
8. Auth MF → Shell (redirect to home)
```

## Comunicación entre Servicios

### Sincrónica (HTTP/REST)
- Frontend ↔ Backend
- API Gateway ↔ Microservicios (cuando se necesita respuesta inmediata)

### Asíncrona (RabbitMQ)
- Microservicio ↔ Microservicio
- Saga Orchestrator ↔ Microservicios
- Eventos del sistema

## Seguridad

### Capas de Seguridad

1. **Frontend**:
   - Firebase Authentication
   - LocalStorage para tokens
   - Protected routes
   - CORS configurado

2. **API Gateway**:
   - Validación de JWT
   - Rate limiting
   - Request sanitization

3. **Microservicios**:
   - Firebase Admin SDK
   - JWT validation
   - Input validation
   - Authorization por roles

4. **Infraestructura**:
   - Network policies en K8s
   - Secrets management
   - HTTPS/TLS en producción

### Flujo de Autenticación

```
┌──────────┐       ┌──────────┐       ┌───────────────┐
│ Frontend │──1──▶ │ Firebase │──2──▶ │  User Service │
│          │◀──3───│   Auth   │◀──4───│               │
└──────────┘       └──────────┘       └───────────────┘
     │                                        │
     └──────────────5─────────────────────────┘
                   (JWT Token)
```

1. Usuario ingresa credenciales
2. Firebase Auth valida
3. Devuelve Firebase ID Token
4. User Service verifica con Firebase Admin
5. Devuelve JWT custom para servicios internos

## Escalabilidad

### Horizontal Scaling

**Backend**:
- Cada microservicio puede escalar independientemente
- Kubernetes HPA (Horizontal Pod Autoscaler)
- RabbitMQ maneja balanceo de carga

**Frontend**:
- CDN para assets estáticos
- Microfrontends pueden desplegarse en diferentes CDNs

### Vertical Scaling

**Base de Datos** (cuando se implemente):
- Read replicas para lectura
- Write master para escritura
- Caching con Redis

## Resiliencia

### Patrones Implementados

1. **Circuit Breaker**: En comunicación entre servicios
2. **Retry con Backoff**: Para operaciones temporalmente fallidas
3. **Saga Pattern**: Transacciones distribuidas con compensación
4. **Health Checks**: Kubernetes liveness/readiness probes
5. **Graceful Degradation**: Frontend sigue funcionando si un MF falla

## Monitoreo y Observabilidad

### Métricas (Próximamente)
- Prometheus para métricas
- Grafana para visualización
- Custom metrics por servicio

### Logs
- Structured logging con Winston
- Agregación con ELK Stack (próximamente)
- Correlation IDs para tracing

### Tracing (Próximamente)
- Distributed tracing con Jaeger
- Request tracing end-to-end

## Deployment

### Estrategias

**Development**:
- Local con npm scripts
- Docker Compose para full stack

**Staging/Production**:
- Kubernetes con Helm
- CI/CD con GitHub Actions (próximamente)
- Blue-Green deployments
- Canary releases

### Infraestructura

```
┌────────────────────────────────────────┐
│         Kubernetes Cluster             │
│                                        │
│  ┌──────────┐  ┌──────────┐          │
│  │ Ingress  │  │ConfigMap │          │
│  │Controller│  │ & Secrets│          │
│  └────┬─────┘  └──────────┘          │
│       │                               │
│  ┌────▼────────────────────┐         │
│  │   Services Layer        │         │
│  │ (LoadBalancing)         │         │
│  └────┬────────────────────┘         │
│       │                               │
│  ┌────▼────────────────────┐         │
│  │   Pods Layer            │         │
│  │ (Containers)            │         │
│  └─────────────────────────┘         │
└────────────────────────────────────────┘
```

## Decisiones Arquitectónicas

Ver [docs/decisions.md](decisions.md) para el registro completo de decisiones arquitectónicas (ADRs).

### Decisiones Clave

1. **¿Por qué Microservicios?**
   - Escalabilidad independiente
   - Desarrollo paralelo por equipos
   - Tecnologías heterogéneas
   - Despliegue independiente

2. **¿Por qué Microfrontends?**
   - Equipos autónomos
   - Despliegue independiente
   - Tecnologías heterogéneas
   - Carga incremental

3. **¿Por qué Firebase?**
   - Autenticación lista para usar
   - Escalable
   - SDKs para web y mobile
   - Fácil integración

4. **¿Por qué RabbitMQ?**
   - Confiable y maduro
   - Soporte para patrones complejos
   - Persistencia de mensajes
   - Fácil de operar

5. **¿Por qué Saga Pattern?**
   - Consistencia eventual
   - Compensación automática
   - Sin transacciones distribuidas
   - Más resiliente

## Próximos Pasos

1. Implementar servicios restantes (routine, nutrition, class, notification)
2. Agregar base de datos (MongoDB/PostgreSQL)
3. Implementar API Gateway completo
4. Agregar autenticación con roles y permisos
5. Implementar caching con Redis
6. Agregar monitoring completo (Prometheus + Grafana)
7. Implementar CI/CD pipeline
8. Mobile app con React Native

## Referencias

- [Microservices Pattern](https://microservices.io/)
- [Saga Pattern](https://microservices.io/patterns/data/saga.html)
- [Module Federation](https://webpack.js.org/concepts/module-federation/)
- [Firebase Documentation](https://firebase.google.com/docs)
- [NestJS Documentation](https://docs.nestjs.com/)
