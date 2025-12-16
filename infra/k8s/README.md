# Kubernetes Deployment Guide - RatGym

Este directorio contiene las configuraciones de Kubernetes para desplegar RatGym.

## Prerequisitos

1. Kubernetes cluster (minikube, k3s, o cloud provider)
2. kubectl configurado
3. Nginx Ingress Controller instalado

```bash
# Para minikube
minikube addons enable ingress

# Para k8s general
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.1/deploy/static/provider/cloud/deploy.yaml
```

## Estructura

```
k8s/
├── configmap.yaml              # Variables de entorno compartidas
├── ingress.yaml                # Configuración de rutas
├── secrets-example.sh          # Template para crear secrets
├── deployments/
│   ├── user-service.yaml       # Servicio de usuarios con Firebase
│   ├── saga-orchestrator.yaml  # Orquestador de sagas
│   └── ...                     # Otros microservicios
└── services/
    └── rabbitmq.yaml           # RabbitMQ para mensajería
```

## Despliegue

### 1. Crear ConfigMap

```bash
kubectl apply -f configmap.yaml
```

### 2. Crear Secrets

Edita y ejecuta el script de secrets:

```bash
# Edita secrets-example.sh con tus credenciales
# Luego ejecuta los comandos del archivo
```

### 3. Desplegar RabbitMQ

```bash
kubectl apply -f services/rabbitmq.yaml
```

### 4. Desplegar Microservicios

```bash
kubectl apply -f deployments/user-service.yaml
kubectl apply -f deployments/saga-orchestrator.yaml
# ... otros servicios
```

### 5. Configurar Ingress

```bash
kubectl apply -f ingress.yaml
```

### 6. Configurar DNS Local (para desarrollo)

Agrega a tu archivo hosts:

**Windows:** `C:\Windows\System32\drivers\etc\hosts`
**Linux/Mac:** `/etc/hosts`

```
127.0.0.1 ratgym.local
```

Para minikube:
```bash
minikube ip  # Usa esta IP en lugar de 127.0.0.1
```

## Acceso a los Servicios

- **Shell (Frontend):** http://ratgym.local
- **Auth MF:** http://ratgym.local/auth
- **User Service:** http://ratgym.local/user-service
- **Saga Orchestrator:** http://ratgym.local/saga
- **API Gateway:** http://ratgym.local/api
- **RabbitMQ Management:** `kubectl port-forward svc/rabbitmq 15672:15672`

## Verificación

```bash
# Ver todos los pods
kubectl get pods

# Ver todos los servicios
kubectl get services

# Ver ingress
kubectl get ingress

# Logs de un servicio
kubectl logs -f deployment/user-service

# Describir un pod
kubectl describe pod <pod-name>
```

## Escalar Servicios

```bash
# Escalar user-service a 3 replicas
kubectl scale deployment user-service --replicas=3

# Auto-scaling (opcional)
kubectl autoscale deployment user-service --min=2 --max=10 --cpu-percent=80
```

## Actualizar Servicios

```bash
# Actualizar imagen
kubectl set image deployment/user-service user-service=ratgym/user-service:v2

# Aplicar cambios en YAML
kubectl apply -f deployments/user-service.yaml
```

## Troubleshooting

### Pod no inicia

```bash
kubectl describe pod <pod-name>
kubectl logs <pod-name>
```

### Problemas de red

```bash
# Probar conectividad entre pods
kubectl run -it --rm debug --image=busybox --restart=Never -- sh
# Dentro del pod:
wget -O- http://user-service:3001
```

### RabbitMQ no conecta

```bash
# Verificar que RabbitMQ esté corriendo
kubectl get pods | grep rabbitmq

# Ver logs de RabbitMQ
kubectl logs deployment/rabbitmq
```

## Producción

Para producción, considera:

1. **Usar Persistent Volumes** para RabbitMQ
2. **Configurar TLS** en el Ingress
3. **Usar secrets externos** (HashiCorp Vault, AWS Secrets Manager)
4. **Configurar Health Checks** apropiados
5. **Implementar Monitoring** (Prometheus, Grafana)
6. **Configurar Network Policies** para seguridad
7. **Usar Helm Charts** para gestión más fácil

## Limpieza

```bash
# Eliminar todo
kubectl delete -f deployments/
kubectl delete -f services/
kubectl delete -f ingress.yaml
kubectl delete -f configmap.yaml
kubectl delete secret ratgym-secrets firebase-secrets firebase-web-config
```
