# Shared Libraries - RatGym

Bibliotecas compartidas entre microservicios y microfrontends.

## Estructura

### `/auth`
Tipos y utilidades para autenticación:
- `types.ts` - Interfaces de autenticación
- `guards.ts` - Guards para protección de rutas
- `index.ts` - Exportaciones

### `/events`
Definiciones de eventos del sistema:
- `auth.events.ts` - Eventos de autenticación
- `index.ts` - Exportaciones

### `/utils`
Utilidades compartidas:
- `validation.ts` - Validación de datos
- `date.ts` - Manipulación de fechas
- `index.ts` - Exportaciones

### `/dto`
Data Transfer Objects compartidos (próximamente)

## Uso

### En Microservicios (Backend)

```typescript
import { User, AuthResponse } from '@ratgym/shared/auth';
import { UserRegisteredEvent } from '@ratgym/shared/events';
import { validateEmail } from '@ratgym/shared/utils';
```

### En Microfrontends (Frontend)

```typescript
import { AuthGuard, User } from '@ratgym/shared/auth';
import { validateEmail, formatDate } from '@ratgym/shared/utils';
```

## Desarrollo

Las librerías compartidas deben:
1. Ser independientes de frameworks específicos cuando sea posible
2. Tener tipos TypeScript estrictos
3. Ser documentadas con JSDoc
4. Incluir tests unitarios (próximamente)
