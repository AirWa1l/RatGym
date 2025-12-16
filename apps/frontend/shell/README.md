# Shell - RatGym

Aplicación shell que orquesta todos los microfrontends usando Module Federation.

## Características

- ✅ Module Federation de Webpack 5
- ✅ Lazy loading de microfrontends
- ✅ Routing centralizado
- ✅ Navbar compartida
- ✅ Gestión de autenticación global
- ✅ Protected routes

## Microfrontends Integrados

1. **authMf** (puerto 3001)
   - LoginPage
   - RegisterPage
   - useAuth hook

2. **classesMf** (puerto 3002) - Próximamente
3. **routinesMf** (puerto 3003) - Próximamente
4. **sharedMf** (puerto 3004) - Próximamente

## Configuración

1. **Instalar dependencias:**
```bash
npm install
```

2. **Ejecutar en desarrollo:**
```bash
npm run dev
```

El shell se ejecutará en http://localhost:3000

## Desarrollo

### Agregar un nuevo microfrontend

1. Edita `webpack.config.js` y agrega el remote:

```javascript
remotes: {
  nuevoMf: 'nuevoMf@http://localhost:3005/remoteEntry.js',
}
```

2. Importa y usa en tus rutas:

```typescript
const NuevoComponente = lazy(() => import('nuevoMf/Component'));
```

### Rutas

- `/` - Home page
- `/login` - Login (authMf)
- `/register` - Registro (authMf)
- `/routines` - Rutinas (protegida)
- `/classes` - Clases (protegida)
- `/nutrition` - Nutrición (protegida)

## Producción

Para producción, las URLs de los remotes se configuran automáticamente para usar rutas relativas.

```bash
npm run build
```

## Estructura

```
src/
├── components/
│   └── Navbar.tsx      # Navegación global
├── pages/
│   └── HomePage.tsx    # Página de inicio
├── App.tsx             # Aplicación principal
└── index.ts            # Entry point
```

## Integración con Backend

El shell no hace llamadas directas al backend. Cada microfrontend maneja su propia comunicación con los microservicios.

## Troubleshooting

### Microfrontend no carga

- Verifica que el microfrontend esté corriendo
- Revisa la consola del navegador para errores de CORS
- Confirma que el puerto en `webpack.config.js` coincida

### Rutas no funcionan

- Verifica que `historyApiFallback: true` esté en webpack dev server
- En producción, configura tu servidor web para manejar SPAs
