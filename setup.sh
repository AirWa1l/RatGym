#!/bin/bash

# Script para configurar el proyecto RatGym
echo "🐀 Configurando RatGym..."

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Función para imprimir mensajes
print_msg() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_warn() {
    echo -e "${YELLOW}[!]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

# Verificar Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js no está instalado. Por favor instala Node.js 18+"
    exit 1
fi
print_msg "Node.js encontrado: $(node --version)"

# Verificar npm
if ! command -v npm &> /dev/null; then
    print_error "npm no está instalado"
    exit 1
fi
print_msg "npm encontrado: $(npm --version)"

# Crear archivos .env si no existen
if [ ! -f .env ]; then
    print_warn "Creando .env desde .env.example..."
    cp .env.example .env
    print_msg ".env creado. ¡No olvides configurar tus credenciales!"
fi

# User Service
echo ""
echo "📦 Configurando User Service..."
cd apps/user-service
if [ ! -f .env ]; then
    cp .env.example .env
    print_msg "user-service/.env creado"
fi
if [ ! -d node_modules ]; then
    print_msg "Instalando dependencias..."
    npm install
fi
cd ../..

# Saga Orchestrator
echo ""
echo "📦 Configurando Saga Orchestrator..."
cd apps/saga-orchestrator
if [ ! -f .env ]; then
    cp .env.example .env
    print_msg "saga-orchestrator/.env creado"
fi
if [ ! -d node_modules ]; then
    print_msg "Instalando dependencias..."
    npm install
fi
cd ../..

# Auth MF
echo ""
echo "📦 Configurando Auth Microfrontend..."
cd apps/frontend/auth-mf
if [ ! -f .env ]; then
    cp .env.example .env
    print_msg "auth-mf/.env creado"
fi
if [ ! -d node_modules ]; then
    print_msg "Instalando dependencias..."
    npm install
fi
cd ../../..

# Shell
echo ""
echo "📦 Configurando Shell..."
cd apps/frontend/shell
if [ ! -d node_modules ]; then
    print_msg "Instalando dependencias..."
    npm install
fi
cd ../../..

echo ""
print_msg "✨ Configuración completada!"
echo ""
echo "📝 Próximos pasos:"
echo "  1. Configura tus credenciales de Firebase en los archivos .env"
echo "  2. Inicia RabbitMQ: docker run -d -p 5672:5672 -p 15672:15672 rabbitmq:3.12-management"
echo "  3. Inicia los servicios:"
echo "     - User Service: cd apps/user-service && npm run start:dev"
echo "     - Saga Orchestrator: cd apps/saga-orchestrator && npm run start:dev"
echo "     - Auth MF: cd apps/frontend/auth-mf && npm run dev"
echo "     - Shell: cd apps/frontend/shell && npm run dev"
echo ""
echo "O ejecuta todo con Docker Compose: docker-compose up -d"
echo ""
