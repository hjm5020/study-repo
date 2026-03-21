# 영속성 컨텍스트 (Persistence Context)

## 핵심 개념
> 영속성 컨텍스트는 엔티티를 영구 저장하는 환경으로, EntityManager를 통해 접근한다. 1차 캐시, 변경 감지, 쓰기 지연 등의 기능을 제공하여 DB 접근을 최적화한다.

## 엔티티의 생명주기

```
    new              persist()          detach() / close() / clear()
     ↓                  ↓                        ↓
  [비영속] --------→ [영속] ----------------→ [준영속]
  (new)            (managed)              (detached)
                     ↓  ↑
              remove() │ merge()
                     ↓  ↑
                   [삭제]
                  (removed)
```

| 상태 | 설명 |
|------|------|
| **비영속 (new)** | new 키워드로 생성만 한 상태. 영속성 컨텍스트와 무관 |
| **영속 (managed)** | 영속성 컨텍스트에 저장된 상태. 변경 감지 대상 |
| **준영속 (detached)** | 영속성 컨텍스트에서 분리된 상태. 변경 감지 안 됨 |
| **삭제 (removed)** | 삭제 요청된 상태. flush 시 DELETE 쿼리 실행 |

```java
// 비영속
Order order = new Order("상품A");

// 영속 (1차 캐시에 저장)
em.persist(order);

// 준영속 (영속성 컨텍스트에서 분리)
em.detach(order);

// 다시 영속 상태로
Order merged = em.merge(order);

// 삭제
em.remove(order);
```

## 영속성 컨텍스트의 기능

### 1. 1차 캐시

```java
// 1차 캐시에 저장
em.persist(order); // INSERT 쿼리는 아직 실행되지 않음

// 1차 캐시에서 조회 → DB 쿼리 없음
Order found = em.find(Order.class, order.getId());

// 같은 엔티티를 두 번 조회해도 쿼리는 1번만
Order a = em.find(Order.class, 1L); // SELECT 쿼리 실행
Order b = em.find(Order.class, 1L); // 1차 캐시에서 반환 (쿼리 없음)

System.out.println(a == b); // true → 동일성 보장
```

### 2. 변경 감지 (Dirty Checking)

```java
@Transactional
public void updateOrder(Long id, String newName) {
    Order order = orderRepository.findById(id).orElseThrow();

    order.changeName(newName); // 엔티티 값만 변경

    // save() 호출 불필요!
    // 트랜잭션 커밋 시점에 변경을 감지하여 자동으로 UPDATE 쿼리 실행
}
```

**동작 원리:**

```
1. 엔티티를 영속성 컨텍스트에 저장할 때 최초 상태를 스냅샷으로 보관
2. 트랜잭션 커밋 시점에 flush() 호출
3. 현재 엔티티와 스냅샷을 비교
4. 변경된 필드가 있으면 UPDATE 쿼리 생성
5. DB에 반영
```

### 3. 쓰기 지연 (Write-Behind)

```java
@Transactional
public void createOrders() {
    em.persist(order1); // INSERT SQL을 쓰기 지연 저장소에 보관
    em.persist(order2); // INSERT SQL을 쓰기 지연 저장소에 보관
    em.persist(order3); // INSERT SQL을 쓰기 지연 저장소에 보관

    // 아직 DB에 쿼리가 실행되지 않음

    // 트랜잭션 커밋 시점에 한번에 DB로 전송
    // → INSERT 3개가 한꺼번에 실행
}
```

### 4. 지연 로딩 (Lazy Loading)

```java
@Entity
public class Order {
    @ManyToOne(fetch = FetchType.LAZY)
    private Member member; // 프록시 객체로 초기화
}

@Transactional
public void printOrder(Long orderId) {
    Order order = orderRepository.findById(orderId).orElseThrow();
    // → SELECT * FROM order WHERE id = ?

    // member는 프록시 객체 (아직 DB 조회 안 함)
    System.out.println(order.getMember().getClass());
    // → class Member$HibernateProxy$...

    // 실제 데이터 접근 시점에 DB 조회
    System.out.println(order.getMember().getName());
    // → SELECT * FROM member WHERE id = ?
}
```

## flush vs commit vs clear

| 메서드 | 동작 |
|--------|------|
| **flush()** | 쓰기 지연 저장소의 SQL을 DB에 전송. 영속성 컨텍스트는 유지 |
| **commit()** | flush() + 트랜잭션 커밋 |
| **clear()** | 영속성 컨텍스트 초기화 (모든 엔티티가 준영속 상태) |

```java
// flush는 자동으로 호출되는 경우:
// 1. 트랜잭션 커밋 시
// 2. JPQL 쿼리 실행 전 (데이터 정합성 보장)
```

## 준영속 상태에서의 문제 — LazyInitializationException

```java
// ❌ 트랜잭션 밖에서 Lazy 로딩 시도
public OrderResponse getOrder(Long id) {
    Order order = orderRepository.findById(id).orElseThrow();
    // 여기서 트랜잭션 종료 → 준영속 상태

    order.getMember().getName(); // LazyInitializationException!
}
```

### 해결 방법

```java
// 1. @Transactional로 트랜잭션 범위 확장
@Transactional(readOnly = true)
public OrderResponse getOrder(Long id) {
    Order order = orderRepository.findById(id).orElseThrow();
    String memberName = order.getMember().getName(); // ✅ 트랜잭션 내
    return new OrderResponse(order, memberName);
}

// 2. Fetch Join으로 한번에 조회
@Query("SELECT o FROM Order o JOIN FETCH o.member WHERE o.id = :id")
Optional<Order> findByIdWithMember(@Param("id") Long id);

// 3. DTO로 직접 조회 (가장 깔끔)
@Query("SELECT new com.example.dto.OrderResponse(o.id, o.name, m.name) " +
       "FROM Order o JOIN o.member m WHERE o.id = :id")
Optional<OrderResponse> findOrderResponse(@Param("id") Long id);
```

## Spring Data JPA에서의 영속성 컨텍스트

### save()의 내부 동작

```java
// SimpleJpaRepository 내부
@Transactional
public <S extends T> S save(S entity) {
    if (entityInformation.isNew(entity)) {
        em.persist(entity); // INSERT
        return entity;
    } else {
        return em.merge(entity); // UPDATE (주의: 새 인스턴스 반환)
    }
}
```

### isNew() 판단 기준

```java
// ID가 null이면 새 엔티티
@Entity
public class Order {
    @Id @GeneratedValue
    private Long id; // null → isNew() = true
}

// ID를 직접 할당하는 경우 → Persistable 구현 필요
@Entity
public class Board implements Persistable<String> {
    @Id
    private String id;

    @CreatedDate
    private LocalDateTime createdDate;

    @Override
    public boolean isNew() {
        return createdDate == null; // 생성일이 없으면 새 엔티티
    }
}
```

## 면접 예상 질문

**Q: 영속성 컨텍스트란?**
A: 엔티티를 관리하는 논리적인 공간으로, 1차 캐시, 변경 감지, 쓰기 지연, 동일성 보장 등의 기능을 제공한다. 트랜잭션 단위로 생성되고 종료된다.

**Q: 변경 감지(Dirty Checking)란?**
A: 영속 상태의 엔티티를 수정하면, 트랜잭션 커밋 시점에 최초 스냅샷과 현재 상태를 비교하여 변경된 필드에 대해 자동으로 UPDATE 쿼리를 생성하는 기능이다. save()를 별도로 호출하지 않아도 된다.

**Q: flush()와 commit()의 차이는?**
A: flush()는 영속성 컨텍스트의 변경 내용을 DB에 SQL로 전송하지만 트랜잭션은 유지된다. commit()은 flush()를 수행한 후 트랜잭션을 커밋하여 영구 반영한다.

**Q: LazyInitializationException이 발생하는 이유와 해결 방법은?**
A: 트랜잭션이 종료되어 영속성 컨텍스트가 닫힌 후(준영속 상태)에 Lazy 로딩을 시도하면 발생한다. Fetch Join으로 한번에 조회하거나, @Transactional로 트랜잭션 범위를 확장하거나, DTO로 직접 조회하여 해결한다.

**Q: merge()와 persist()의 차이는?**
A: persist()는 비영속 엔티티를 영속 상태로 만들고(INSERT), merge()는 준영속 엔티티를 영속 상태로 복구한다(SELECT + UPDATE). merge()는 1차 캐시에 해당 엔티티가 없으면 DB에서 조회 후 파라미터 값으로 덮어쓴 새 인스턴스를 반환한다.

## 참고
- [JPA 공식 스펙 - Persistence Context](https://jakarta.ee/specifications/persistence/)
- [Spring Data JPA 공식 문서](https://docs.spring.io/spring-data/jpa/reference/)
