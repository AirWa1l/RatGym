# RatGym 🐀💪

Sistema de gestión de gimnasio con arquitectura de microservicios y microfrontends.

## 🚀 Inicio Rápido

### Opción 1: Script Automático (Windows)
```powershell
.\start.ps1
```

### Opción 2: Manual
```bash
# 1. Iniciar RabbitMQ
docker run -d --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:3.12-management

# 2. Instalar dependencias
cd apps/user-service && npm install
cd apps/routine-service && npm install
cd apps/nutrition-service/backend && npm install
cd apps/saga-orchestrator && npm install
cd apps/frontend/shell && npm install

# 3. Iniciar servicios (5 terminales)
cd apps/user-service && npm run start:dev              # Terminal 1 - Puerto 3001
cd apps/routine-service && npm run start:dev           # Terminal 2 - Puerto 3002
cd apps/nutrition-service/backend && npm run start:dev # Terminal 3 - Puerto 3004
cd apps/saga-orchestrator && npm run start:dev         # Terminal 4 - Puerto 3005
cd apps/frontend/shell && npm run dev                  # Terminal 5 - Puerto 3000
```

### Opción 3: Docker Compose
```bash
docker-compose up --build
```

### Opción 4: Kubernetes
Ver [QUICKSTART.md](QUICKSTART.md#kubernetes-opción-3---producción)

## 🌐 Acceso

| Servicio | URL | Descripción |
|----------|-----|-------------|
| **Frontend** | http://localhost:3000 | Dashboard principal |
| **User Service** | http://localhost:3001 | Auth y usuarios |
| **Routine Service** | http://localhost:3002 | Rutinas y ejercicios |
| **Nutrition Service** | http://localhost:3004 | Planes nutricionales |
| **Saga Orchestrator** | http://localhost:3005 | Transacciones distribuidas |
| **RabbitMQ UI** | http://localhost:15672 | Management Console (guest/guest) |

## 📁 Estructura

```
apps/
  ├── user-service/          # Auth con username local (in-memory)
  ├── routine-service/       # Gestión de rutinas y ejercicios
  ├── nutrition-service/     # Planes nutricionales personalizados
  │   ├── backend/          # API NestJS
  │   └── frontend/         # Widget React
  ├── saga-orchestrator/     # Orquestación de sagas distribuidas
  ├── frontend/
  │   └── shell/            # Dashboard profesional React
  └── [otros servicios]/    # class, etc.
infra/
  ├── k8s/                  # Configuraciones Kubernetes
  └── docker/               # Configuraciones Docker
```

## ✨ Características

- ✅ Login simplificado (solo username, sin contraseña)
- ✅ Almacenamiento local con LocalStorage
- ✅ Dashboard profesional estilo SmartFit con sidebar
- ✅ 6 widgets preparados para microservicios
- ✅ Arquitectura SAGA para transacciones distribuidas
- ✅ RabbitMQ para comunicación asíncrona
- ✅ Module Federation para microfrontends
- ✅ Auto-creación de usuarios
- ✅ Docker & Kubernetes ready

## 🎨 Personalización

**Agregar logo personalizado:**
1. Coloca tu imagen en: `apps/frontend/shell/public/logo.png`
2. El logo aparecerá automáticamente en el navbar

## 📡 API Endpoints

### User Service (puerto 3001)
- `POST /auth/login` - Login (auto-crea usuario)
- `GET /auth/users` - Listar usuarios
- `GET /auth/health` - Health check

### Routine Service (puerto 3002)
- `GET /routines` - Listar rutinas públicas
- `GET /routines/:id` - Obtener rutina por ID
- `POST /routines` - Crear nueva rutina
- `PUT /routines/:id` - Actualizar rutina
- `DELETE /routines/:id` - Eliminar rutina
- `POST /routines/:id/complete` - Marcar rutina como completada
- `POST /routines/:id/duplicate` - Duplicar rutina
- `GET /routines/user/:userId` - Rutinas de un usuario
- `GET /routines/category/:category` - Filtrar por categoría
- `GET /routines/difficulty/:level` - Filtrar por dificultad
- `GET /exercises` - Listar ejercicios
- `GET /exercises/:id` - Obtener ejercicio por ID
- `GET /exercises/muscle/:group` - Filtrar por grupo muscular
- `GET /health` - Health check

### Nutrition Service (puerto 3004)
- `POST /nutrition/plan` - Generar plan nutricional personalizado
- `GET /health` - Health check

### Saga Orchestrator (puerto 3005)
- `POST /saga/user-registration` - Iniciar saga de registro
- `GET /saga/status/:sagaId` - Estado de una saga
- `GET /saga/all` - Listar todas las sagas
- `POST /saga/cleanup` - Limpiar sagas antiguas

## 📚 Documentación

- [Inicio Rápido Detallado](QUICKSTART.md)
- [Arquitectura](docs/architecture.md)
- [Decisiones de Diseño](docs/decisions.md)
- [Sagas](docs/sagas.md)

## 🛠️ Tecnologías

- **Backend**: NestJS 10, RabbitMQ, TypeScript
- **Frontend**: React 18, Webpack Module Federation
- **Orquestación**: Kubernetes, Docker Compose
- **Mensajería**: RabbitMQ 3.12
