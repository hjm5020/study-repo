# Spring Data JPA

## 핵심 개념
> Spring Data JPA는 JPA를 추상화한 Repository 인터페이스를 제공하여, 반복적인 CRUD 코드 없이 데이터 접근 계층을 구현할 수 있게 해준다.

## Repository 계층 구조

```
Repository (마커 인터페이스)
    ↓
CrudRepository (CRUD 메서드)
    ↓
ListCrudRepository
    ↓
JpaRepository (JPA 특화: flush, batch 등)
```

## 기본 사용법

```java
public interface OrderRepository extends JpaRepository<Order, Long> {
    // 기본 CRUD 메서드가 자동 제공됨
    // save(), findById(), findAll(), delete(), count() 등
}
```

## 쿼리 메서드

메서드 이름으로 쿼리를 자동 생성한다.

```java
public interface OrderRepository extends JpaRepository<Order, Long> {

    // WHERE status = ?
    List<Order> findByStatus(OrderStatus status);

    // WHERE customer_name = ? AND status = ?
    List<Order> findByCustomerNameAndStatus(String name, OrderStatus status);

    // WHERE price > ?
    List<Order> findByPriceGreaterThan(BigDecimal price);

    // WHERE customer_name LIKE %?%
    List<Order> findByCustomerNameContaining(String keyword);

    // WHERE created_at BETWEEN ? AND ?
    List<Order> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);

    // ORDER BY created_at DESC
    List<Order> findByStatusOrderByCreatedAtDesc(OrderStatus status);

    // COUNT
    long countByStatus(OrderStatus status);

    // EXISTS
    boolean existsByCustomerNameAndStatus(String name, OrderStatus status);
}
```

## @Query — 직접 JPQL/SQL 작성

```java
public interface OrderRepository extends JpaRepository<Order, Long> {

    // JPQL
    @Query("SELECT o FROM Order o WHERE o.status = :status AND o.price > :minPrice")
    List<Order> findExpensiveOrders(@Param("status") OrderStatus status,
                                   @Param("minPrice") BigDecimal minPrice);

    // Native SQL
    @Query(value = "SELECT * FROM orders WHERE DATE(created_at) = :date",
           nativeQuery = true)
    List<Order> findByDate(@Param("date") LocalDate date);

    // 수정 쿼리
    @Modifying
    @Query("UPDATE Order o SET o.status = :status WHERE o.id = :id")
    int updateStatus(@Param("id") Long id, @Param("status") OrderStatus status);
}
```

## 페이징과 정렬

```java
public interface OrderRepository extends JpaRepository<Order, Long> {
    Page<Order> findByStatus(OrderStatus status, Pageable pageable);
}

// 사용
@GetMapping("/orders")
public Page<OrderResponse> getOrders(
        @RequestParam OrderStatus status,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size) {

    Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
    return orderRepository.findByStatus(status, pageable)
            .map(OrderResponse::from);
}
```

## N+1 문제

### 발생 원인

```java
@Entity
public class Order {
    @OneToMany(mappedBy = "order", fetch = FetchType.LAZY)
    private List<OrderItem> items;
}

// N+1 발생!
List<Order> orders = orderRepository.findAll(); // 1번 쿼리
for (Order order : orders) {
    order.getItems().size(); // 주문마다 추가 쿼리 → N번 쿼리
}
// 총 N+1번 쿼리 실행
```

### 해결 방법

#### 1. Fetch Join (가장 일반적)

```java
@Query("SELECT o FROM Order o JOIN FETCH o.items WHERE o.status = :status")
List<Order> findByStatusWithItems(@Param("status") OrderStatus status);
```

#### 2. @EntityGraph

```java
@EntityGraph(attributePaths = {"items"})
List<Order> findByStatus(OrderStatus status);
```

#### 3. @BatchSize (Lazy Loading 최적화)

```java
@Entity
public class Order {
    @BatchSize(size = 100)
    @OneToMany(mappedBy = "order")
    private List<OrderItem> items;
    // IN 절로 묶어서 조회 → N+1 대신 1+1 쿼리
}
```

### Fetch Join 주의사항

- **컬렉션 Fetch Join은 1개만** 가능 (2개 이상이면 MultipleBagFetchException)
- 컬렉션 Fetch Join + 페이징 = **메모리에서 페이징** (위험!)
  - 해결: @BatchSize 또는 별도 쿼리로 분리

## 면접 예상 질문

**Q: N+1 문제란 무엇이고 어떻게 해결하는가?**
A: 연관된 엔티티를 조회할 때 1번의 쿼리로 N개의 엔티티를 가져온 후, 각 엔티티의 연관 엔티티를 조회하기 위해 N번의 추가 쿼리가 실행되는 문제이다. Fetch Join, @EntityGraph, @BatchSize로 해결할 수 있다.

**Q: Fetch Join과 일반 Join의 차이는?**
A: 일반 Join은 SQL에서 WHERE 조건을 위해 조인할 뿐 연관 엔티티 데이터를 가져오지 않는다. Fetch Join은 조인한 엔티티의 데이터까지 한 번에 가져와 영속성 컨텍스트에 올린다.

**Q: JpaRepository의 save()는 내부적으로 어떻게 동작하는가?**
A: 엔티티의 식별자(ID)가 null이면 persist()(INSERT), null이 아니면 merge()(UPDATE)를 호출한다. @GeneratedValue를 사용하면 새 엔티티의 ID가 null이므로 persist가 된다.

**Q: 페이징과 Fetch Join을 함께 사용하면 왜 위험한가?**
A: 컬렉션 Fetch Join과 페이징을 함께 사용하면 DB에서 전체 데이터를 가져온 후 메모리에서 페이징하기 때문에 OOM이 발생할 수 있다. @BatchSize로 해결하거나 쿼리를 분리해야 한다.

## 참고
- [Spring Data JPA 공식 문서](https://docs.spring.io/spring-data/jpa/reference/)
