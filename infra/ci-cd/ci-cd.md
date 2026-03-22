# CI/CD

## 핵심 개념
> CI(Continuous Integration)는 코드 변경을 자주 통합하고 자동으로 빌드/테스트하는 것이고, CD(Continuous Delivery/Deployment)는 검증된 코드를 자동으로 배포하는 것이다.

## CI/CD 파이프라인

```
코드 푸시 → [빌드] → [테스트] → [정적 분석] → [이미지 빌드] → [배포]
             CI ─────────────────────────        CD ──────────
```

| 단계 | 하는 일 | 도구 |
|------|---------|------|
| **빌드** | 소스 코드 컴파일 | Gradle, Maven |
| **테스트** | 단위/통합 테스트 실행 | JUnit, Mockito |
| **정적 분석** | 코드 품질, 보안 검사 | SonarQube, SpotBugs |
| **이미지 빌드** | Docker 이미지 생성 & 레지스트리 푸시 | Docker, ECR, GCR |
| **배포** | 서버/클러스터에 배포 | ArgoCD, kubectl, AWS CodeDeploy |

## GitHub Actions

### 기본 구조

```yaml
# .github/workflows/ci.yml
name: CI Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Set up JDK 21
        uses: actions/setup-java@v4
        with:
          java-version: '21'
          distribution: 'temurin'

      - name: Cache Gradle
        uses: actions/cache@v4
        with:
          path: |
            ~/.gradle/caches
            ~/.gradle/wrapper
          key: ${{ runner.os }}-gradle-${{ hashFiles('**/*.gradle*', '**/gradle-wrapper.properties') }}

      - name: Build & Test
        run: ./gradlew build

      - name: Upload Test Results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: test-results
          path: build/reports/tests/
```

### CI + Docker 이미지 빌드 + 배포

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Set up JDK 21
        uses: actions/setup-java@v4
        with:
          java-version: '21'
          distribution: 'temurin'

      - name: Build & Test
        run: ./gradlew build

      - name: Docker Login
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Build & Push Docker Image
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: ghcr.io/${{ github.repository }}:${{ github.sha }}

  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Server
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            docker pull ghcr.io/${{ github.repository }}:${{ github.sha }}
            docker stop myapp || true
            docker rm myapp || true
            docker run -d --name myapp -p 8080:8080 \
              ghcr.io/${{ github.repository }}:${{ github.sha }}
```

### PR 자동 검증

```yaml
name: PR Check

on:
  pull_request:
    branches: [ main ]

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Set up JDK 21
        uses: actions/setup-java@v4
        with:
          java-version: '21'
          distribution: 'temurin'

      - name: Build & Test
        run: ./gradlew build

      - name: Checkstyle
        run: ./gradlew checkstyleMain

      - name: Test Coverage Check
        run: ./gradlew jacocoTestReport jacocoTestCoverageVerification
```

## Jenkins

### Jenkinsfile (선언적 파이프라인)

```groovy
pipeline {
    agent any

    environment {
        DOCKER_IMAGE = "myapp"
        DOCKER_TAG = "${env.BUILD_NUMBER}"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build & Test') {
            steps {
                sh './gradlew clean build'
            }
            post {
                always {
                    junit 'build/test-results/test/*.xml'
                }
            }
        }

        stage('Docker Build') {
            steps {
                sh "docker build -t ${DOCKER_IMAGE}:${DOCKER_TAG} ."
            }
        }

        stage('Deploy') {
            when {
                branch 'main'
            }
            steps {
                sh """
                    docker stop ${DOCKER_IMAGE} || true
                    docker rm ${DOCKER_IMAGE} || true
                    docker run -d --name ${DOCKER_IMAGE} \
                        -p 8080:8080 ${DOCKER_IMAGE}:${DOCKER_TAG}
                """
            }
        }
    }

    post {
        failure {
            // Slack 알림 등
            echo 'Pipeline failed!'
        }
        success {
            echo 'Pipeline succeeded!'
        }
    }
}
```

## 배포 전략

### Rolling Update (무중단 기본)

```
v1 v1 v1 v1   ← 현재
v2 v1 v1 v1   ← 하나씩 교체
v2 v2 v1 v1
v2 v2 v2 v1
v2 v2 v2 v2   ← 완료

장점: 추가 리소스 적음
단점: 배포 중 v1/v2 혼재, 롤백이 느림
```

### Blue/Green

```
[Blue - v1] ← 현재 트래픽
[Green - v2] ← 새 버전 배포 완료

트래픽 전환: Blue → Green (순간 전환)

[Blue - v1]  (대기, 문제 시 즉시 롤백)
[Green - v2] ← 현재 트래픽

장점: 즉시 롤백 가능, 다운타임 없음
단점: 2배의 리소스 필요
```

### Canary

```
[v1] [v1] [v1] [v1] [v1]  ← 95% 트래픽
[v2]                        ← 5% 트래픽 (카나리)

모니터링 → 문제 없으면 점진적으로 비율 증가

[v1] [v1] [v1]              ← 60%
[v2] [v2]                   ← 40%

최종:
[v2] [v2] [v2] [v2] [v2]   ← 100%

장점: 위험 최소화, 점진적 검증
단점: 구현 복잡, 모니터링 필수
```

## GitOps (ArgoCD)

```
개발자 → Git Push → GitHub
                      ↓ (감지)
                   [ArgoCD]
                      ↓ (배포)
                 [Kubernetes Cluster]

원칙:
- Git이 단일 진실 공급원 (Single Source of Truth)
- 선언적 배포 (매니페스트 = 실제 상태)
- 자동 동기화 (Git 변경 → 자동 반영)
- 감사 추적 (Git 히스토리 = 배포 히스토리)
```

```yaml
# ArgoCD Application
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: myapp
spec:
  project: default
  source:
    repoURL: https://github.com/org/k8s-manifests.git
    targetRevision: main
    path: myapp/overlays/prod
  destination:
    server: https://kubernetes.default.svc
    namespace: production
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
```

## 실무 CI/CD 구성 예시

```
GitHub (코드 저장)
    ↓ push/PR
GitHub Actions (CI)
    - 빌드 & 테스트
    - Docker 이미지 빌드
    - 이미지 레지스트리 푸시 (ECR/GCR)
    - K8s 매니페스트 업데이트 (이미지 태그 변경)
    ↓
ArgoCD (CD)
    - Git 변경 감지
    - K8s 클러스터에 자동 배포
    - 롤백 관리
    ↓
Kubernetes (운영 환경)
    - Rolling Update / Canary
    - HPA (자동 스케일링)
    - 모니터링 (Prometheus + Grafana)
```

## 면접 예상 질문

**Q: CI/CD란?**
A: CI(Continuous Integration)는 개발자들의 코드 변경을 자주 통합하고 자동으로 빌드/테스트하여 문제를 조기에 발견하는 것이다. CD(Continuous Delivery/Deployment)는 검증된 코드를 자동으로 운영 환경에 배포하는 것이다.

**Q: Blue/Green 배포와 Canary 배포의 차이는?**
A: Blue/Green은 새 버전을 전체 배포한 후 트래픽을 한번에 전환하여 즉시 롤백이 가능하다. Canary는 일부 트래픽만 새 버전으로 보내 점진적으로 검증한 후 비율을 늘린다. Blue/Green은 리소스가 2배 필요하고, Canary는 모니터링 체계가 필요하다.

**Q: GitOps란?**
A: Git을 배포의 단일 진실 공급원으로 사용하는 방법론이다. 인프라와 애플리케이션 설정을 Git에 선언적으로 관리하고, ArgoCD 같은 도구가 Git 상태와 클러스터 상태를 자동으로 동기화한다. 모든 변경이 Git 히스토리에 남아 감사 추적이 가능하다.

**Q: GitHub Actions와 Jenkins의 차이는?**
A: GitHub Actions는 GitHub에 내장된 SaaS형 CI/CD로 설정이 간단하고 별도 서버가 불필요하다. Jenkins는 자체 서버에 설치하는 오픈소스로 플러그인이 풍부하고 커스터마이징이 자유롭지만 관리 부담이 있다. 소규모 프로젝트는 GitHub Actions, 복잡한 파이프라인이 필요하면 Jenkins가 적합하다.

## 참고
- [GitHub Actions 공식 문서](https://docs.github.com/en/actions)
- [Jenkins 공식 문서](https://www.jenkins.io/doc/)
- [ArgoCD 공식 문서](https://argo-cd.readthedocs.io/)
