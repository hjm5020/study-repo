# MySQL InnoDB 아키텍처 & 쿼리 최적화

## 핵심 개념
> InnoDB는 MySQL의 기본 스토리지 엔진으로, ACID 트랜잭션, MVCC, 행 수준 잠금을 지원한다.

## InnoDB 아키텍처

```
┌─────────────────────────────────────────┐
│              MySQL Server                │
│  ┌─────────────────────────────────┐    │
│  │        SQL 파서 / 옵티마이저     │    │
│  └─────────────┬───────────────────┘    │
│                ↓                         │
│  ┌─────────────────────────────────┐    │
│  │         InnoDB 엔진              │    │
│  │                                  │    │
│  │  [Buffer Pool]  ← 데이터/인덱스 캐시  │
│  │  [Change Buffer] ← 보조 인덱스 변경   │
│  │  [Log Buffer]   ← Redo 로그 버퍼     │
│  │  [Undo Log]     ← MVCC, 롤백        │
│  └─────────────┬───────────────────┘    │
│                ↓                         │
│  ┌─────────────────────────────────┐    │
│  │          디스크                   │    │
│  │  [데이터 파일] [Redo Log] [Undo] │    │
│  └─────────────────────────────────┘    │
└─────────────────────────────────────────┘
```

### Buffer Pool

- 디스크의 데이터와 인덱스를 메모리에 캐시
- InnoDB에서 가장 중요한 메모리 영역
- **실무:** 전체 메모리의 50~80%를 할당 (`innodb_buffer_pool_size`)
- LRU(Least Recently Used) 알고리즘으로 관리

### Redo Log & Undo Log

```
Redo Log: 커밋된 데이터의 복구용 (Durability)
  → "이 데이터를 이렇게 변경했다" 기록
  → 비정상 종료 시 디스크에 반영 안 된 변경사항 복구

Undo Log: 롤백 및 MVCC용 (Atomicity, Isolation)
  → "변경 전 데이터는 이것이었다" 기록
  → 트랜잭션 롤백 시 원래 상태로 복구
  → MVCC에서 이전 버전 데이터 제공
```

## 쿼리 최적화

### 1. SELECT 최적화

```sql
-- ❌ 불필요한 컬럼 조회
SELECT * FROM orders WHERE status = 'ACTIVE';

-- ✅ 필요한 컬럼만
SELECT id, product_name, price FROM orders WHERE status = 'ACTIVE';
```

### 2. JOIN 최적화

```sql
-- 조인 컬럼에 인덱스 필수
-- orders.user_id에 인덱스가 있어야 함
SELECT o.*, u.name
FROM orders o
JOIN users u ON o.user_id = u.id
WHERE o.status = 'ACTIVE';

-- 작은 테이블을 드라이빙 테이블로 (옵티마이저가 보통 자동 결정)
```

### 3. 페이징 최적화

```sql
-- ❌ OFFSET이 크면 느림 (앞의 10000건을 읽고 버림)
SELECT * FROM orders ORDER BY id DESC LIMIT 10 OFFSET 10000;

-- ✅ 커서 기반 페이징 (No-Offset)
SELECT * FROM orders WHERE id < 마지막_조회_id ORDER BY id DESC LIMIT 10;

-- ✅ 커버링 인덱스 + 서브쿼리
SELECT o.* FROM orders o
JOIN (SELECT id FROM orders ORDER BY id DESC LIMIT 10 OFFSET 10000) t
ON o.id = t.id;
```

### 4. COUNT 최적화

```sql
-- ❌ 전체 카운트 (대량 데이터에서 느림)
SELECT COUNT(*) FROM orders;

-- ✅ 조건부 카운트 (인덱스 활용)
SELECT COUNT(*) FROM orders WHERE status = 'ACTIVE';

-- ✅ 대략적 카운트가 충분하면
SELECT TABLE_ROWS FROM information_schema.TABLES
WHERE TABLE_NAME = 'orders';
```

### 5. 서브쿼리 vs JOIN

```sql
-- ❌ 상관 서브쿼리 (행마다 서브쿼리 실행)
SELECT * FROM orders o
WHERE o.price > (SELECT AVG(price) FROM orders WHERE user_id = o.user_id);

-- ✅ JOIN으로 변환
SELECT o.* FROM orders o
JOIN (SELECT user_id, AVG(price) as avg_price FROM orders GROUP BY user_id) t
ON o.user_id = t.user_id
WHERE o.price > t.avg_price;
```

## 리플리케이션

```
┌──────────┐    Binlog    ┌──────────┐
│  Source   │ ──────────→ │  Replica  │
│  (쓰기)   │             │  (읽기)   │
└──────────┘             └──────────┘
                          ┌──────────┐
                    ────→ │  Replica  │
                          │  (읽기)   │
                          └──────────┘
```

- **Source(Master):** 쓰기 처리
- **Replica(Slave):** 읽기 처리 → 읽기 부하 분산
- **복제 지연(Replication Lag):** 쓰기 직후 Replica에서 읽으면 반영이 안 될 수 있음

```java
// Spring에서 읽기/쓰기 분리
@Transactional(readOnly = true)  // → Replica로 라우팅
public List<Order> findAll() { }

@Transactional                   // → Source로 라우팅
public void create(Order order) { }
```

## 면접 예상 질문

**Q: Buffer Pool이란?**
A: 디스크의 데이터와 인덱스 페이지를 메모리에 캐시하는 공간이다. 디스크 I/O를 줄여 성능을 향상시키며, InnoDB에서 가장 중요한 메모리 영역이다. 보통 전체 메모리의 50~80%를 할당한다.

**Q: Redo Log와 Undo Log의 차이는?**
A: Redo Log는 커밋된 변경사항을 기록하여 비정상 종료 시 데이터를 복구(Durability)하고, Undo Log는 변경 전 데이터를 기록하여 롤백(Atomicity)과 MVCC(Isolation)를 지원한다.

**Q: 페이징 성능이 느린 이유와 해결 방법은?**
A: OFFSET이 크면 해당 위치까지 모든 행을 읽고 버리기 때문에 느리다. 커서 기반 페이징(WHERE id < 마지막ID)으로 직접 해당 위치부터 읽거나, 커버링 인덱스 서브쿼리로 최적화할 수 있다.

## 참고
- [MySQL 공식 문서 - InnoDB Architecture](https://dev.mysql.com/doc/refman/8.0/en/innodb-architecture.html)
- Real MySQL (이성욱) — 4장 아키텍처, 9장 옵티마이저
