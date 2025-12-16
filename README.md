# RatGym - Sistema de Gestión Fitness 🐀💪

Sistema completo de gestión fitness basado en microservicios y microfrontends, con autenticación Firebase y orquestación de sagas.

## 🏗️ Arquitectura

### Backend (Microservicios)
- **user-service**: Autenticación y gestión de usuarios con Firebase
- **saga-orchestrator**: Orquestación de transacciones distribuidas
- **routine-service**: Gestión de rutinas de ejercicio (próximamente)
- **nutrition-service**: Planes nutricionales (próximamente)
- **class-service**: Clases grupales (próximamente)
- **notification-service**: Notificaciones (próximamente)

### Frontend (Microfrontends)
- **shell**: Aplicación contenedora con Module Federation
- **auth-mf**: Autenticación (Login/Register)
- **routines-mf**: Rutinas de ejercicio (próximamente)
- **classes-mf**: Clases (próximamente)
- **shared-mf**: Componentes compartidos (próximamente)

### Infraestructura
- **RabbitMQ**: Mensajería entre microservicios
- **Kubernetes**: Orquestación de contenedores
- **Firebase**: Autenticación y gestión de usuarios

## 🚀 Inicio Rápido

### Prerequisitos

- Node.js 18+
- Docker & Docker Compose
- Firebase project
- (Opcional) Kubernetes cluster

### 1. Configurar Firebase

1. Crea un proyecto en [Firebase Console](https://console.firebase.google.com/)
2. Habilita Firebase Authentication (Email/Password)
3. Obtén las credenciales:
   - Web app config (para frontend)
   - Service account key (para backend)

### 2. Configurar Variables de Entorno

```bash
# En la raíz del proyecto
cp .env.example .env
# Edita .env con tus credenciales de Firebase

# En user-service
cd apps/user-service
cp .env.example .env
# Edita con tus credenciales

# En auth-mf
cd apps/frontend/auth-mf
cp .env.example .env
# Edita con tus credenciales de Firebase Web
```

### 3. Ejecutar con Docker Compose (Recomendado)

```bash
# Desde la raíz del proyecto
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener
docker-compose down
```

Accede a:
- **Frontend**: http://localhost:3000
- **User Service**: http://localhost:3001
- **Saga Orchestrator**: http://localhost:3010
- **RabbitMQ Management**: http://localhost:15672 (guest/guest)

### 4. Ejecutar en Desarrollo (Local)

#### Backend

```bash
# User Service
cd apps/user-service
npm install
npm run start:dev

# Saga Orchestrator
cd apps/saga-orchestrator
npm install
npm run start:dev
```

#### Frontend

```bash
# Auth Microfrontend
cd apps/frontend/auth-mf
npm install
npm run dev  # Puerto 3001

# Shell
cd apps/frontend/shell
npm install
npm run dev  # Puerto 3000
```

#### RabbitMQ (con Docker)

```bash
docker run -d --name rabbitmq \
  -p 5672:5672 \
  -p 15672:15672 \
  rabbitmq:3.12-management
```

## 📚 Documentación

### Estructura del Proyecto

```
mainRatGym/
├── apps/
│   ├── user-service/          # Microservicio de usuarios
│   ├── saga-orchestrator/     # Orquestador de sagas
│   ├── frontend/
│   │   ├── auth-mf/          # Microfrontend de auth
│   │   └── shell/            # Shell application
│   └── ...                    # Otros servicios
├── libs/
│   └── shared/               # Librerías compartidas
│       ├── auth/             # Tipos y guards de auth
│       ├── events/           # Eventos del sistema
│       └── utils/            # Utilidades
├── infra/
│   └── k8s/                  # Configuraciones de Kubernetes
└── docker-compose.yml        # Orquestación con Docker
```

### Endpoints Principales

#### User Service (puerto 3001)
- `POST /auth/register` - Registrar usuario
- `POST /auth/verify` - Verificar token Firebase
- `GET /auth/profile` - Obtener perfil (requiere auth)

#### Saga Orchestrator (puerto 3010)
- `POST /saga/user-registration` - Iniciar saga de registro
- `GET /saga/status/:sagaId` - Consultar estado de saga
- `GET /saga/all` - Listar todas las sagas

## 🔧 Desarrollo

### Agregar un Nuevo Microservicio

1. Crea directorio en `apps/`
2. Configura NestJS con RabbitMQ
3. Agrega deployment en `infra/k8s/deployments/`
4. Actualiza `docker-compose.yml`

### Agregar un Nuevo Microfrontend

1. Crea directorio en `apps/frontend/`
2. Configura Webpack con Module Federation
3. Expone componentes en `webpack.config.js`
4. Importa en shell desde remote

### Librerías Compartidas

Las librerías en `libs/shared/` están disponibles para todos los servicios:

```typescript
// En backend
import { User, AuthResponse } from '../../../libs/shared/auth';

// En frontend
import { AuthGuard } from '../../../libs/shared/auth';
```

## 🐳 Docker

### Construir Imágenes

```bash
# User Service
docker build -t ratgym/user-service:latest ./apps/user-service

# Saga Orchestrator
docker build -t ratgym/saga-orchestrator:latest ./apps/saga-orchestrator

# Auth MF
docker build -t ratgym/auth-mf:latest ./apps/frontend/auth-mf

# Shell
docker build -t ratgym/shell:latest ./apps/frontend/shell
```

### Publicar a Registry

```bash
docker tag ratgym/user-service:latest your-registry/ratgym/user-service:latest
docker push your-registry/ratgym/user-service:latest
```

## ☸️ Kubernetes

Ver [infra/k8s/README.md](infra/k8s/README.md) para instrucciones detalladas.

```bash
# Desplegar todo
kubectl apply -f infra/k8s/

# Verificar
kubectl get pods
kubectl get services
kubectl get ingress
```

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage
npm run test:cov
```

## 📈 Monitoreo

### RabbitMQ Management

Accede a http://localhost:15672 para monitorear colas y mensajes.

### Logs

```bash
# Docker Compose
docker-compose logs -f service-name

# Kubernetes
kubectl logs -f deployment/user-service
```

## 🔐 Seguridad

### Best Practices Implementadas

- ✅ Firebase Authentication
- ✅ JWT para comunicación entre servicios
- ✅ Variables de entorno para secrets
- ✅ Validación de inputs
- ✅ CORS configurado
- ✅ HTTPS ready (en producción)

### Para Producción

1. Cambia todos los secrets
2. Usa un gestor de secrets (Vault, AWS Secrets Manager)
3. Habilita HTTPS/TLS
4. Configura network policies en K8s
5. Implementa rate limiting
6. Configura backups automáticos

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Notas de Versión

### v1.0.0 (Actual)

- ✅ Autenticación con Firebase
- ✅ User service completo
- ✅ Saga orchestrator funcional
- ✅ Microfrontend de autenticación
- ✅ Shell con Module Federation
- ✅ Despliegue con Docker y K8s
- ✅ Documentación completa

### Próximos Features

- 🔄 Routine service
- 🔄 Nutrition service
- 🔄 Class service
- 🔄 Notification service
- 🔄 Dashboard analytics
- 🔄 Mobile app

## 📧 Soporte

Para preguntas y soporte, abre un issue en el repositorio.

## 📄 Licencia

Este proyecto es privado y propietario.

---

**Desarrollado con ❤️ para RatGym** 🐀💪
