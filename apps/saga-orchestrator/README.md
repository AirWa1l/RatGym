# Saga Orchestrator

Orquestador de transacciones distribuidas.

## Inicio

```bash
npm install
npm run start:dev
```

Puerto: 3010

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
