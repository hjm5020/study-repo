# AOP (Aspect-Oriented Programming)

## 핵심 개념
> AOP는 핵심 비즈니스 로직과 횡단 관심사(로깅, 트랜잭션, 보안 등)를 분리하여, 공통 기능을 한 곳에서 관리할 수 있게 해주는 프로그래밍 패러다임이다.

## 왜 필요한가?

### AOP 없이 — 코드 중복

```java
public class OrderService {
    public void createOrder() {
        long start = System.currentTimeMillis(); // 중복
        log.info("createOrder 시작");             // 중복

        // 핵심 로직
        orderRepository.save(order);

        log.info("createOrder 끝");               // 중복
        long end = System.currentTimeMillis();    // 중복
    }

    public void cancelOrder() {
        long start = System.currentTimeMillis(); // 또 중복
        log.info("cancelOrder 시작");             // 또 중복

        // 핵심 로직
        orderRepository.delete(order);

        log.info("cancelOrder 끝");               // 또 중복
        long end = System.currentTimeMillis();    // 또 중복
    }
}
```

### AOP 적용 — 관심사 분리

```java
@Aspect
@Component
public class LoggingAspect {

    @Around("execution(* com.example.service.*.*(..))")
    public Object logging(ProceedingJoinPoint joinPoint) throws Throwable {
        long start = System.currentTimeMillis();
        log.info("{} 시작", joinPoint.getSignature().getName());

        Object result = joinPoint.proceed(); // 원본 메서드 실행

        log.info("{} 끝 ({}ms)", joinPoint.getSignature().getName(),
                System.currentTimeMillis() - start);
        return result;
    }
}
```

비즈니스 로직은 깔끔해진다:

```java
public class OrderService {
    public void createOrder() {
        orderRepository.save(order); // 핵심 로직만
    }
}
```

## AOP 핵심 용어

| 용어 | 설명 |
|------|------|
| **Aspect** | 횡단 관심사를 모듈화한 것 (@Aspect) |
| **Advice** | 실제 실행되는 부가 기능 (로깅, 트랜잭션 등) |
| **JoinPoint** | Advice가 적용될 수 있는 지점 (메서드 실행) |
| **Pointcut** | Advice를 적용할 대상을 선정하는 표현식 |
| **Target** | Advice가 적용되는 대상 객체 |
| **Proxy** | AOP가 적용된 후 생성되는 프록시 객체 |

## Advice 종류

```java
@Aspect
@Component
public class ExampleAspect {

    // 메서드 실행 전
    @Before("execution(* com.example.service.*.*(..))")
    public void before(JoinPoint joinPoint) { }

    // 메서드 정상 실행 후
    @AfterReturning(pointcut = "execution(* com.example.service.*.*(..))",
                    returning = "result")
    public void afterReturning(JoinPoint joinPoint, Object result) { }

    // 예외 발생 시
    @AfterThrowing(pointcut = "execution(* com.example.service.*.*(..))",
                   throwing = "ex")
    public void afterThrowing(JoinPoint joinPoint, Exception ex) { }

    // 항상 (finally)
    @After("execution(* com.example.service.*.*(..))")
    public void after(JoinPoint joinPoint) { }

    // 전후 모두 제어 (가장 강력)
    @Around("execution(* com.example.service.*.*(..))")
    public Object around(ProceedingJoinPoint joinPoint) throws Throwable {
        // 전처리
        Object result = joinPoint.proceed();
        // 후처리
        return result;
    }
}
```

## Pointcut 표현식

```java
// 패키지 내 모든 메서드
@Around("execution(* com.example.service.*.*(..))")

// 특정 어노테이션이 붙은 메서드
@Around("@annotation(com.example.annotation.LogExecutionTime)")

// 특정 어노테이션이 붙은 클래스의 모든 메서드
@Around("@within(org.springframework.stereotype.Service)")

// Pointcut 재사용
@Pointcut("execution(* com.example.service.*.*(..))")
private void serviceLayer() {}

@Around("serviceLayer()")
public Object logging(ProceedingJoinPoint joinPoint) throws Throwable { }
```

## Spring AOP의 동작 원리 — 프록시

```
클라이언트 → [프록시 객체] → [실제 객체]
              ↓
         부가 기능 실행
         (로깅, 트랜잭션)
              ↓
         실제 메서드 호출
```

- Spring AOP는 **프록시 기반**으로 동작한다
- 기본적으로 **CGLIB 프록시**를 사용 (클래스 상속 방식)
- 인터페이스가 있으면 **JDK 동적 프록시**도 가능

### 프록시의 한계 — 내부 호출 문제

```java
@Service
public class OrderService {

    @Transactional
    public void createOrder() {
        // ...
    }

    public void process() {
        createOrder(); // ❌ 프록시를 거치지 않음 → @Transactional 적용 안 됨!
    }
}
```

같은 클래스 내부에서 호출하면 프록시를 거치지 않기 때문에 AOP가 적용되지 않는다.

**해결 방법:**
- 메서드를 별도 클래스로 분리
- `self-injection` (자기 자신을 주입)
- `ApplicationContext.getBean()`

## 실무에서의 AOP 활용

| 활용 | 설명 |
|------|------|
| **@Transactional** | 트랜잭션 관리 (가장 대표적) |
| **@Cacheable** | 캐시 처리 |
| **@Async** | 비동기 처리 |
| 실행 시간 측정 | 커스텀 어노테이션 + @Around |
| API 접근 로깅 | 요청/응답 로깅 |
| 권한 체크 | 커스텀 인가 처리 |

## 면접 예상 질문

**Q: Spring AOP는 어떻게 동작하는가?**
A: 프록시 패턴을 기반으로 동작한다. Spring은 Bean을 생성할 때 AOP 적용 대상이면 실제 객체 대신 프록시 객체를 생성하여 컨테이너에 등록한다. 클라이언트가 메서드를 호출하면 프록시가 먼저 받아서 부가 기능(Advice)을 실행한 후 실제 객체의 메서드를 호출한다.

**Q: @Transactional이 내부 호출에서 동작하지 않는 이유는?**
A: Spring AOP가 프록시 기반이기 때문이다. 같은 클래스 내에서 this.method()로 호출하면 프록시를 거치지 않고 실제 객체의 메서드가 직접 호출되어 AOP가 적용되지 않는다.

**Q: JDK 동적 프록시와 CGLIB의 차이는?**
A: JDK 동적 프록시는 인터페이스를 기반으로 프록시를 생성하고, CGLIB은 클래스를 상속하여 프록시를 생성한다. Spring Boot는 기본적으로 CGLIB을 사용한다.

## 참고
- [Spring 공식 문서 - AOP](https://docs.spring.io/spring-framework/reference/core/aop.html)
