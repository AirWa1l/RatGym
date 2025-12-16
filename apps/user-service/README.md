# User Service - RatGym

Microservicio de autenticación y gestión de usuarios usando Firebase Admin SDK.

## Características

- ✅ Registro de usuarios con Firebase Auth
- ✅ Verificación de tokens Firebase
- ✅ Integración con RabbitMQ para comunicación asíncrona
- ✅ Soporte para Saga orchestration
- ✅ API REST y microservicio híbrido
- ✅ Gestión de perfiles de usuario

## Configuración

1. **Instalar dependencias:**
```bash
npm install
```

2. **Configurar variables de entorno:**
Copia `.env.example` a `.env` y configura:
- Credenciales de Firebase Admin SDK
- URL de RabbitMQ
- Secreto JWT
- Puerto del servicio

3. **Obtener credenciales de Firebase:**
   - Ve a Firebase Console > Project Settings > Service Accounts
   - Genera una nueva clave privada
   - Usa los valores en tu archivo `.env`

## Scripts

- `npm run start:dev` - Ejecutar en modo desarrollo
- `npm run build` - Compilar para producción
- `npm run start:prod` - Ejecutar en producción
- `npm run test` - Ejecutar tests

## Endpoints

### REST API

- `POST /auth/register` - Registrar nuevo usuario
- `POST /auth/verify` - Verificar token Firebase
- `GET /auth/profile` - Obtener perfil (requiere autenticación)
- `GET /users/profile` - Obtener perfil extendido
- `PUT /users/profile` - Actualizar perfil

### Message Patterns (RabbitMQ)

- `user.register` - Registro de usuario
- `user.verify` - Verificación de token
- `user.getById` - Obtener usuario por ID
- `user.delete` - Eliminar usuario
- `user.update` - Actualizar usuario
- `user.profile.get` - Obtener perfil
- `user.profile.update` - Actualizar perfil

## Integración con Saga

Este servicio está listo para trabajar con el saga-orchestrator. Los eventos emitidos permiten transacciones distribuidas con compensación automática.
