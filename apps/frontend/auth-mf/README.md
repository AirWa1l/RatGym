# Auth Microfrontend - RatGym

Microfrontend de autenticación con Firebase y Module Federation.

## Características

- ✅ Login y registro con Firebase Authentication
- ✅ Interfaz moderna y responsive
- ✅ Module Federation para integración con shell
- ✅ Estado global con Zustand
- ✅ TypeScript para type safety
- ✅ Estilos en línea simples y limpios

## Configuración

1. **Instalar dependencias:**
```bash
npm install
```

2. **Configurar variables de entorno:**
Copia `.env.example` a `.env` y configura las credenciales de Firebase.

3. **Obtener configuración de Firebase:**
   - Ve a Firebase Console > Project Settings
   - En "Your apps", selecciona tu web app
   - Copia la configuración a tu archivo `.env`

## Scripts

- `npm run dev` - Ejecutar en desarrollo (puerto 3001)
- `npm run build` - Compilar para producción
- `npm run preview` - Preview de producción

## Integración con Shell

Este microfrontend está configurado para Module Federation y expone:

- `./AuthApp` - Aplicación completa
- `./LoginPage` - Página de login
- `./RegisterPage` - Página de registro  
- `./useAuth` - Hook de autenticación

### Ejemplo de uso en Shell:

```typescript
import { useAuth } from 'authMf/useAuth';
import LoginPage from 'authMf/LoginPage';

// En tu componente
const { user, login, logout } = useAuth();
```

## Estructura

```
src/
├── config/          # Configuración de Firebase
├── hooks/           # Custom hooks (useAuth)
├── pages/           # Páginas (Login, Register)
├── store/           # Estado global (Zustand)
├── styles/          # Estilos compartidos
├── App.tsx          # Componente principal
└── index.ts         # Entry point
```

## Modo Standalone

El microfrontend puede ejecutarse de forma independiente para desarrollo:

```bash
npm run dev
```

Accede a http://localhost:3001
