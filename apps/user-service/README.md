# User Service

Microservicio simple de autenticación local.

## Inicio Rápido

```bash
npm install
npm run start:dev
```

Puerto: 3001

## Endpoints

- `POST /auth/login` - Login con username (crea usuario si no existe)
- `GET /auth/users` - Lista todos los usuarios

## Ejemplo

```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "juan"}'
```
