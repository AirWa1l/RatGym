# ===============================
# RatGym - Destructor (Cleanup)
# ===============================

Write-Host "🗑️  Limpiando recursos de RatGym en Kubernetes..." -ForegroundColor Red
Write-Host ""

# ===============================
# ⚠️ Confirmación
# ===============================

$confirmation = Read-Host "¿Estás seguro de eliminar TODOS los recursos de RatGym? (S/N)"

if ($confirmation -ne 'S' -and $confirmation -ne 's') {
    Write-Host "❌ Operación cancelada." -ForegroundColor Yellow
    exit
}

Write-Host ""

# ===============================
# 🔴 Eliminar Ingress
# ===============================

Write-Host "🔴 Eliminando Ingress..." -ForegroundColor Red
kubectl delete -f infra/k8s/ingress.yaml --ignore-not-found=true

# ===============================
# 🔴 Eliminar Deployments
# ===============================

Write-Host "🔴 Eliminando todos los deployments..." -ForegroundColor Red
kubectl delete -f infra/k8s/deployments/ --all --ignore-not-found=true

# ===============================
# 🔴 Eliminar RabbitMQ
# ===============================

Write-Host "🔴 Eliminando RabbitMQ..." -ForegroundColor Red
kubectl delete -f infra/k8s/services/rabbitmq.yaml --ignore-not-found=true

# ===============================
# 🔴 Eliminar ConfigMaps
# ===============================

Write-Host "🔴 Eliminando ConfigMaps..." -ForegroundColor Red
kubectl delete -f infra/k8s/configmap.yaml --ignore-not-found=true

# ===============================
# 🔴 Eliminar Pods huérfanos
# ===============================

Write-Host "🔴 Eliminando pods huérfanos..." -ForegroundColor Red
kubectl delete pods --all --grace-period=0 --force --ignore-not-found=true

# ===============================
# 🔴 Eliminar PersistentVolumeClaims
# ===============================

Write-Host "🔴 Eliminando PersistentVolumeClaims..." -ForegroundColor Red
kubectl delete pvc --all --ignore-not-found=true

# ===============================
# 🔴 Eliminar Services huérfanos
# ===============================

Write-Host "🔴 Eliminando services huérfanos de RatGym..." -ForegroundColor Red
$services = @(
    "user-service",
    "routine-service",
    "class-service",
    "nutrition-service",
    "saga-orchestrator",
    "notification-service",
    "recommendation-service",
    "shell",
    "rabbitmq",
    "llama-service"
)

foreach ($svc in $services) {
    kubectl delete svc $svc --ignore-not-found=true 2>$null
}

# ===============================
# 📊 Verificar limpieza
# ===============================

Start-Sleep -Seconds 3

Write-Host "`n📊 Verificando recursos restantes..." -ForegroundColor Cyan

Write-Host "`nPods:" -ForegroundColor Yellow
kubectl get pods

Write-Host "`nDeployments:" -ForegroundColor Yellow
kubectl get deployments

Write-Host "`nServices:" -ForegroundColor Yellow
kubectl get services

Write-Host "`nConfigMaps:" -ForegroundColor Yellow
kubectl get configmaps

Write-Host "`nIngress:" -ForegroundColor Yellow
kubectl get ingress

# ===============================
# 🧹 Opcional: Limpiar NGINX Ingress Controller
# ===============================

Write-Host "`n🧹 ¿Deseas eliminar también el NGINX Ingress Controller? (S/N)" -ForegroundColor Yellow
$deleteIngress = Read-Host

if ($deleteIngress -eq 'S' -or $deleteIngress -eq 's') {
    Write-Host "🔴 Eliminando NGINX Ingress Controller..." -ForegroundColor Red
    kubectl delete -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.1/deploy/static/provider/cloud/deploy.yaml --ignore-not-found=true
    Write-Host "✅ NGINX Ingress Controller eliminado" -ForegroundColor Green
} else {
    Write-Host "ℹ️  NGINX Ingress Controller mantenido" -ForegroundColor Cyan
}

# ===============================
# 🐳 Opcional: Limpiar imágenes Docker
# ===============================

Write-Host "`n🐳 ¿Deseas eliminar las imágenes Docker de RatGym? (S/N)" -ForegroundColor Yellow
$deleteImages = Read-Host

if ($deleteImages -eq 'S' -or $deleteImages -eq 's') {
    Write-Host "🔴 Eliminando imágenes Docker..." -ForegroundColor Red
    
    $images = @(
        "ratgym/user-service:latest",
        "ratgym/routine-service:latest",
        "ratgym/class-service:latest",
        "ratgym/nutrition-service:latest",
        "ratgym/saga-orchestrator:latest",
        "ratgym/notification-service:latest",
        "ratgym/recommendations-service:latest",
        "ratgym/shell:latest"
    )
    
    foreach ($img in $images) {
        docker rmi $img --force 2>$null
        if ($?) {
            Write-Host "  ✓ Eliminada: $img" -ForegroundColor Gray
        }
    }
    
    Write-Host "✅ Imágenes Docker eliminadas" -ForegroundColor Green
} else {
    Write-Host "ℹ️  Imágenes Docker mantenidas" -ForegroundColor Cyan
}

# ===============================
# ✅ Completado
# ===============================

Write-Host "`n✅ Limpieza completada!" -ForegroundColor Green
Write-Host "Para volver a desplegar, ejecuta: .\constructor.sh" -ForegroundColor White
