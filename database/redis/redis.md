# Redis

## 핵심 개념
> Redis는 인메모리 키-값 저장소로, 캐시, 세션 관리, 메시지 브로커 등 다양한 용도로 사용되며 싱글 스레드 기반으로 원자적 연산을 보장한다.

## 왜 Redis를 사용하는가?

```
DB 직접 조회:   디스크 I/O → 수 ms ~ 수십 ms
Redis 캐시 조회: 메모리 접근 → 수십 µs ~ 수백 µs (100~1000배 빠름)
```

## 자료구조

| 타입 | 설명 | 활용 |
|------|------|------|
| **String** | 단순 키-값 | 캐시, 카운터, 세션 |
| **List** | 연결 리스트 | 최근 항목, 큐 |
| **Set** | 중복 없는 집합 | 태그, 좋아요 유저 |
| **Hash** | 필드-값 쌍 | 객체 저장 |
| **Sorted Set** | 점수 기반 정렬 집합 | 랭킹, 리더보드 |

### 사용 예시

```bash
# String
SET user:1:name "홍길동"
GET user:1:name
INCR page:view:count           # 원자적 증가

# Hash — 객체 저장
HSET user:1 name "홍길동" age 25
HGET user:1 name
HGETALL user:1

# Set
SADD post:1:likes user:1 user:2 user:3
SISMEMBER post:1:likes user:1  # 좋아요 여부 O(1)
SCARD post:1:likes             # 좋아요 수

# Sorted Set — 랭킹
ZADD leaderboard 100 "player1" 200 "player2" 150 "player3"
ZREVRANGE leaderboard 0 9     # 상위 10명
ZRANK leaderboard "player1"   # 순위 조회

# List
LPUSH queue:email "mail1" "mail2"
RPOP queue:email              # 큐처럼 사용
```

## 캐시 전략

### 1. Cache Aside (Lazy Loading) — 가장 일반적

```
읽기:
1. 캐시에서 조회
2. 캐시 히트 → 반환
3. 캐시 미스 → DB 조회 → 캐시에 저장 → 반환

쓰기:
1. DB에 쓰기
2. 캐시 삭제 (또는 갱신)
```

```java
public Order findById(Long id) {
    // 1. 캐시 조회
    String cached = redisTemplate.opsForValue().get("order:" + id);
    if (cached != null) {
        return objectMapper.readValue(cached, Order.class);
    }

    // 2. DB 조회
    Order order = orderRepository.findById(id).orElseThrow();

    // 3. 캐시 저장
    redisTemplate.opsForValue().set(
        "order:" + id,
        objectMapper.writeValueAsString(order),
        Duration.ofMinutes(30) // TTL
    );

    return order;
}

public void update(Long id, OrderUpdateRequest request) {
    orderRepository.update(id, request);
    redisTemplate.delete("order:" + id); // 캐시 무효화
}
```

### 2. Write Through

```
쓰기:
1. 캐시에 쓰기
2. 캐시가 DB에 쓰기

장점: 캐시와 DB가 항상 동기화
단점: 쓰기 지연 증가
```

### 3. Write Behind (Write Back)

```
쓰기:
1. 캐시에만 쓰기
2. 비동기로 일정 주기마다 DB에 반영

장점: 쓰기 성능 최고
단점: 데이터 유실 위험
```

## Spring Boot + Redis 연동

### @Cacheable 사용

```java
@Service
public class OrderService {

    @Cacheable(value = "orders", key = "#id")
    public OrderResponse findById(Long id) {
        return OrderResponse.from(orderRepository.findById(id).orElseThrow());
    }

    @CachePut(value = "orders", key = "#id")
    public OrderResponse update(Long id, OrderUpdateRequest request) {
        // 반환값으로 캐시 갱신
        Order order = orderRepository.findById(id).orElseThrow();
        order.update(request);
        return OrderResponse.from(order);
    }

    @CacheEvict(value = "orders", key = "#id")
    public void delete(Long id) {
        orderRepository.deleteById(id);
        // 캐시 자동 삭제
    }
}
```

## TTL & Eviction Policy

### TTL (Time To Live)

```bash
SET key "value" EX 3600     # 3600초 후 만료
EXPIRE key 3600             # 기존 키에 TTL 설정
TTL key                     # 남은 시간 확인
```

### Eviction Policy (메모리 초과 시)

| 정책 | 설명 |
|------|------|
| `noeviction` | 메모리 초과 시 에러 반환 (기본) |
| `allkeys-lru` | 모든 키 중 LRU 삭제 (캐시 서버 권장) |
| `volatile-lru` | TTL이 설정된 키 중 LRU 삭제 |
| `allkeys-random` | 무작위 삭제 |
| `volatile-ttl` | TTL이 짧은 키부터 삭제 |

## 주의사항

### 캐시 스탬피드 (Cache Stampede)

```
인기 키의 TTL 만료 → 동시에 수백 요청이 DB로 → DB 과부하

해결:
1. 뮤텍스 (분산 락) — 한 요청만 DB 조회, 나머지 대기
2. TTL 랜덤화 — 만료 시점 분산
3. 사전 갱신 — TTL 만료 전에 백그라운드에서 갱신
```

### 캐시와 DB 일관성

```
1. 캐시 삭제 → DB 업데이트 (❌ 사이에 다른 요청이 구 데이터를 캐시)
2. DB 업데이트 → 캐시 삭제 (✅ 더 안전, 일반적 방식)
3. 완벽한 일관성이 필요하면 → 캐시를 쓰지 않거나 짧은 TTL
```

## Redis Cluster & Sentinel

### Sentinel (고가용성)

```
┌──────────┐
│ Sentinel  │ ← 마스터 모니터링
│ Sentinel  │   마스터 장애 시 자동 페일오버
│ Sentinel  │
└──────────┘
     ↓
┌──────────┐     ┌──────────┐
│  Master   │ ──→ │  Replica  │
│  (읽기/쓰기)│     │  (읽기)    │
└──────────┘     └──────────┘
```

### Cluster (수평 확장)

```
데이터를 16384개의 해시 슬롯으로 분배

Node 1: 슬롯 0~5460
Node 2: 슬롯 5461~10922
Node 3: 슬롯 10923~16383

각 노드는 자체 Replica를 가짐
```

## Pub/Sub

```bash
# 구독자
SUBSCRIBE order-events

# 발행자
PUBLISH order-events '{"orderId": 1, "status": "CREATED"}'
```

- 실시간 메시지 전달
- 메시지 영속성 없음 (구독자가 없으면 메시지 유실)
- 영속성이 필요하면 Redis Streams 또는 Kafka 사용

## 면접 예상 질문

**Q: Redis를 캐시로 사용할 때 주의할 점은?**
A: 캐시와 DB 간 데이터 일관성, TTL 설정, 캐시 스탬피드(동시에 캐시 만료 시 DB 과부하), 메모리 관리(Eviction Policy)를 고려해야 한다. DB 업데이트 후 캐시를 삭제하는 방식이 일반적이다.

**Q: Redis가 싱글 스레드인데 왜 빠른가?**
A: 메모리 기반이라 디스크 I/O가 없고, 이벤트 루프 기반 I/O 멀티플렉싱으로 여러 클라이언트 요청을 효율적으로 처리한다. 컨텍스트 스위칭 오버헤드도 없다. (Redis 6부터 I/O 스레딩은 멀티 스레드)

**Q: Cache Aside 패턴을 설명해주세요.**
A: 읽기 시 캐시를 먼저 조회하고, 캐시 미스면 DB에서 조회하여 캐시에 저장한다. 쓰기 시 DB를 먼저 업데이트하고 캐시를 삭제한다. 가장 일반적인 캐시 전략이다.

**Q: Redis Sentinel과 Cluster의 차이는?**
A: Sentinel은 고가용성을 위한 것으로, 마스터 장애 시 Replica를 자동으로 마스터로 승격한다. Cluster는 수평 확장을 위한 것으로, 데이터를 여러 노드에 분산 저장하여 용량과 처리량을 확장한다.

## 참고
- [Redis 공식 문서](https://redis.io/docs/)
- [Spring Data Redis 공식 문서](https://docs.spring.io/spring-data/redis/reference/)
