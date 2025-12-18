#!/bin/bash
set -e

echo "🚀 Iniciando entorno IA + Nutrition Service"

# -----------------------------
# 1️⃣ Verificar Kubernetes
# -----------------------------
echo "🔍 Verificando cluster..."
kubectl version --client > /dev/null

if ! kubectl get nodes > /dev/null 2>&1; then
  echo "❌ Kubernetes no está activo"
  exit 1
fi

# -----------------------------
# 2️⃣ Build imagen nutrition-service (backend)
# -----------------------------
echo "🐳 Construyendo imagen nutrition-service..."

docker build \
  -t ratgym/nutrition-service:latest \
  -f apps/nutrition-service/backend/Dockerfile \
  apps/nutrition-service/backend

# -----------------------------
# 3️⃣ Desplegar LLaMA
# -----------------------------
echo "🤖 Desplegando LLaMA (Ollama)..."

kubectl apply -f infra/k8s/deployments/llama-service.yaml

echo "⏳ Esperando a que LLaMA esté listo..."
kubectl wait \
  --for=condition=available \
  deployment/llama-service \
  --timeout=300s

# -----------------------------
# 4️⃣ Desplegar Nutrition Service
# -----------------------------
echo "🥗 Desplegando nutrition-service..."

kubectl apply -f infra/k8s/deployments/nutrition-service.yaml

echo "⏳ Esperando nutrition-service..."
kubectl wait \
  --for=condition=available \
  deployment/nutrition-service \
  --timeout=180s

# -----------------------------
# 5️⃣ Estado final
# -----------------------------
echo "📦 Pods activos:"
kubectl get pods

echo "✅ TODO LISTO"
echo ""
echo "👉 Para probar localmente:"
echo "kubectl port-forward service/nutrition-service 3004:3004"
