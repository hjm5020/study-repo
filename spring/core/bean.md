# Bean 생명주기와 스코프

## 핵심 개념
> Spring Bean은 컨테이너가 관리하는 객체로, 생성 → 의존관계 주입 → 초기화 → 사용 → 소멸의 생명주기를 가지며, 스코프에 따라 인스턴스 관리 방식이 달라진다.

## Bean 생명주기

```
스프링 컨테이너 생성
    ↓
Bean 인스턴스 생성 (생성자 호출)
    ↓
의존관계 주입 (DI)
    ↓
초기화 콜백
    ↓
사용
    ↓
소멸 전 콜백
    ↓
스프링 컨테이너 종료
```

### 초기화 / 소멸 콜백 방법

#### 1. @PostConstruct / @PreDestroy (권장)

```java
@Service
public class CacheService {

    @PostConstruct
    public void init() {
        // Bean 생성 + DI 완료 후 호출
        // 초기 데이터 로딩, 커넥션 연결 등
    }

    @PreDestroy
    public void destroy() {
        // Bean 소멸 전 호출
        // 리소스 정리, 커넥션 해제 등
    }
}
```

#### 2. @Bean의 initMethod / destroyMethod

```java
@Configuration
public class AppConfig {
    @Bean(initMethod = "init", destroyMethod = "close")
    public DataSource dataSource() {
        return new HikariDataSource();
    }
}
```

외부 라이브러리에 콜백을 적용할 때 사용한다.

#### 3. InitializingBean / DisposableBean 인터페이스

```java
@Service
public class CacheService implements InitializingBean, DisposableBean {
    @Override
    public void afterPropertiesSet() { /* 초기화 */ }

    @Override
    public void destroy() { /* 소멸 */ }
}
```

스프링에 종속되므로 잘 사용하지 않는다.

## Bean 스코프

| 스코프 | 설명 | 인스턴스 수 |
|--------|------|-------------|
| **singleton** (기본) | 컨테이너당 하나의 인스턴스 | 1개 |
| **prototype** | 요청할 때마다 새 인스턴스 | N개 |
| request | HTTP 요청마다 새 인스턴스 | 요청당 1개 |
| session | HTTP 세션마다 새 인스턴스 | 세션당 1개 |

### Singleton (기본)

```java
@Service // 기본적으로 singleton
public class OrderService {
    // 컨테이너에 1개만 존재
    // 모든 곳에서 같은 인스턴스를 공유
}
```

**주의사항:**
- 상태를 가지면 안 된다 (stateless)
- 여러 스레드가 공유하므로 필드에 공유 변수를 두면 동시성 문제 발생

```java
@Service
public class OrderService {
    private int count = 0; // ❌ 위험! 공유 상태

    public void order() {
        count++;  // 여러 스레드가 동시 접근 → 동시성 문제
    }
}
```

### Prototype

```java
@Scope("prototype")
@Component
public class ClientSession {
    // 조회할 때마다 새 인스턴스 생성
    // 컨테이너는 생성과 DI까지만 관여, 이후 관리하지 않음
    // @PreDestroy 호출되지 않음
}
```

### Singleton 안에서 Prototype 사용 시 문제

```java
@Service
public class OrderService { // singleton
    private final ClientSession session; // prototype이지만 한 번만 주입됨!

    public OrderService(ClientSession session) {
        this.session = session; // 항상 같은 인스턴스
    }
}
```

**해결: ObjectProvider 사용**

```java
@Service
public class OrderService {
    private final ObjectProvider<ClientSession> sessionProvider;

    public OrderService(ObjectProvider<ClientSession> sessionProvider) {
        this.sessionProvider = sessionProvider;
    }

    public void doSomething() {
        ClientSession session = sessionProvider.getObject(); // 매번 새 인스턴스
    }
}
```

## 면접 예상 질문

**Q: Spring Bean의 기본 스코프는?**
A: Singleton이다. 스프링 컨테이너당 하나의 인스턴스만 생성되어 공유된다.

**Q: Singleton Bean에서 주의할 점은?**
A: 여러 스레드가 공유하므로 상태를 가지면 안 된다(stateless). 필드에 공유 변수를 두면 동시성 문제가 발생한다.

**Q: @PostConstruct는 언제 호출되는가?**
A: Bean 인스턴스 생성 + 의존관계 주입이 완료된 후 호출된다. 초기 데이터 로딩이나 리소스 연결 등에 사용한다.

**Q: Prototype 스코프를 Singleton에서 사용하면 어떤 문제가 있는가?**
A: Singleton Bean에 주입된 Prototype Bean은 한 번만 생성되어 계속 같은 인스턴스가 사용된다. ObjectProvider를 통해 매번 새 인스턴스를 가져와야 한다.

## 참고
- [Spring 공식 문서 - Bean Scopes](https://docs.spring.io/spring-framework/reference/core/beans/factory-scopes.html)
- [Spring 공식 문서 - Lifecycle Callbacks](https://docs.spring.io/spring-framework/reference/core/beans/factory-nature.html)
