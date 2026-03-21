# Kubernetes (K8s)

## 핵심 개념
> Kubernetes는 컨테이너 오케스트레이션 플랫폼으로, 컨테이너의 배포, 확장, 관리를 자동화한다.

## 왜 Kubernetes인가?

```
Docker만 사용:
- 서버 1대에서 컨테이너 관리 → 괜찮음
- 서버 100대에서 수천 개 컨테이너 → 수동 관리 불가능

Kubernetes가 해결하는 것:
- 자동 배포 & 롤백
- 자동 스케일링 (부하에 따라 Pod 수 조절)
- 자동 복구 (컨테이너 장애 시 재시작)
- 서비스 디스커버리 & 로드 밸런싱
```

## 아키텍처

```
┌────────────────────────────────────────┐
│            Control Plane                │
│  ┌──────────┐  ┌──────────────────┐   │
│  │ API Server│  │ etcd (상태 저장)  │   │
│  └──────────┘  └──────────────────┘   │
│  ┌──────────┐  ┌──────────────────┐   │
│  │Scheduler │  │Controller Manager│   │
│  └──────────┘  └──────────────────┘   │
└────────────────────────────────────────┘
         ↓                ↓
┌────────────────┐  ┌────────────────┐
│   Worker Node   │  │   Worker Node   │
│ ┌────────────┐ │  │ ┌────────────┐ │
│ │   kubelet   │ │  │ │   kubelet   │ │
│ ├────────────┤ │  │ ├────────────┤ │
│ │ kube-proxy │ │  │ │ kube-proxy │ │
│ ├────────────┤ │  │ ├────────────┤ │
│ │ Pod  │ Pod  │ │  │ │ Pod  │ Pod  │ │
│ └────────────┘ │  │ └────────────┘ │
└────────────────┘  └────────────────┘
```

| 컴포넌트 | 역할 |
|----------|------|
| **API Server** | 모든 통신의 중심, kubectl 명령 수신 |
| **etcd** | 클러스터 상태를 저장하는 키-값 저장소 |
| **Scheduler** | Pod를 적절한 노드에 배치 |
| **Controller Manager** | 원하는 상태(desired state)를 유지 |
| **kubelet** | 노드에서 Pod를 관리하는 에이전트 |
| **kube-proxy** | 네트워크 규칙, 서비스 로드 밸런싱 |

## 핵심 오브젝트

### Pod

```yaml
# 가장 작은 배포 단위 (보통 컨테이너 1개 = Pod 1개)
apiVersion: v1
kind: Pod
metadata:
  name: myapp
spec:
  containers:
    - name: myapp
      image: myapp:1.0
      ports:
        - containerPort: 8080
      resources:
        requests:
          cpu: "250m"
          memory: "256Mi"
        limits:
          cpu: "500m"
          memory: "512Mi"
```

### Deployment

```yaml
# Pod의 선언적 관리 (스케일링, 롤링 업데이트)
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp
spec:
  replicas: 3                    # Pod 3개 유지
  selector:
    matchLabels:
      app: myapp
  strategy:
    type: RollingUpdate          # 무중단 배포
    rollingUpdate:
      maxSurge: 1                # 최대 1개 추가 생성
      maxUnavailable: 0          # 최소 가용 Pod 유지
  template:
    metadata:
      labels:
        app: myapp
    spec:
      containers:
        - name: myapp
          image: myapp:1.0
          ports:
            - containerPort: 8080
          readinessProbe:        # 트래픽 수신 가능 여부
            httpGet:
              path: /actuator/health
              port: 8080
            initialDelaySeconds: 15
            periodSeconds: 5
          livenessProbe:         # 컨테이너 정상 여부
            httpGet:
              path: /actuator/health
              port: 8080
            initialDelaySeconds: 30
            periodSeconds: 10
          resources:
            requests:
              cpu: "250m"
              memory: "512Mi"
            limits:
              cpu: "500m"
              memory: "1Gi"
```

### Service

```yaml
# Pod에 안정적인 네트워크 엔드포인트 제공
apiVersion: v1
kind: Service
metadata:
  name: myapp-service
spec:
  type: ClusterIP              # 클러스터 내부에서만 접근
  selector:
    app: myapp
  ports:
    - port: 80                 # 서비스 포트
      targetPort: 8080         # Pod 포트
```

**Service 타입:**

| 타입 | 설명 |
|------|------|
| **ClusterIP** (기본) | 클러스터 내부에서만 접근 |
| **NodePort** | 노드의 포트로 외부 접근 (30000~32767) |
| **LoadBalancer** | 클라우드 로드 밸런서 자동 생성 |

### Ingress

```yaml
# HTTP/HTTPS 라우팅 (L7 로드 밸런서)
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: myapp-ingress
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  rules:
    - host: api.example.com
      http:
        paths:
          - path: /orders
            pathType: Prefix
            backend:
              service:
                name: order-service
                port:
                  number: 80
          - path: /users
            pathType: Prefix
            backend:
              service:
                name: user-service
                port:
                  number: 80
```

### ConfigMap & Secret

```yaml
# ConfigMap — 설정 데이터
apiVersion: v1
kind: ConfigMap
metadata:
  name: myapp-config
data:
  SPRING_PROFILES_ACTIVE: "prod"
  SERVER_PORT: "8080"

---
# Secret — 민감한 데이터 (Base64 인코딩)
apiVersion: v1
kind: Secret
metadata:
  name: myapp-secret
type: Opaque
data:
  DB_PASSWORD: cGFzc3dvcmQ=    # base64 encoded

---
# Deployment에서 사용
spec:
  containers:
    - name: myapp
      envFrom:
        - configMapRef:
            name: myapp-config
        - secretRef:
            name: myapp-secret
```

### HPA (Horizontal Pod Autoscaler)

```yaml
# CPU 사용률에 따라 자동 스케일링
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: myapp-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: myapp
  minReplicas: 2
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70   # CPU 70% 초과 시 스케일 아웃
```

## 주요 kubectl 명령어

```bash
# 조회
kubectl get pods
kubectl get deployments
kubectl get services
kubectl get all

# 상세 정보
kubectl describe pod myapp-xxxxx
kubectl logs myapp-xxxxx           # 로그
kubectl logs myapp-xxxxx -f        # 실시간 로그

# 배포
kubectl apply -f deployment.yaml   # 선언적 배포
kubectl rollout status deployment/myapp
kubectl rollout history deployment/myapp

# 롤백
kubectl rollout undo deployment/myapp

# 스케일링
kubectl scale deployment myapp --replicas=5

# 디버깅
kubectl exec -it myapp-xxxxx -- bash
kubectl port-forward svc/myapp-service 8080:80
```

## 배포 전략

| 전략 | 설명 |
|------|------|
| **Rolling Update** | 하나씩 교체 (기본, 무중단) |
| **Blue/Green** | 새 버전 전체 배포 후 트래픽 전환 |
| **Canary** | 일부 트래픽만 새 버전으로, 점진적 확대 |

## 면접 예상 질문

**Q: Kubernetes를 사용하는 이유는?**
A: 컨테이너의 배포, 스케일링, 복구를 자동화한다. 선언적으로 원하는 상태를 정의하면 K8s가 그 상태를 자동으로 유지한다. 수평 확장, 무중단 배포, 자동 복구를 쉽게 구현할 수 있다.

**Q: Pod, Deployment, Service의 관계는?**
A: Pod는 컨테이너를 실행하는 최소 단위이고, Deployment는 Pod의 생성/스케일링/업데이트를 관리한다. Service는 Pod에 안정적인 네트워크 엔드포인트(IP, DNS)를 제공하여 Pod가 재시작되어도 접근 주소가 변하지 않게 한다.

**Q: readinessProbe와 livenessProbe의 차이는?**
A: livenessProbe는 컨테이너가 정상 동작하는지 확인하여 실패하면 컨테이너를 재시작한다. readinessProbe는 트래픽을 수신할 준비가 되었는지 확인하여 실패하면 Service 엔드포인트에서 제외한다. 배포 시 readinessProbe가 통과해야 트래픽을 받는다.

**Q: ConfigMap과 Secret의 차이는?**
A: 둘 다 설정 데이터를 Pod 외부에서 관리하지만, Secret은 민감한 데이터(비밀번호, 토큰)를 저장하며 Base64 인코딩되어 있고 접근이 제한된다.

## 참고
- [Kubernetes 공식 문서](https://kubernetes.io/docs/)
- [Kubernetes Patterns (O'Reilly)](https://k8spatterns.io/)
