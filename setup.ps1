# Script para configurar el proyecto RatGym en PowerShell
Write-Host "🐀 Configurando RatGym..." -ForegroundColor Cyan

function Print-Success {
    param($message)
    Write-Host "[✓] $message" -ForegroundColor Green
}

function Print-Warning {
    param($message)
    Write-Host "[!] $message" -ForegroundColor Yellow
}

function Print-Error {
    param($message)
    Write-Host "[✗] $message" -ForegroundColor Red
}

# Verificar Node.js
if (!(Get-Command node -ErrorAction SilentlyContinue)) {
    Print-Error "Node.js no está instalado. Por favor instala Node.js 18+"
    exit 1
}
Print-Success "Node.js encontrado: $(node --version)"

# Verificar npm
if (!(Get-Command npm -ErrorAction SilentlyContinue)) {
    Print-Error "npm no está instalado"
    exit 1
}
Print-Success "npm encontrado: $(npm --version)"

# Crear archivos .env si no existen
if (!(Test-Path .env)) {
    Print-Warning "Creando .env desde .env.example..."
    Copy-Item .env.example .env
    Print-Success ".env creado. ¡No olvides configurar tus credenciales!"
}

# User Service
Write-Host "`n📦 Configurando User Service..." -ForegroundColor Cyan
Set-Location apps\user-service
if (!(Test-Path .env)) {
    Copy-Item .env.example .env
    Print-Success "user-service/.env creado"
}
if (!(Test-Path node_modules)) {
    Print-Success "Instalando dependencias..."
    npm install
}
Set-Location ..\..

# Saga Orchestrator
Write-Host "`n📦 Configurando Saga Orchestrator..." -ForegroundColor Cyan
Set-Location apps\saga-orchestrator
if (!(Test-Path .env)) {
    Copy-Item .env.example .env
    Print-Success "saga-orchestrator/.env creado"
}
if (!(Test-Path node_modules)) {
    Print-Success "Instalando dependencias..."
    npm install
}
Set-Location ..\..

# Auth MF
Write-Host "`n📦 Configurando Auth Microfrontend..." -ForegroundColor Cyan
Set-Location apps\frontend\auth-mf
if (!(Test-Path .env)) {
    Copy-Item .env.example .env
    Print-Success "auth-mf/.env creado"
}
if (!(Test-Path node_modules)) {
    Print-Success "Instalando dependencias..."
    npm install
}
Set-Location ..\..\..

# Shell
Write-Host "`n📦 Configurando Shell..." -ForegroundColor Cyan
Set-Location apps\frontend\shell
if (!(Test-Path node_modules)) {
    Print-Success "Instalando dependencias..."
    npm install
}
Set-Location ..\..\..

Write-Host "`n"
Print-Success "✨ Configuración completada!"
Write-Host "`n📝 Próximos pasos:"
Write-Host "  1. Configura tus credenciales de Firebase en los archivos .env"
Write-Host "  2. Inicia RabbitMQ: docker run -d -p 5672:5672 -p 15672:15672 rabbitmq:3.12-management"
Write-Host "  3. Inicia los servicios:"
Write-Host "     - User Service: cd apps\user-service; npm run start:dev"
Write-Host "     - Saga Orchestrator: cd apps\saga-orchestrator; npm run start:dev"
Write-Host "     - Auth MF: cd apps\frontend\auth-mf; npm run dev"
Write-Host "     - Shell: cd apps\frontend\shell; npm run dev"
Write-Host "`nO ejecuta todo con Docker Compose: docker-compose up -d"
Write-Host ""
