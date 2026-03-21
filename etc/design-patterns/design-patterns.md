# 디자인 패턴

## 핵심 개념
> 디자인 패턴은 소프트웨어 설계에서 반복적으로 나타나는 문제에 대한 검증된 해결책이다. Spring 프레임워크 자체가 여러 패턴으로 구성되어 있다.

## 생성 패턴 (Creational)

### Singleton

**인스턴스를 하나만 생성하여 공유한다.**

```java
// 1. Java 구현
public class Singleton {
    private static final Singleton INSTANCE = new Singleton();

    private Singleton() { } // 외부 생성 방지

    public static Singleton getInstance() {
        return INSTANCE;
    }
}

// 2. Enum (권장 — Effective Java)
public enum Singleton {
    INSTANCE;

    public void doSomething() { }
}
```

**Spring에서:** Bean의 기본 스코프가 Singleton이다.

```java
@Service // Spring이 Singleton으로 관리
public class OrderService { }
```

### Factory Method

**객체 생성 로직을 분리하여 하위 클래스에서 결정한다.**

```java
// 인터페이스
public interface NotificationSender {
    void send(String message);
}

// 구현체
public class EmailSender implements NotificationSender { ... }
public class SmsSender implements NotificationSender { ... }

// 팩토리
public class NotificationFactory {
    public static NotificationSender create(String type) {
        return switch (type) {
            case "EMAIL" -> new EmailSender();
            case "SMS" -> new SmsSender();
            default -> throw new IllegalArgumentException();
        };
    }
}
```

**Spring에서:** `BeanFactory`, `ApplicationContext`가 팩토리 패턴이다.

### Builder

**복잡한 객체를 단계별로 구성한다.**

```java
// Lombok @Builder 사용 (실무)
@Builder
public class Order {
    private String productName;
    private int quantity;
    private BigDecimal price;
    private OrderStatus status;
}

Order order = Order.builder()
    .productName("상품A")
    .quantity(2)
    .price(BigDecimal.valueOf(10000))
    .status(OrderStatus.CREATED)
    .build();
```

**장점:** 가독성, 선택적 매개변수 처리, 불변 객체 생성

## 구조 패턴 (Structural)

### Proxy

**실제 객체에 대한 대리 객체를 통해 접근을 제어한다.**

```java
public interface OrderService {
    void createOrder();
}

// 실제 객체
public class OrderServiceImpl implements OrderService {
    public void createOrder() { /* 비즈니스 로직 */ }
}

// 프록시 — 부가 기능 추가
public class OrderServiceProxy implements OrderService {
    private final OrderService target;

    public void createOrder() {
        log.info("트랜잭션 시작");
        target.createOrder();         // 실제 로직 위임
        log.info("트랜잭션 커밋");
    }
}
```

**Spring에서:** AOP, @Transactional, @Cacheable이 모두 프록시 패턴이다.

### Decorator

**객체에 동적으로 기능을 추가한다.**

```java
// Java I/O가 대표적인 데코레이터 패턴
InputStream is = new BufferedInputStream(     // 버퍼링 추가
                    new FileInputStream("file.txt")); // 기본 파일 읽기

// 래핑하여 기능을 계속 추가
```

### Adapter

**호환되지 않는 인터페이스를 변환한다.**

```java
// 외부 라이브러리의 인터페이스
public class ExternalPaymentApi {
    public PayResult processPayment(PayData data) { ... }
}

// 우리 시스템의 인터페이스
public interface PaymentService {
    void pay(int amount);
}

// 어댑터 — 외부 API를 우리 인터페이스에 맞게 변환
public class ExternalPaymentAdapter implements PaymentService {
    private final ExternalPaymentApi api;

    public void pay(int amount) {
        PayData data = convertToPayData(amount);
        api.processPayment(data);
    }
}
```

**Spring에서:** `HandlerAdapter`가 다양한 핸들러 타입을 처리한다.

### Facade

**복잡한 하위 시스템을 단순한 인터페이스로 감싼다.**

```java
// 여러 서비스를 조합하는 퍼사드
@Service
public class OrderFacade {
    private final OrderService orderService;
    private final PaymentService paymentService;
    private final NotificationService notificationService;

    public void placeOrder(OrderRequest request) {
        Order order = orderService.create(request);
        paymentService.pay(order);
        notificationService.send(order);
    }
}
```

## 행위 패턴 (Behavioral)

### Strategy

**알고리즘을 인터페이스로 정의하고 런타임에 교체한다.**

```java
public interface DiscountPolicy {
    int discount(int price);
}

public class VipDiscount implements DiscountPolicy {
    public int discount(int price) { return price * 20 / 100; }
}

public class NormalDiscount implements DiscountPolicy {
    public int discount(int price) { return price * 5 / 100; }
}

@Service
public class OrderService {
    private final Map<String, DiscountPolicy> policies;

    public int calculatePrice(String memberType, int price) {
        DiscountPolicy policy = policies.get(memberType);
        return price - policy.discount(price);
    }
}
```

**Spring에서:** DI로 전략을 주입하면 자연스럽게 전략 패턴이 된다.

### Template Method

**알고리즘의 골격을 정의하고, 세부 단계를 하위 클래스에서 구현한다.**

```java
public abstract class AbstractExportService {

    // 템플릿 메서드 — 순서를 정의
    public final void export(List<Data> data) {
        validate(data);
        List<Data> processed = process(data);
        write(processed);
        notify();
    }

    protected abstract List<Data> process(List<Data> data);
    protected abstract void write(List<Data> data);

    private void validate(List<Data> data) { /* 공통 검증 */ }
    private void notify() { /* 공통 알림 */ }
}

public class CsvExportService extends AbstractExportService {
    protected List<Data> process(List<Data> data) { /* CSV 변환 */ }
    protected void write(List<Data> data) { /* 파일 저장 */ }
}
```

**Spring에서:** `JdbcTemplate`, `RestTemplate`이 템플릿 메서드 패턴이다.

### Observer

**상태 변경을 관찰자들에게 자동 통지한다.**

```java
// Spring의 이벤트 시스템이 Observer 패턴
// 발행
@Service
public class OrderService {
    private final ApplicationEventPublisher eventPublisher;

    public void createOrder(OrderRequest request) {
        Order order = orderRepository.save(Order.create(request));
        eventPublisher.publishEvent(new OrderCreatedEvent(order));
    }
}

// 구독
@Component
public class OrderEventListener {

    @EventListener
    public void handleOrderCreated(OrderCreatedEvent event) {
        // 이메일 발송, 알림 등
    }
}
```

## Spring에서 사용되는 패턴 정리

| 패턴 | Spring에서의 적용 |
|------|-------------------|
| **Singleton** | Bean 기본 스코프 |
| **Factory** | BeanFactory, ApplicationContext |
| **Proxy** | AOP, @Transactional, @Cacheable |
| **Template Method** | JdbcTemplate, RestTemplate |
| **Strategy** | DI를 통한 구현체 교체 |
| **Observer** | ApplicationEventPublisher |
| **Adapter** | HandlerAdapter |
| **Facade** | Service 계층이 여러 컴포넌트를 조합 |

## 면접 예상 질문

**Q: 전략 패턴이란?**
A: 알고리즘을 인터페이스로 정의하고 구현체를 캡슐화하여, 클라이언트 코드 변경 없이 런타임에 알고리즘을 교체할 수 있게 하는 패턴이다. Spring의 DI가 전략 패턴을 자연스럽게 구현한다.

**Q: 프록시 패턴이란?**
A: 실제 객체 대신 대리 객체가 요청을 받아 부가 기능(로깅, 트랜잭션, 캐시 등)을 수행한 후 실제 객체에 위임하는 패턴이다. Spring AOP가 프록시 패턴으로 동작한다.

**Q: 템플릿 메서드 패턴과 전략 패턴의 차이는?**
A: 템플릿 메서드는 상속으로 알고리즘의 일부를 오버라이드하고, 전략 패턴은 조합(Composition)으로 알고리즘 전체를 교체한다. 전략 패턴이 더 유연하여 선호된다.

**Q: 실무에서 가장 많이 사용하는 패턴은?**
A: 전략 패턴(DI를 통한 구현체 교체), 프록시 패턴(@Transactional 등), 빌더 패턴(Lombok @Builder), 팩토리 패턴(객체 생성 분리)이 가장 빈번하게 사용된다.
