# Etapa de construcción
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar archivos de configuración
COPY package*.json ./
COPY tsconfig.json ./
COPY nest-cli.json ./

# Instalar todas las dependencias
RUN npm install

# Copiar código fuente
COPY src ./src

# Compilar
RUN npm run build

# Etapa de producción
FROM node:20-alpine

WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar solo dependencias de producción
RUN npm install --omit=dev

# Copiar el código compilado
COPY --from=builder /app/dist ./dist

# Exponer puerto
EXPOSE 3010

# Comando de inicio
CMD ["node", "dist/main.js"]
