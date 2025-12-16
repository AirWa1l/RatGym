# Saga Orchestrator - RatGym

Orquestador de transacciones distribuidas usando el patrón Saga.

## Características

- ✅ Patrón Saga para transacciones distribuidas
- ✅ Compensación automática en caso de fallo
- ✅ Integración con RabbitMQ
- ✅ Monitoreo de estado de sagas
- ✅ Soporte para múltiples servicios

## Sagas Implementadas

### User Registration Saga

Orquesta el proceso completo de registro de usuario:

1. **Registrar usuario** (USER_SERVICE)
   - Crea usuario en Firebase
   - Compensación: Elimina usuario

2. **Enviar email de bienvenida** (NOTIFICATION_SERVICE)
   - Envía notificación de bienvenida
   - Sin compensación (email ya enviado)

## Endpoints

### REST API

- `POST /saga/user-registration` - Iniciar saga de registro
- `GET /saga/status/:sagaId` - Consultar estado de saga
- `GET /saga/all` - Listar todas las sagas

### Message Patterns

- `saga.user.registration` - Iniciar saga de registro de usuario

## Configuración

1. **Instalar dependencias:**
```bash
npm install
```

2. **Configurar variables de entorno:**
Copia `.env.example` a `.env` y configura las URLs de los servicios.

## Scripts

- `npm run start:dev` - Desarrollo
- `npm run build` - Compilar
- `npm run start:prod` - Producción

## Flujo de Compensación

Si un paso falla, el orquestador:
1. Detiene la ejecución
2. Ejecuta compensaciones en orden inverso
3. Marca la saga como COMPENSATED o FAILED

## Estados de Saga

- `PENDING` - Saga creada, no iniciada
- `IN_PROGRESS` - Ejecutando pasos
- `COMPLETED` - Todos los pasos exitosos
- `FAILED` - Fallo sin compensación
- `COMPENSATING` - Ejecutando compensaciones
- `COMPENSATED` - Compensación completada
