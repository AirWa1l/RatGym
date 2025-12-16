# Shell

Aplicación principal que integra los microfrontends.

## Inicio

```bash
npm install
npm run dev
```

Puerto: 3000

## Microfrontends

- **authMf** (puerto 3001): Login con LocalStorage

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
