# 시스템 설계

## 핵심 개념
> 시스템 설계는 대규모 트래픽을 처리하고, 높은 가용성과 확장성을 갖춘 시스템을 구축하는 방법론이다.

## 확장 전략

### 수직 확장 (Scale Up) vs 수평 확장 (Scale Out)

```
Scale Up:  서버 1대의 성능을 올림 (CPU, 메모리 추가)
           - 단순하지만 한계가 있음
           - 단일 장애점 (SPOF)

Scale Out: 서버 수를 늘림 (로드 밸런싱)
           - 이론상 무한 확장
           - 세션, 상태 관리가 복잡해짐
```

## 대규모 트래픽 처리 아키텍처

```
                    [CDN]
                      ↓
Client → [Load Balancer] → [API Gateway]
                              ↓
              ┌───────────────┼───────────────┐
              ↓               ↓               ↓
         [Service A]    [Service B]    [Service C]
              ↓               ↓               ↓
         [DB Master]    [Redis Cache]  [Message Queue]
              ↓                               ↓
         [DB Replica]                  [Consumer Service]
```

## 캐싱 전략

### 캐시 적용 위치

```
Client Cache (브라우저)
    ↓
CDN Cache (정적 리소스)
    ↓
API Gateway Cache
    ↓
Application Cache (Redis)
    ↓
Database Cache (Buffer Pool)
```

### 캐시 적용 기준

```
✅ 캐시하면 좋은 것:
- 자주 읽히지만 거의 변경되지 않는 데이터
- 계산 비용이 높은 결과
- 외부 API 호출 결과

❌ 캐시하면 안 되는 것:
- 실시간 정합성이 중요한 데이터 (잔액, 재고)
- 자주 변경되는 데이터
- 개인 민감 정보
```

### 캐시 문제와 해결

| 문제 | 설명 | 해결 |
|------|------|------|
| **Cache Stampede** | 인기 키 만료 시 동시 DB 접근 | 분산 락, TTL 랜덤화 |
| **Cache Penetration** | 존재하지 않는 키를 반복 조회 | Bloom Filter, null 캐싱 |
| **Cache Avalanche** | 대량의 키가 동시에 만료 | TTL 분산, 다중 캐시 계층 |

## 메시지 큐

### 왜 필요한가?

```
동기 처리:
Client → [주문] → [결제] → [알림] → [재고 감소] → 응답
문제: 느림, 하나라도 실패하면 전체 실패

비동기 처리 (메시지 큐):
Client → [주문] → 응답 (빠름)
              ↓ (메시지 발행)
         [Message Queue]
          ↓      ↓      ↓
       [결제]  [알림]  [재고] (각자 처리)
```

### Kafka vs RabbitMQ

| | Kafka | RabbitMQ |
|---|---|---|
| 모델 | 분산 로그 (Pull) | 메시지 브로커 (Push) |
| 처리량 | 매우 높음 | 보통 |
| 메시지 보존 | 디스크에 영구 저장 | 소비 후 삭제 |
| 순서 보장 | 파티션 내 보장 | 큐 내 보장 |
| 용도 | 이벤트 스트리밍, 로그 수집 | 작업 큐, RPC |

### 이벤트 기반 아키텍처

```java
// 주문 서비스 — 이벤트 발행
@Service
public class OrderService {
    private final KafkaTemplate<String, OrderEvent> kafkaTemplate;

    @Transactional
    public void createOrder(OrderRequest request) {
        Order order = orderRepository.save(Order.create(request));
        kafkaTemplate.send("order-events",
            new OrderEvent("ORDER_CREATED", order.getId()));
    }
}

// 알림 서비스 — 이벤트 소비
@Component
public class NotificationConsumer {
    @KafkaListener(topics = "order-events")
    public void handle(OrderEvent event) {
        if ("ORDER_CREATED".equals(event.getType())) {
            notificationService.sendOrderConfirmation(event.getOrderId());
        }
    }
}
```

## MSA vs Monolithic

| | Monolithic | MSA |
|---|---|---|
| 배포 | 전체 배포 | 서비스별 독립 배포 |
| 확장 | 전체 확장 | 서비스별 개별 확장 |
| 기술 | 단일 기술 스택 | 서비스별 자유 선택 |
| 복잡도 | 코드 복잡 | 운영 복잡 (네트워크, 분산 트랜잭션) |
| 장애 | 하나의 장애가 전체에 영향 | 서비스 격리 가능 |

**MSA 도입 시 고려사항:**
- 서비스 간 통신 (REST, gRPC, 메시지 큐)
- 분산 트랜잭션 (Saga 패턴)
- 서비스 디스커버리
- API Gateway
- 분산 추적 (Zipkin, Jaeger)
- Circuit Breaker (Resilience4j)

## API Gateway

```
Client → [API Gateway] → [Service A]
                       → [Service B]
                       → [Service C]

역할:
- 라우팅: 요청을 적절한 서비스로 전달
- 인증/인가: 토큰 검증을 한 곳에서 처리
- Rate Limiting: 요청 수 제한
- 로드 밸런싱
- 요청/응답 변환
- 로깅, 모니터링
```

## 분산 시스템 핵심 개념

### CAP 정리

```
분산 시스템에서 아래 3가지를 동시에 만족할 수 없다:

C (Consistency)     — 모든 노드가 같은 데이터를 보여줌
A (Availability)    — 모든 요청에 응답
P (Partition Tolerance) — 네트워크 분할에도 동작

네트워크 파티션은 현실에서 불가피하므로:
- CP: 일관성 우선 (금융 시스템) — 응답을 포기할 수 있음
- AP: 가용성 우선 (SNS, 캐시) — 일시적 불일치 허용
```

### 이벤트 소싱 & CQRS

```
이벤트 소싱:
상태를 직접 저장하는 대신, 상태 변경 이벤트를 순서대로 저장
→ 이벤트를 재생하면 현재 상태를 복원

CQRS (Command Query Responsibility Segregation):
쓰기(Command)와 읽기(Query)를 분리
→ 각각에 최적화된 모델과 저장소 사용

[쓰기] → Event Store → [이벤트 발행] → [읽기 모델 갱신] → [읽기]
```

## 면접 예상 질문

**Q: 대규모 트래픽을 처리하는 방법은?**
A: 수평 확장(Scale Out)과 로드 밸런싱, 캐시(Redis), CDN, 메시지 큐(비동기 처리), DB 리플리케이션(읽기 분산)을 조합한다. 캐시로 DB 부하를 줄이고, 메시지 큐로 비동기 처리하여 응답 속도를 높이는 것이 핵심이다.

**Q: MSA의 장단점은?**
A: 장점은 서비스별 독립 배포/확장, 기술 스택 자유도, 장애 격리이다. 단점은 분산 시스템의 복잡도(네트워크 통신, 분산 트랜잭션, 데이터 일관성), 운영 오버헤드(모니터링, 로깅, 배포 파이프라인)이 증가하는 것이다.

**Q: CAP 정리를 설명해주세요.**
A: 분산 시스템에서 일관성(Consistency), 가용성(Availability), 분할 내성(Partition Tolerance) 3가지를 동시에 만족할 수 없다는 정리이다. 네트워크 파티션은 불가피하므로, CP(일관성 우선)와 AP(가용성 우선) 중 선택해야 한다.

**Q: 메시지 큐를 사용하는 이유는?**
A: 서비스 간 결합도를 낮추고(비동기 통신), 부하를 분산하며(버퍼 역할), 장애 전파를 방지한다. 주문 후 알림, 로그 처리 같은 즉시 응답이 불필요한 작업에 사용한다.

## 참고
- 가상 면접 사례로 배우는 대규모 시스템 설계 기초 (Alex Xu)
- [Martin Fowler - Microservices](https://martinfowler.com/articles/microservices.html)
