# Kubernetes Deployment - RatGym 🚢

Configuración simplificada para desplegar RatGym en Kubernetes.

## 📋 Pre-requisitos

- Kubernetes cluster (minikube, kind, GKE, EKS, AKS)
- kubectl configurado
- Nginx Ingress Controller

```bash
# Instalar Ingress Controller (minikube)
minikube addons enable ingress

# O para cluster general
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.1/deploy/static/provider/cloud/deploy.yaml
```

## 📁 Estructura

```
k8s/
├── configmap.yaml           # Variables de entorno
├── ingress.yaml            # Rutas HTTP
├── deployments/
│   ├── user-service.yaml       # Auth + Users (puerto 3001)
│   ├── saga-orchestrator.yaml  # Sagas (puerto 3005)
│   └── shell.yaml              # Frontend (puerto 3000)
└── services/
    └── rabbitmq.yaml           # RabbitMQ
```

## 🚀 Despliegue Rápido

### 1. Aplicar ConfigMap
```bash
kubectl apply -f configmap.yaml
```

### 2. Desplegar RabbitMQ
```bash
kubectl apply -f services/rabbitmq.yaml
```

### 3. Desplegar Microservicios
```bash
kubectl apply -f deployments/user-service.yaml
kubectl apply -f deployments/saga-orchestrator.yaml
kubectl apply -f deployments/shell.yaml
```

### 4. Configurar Ingress
```bash
kubectl apply -f ingress.yaml
```

### 5. Verificar Estado
```bash
# Ver pods
kubectl get pods

# Ver servicios
kubectl get services

# Ver ingress
kubectl get ingress

# Logs de un servicio
kubectl logs -f deployment/user-service
```

## 🌐 Acceso

### Con Minikube
```bash
# Obtener IP
minikube ip

# Agregar a /etc/hosts (Linux/Mac) o C:\Windows\System32\drivers\etc\hosts (Windows)
<MINIKUBE_IP> ratgym.local

# Acceder
http://ratgym.local
```

### Con LoadBalancer (Cloud)
```bash
# Obtener IP externa
kubectl get ingress ratgym-ingress

# Acceder usando la IP o configurar DNS
http://<EXTERNAL-IP>
```

## 🔧 Configuración

### Variables de Entorno (configmap.yaml)
```yaml
RABBITMQ_URL: "amqp://rabbitmq:5672"
USER_SERVICE_URL: "http://user-service:3001"
SAGA_ORCHESTRATOR_URL: "http://saga-orchestrator:3005"
```

### Escalado
```bash
# Escalar user-service
kubectl scale deployment user-service --replicas=3

# Escalar shell
kubectl scale deployment shell --replicas=2

# Auto-scaling (HPA)
kubectl autoscale deployment user-service --cpu-percent=70 --min=2 --max=10
```

## 📊 Monitoreo

### Logs en tiempo real
```bash
# Ver logs de todos los pods de un deployment
kubectl logs -f -l app=user-service

# Ver logs de saga-orchestrator
kubectl logs -f deployment/saga-orchestrator

# Ver logs de RabbitMQ
kubectl logs -f statefulset/rabbitmq
```

### Métricas
```bash
# CPU y memoria de pods
kubectl top pods

# Métricas de nodos
kubectl top nodes
```

### Debugging
```bash
# Describir un pod con problemas
kubectl describe pod <pod-name>

# Ejecutar comandos dentro de un pod
kubectl exec -it <pod-name> -- /bin/sh

# Ver eventos
kubectl get events --sort-by=.metadata.creationTimestamp
```

## 🔄 Actualización

### Rolling Update
```bash
# Actualizar imagen
kubectl set image deployment/user-service user-service=ratgym/user-service:v2

# Ver estado del rollout
kubectl rollout status deployment/user-service

# Rollback si algo sale mal
kubectl rollout undo deployment/user-service
```

### Actualizar configuración
```bash
# Editar ConfigMap
kubectl edit configmap ratgym-config

# Reiniciar deployments para aplicar cambios
kubectl rollout restart deployment/user-service
kubectl rollout restart deployment/saga-orchestrator
```

## 🧹 Limpieza

```bash
# Eliminar todo
kubectl delete -f deployments/
kubectl delete -f services/
kubectl delete -f ingress.yaml
kubectl delete -f configmap.yaml

# O eliminar por namespace (si usaste uno específico)
kubectl delete namespace ratgym
```

## 🏗️ Arquitectura en K8s

```
┌─────────────────────────────────────────────────┐
│              Ingress (ratgym.local)             │
│  ┌──────────┬────────────┬──────────────────┐  │
│  │ / → Shell│ /user-...  │ /saga/...        │  │
└──┴──────────┴────────────┴──────────────────┴──┘
        │              │              │
   ┌────▼────┐   ┌────▼────┐   ┌────▼────┐
   │  Shell  │   │  User   │   │  Saga   │
   │ (x2)    │   │ Service │   │  Orch.  │
   │         │   │ (x2)    │   │ (x1)    │
   └─────────┘   └────┬────┘   └────┬────┘
                      │              │
                 ┌────▼──────────────▼────┐
                 │     RabbitMQ (x1)      │
                 └────────────────────────┘
```

## 📝 Puertos

| Servicio          | Puerto Interno | Puerto Externo |
|-------------------|----------------|----------------|
| Shell             | 80             | 3000           |
| User Service      | 3001           | 3001           |
| Saga Orchestrator | 3005           | 3005           |
| RabbitMQ AMQP     | 5672           | 5672           |
| RabbitMQ UI       | 15672          | 15672          |

## ⚠️ Notas Importantes

1. **Persistencia**: RabbitMQ usa StatefulSet con PersistentVolume
2. **Replicas**: User Service y Shell tienen 2 réplicas por defecto
3. **Health Checks**: Todos los servicios tienen liveness y readiness probes
4. **Resources**: Se definen límites de CPU y memoria para cada pod
5. **Networking**: Todos los servicios usan ClusterIP (internos), excepto cuando se exponen vía Ingress

## 🆘 Troubleshooting

### Pods no inician
```bash
# Ver por qué falla
kubectl describe pod <pod-name>

# Verificar logs
kubectl logs <pod-name>

# Verificar recursos
kubectl top nodes
```

### RabbitMQ no conecta
```bash
# Verificar que RabbitMQ está corriendo
kubectl get pods -l app=rabbitmq

# Ver logs
kubectl logs -f statefulset/rabbitmq

# Port-forward para debugging
kubectl port-forward svc/rabbitmq 15672:15672
# Accede a http://localhost:15672
```

### Ingress no funciona
```bash
# Verificar que ingress controller está instalado
kubectl get pods -n ingress-nginx

# Ver detalles del ingress
kubectl describe ingress ratgym-ingress

# Ver logs del controller
kubectl logs -n ingress-nginx -l app.kubernetes.io/name=ingress-nginx
```

## 🔐 Seguridad (TODO)

Para producción, considera:
- [ ] Usar Secrets para datos sensibles
- [ ] Habilitar NetworkPolicies
- [ ] Configurar RBAC
- [ ] Usar TLS/HTTPS en Ingress
- [ ] Implementar Pod Security Standards
