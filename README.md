# RatGym 🐀💪

Sistema de gestión de gimnasio con microservicios y microfrontends.

## Inicio Rápido

```bash
# Instalar dependencias
cd apps/user-service && npm install
cd apps/frontend/auth-mf && npm install
cd apps/frontend/shell && npm install

# Iniciar RabbitMQ
docker run -d --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:3.12-management

# Iniciar servicios
cd apps/user-service && npm run start:dev  # Puerto 3001
cd apps/frontend/auth-mf && npm run dev    # Puerto 3001 (standalone)
cd apps/frontend/shell && npm run dev      # Puerto 3000
```

## Acceso

- **Frontend**: http://localhost:3000
- **User Service**: http://localhost:3001
- **RabbitMQ**: http://localhost:15672 (guest/guest)

## Estructura

```
apps/
  ├── user-service/        # Auth con username/password local
  ├── saga-orchestrator/   # Transacciones distribuidas
  ├── frontend/
  │   ├── auth-mf/        # Login (LocalStorage)
  │   └── shell/          # App principal
  └── ...                  # Otros servicios
```

## Características

- Login simple con username (password opcional)
- Datos guardados en LocalStorage
- Module Federation para microfrontends
- RabbitMQ para comunicación entre servicios
- Auto-creación de usuarios

## Endpoints

### User Service
- `POST /auth/login` - Login (auto-crea usuario si no existe)
- `GET /auth/users` - Listar usuarios

## Documentación

Ver archivos individuales README.md en cada servicio.
