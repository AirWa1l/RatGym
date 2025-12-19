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

Write-Host "🐳 Construyendo nutrition-service (backend)..." -ForegroundColor Yellow
docker build -t ratgym/nutrition-service:latest ./apps/nutrition-service/backend

Write-Host "🐳 Construyendo recommendation-service..." -ForegroundColor Yellow
docker build -t ratgym/recommendations-service:latest ./apps/recommendation-service

Write-Host "🐳 Construyendo shell (frontend)..." -ForegroundColor Yellow
docker build -t ratgym/shell:latest ./apps/frontend/shell

# ===============================
# 📦 Verificar imágenes
# ===============================

Write-Host "📦 Imágenes construidas:" -ForegroundColor Green
docker images | Select-String ratgym

# ===============================
# 🚀 Deploy Kubernetes
# ===============================

Write-Host "🚀 Desplegando ConfigMaps y RabbitMQ..." -ForegroundColor Yellow
kubectl apply -f infra/k8s/configmap.yaml
kubectl apply -f infra/k8s/services/rabbitmq.yaml

Start-Sleep -Seconds 15

Write-Host "🚀 Desplegando microservicios..." -ForegroundColor Yellow
kubectl apply -f infra/k8s/deployments/

# ===============================
# 🤖 Deploy IA - LLaMA (Ollama)
# ===============================

Write-Host "🤖 Desplegando LLaMA Service..." -ForegroundColor Magenta
kubectl apply -f infra/k8s/deployments/llama-service.yaml

# ===============================
# 📊 Estado
# ===============================

Write-Host "📊 Estado de los pods:" -ForegroundColor Cyan
kubectl get pods

# ===============================
# 🌐 Accesos
# ===============================

Write-Host "`n🌐 Para acceder a los servicios:" -ForegroundColor Green
Write-Host "kubectl port-forward svc/shell 3000:3000" -ForegroundColor White
Write-Host "kubectl port-forward svc/user-service 3001:3001" -ForegroundColor White
Write-Host "kubectl port-forward svc/routine-service 3002:3002" -ForegroundColor White
Write-Host "kubectl port-forward svc/class-service 3003:3003" -ForegroundColor White
Write-Host "kubectl port-forward svc/nutrition-service 3004:3004" -ForegroundColor White
Write-Host "kubectl port-forward svc/saga-orchestrator 3005:3005" -ForegroundColor White
Write-Host "kubectl port-forward svc/llama-service 11434:11434" -ForegroundColor White
