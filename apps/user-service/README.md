# User Service 👤

Microservicio de autenticación y gestión de usuarios con almacenamiento en memoria.

## 🎯 Características

- ✅ Login simplificado (solo username, sin contraseña)
- ✅ Auto-creación de usuarios
- ✅ Almacenamiento en memoria (Map)
- ✅ RabbitMQ para comunicación asíncrona
- ✅ Health endpoint para Kubernetes

## 📡 Endpoints

### POST /auth/login
Login con username. Si el usuario no existe, se crea automáticamente.

**Request:**
```json
{
  "username": "juanperez"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "username": "juanperez",
    "createdAt": "2025-12-16T..."
  },
  "token": "user-token-123"
}
```

### GET /auth/users
Lista todos los usuarios registrados.

**Response:**
```json
{
  "success": true,
  "users": [
    {
      "username": "juanperez",
      "createdAt": "2025-12-16T..."
    }
  ]
}
```

### GET /auth/health
Health check para Kubernetes liveness/readiness probes.

**Response:**
```json
{
  "status": "ok",
  "service": "user-service",
  "timestamp": "2025-12-16T...",
  "uptime": 123.45
}
```

## 🔌 Message Patterns (RabbitMQ)

### user.login
Patrón de mensaje para login asíncrono.

**Payload:**
```json
{
  "username": "juanperez"
}
```

### user.getByUsername
Obtiene usuario por username.

**Payload:**
```json
{
  "username": "juanperez"
}
```

## 🛠️ Desarrollo

### Pre-requisitos
- Node.js 18+
- RabbitMQ corriendo

### Instalación
```bash
npm install
```

### Configuración (.env)
```env
PORT=3001
RABBITMQ_URL=amqp://guest:guest@localhost:5672
RABBITMQ_QUEUE=user_service_queue
```

### Ejecución
```bash
# Desarrollo
npm run start:dev

# Producción
npm run build
npm run start:prod
```

## 🧪 Testing

### Login
```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser"}'
```

### Listar usuarios
```bash
curl http://localhost:3001/auth/users
```

### Health check
```bash
curl http://localhost:3001/auth/health
```

## 🗄️ Modelo de Datos

### User
```typescript
{
  username: string;
  createdAt: Date;
}
```

**Nota:** El almacenamiento es en memoria usando un Map, por lo que los datos se pierden al reiniciar el servicio.

## 🚀 Deploy

### Docker
```bash
docker build -t ratgym/user-service .
docker run -p 3001:3001 \
  -e RABBITMQ_URL=amqp://rabbitmq:5672 \
  ratgym/user-service
```

### Kubernetes
```bash
kubectl apply -f ../../infra/k8s/deployments/user-service.yaml
```

## ⚠️ Consideraciones

1. **Sin persistencia**: Los usuarios se almacenan en memoria
2. **Sin contraseña**: Solo se usa username para simplificar
3. **Sin JWT**: Token simple basado en username
4. **Auto-creación**: Cualquier username válido puede "registrarse" haciendo login
5. **Sin validación**: No hay validación de formato de username

## 🔮 Próximas mejoras

- [ ] Persistencia en base de datos (PostgreSQL/MongoDB)
- [ ] Validación de username
- [ ] JWT tokens reales
- [ ] Password opcional
- [ ] Rate limiting
- [ ] Logs estructurados
