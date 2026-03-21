# 인덱스 & 실행 계획

## 핵심 개념
> 인덱스는 테이블의 데이터를 빠르게 찾기 위한 자료구조로, B-Tree 기반으로 동작하며 적절한 인덱스 설계는 DB 성능의 핵심이다.

## 인덱스란?

```
인덱스 없이 검색:  전체 테이블 스캔 (Full Table Scan) → O(n)
인덱스로 검색:    B-Tree 탐색 → O(log n)

비유: 책의 목차(인덱스)로 원하는 페이지를 바로 찾는 것
```

## B-Tree 인덱스

MySQL InnoDB의 기본 인덱스 구조이다.

```
              [10 | 20 | 30]              ← Root Node
             /    |      |    \
      [1|5|8]  [12|15]  [22|25]  [35|40]  ← Branch Node
       / | \    / | \
    [1] [5] [8] ...                        ← Leaf Node (실제 데이터 또는 PK 포인터)
```

- 항상 정렬된 상태 유지
- Leaf 노드가 연결 리스트로 연결 → 범위 검색에 유리
- 삽입/삭제 시 트리 재구성 비용 발생

## 인덱스 종류

### 클러스터형 인덱스 (Clustered Index)

```
- 테이블당 1개만 존재 (보통 PK)
- 실제 데이터가 인덱스 순서대로 물리적으로 정렬
- Leaf 노드 = 실제 데이터 행
- InnoDB에서 PK가 곧 클러스터형 인덱스
```

### 보조 인덱스 (Secondary Index)

```
- 여러 개 생성 가능
- Leaf 노드 = PK 값 (포인터)
- 검색 시: 보조 인덱스 → PK 값 획득 → 클러스터형 인덱스에서 실제 데이터 조회
```

### 커버링 인덱스 (Covering Index)

```sql
-- 인덱스: (name, age)
SELECT name, age FROM users WHERE name = '홍길동';
-- 인덱스만으로 모든 컬럼을 반환 가능 → 테이블 접근 불필요 (성능 최고)
-- EXPLAIN에서 Extra: Using index로 표시
```

### 복합 인덱스 (Composite Index)

```sql
CREATE INDEX idx_name_age ON users (name, age);

-- ✅ 인덱스 사용 (선두 컬럼 포함)
SELECT * FROM users WHERE name = '홍길동';
SELECT * FROM users WHERE name = '홍길동' AND age = 25;

-- ❌ 인덱스 사용 안 됨 (선두 컬럼 없음)
SELECT * FROM users WHERE age = 25;
```

**복합 인덱스 컬럼 순서 결정 기준:**
1. WHERE 절에 자주 사용되는 컬럼이 앞에
2. 카디널리티(고유값 수)가 높은 컬럼이 앞에
3. 범위 조건(<, >, BETWEEN)보다 등호(=) 조건이 앞에

## 인덱스가 사용되지 않는 경우

```sql
-- 1. 인덱스 컬럼에 함수 적용
WHERE YEAR(created_at) = 2024         -- ❌
WHERE created_at >= '2024-01-01'      -- ✅

-- 2. 암묵적 타입 변환
WHERE phone = 01012345678             -- ❌ (숫자 vs 문자열)
WHERE phone = '01012345678'           -- ✅

-- 3. LIKE 앞쪽 와일드카드
WHERE name LIKE '%길동'               -- ❌
WHERE name LIKE '홍%'                 -- ✅

-- 4. NOT, <>, != 조건
WHERE status != 'DELETED'            -- ❌ (대부분 풀 스캔)

-- 5. OR 조건 (각 컬럼에 별도 인덱스 필요)
WHERE name = '홍길동' OR age = 25     -- 비효율적
```

## EXPLAIN (실행 계획)

```sql
EXPLAIN SELECT * FROM orders WHERE user_id = 1 AND status = 'ACTIVE';
```

### 주요 항목

| 항목 | 설명 | 좋은 값 |
|------|------|---------|
| **type** | 접근 방식 | const > eq_ref > ref > range > index > ALL |
| **key** | 실제 사용된 인덱스 | NULL이면 인덱스 미사용 |
| **rows** | 예상 조회 행 수 | 작을수록 좋음 |
| **Extra** | 추가 정보 | Using index (커버링) 좋음, Using filesort/temporary 나쁨 |

### type 상세

```
const     → PK/유니크 인덱스로 1건 조회 (최고)
eq_ref    → 조인에서 PK/유니크로 1건 매칭
ref       → 인덱스로 여러 건 조회
range     → 인덱스 범위 스캔 (BETWEEN, <, >)
index     → 인덱스 전체 스캔 (커버링 인덱스)
ALL       → 테이블 전체 스캔 (최악)
```

### 실무 최적화 예시

```sql
-- 느린 쿼리
EXPLAIN SELECT * FROM orders
WHERE DATE(created_at) = '2024-01-15'
AND status = 'ACTIVE';
-- type: ALL, 풀 테이블 스캔

-- 최적화
CREATE INDEX idx_status_created ON orders (status, created_at);

EXPLAIN SELECT * FROM orders
WHERE created_at >= '2024-01-15' AND created_at < '2024-01-16'
AND status = 'ACTIVE';
-- type: range, 인덱스 사용
```

## 면접 예상 질문

**Q: 인덱스의 동작 원리를 설명해주세요.**
A: MySQL InnoDB는 B-Tree 구조의 인덱스를 사용한다. 데이터가 정렬된 상태로 저장되어 O(log n)으로 검색할 수 있다. 클러스터형 인덱스(PK)는 실제 데이터가 인덱스 순서대로 저장되고, 보조 인덱스는 Leaf 노드에 PK 값을 저장하여 클러스터형 인덱스를 통해 실제 데이터에 접근한다.

**Q: 인덱스를 무조건 많이 만들면 좋은가?**
A: 아니다. 인덱스는 조회 성능을 높이지만, INSERT/UPDATE/DELETE 시 인덱스도 함께 갱신해야 하므로 쓰기 성능이 저하된다. 또한 인덱스 자체가 저장 공간을 차지한다. 자주 조회하는 조건에만 적절하게 생성해야 한다.

**Q: 복합 인덱스에서 컬럼 순서가 중요한 이유는?**
A: B-Tree는 선두 컬럼부터 정렬되므로, 선두 컬럼이 WHERE 조건에 없으면 인덱스를 사용할 수 없다. 등호 조건 컬럼을 앞에, 범위 조건 컬럼을 뒤에 배치해야 효율적이다.

## 참고
- [MySQL 공식 문서 - Optimization and Indexes](https://dev.mysql.com/doc/refman/8.0/en/optimization-indexes.html)
- Real MySQL (이성욱) — 8장 인덱스
