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
cd apps/saga-orchestrator && npm install
cd apps/frontend/shell && npm install

# 3. Iniciar servicios (3 terminales)
cd apps/user-service && npm run start:dev       # Terminal 1 - Puerto 3001
cd apps/saga-orchestrator && npm run start:dev  # Terminal 2 - Puerto 3005
cd apps/frontend/shell && npm run dev           # Terminal 3 - Puerto 3000
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
| **Saga Orchestrator** | http://localhost:3005 | Transacciones distribuidas |
| **RabbitMQ UI** | http://localhost:15672 | Management Console (guest/guest) |

## 📁 Estructura

```
apps/
  ├── user-service/          # Auth con username local (in-memory)
  ├── saga-orchestrator/     # Orquestación de sagas distribuidas
  ├── frontend/
  │   └── shell/            # Dashboard profesional React
  └── [otros servicios]/    # routine, class, nutrition, etc.
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
