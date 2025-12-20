# Routine Service Frontend

Frontend del servicio de rutinas para RatGym.

## 🚀 Inicio Rápido

```bash
# Instalar dependencias
npm install

# Iniciar en modo desarrollo
npm run dev
```

El frontend estará disponible en: http://localhost:3006

## 📁 Estructura

```
frontend/
├── src/
│   ├── components/
│   │   ├── RoutineWidget.tsx    # Componente principal
│   │   └── RoutineWidget.css    # Estilos
│   ├── services/
│   │   └── routine.service.ts   # API calls y utilidades
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## 🔗 API Backend

Este frontend se conecta al backend de routine-service en el puerto 3002.

Asegúrate de que el backend esté corriendo:
```bash
cd ../  # Ir a routine-service root
npm run start:dev
```

## 📦 Exportar componente

El `RoutineWidget` puede ser importado desde este paquete para usarse en otros proyectos (como el shell principal):

```tsx
import RoutineWidget from 'routine-frontend/components/RoutineWidget';

<RoutineWidget userId="user123" compact={false} />
```

### Props

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `userId` | string | 'guest' | ID del usuario |
| `compact` | boolean | false | Vista compacta para dashboard |
