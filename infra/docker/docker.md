# Docker

## 핵심 개념
> Docker는 애플리케이션을 컨테이너라는 격리된 환경에서 실행하는 플랫폼으로, "내 컴퓨터에서는 되는데"를 해결한다.

## 컨테이너 vs VM

```
VM:                              Container:
┌────────┐ ┌────────┐          ┌────────┐ ┌────────┐
│  App A  │ │  App B  │          │  App A  │ │  App B  │
├────────┤ ├────────┤          ├────────┤ ├────────┤
│Guest OS│ │Guest OS│          │  Bins/  │ │  Bins/  │
├────────┤ ├────────┤          │  Libs   │ │  Libs   │
│  가상화  │ │  가상화  │          └────┬───┘ └────┬───┘
├────────────────────┤               │           │
│     Hypervisor      │          ┌───┴───────────┴───┐
├────────────────────┤          │   Docker Engine     │
│      Host OS        │          ├────────────────────┤
└────────────────────┘          │      Host OS        │
                                 └────────────────────┘

VM: OS 전체를 가상화 → 무겁고 느림 (GB 단위)
컨테이너: 프로세스 격리 → 가볍고 빠름 (MB 단위)
```

## 핵심 구성 요소

| 개념 | 설명 |
|------|------|
| **이미지** | 컨테이너를 만들기 위한 읽기 전용 템플릿 (클래스) |
| **컨테이너** | 이미지를 실행한 인스턴스 (객체) |
| **레이어** | 이미지는 여러 레이어로 구성, 변경된 레이어만 다시 빌드 |
| **레지스트리** | 이미지 저장소 (Docker Hub, ECR 등) |

## Dockerfile

### Spring Boot 기본

```dockerfile
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY build/libs/app.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

### 멀티 스테이지 빌드 (권장)

```dockerfile
# 1단계: 빌드
FROM eclipse-temurin:21-jdk AS builder
WORKDIR /app
COPY . .
RUN ./gradlew bootJar

# 2단계: 실행 (JDK 불필요, JRE만)
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=builder /app/build/libs/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

**멀티 스테이지 빌드의 장점:**
- 최종 이미지에 빌드 도구(JDK, Gradle) 미포함 → 이미지 크기 감소
- 보안 향상 (불필요한 도구 제거)

### Dockerfile 최적화

```dockerfile
# ❌ 변경이 잦은 파일을 먼저 복사 → 캐시 무효화
COPY . .
RUN ./gradlew bootJar

# ✅ 의존성 먼저, 소스 나중에 → 의존성 레이어 캐시 활용
COPY build.gradle settings.gradle ./
COPY gradle ./gradle
RUN ./gradlew dependencies

COPY src ./src
RUN ./gradlew bootJar
```

## 주요 명령어

```bash
# 이미지 빌드
docker build -t myapp:1.0 .

# 컨테이너 실행
docker run -d --name myapp -p 8080:8080 myapp:1.0
# -d: 백그라운드, -p: 포트 매핑, --name: 컨테이너 이름

# 환경 변수 전달
docker run -d -e SPRING_PROFILES_ACTIVE=prod -e DB_PASSWORD=secret myapp:1.0

# 컨테이너 확인
docker ps          # 실행 중인 컨테이너
docker ps -a       # 모든 컨테이너
docker logs myapp  # 로그 확인
docker exec -it myapp bash  # 컨테이너 내부 접속

# 정리
docker stop myapp
docker rm myapp
docker rmi myapp:1.0
docker system prune  # 미사용 리소스 정리
```

## Docker Compose

여러 컨테이너를 한번에 관리한다.

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "8080:8080"
    environment:
      SPRING_PROFILES_ACTIVE: local
      SPRING_DATASOURCE_URL: jdbc:mysql://db:3306/mydb
      SPRING_DATA_REDIS_HOST: redis
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_started

  db:
    image: mysql:8.0
    ports:
      - "3306:3306"
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: mydb
    volumes:
      - mysql_data:/var/lib/mysql
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 5s
      retries: 3

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  mysql_data:
```

```bash
docker compose up -d     # 전체 실행
docker compose down      # 전체 중지 + 삭제
docker compose logs app  # 특정 서비스 로그
docker compose ps        # 상태 확인
```

## 네트워크

```bash
# 같은 Compose 파일 내 서비스는 서비스명으로 통신
# app → db:3306 (서비스 이름이 호스트명)
# app → redis:6379

# 네트워크 종류
bridge   # 기본, 같은 호스트 내 컨테이너 통신
host     # 호스트 네트워크 직접 사용
none     # 네트워크 없음
```

## 볼륨

```bash
# Named Volume — Docker가 관리 (데이터 영속화)
docker run -v mysql_data:/var/lib/mysql mysql

# Bind Mount — 호스트 경로 직접 마운트 (개발 시 소스 공유)
docker run -v $(pwd)/src:/app/src myapp
```

## 면접 예상 질문

**Q: 컨테이너와 VM의 차이는?**
A: VM은 하이퍼바이저 위에 전체 OS를 가상화하여 무겁고 느리다. 컨테이너는 호스트 OS의 커널을 공유하고 프로세스만 격리하여 가볍고 빠르다. 컨테이너는 MB 단위이고 초 단위로 시작된다.

**Q: Docker 이미지 레이어란?**
A: Dockerfile의 각 명령어가 하나의 레이어를 생성하며, 레이어는 읽기 전용이다. 변경된 레이어만 다시 빌드하므로 캐시를 활용하면 빌드 속도가 빨라진다. 변경이 적은 레이어를 위에 배치하는 것이 좋다.

**Q: 멀티 스테이지 빌드를 사용하는 이유는?**
A: 빌드에 필요한 도구(JDK, 빌드 툴)를 최종 이미지에 포함시키지 않아 이미지 크기를 줄이고 보안을 향상시킨다.

## 참고
- [Docker 공식 문서](https://docs.docker.com/)
- [Dockerfile Best Practices](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/)
