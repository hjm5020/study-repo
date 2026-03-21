# @Transactional 심화

## 핵심 개념
> @Transactional은 Spring AOP 기반으로 동작하는 선언적 트랜잭션 관리로, 메서드 단위로 트랜잭션의 시작/커밋/롤백을 자동 처리한다.

## 동작 원리

```
클라이언트 → [프록시 객체] → [실제 객체]
              ↓
         트랜잭션 시작
              ↓
         실제 메서드 호출
              ↓
         성공 → 커밋 / 예외 → 롤백
```

- AOP 프록시가 메서드 호출을 가로채서 트랜잭션을 시작한다
- 메서드가 정상 완료되면 커밋, 예외가 발생하면 롤백한다
- **프록시 기반이므로 같은 클래스 내부 호출에서는 동작하지 않는다**

## 전파 옵션 (Propagation)

이미 진행 중인 트랜잭션이 있을 때 어떻게 할지 결정한다.

| 옵션 | 동작 | 사용 상황 |
|------|------|-----------|
| **REQUIRED** (기본) | 기존 트랜잭션 참여, 없으면 새로 생성 | 대부분의 경우 |
| **REQUIRES_NEW** | 항상 새 트랜잭션 생성 (기존은 일시 중단) | 독립적인 트랜잭션이 필요할 때 |
| **SUPPORTS** | 기존 트랜잭션 참여, 없으면 트랜잭션 없이 실행 | 트랜잭션 선택적 |
| **MANDATORY** | 기존 트랜잭션 필수, 없으면 예외 | 반드시 트랜잭션 내에서 실행 |
| **NOT_SUPPORTED** | 트랜잭션 없이 실행 (기존은 일시 중단) | 트랜잭션 불필요한 작업 |
| **NEVER** | 트랜잭션 있으면 예외 | 트랜잭션 금지 |
| **NESTED** | 중첩 트랜잭션 (Savepoint) | 부분 롤백 |

### REQUIRED vs REQUIRES_NEW

```java
@Service
public class OrderService {

    @Transactional // REQUIRED (기본)
    public void createOrder(OrderRequest request) {
        orderRepository.save(order);
        paymentService.pay(order);      // 같은 트랜잭션
        notificationService.send(order); // 같은 트랜잭션
        // → 하나라도 실패하면 전부 롤백
    }
}

@Service
public class NotificationService {

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void send(Order order) {
        // 별도의 새 트랜잭션
        // → 알림 실패해도 주문은 롤백되지 않음
        notificationRepository.save(notification);
    }
}
```

### 실무 예시: 로그 저장

```java
@Service
public class OrderService {

    @Transactional
    public void createOrder(OrderRequest request) {
        orderRepository.save(order);

        // 로그 저장은 주문과 무관하게 성공해야 함
        auditLogService.log("ORDER_CREATED", order.getId());
    }
}

@Service
public class AuditLogService {

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void log(String action, Long targetId) {
        // 메인 트랜잭션이 롤백되어도 로그는 남음
        auditLogRepository.save(new AuditLog(action, targetId));
    }
}
```

## readOnly 옵션

```java
@Transactional(readOnly = true)
public List<Order> findAll() {
    return orderRepository.findAll();
}
```

**readOnly = true의 효과:**
- JPA: 변경 감지(Dirty Checking)를 수행하지 않음 → 성능 향상
- DB: 읽기 전용 힌트를 전달 → DB 최적화 가능
- Replication 환경: Slave(읽기 전용) DB로 라우팅 가능

**실무 패턴: 클래스 레벨 + 메서드 레벨 오버라이드**

```java
@Service
@Transactional(readOnly = true) // 기본: 읽기 전용
public class OrderService {

    public List<Order> findAll() {
        // readOnly = true 적용
        return orderRepository.findAll();
    }

    public Order findById(Long id) {
        // readOnly = true 적용
        return orderRepository.findById(id).orElseThrow();
    }

    @Transactional // 쓰기 작업만 오버라이드 (readOnly = false)
    public Order create(OrderRequest request) {
        return orderRepository.save(Order.create(request));
    }

    @Transactional
    public void delete(Long id) {
        orderRepository.deleteById(id);
    }
}
```

## 롤백 규칙

```java
// 기본: RuntimeException(Unchecked) → 롤백, CheckedException → 커밋
@Transactional
public void createOrder() {
    // RuntimeException 발생 → 롤백
    // IOException 발생 → 커밋 (주의!)
}

// Checked Exception도 롤백하고 싶을 때
@Transactional(rollbackFor = Exception.class)
public void createOrder() throws IOException {
    // 모든 예외에서 롤백
}

// 특정 예외는 롤백하지 않을 때
@Transactional(noRollbackFor = MailSendException.class)
public void createOrder() {
    // MailSendException 발생해도 커밋
}
```

## 주의사항

### 1. 내부 호출 문제 (가장 흔한 실수)

```java
@Service
public class OrderService {

    public void process() {
        createOrder(); // ❌ 프록시를 거치지 않음 → @Transactional 미적용!
    }

    @Transactional
    public void createOrder() {
        orderRepository.save(order);
    }
}
```

**해결: 클래스 분리**

```java
@Service
public class OrderFacade {
    private final OrderService orderService;

    public void process() {
        orderService.createOrder(); // ✅ 프록시를 거침
    }
}

@Service
public class OrderService {
    @Transactional
    public void createOrder() {
        orderRepository.save(order);
    }
}
```

### 2. public 메서드에만 적용 가능

```java
@Transactional
private void createOrder() { } // ❌ private → 프록시가 오버라이드 불가

@Transactional
public void createOrder() { }  // ✅ public
```

### 3. try-catch로 예외를 삼키면 롤백 안 됨

```java
@Transactional
public void createOrder() {
    try {
        orderRepository.save(order);
        paymentService.pay(order); // 예외 발생
    } catch (Exception e) {
        log.error("결제 실패", e);
        // ❌ 예외를 잡아버리면 트랜잭션은 커밋됨!
        // 롤백하려면 예외를 다시 던져야 함
    }
}
```

## 면접 예상 질문

**Q: @Transactional의 동작 원리는?**
A: Spring AOP의 프록시 기반으로 동작한다. 메서드 호출 시 프록시가 트랜잭션을 시작하고, 정상 완료 시 커밋, RuntimeException 발생 시 롤백한다.

**Q: REQUIRED와 REQUIRES_NEW의 차이는?**
A: REQUIRED는 기존 트랜잭션이 있으면 참여하고 없으면 새로 생성한다. REQUIRES_NEW는 항상 새 트랜잭션을 생성하며, 기존 트랜잭션은 일시 중단된다. REQUIRES_NEW의 트랜잭션이 롤백되어도 기존 트랜잭션에는 영향을 주지 않는다.

**Q: readOnly = true를 사용하는 이유는?**
A: JPA의 변경 감지(Dirty Checking)를 비활성화하여 성능을 최적화하고, DB에 읽기 전용 힌트를 전달한다. Replication 환경에서는 Slave DB로 라우팅하는 데에도 활용된다.

**Q: Checked Exception에서 롤백이 안 되는 이유는?**
A: Spring의 기본 롤백 정책은 RuntimeException과 Error에 대해서만 롤백한다. Checked Exception은 비즈니스적으로 복구 가능한 예외로 간주하기 때문이다. rollbackFor 속성으로 변경할 수 있다.

## 참고
- [Spring 공식 문서 - Transaction Management](https://docs.spring.io/spring-framework/reference/data-access/transaction.html)
- [Spring 공식 문서 - @Transactional](https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative/annotations.html)
