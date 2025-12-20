# ===============================
# RatGym - Deploy Kubernetes
# ===============================

Write-Host "🔧 Configurando Docker para Minikube..." -ForegroundColor Cyan
minikube docker-env | Invoke-Expression

# ===============================
# 🐳 Construir imágenes
# ===============================

Write-Host "🐳 Construyendo user-service..." -ForegroundColor Yellow
docker build -t ratgym/user-service:latest ./apps/user-service

Write-Host "🐳 Construyendo routine-service..." -ForegroundColor Yellow
docker build -t ratgym/routine-service:latest ./apps/routine-service

Write-Host "🐳 Construyendo class-service..." -ForegroundColor Yellow
docker build -t ratgym/class-service:latest ./apps/class-service

Write-Host "🐳 Construyendo saga-orchestrator..." -ForegroundColor Yellow
docker build -t ratgym/saga-orchestrator:latest ./apps/saga-orchestrator

Write-Host "🐳 Construyendo notification-service..." -ForegroundColor Yellow
docker build -t ratgym/notification-service:latest ./apps/notification-service

Write-Host "🐳 Construyendo nutrition-service (backend)..." -ForegroundColor Yellow
docker build -t ratgym/nutrition-service:latest ./apps/nutrition-service/backend

Write-Host "🐳 Construyendo recommendation-service..." -ForegroundColor Yellow
docker build -t ratgym/recommendations-service:latest ./apps/recommendation-service

Write-Host "🐳 Construyendo shell (frontend)..." -ForegroundColor Yellow
docker build -t ratgym/shell:latest ./apps/shell

# ===============================
# 📦 Verificar imágenes
# ===============================

Write-Host "📦 Imágenes construidas:" -ForegroundColor Green
docker images | Select-String ratgym

# ===============================
# 🚀 Deploy Kubernetes
# ===============================

Write-Host "`n🚀 Desplegando ConfigMaps y RabbitMQ..." -ForegroundColor Yellow
kubectl apply -f infra/k8s/configmap.yaml
kubectl apply -f infra/k8s/services/rabbitmq.yaml

Start-Sleep -Seconds 15

Write-Host "🚀 Desplegando microservicios..." -ForegroundColor Yellow
kubectl apply -f infra/k8s/deployments/

Write-Host "⏳ Esperando 10 segundos para que los deployments se actualicen..." -ForegroundColor Gray
Start-Sleep -Seconds 10

Write-Host "🔄 Forzando recreación de pods para usar nuevas imágenes..." -ForegroundColor Yellow
kubectl delete pods -l app=saga-orchestrator --ignore-not-found=true
kubectl delete pods -l app=shell --ignore-not-found=true

# ===============================
# 🤖 Deploy IA - LLaMA (Ollama)
# ===============================

Write-Host "`n🤖 Desplegando LLaMA Service..." -ForegroundColor Magenta
kubectl apply -f infra/k8s/deployments/llama-service.yaml
Write-Host "`n🔌 Desplegando Ingress..." -ForegroundColor Cyan
kubectl apply -f infra/k8s/ingress.yaml
# ===============================
# � Estado
# ===============================

Write-Host "`n📊 Estado de los pods:" -ForegroundColor Cyan
kubectl get pods

# ===============================
# 🚀 INICIO RÁPIDO
# ===============================

Write-Host "`n🚀 ACCEDER A LA APLICACIÓN:" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""
Write-Host "Opción 1 - Todos los servicios (Recomendado):" -ForegroundColor Cyan
Write-Host "  .\port-forward.ps1" -ForegroundColor Yellow
Write-Host ""
Write-Host "Opción 2 - Solo Frontend:" -ForegroundColor Cyan
Write-Host "  kubectl port-forward svc/shell 3000:3000" -ForegroundColor Yellow
Write-Host ""
Write-Host "Luego abre: http://localhost:3000" -ForegroundColor Green

# ===============================
# 📊 Herramientas Adicionales
# ===============================

Write-Host "`n📊 RabbitMQ Management:" -ForegroundColor Cyan
Write-Host "  kubectl port-forward svc/rabbitmq 15672:15672" -ForegroundColor Yellow
Write-Host "  http://localhost:15672 (guest/guest)" -ForegroundColor White

Write-Host "`n🎭 Saga Orchestrator API:" -ForegroundColor Magenta
Write-Host "  kubectl port-forward svc/saga-orchestrator 3005:3005" -ForegroundColor Yellow
Write-Host "  http://localhost:3005/saga" -ForegroundColor White

Write-Host "`n✅ Deploy completado!" -ForegroundColor Green

# ===============================
# 🗑️ Limpiar Recursos
# ===============================

Write-Host "`n🗑️  Para limpiar y eliminar todos los recursos:" -ForegroundColor Red
Write-Host "  .\destructor.ps1" -ForegroundColor Yellow
