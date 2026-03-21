# 트랜잭션 & 격리 수준

## 핵심 개념
> 트랜잭션은 하나의 논리적 작업 단위로, ACID 속성을 보장한다. 격리 수준은 동시에 실행되는 트랜잭션 간의 데이터 가시성을 결정한다.

## ACID

| 속성 | 설명 | 보장 방법 |
|------|------|-----------|
| **Atomicity** (원자성) | 전부 성공 또는 전부 실패 | Undo 로그로 롤백 |
| **Consistency** (일관성) | 트랜잭션 전후로 DB가 일관된 상태 | 제약 조건, 트리거 |
| **Isolation** (격리성) | 동시 실행 트랜잭션이 서로 간섭하지 않음 | 격리 수준, 락 |
| **Durability** (지속성) | 커밋된 데이터는 영구 보존 | Redo 로그, WAL |

## 동시성 문제

### Dirty Read

```
트랜잭션 A: UPDATE balance = 0 WHERE id = 1;  (아직 커밋 안 함)
트랜잭션 B: SELECT balance FROM account WHERE id = 1;  → 0 읽음
트랜잭션 A: ROLLBACK;  (원래 1000이었음)
트랜잭션 B: 0이라는 잘못된 데이터를 사용함
```

### Non-Repeatable Read

```
트랜잭션 B: SELECT balance WHERE id = 1;  → 1000
트랜잭션 A: UPDATE balance = 500 WHERE id = 1; COMMIT;
트랜잭션 B: SELECT balance WHERE id = 1;  → 500 (같은 쿼리인데 결과가 다름!)
```

### Phantom Read

```
트랜잭션 B: SELECT * FROM orders WHERE price > 100;  → 3건
트랜잭션 A: INSERT INTO orders (price) VALUES (200); COMMIT;
트랜잭션 B: SELECT * FROM orders WHERE price > 100;  → 4건 (유령 행 등장!)
```

## 격리 수준 (Isolation Level)

| 격리 수준 | Dirty Read | Non-Repeatable Read | Phantom Read | 성능 |
|-----------|------------|---------------------|--------------|------|
| **READ UNCOMMITTED** | 발생 | 발생 | 발생 | 최고 |
| **READ COMMITTED** | 방지 | 발생 | 발생 | 높음 |
| **REPEATABLE READ** | 방지 | 방지 | 발생 (InnoDB는 방지) | 보통 |
| **SERIALIZABLE** | 방지 | 방지 | 방지 | 최저 |

### READ UNCOMMITTED
- 커밋되지 않은 데이터도 읽을 수 있음
- 실무에서 거의 사용하지 않음

### READ COMMITTED
- **커밋된 데이터만** 읽을 수 있음
- Oracle의 기본 격리 수준
- 같은 쿼리를 다시 실행하면 다른 결과가 나올 수 있음

### REPEATABLE READ (MySQL InnoDB 기본)
- 트랜잭션 시작 시점의 스냅샷을 읽음 (MVCC)
- 같은 쿼리는 항상 같은 결과 보장
- **InnoDB에서는 Gap Lock으로 Phantom Read도 방지**

### SERIALIZABLE
- 모든 SELECT에 공유 락을 걸어 완전한 직렬화
- 동시성이 크게 떨어져 실무에서 거의 사용하지 않음

## MVCC (Multi-Version Concurrency Control)

InnoDB가 격리 수준을 구현하는 핵심 메커니즘이다.

```
1. 데이터 변경 시 이전 버전을 Undo 로그에 보관
2. 각 트랜잭션은 자신의 시작 시점 스냅샷을 읽음
3. 읽기 작업에 락을 걸지 않음 → 읽기와 쓰기가 서로 블로킹하지 않음

READ COMMITTED:  매 쿼리마다 새 스냅샷
REPEATABLE READ: 트랜잭션 시작 시 스냅샷 고정
```

## 락 (Lock)

### 공유 락 (S Lock) vs 배타 락 (X Lock)

| | S Lock (읽기) | X Lock (쓰기) |
|---|---|---|
| S Lock과 호환 | ✅ (동시 읽기 가능) | ❌ |
| X Lock과 호환 | ❌ | ❌ |

### InnoDB 락 종류

```
Record Lock   → 인덱스 레코드에 거는 락
Gap Lock      → 인덱스 레코드 사이의 간격에 거는 락 (Phantom Read 방지)
Next-Key Lock → Record Lock + Gap Lock (InnoDB 기본)
```

### 데드락

```sql
-- 트랜잭션 A
UPDATE accounts SET balance = balance - 100 WHERE id = 1; -- id=1 락
UPDATE accounts SET balance = balance + 100 WHERE id = 2; -- id=2 락 대기

-- 트랜잭션 B
UPDATE accounts SET balance = balance - 100 WHERE id = 2; -- id=2 락
UPDATE accounts SET balance = balance + 100 WHERE id = 1; -- id=1 락 대기

-- → 데드락! InnoDB가 감지하여 하나를 롤백
```

**예방:**
- 테이블/행에 접근하는 순서를 통일
- 트랜잭션을 짧게 유지
- 적절한 인덱스 사용 (락 범위 최소화)

## 면접 예상 질문

**Q: ACID를 설명해주세요.**
A: 원자성(전부 성공 또는 전부 실패), 일관성(트랜잭션 전후 데이터 무결성 유지), 격리성(동시 트랜잭션이 서로 간섭하지 않음), 지속성(커밋된 데이터는 영구 보존)이다.

**Q: MySQL InnoDB의 기본 격리 수준은?**
A: REPEATABLE READ이다. MVCC를 통해 트랜잭션 시작 시점의 스냅샷을 읽으며, Gap Lock으로 Phantom Read도 방지한다.

**Q: MVCC란?**
A: Multi-Version Concurrency Control의 약자로, 데이터 변경 시 이전 버전을 Undo 로그에 보관하여 각 트랜잭션이 자신의 시점에 맞는 데이터를 읽을 수 있게 한다. 읽기에 락을 걸지 않으므로 읽기와 쓰기가 서로 블로킹하지 않는다.

**Q: 데드락이 발생하면 어떻게 되는가?**
A: InnoDB는 데드락 감지 알고리즘을 실행하여 자동으로 감지하고, 트랜잭션 중 하나를 롤백한다. 예방을 위해 테이블 접근 순서를 통일하고 트랜잭션을 짧게 유지해야 한다.

## 참고
- [MySQL 공식 문서 - InnoDB Locking](https://dev.mysql.com/doc/refman/8.0/en/innodb-locking.html)
- [MySQL 공식 문서 - Transaction Isolation Levels](https://dev.mysql.com/doc/refman/8.0/en/innodb-transaction-isolation-levels.html)
- Real MySQL (이성욱) — 5장 트랜잭션과 잠금
