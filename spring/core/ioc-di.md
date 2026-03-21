# IoC (Inversion of Control) / DI (Dependency Injection)

## 핵심 개념
> IoC는 객체의 생성과 의존관계 설정을 개발자가 아닌 프레임워크(컨테이너)가 대신 해주는 것이고, DI는 IoC를 구현하는 방법으로 외부에서 의존성을 주입해주는 패턴이다.

## 상세 설명

### IoC란?
- 전통적인 프로그래밍에서는 개발자가 직접 객체를 생성하고 의존관계를 설정한다
- IoC에서는 이 **제어권이 역전**되어 프레임워크(Spring 컨테이너)가 객체의 생성, 의존관계 설정, 생명주기를 관리한다
- 개발자는 "어떤 객체가 필요하다"고 선언만 하면 된다

### DI란?
- IoC를 실현하는 구체적인 방법
- 객체가 필요로 하는 의존성을 **외부에서 주입**해준다
- 객체는 자신이 사용할 의존 객체를 직접 생성하지 않는다

### IoC가 없는 경우 (강한 결합)

```java
public class OrderService {
    // 직접 생성 → 강한 결합
    private final OrderRepository repository = new JdbcOrderRepository();

    // JpaOrderRepository로 바꾸려면 코드를 수정해야 한다
}
```

### IoC가 있는 경우 (느슨한 결합)

```java
public class OrderService {
    private final OrderRepository repository;

    // 외부에서 주입 → 느슨한 결합
    public OrderService(OrderRepository repository) {
        this.repository = repository;
    }
}
```

## DI 방식 3가지

### 1. 생성자 주입 (권장)

```java
@Service
public class OrderService {
    private final OrderRepository orderRepository;
    private final PaymentService paymentService;

    // 생성자가 1개면 @Autowired 생략 가능
    public OrderService(OrderRepository orderRepository,
                        PaymentService paymentService) {
        this.orderRepository = orderRepository;
        this.paymentService = paymentService;
    }
}
```

**권장 이유:**
- `final` 키워드 사용 가능 → 불변 보장
- 컴파일 시점에 누락된 의존성 확인 가능
- 순환 참조를 애플리케이션 구동 시점에 감지
- 테스트에서 Mock 주입이 쉬움

### 2. 필드 주입

```java
@Service
public class OrderService {
    @Autowired
    private OrderRepository orderRepository;
}
```

**비권장 이유:**
- `final` 사용 불가 → 불변 보장 안 됨
- 테스트에서 의존성 주입이 어려움 (리플렉션 필요)
- 의존성이 숨겨져 있어 외부에서 파악하기 어려움

### 3. 수정자(Setter) 주입

```java
@Service
public class OrderService {
    private OrderRepository orderRepository;

    @Autowired
    public void setOrderRepository(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }
}
```

**사용 상황:** 선택적 의존성이 있을 때 (거의 사용하지 않음)

## Spring 컨테이너의 동작 흐름

```
1. @Configuration 클래스 또는 @ComponentScan으로 Bean 정의 탐색
2. BeanDefinition 생성
3. Bean 인스턴스 생성
4. 의존관계 주입 (DI)
5. 초기화 콜백 (@PostConstruct)
6. 사용
7. 소멸 콜백 (@PreDestroy)
```

## Bean 등록 방법

### 1. 컴포넌트 스캔 (자동)

```java
@Component   // 일반 컴포넌트
@Service     // 비즈니스 로직
@Repository  // 데이터 접근
@Controller  // 웹 컨트롤러
```

### 2. @Bean 직접 등록 (수동)

```java
@Configuration
public class AppConfig {
    @Bean
    public OrderRepository orderRepository() {
        return new JpaOrderRepository();
    }

    @Bean
    public OrderService orderService() {
        return new OrderService(orderRepository());
    }
}
```

**수동 등록이 필요한 경우:**
- 외부 라이브러리를 Bean으로 등록할 때
- 구현체를 상황에 따라 다르게 등록할 때

## 같은 타입의 Bean이 여러 개일 때

```java
public interface PaymentService { }

@Service
public class CardPaymentService implements PaymentService { }

@Service
public class CashPaymentService implements PaymentService { }
```

### 해결 방법

```java
// 1. @Primary - 우선순위 지정
@Primary
@Service
public class CardPaymentService implements PaymentService { }

// 2. @Qualifier - 이름으로 지정
@Service
public class OrderService {
    public OrderService(@Qualifier("cashPaymentService") PaymentService paymentService) {
        this.paymentService = paymentService;
    }
}

// 3. 모든 구현체를 주입받기
@Service
public class OrderService {
    private final Map<String, PaymentService> paymentServices;

    public OrderService(Map<String, PaymentService> paymentServices) {
        this.paymentServices = paymentServices;
    }
}
```

## 면접 예상 질문

**Q: IoC와 DI의 차이는?**
A: IoC는 제어의 역전이라는 설계 원칙이고, DI는 그것을 구현하는 구체적인 방법(패턴)이다. Spring에서는 컨테이너가 객체의 생성과 의존관계를 관리(IoC)하며, 생성자/필드/수정자를 통해 의존성을 주입(DI)한다.

**Q: 생성자 주입을 권장하는 이유는?**
A: final 키워드로 불변을 보장할 수 있고, 컴파일 시점에 의존성 누락을 확인할 수 있으며, 순환 참조를 애플리케이션 시작 시점에 감지할 수 있다. 또한 테스트에서 Mock 객체를 쉽게 주입할 수 있다.

**Q: @Component와 @Bean의 차이는?**
A: @Component는 클래스 레벨에 붙여서 컴포넌트 스캔으로 자동 등록하는 방식이고, @Bean은 메서드 레벨에 붙여서 @Configuration 클래스 안에서 수동 등록하는 방식이다. 외부 라이브러리처럼 소스코드를 수정할 수 없는 경우 @Bean을 사용한다.

**Q: 순환 참조(Circular Dependency)란?**
A: A가 B를 의존하고 B가 A를 의존하는 상황. 생성자 주입에서는 애플리케이션 시작 시점에 BeanCurrentlyInCreationException이 발생하여 바로 감지할 수 있다. 근본적으로 설계를 수정하여 해결해야 한다.

## 참고
- [Spring 공식 문서 - IoC Container](https://docs.spring.io/spring-framework/reference/core/beans.html)
- [Spring 공식 문서 - Dependency Injection](https://docs.spring.io/spring-framework/reference/core/beans/dependencies/factory-collaborators.html)
