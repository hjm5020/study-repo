# Modern Java (Java 8+)

## 핵심 개념
> Java 8 이후 추가된 주요 기능들로, 함수형 프로그래밍, 간결한 코드 작성, 성능 최적화를 지원한다.

## Lambda & Functional Interface

### 람다 표현식

```java
// 익명 클래스 → 람다
Comparator<String> comp = new Comparator<>() {
    @Override
    public int compare(String a, String b) {
        return a.length() - b.length();
    }
};

// 람다
Comparator<String> comp = (a, b) -> a.length() - b.length();
```

### 주요 함수형 인터페이스 (java.util.function)

| 인터페이스 | 시그니처 | 용도 |
|-----------|----------|------|
| `Predicate<T>` | `T → boolean` | 조건 검사 |
| `Function<T, R>` | `T → R` | 변환 |
| `Consumer<T>` | `T → void` | 소비 (부수 효과) |
| `Supplier<T>` | `() → T` | 생성 |
| `BiFunction<T, U, R>` | `(T, U) → R` | 두 인자 변환 |

```java
Predicate<String> isNotEmpty = s -> !s.isEmpty();
Function<String, Integer> toLength = String::length;
Consumer<String> printer = System.out::println;
Supplier<List<String>> listFactory = ArrayList::new;
```

### 메서드 참조

```java
// 정적 메서드 참조
Function<String, Integer> parser = Integer::parseInt;

// 인스턴스 메서드 참조
Function<String, String> upper = String::toUpperCase;

// 생성자 참조
Supplier<ArrayList<String>> factory = ArrayList::new;
```

## Stream API

### 기본 구조

```java
List<Order> result = orders.stream()       // 1. 스트림 생성
    .filter(o -> o.getPrice() > 10000)      // 2. 중간 연산 (lazy)
    .sorted(comparing(Order::getPrice))     // 2. 중간 연산 (lazy)
    .collect(toList());                     // 3. 최종 연산 (실행 트리거)
```

### 주요 중간 연산

```java
// filter — 조건 필터링
stream.filter(o -> o.getStatus() == ACTIVE)

// map — 변환
stream.map(Order::getProductName)     // Order → String
stream.mapToInt(Order::getQuantity)   // IntStream으로 변환

// flatMap — 중첩 컬렉션 펼치기
// List<Order> → 각 Order에 List<OrderItem> → 모든 OrderItem 하나의 스트림으로
orders.stream()
    .flatMap(order -> order.getItems().stream())

// distinct — 중복 제거
stream.distinct()

// sorted — 정렬
stream.sorted(comparing(Order::getPrice).reversed())

// peek — 디버깅용 (부수 효과)
stream.peek(o -> log.debug("processing: {}", o))
```

### 주요 최종 연산

```java
// collect — 결과 수집
List<Order> list = stream.collect(toList());
Set<String> set = stream.collect(toSet());
Map<Long, Order> map = stream.collect(toMap(Order::getId, Function.identity()));

// groupingBy — 그룹화
Map<OrderStatus, List<Order>> grouped =
    orders.stream().collect(groupingBy(Order::getStatus));

// 그룹별 개수
Map<OrderStatus, Long> counts =
    orders.stream().collect(groupingBy(Order::getStatus, counting()));

// joining — 문자열 결합
String names = orders.stream()
    .map(Order::getProductName)
    .collect(joining(", "));

// 집계
int total = stream.mapToInt(Order::getPrice).sum();
OptionalInt max = stream.mapToInt(Order::getPrice).max();
double avg = stream.mapToInt(Order::getPrice).average().orElse(0);

// reduce — 사용자 정의 집계
int sum = numbers.stream().reduce(0, Integer::sum);

// anyMatch / allMatch / noneMatch
boolean hasExpensive = orders.stream().anyMatch(o -> o.getPrice() > 100000);

// findFirst / findAny
Optional<Order> first = orders.stream()
    .filter(o -> o.getStatus() == ACTIVE)
    .findFirst();
```

### parallelStream 주의사항

```java
// 병렬 스트림 — 멀티 스레드로 처리
orders.parallelStream()
    .filter(...)
    .collect(toList());

// 주의:
// - 데이터 양이 적으면 오히려 느림 (스레드 생성 오버헤드)
// - 공유 상태 변경하면 안 됨
// - ForkJoinPool.commonPool()을 사용하므로 다른 작업에 영향
// - 순서 보장이 필요한 경우 부적합
```

## Optional

```java
// 생성
Optional<String> opt = Optional.of("hello");          // null이면 NPE
Optional<String> opt = Optional.ofNullable(value);     // null 허용
Optional<String> opt = Optional.empty();               // 빈 값

// 사용
String name = optional
    .map(User::getName)                // 값이 있으면 변환
    .orElse("Unknown");                // 없으면 기본값

String name = optional
    .orElseThrow(() -> new EntityNotFoundException("User not found"));

optional.ifPresent(user -> log.info("Found: {}", user.getName()));

// ❌ 안티패턴
optional.get();                          // NoSuchElementException 위험
optional.isPresent() ? optional.get() : null;  // if-else와 다를 바 없음
if (optional != null) { ... }           // Optional 자체를 null 체크

// ❌ Optional을 필드, 파라미터, 컬렉션에 사용하지 않는다
public class User {
    private Optional<String> name;      // ❌
}
public void process(Optional<String> name) { } // ❌

// ✅ Optional은 반환 타입에만 사용
public Optional<User> findByEmail(String email) { }
```

## Record (Java 16+)

```java
// 불변 데이터 클래스를 간결하게 정의
public record OrderResponse(
    Long id,
    String productName,
    int quantity,
    BigDecimal price
) {
    // 컴팩트 생성자 (유효성 검증)
    public OrderResponse {
        if (quantity < 0) throw new IllegalArgumentException();
    }

    // 정적 팩토리 메서드
    public static OrderResponse from(Order order) {
        return new OrderResponse(
            order.getId(),
            order.getProductName(),
            order.getQuantity(),
            order.getPrice()
        );
    }
}

// 자동 생성: 생성자, getter, equals, hashCode, toString
// 모든 필드가 final (불변)
// DTO, VO에 적합
```

## Sealed Class (Java 17+)

```java
// 상속 가능한 클래스를 제한
public sealed interface PaymentResult
    permits PaymentSuccess, PaymentFailure, PaymentPending {
}

public record PaymentSuccess(String transactionId) implements PaymentResult { }
public record PaymentFailure(String errorCode, String message) implements PaymentResult { }
public record PaymentPending(String pendingId) implements PaymentResult { }

// 패턴 매칭과 함께 사용 (Java 21+)
String message = switch (result) {
    case PaymentSuccess s -> "성공: " + s.transactionId();
    case PaymentFailure f -> "실패: " + f.message();
    case PaymentPending p -> "대기: " + p.pendingId();
};
```

## Virtual Thread (Java 21+)

```java
// 기존 플랫폼 스레드 — OS 스레드와 1:1 매핑, 무거움
Thread thread = new Thread(() -> doWork());

// 가상 스레드 — JVM이 관리, 매우 가벼움 (수백만 개 생성 가능)
Thread vThread = Thread.ofVirtual().start(() -> doWork());

// ExecutorService와 사용
try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
    // 요청마다 가상 스레드 생성 — thread-per-request 모델
    for (int i = 0; i < 100_000; i++) {
        executor.submit(() -> handleRequest());
    }
}

// Spring Boot 3.2+에서 활성화
// application.yml
// spring.threads.virtual.enabled: true
```

**Virtual Thread 특징:**
- I/O 바운드 작업에 큰 성능 향상
- CPU 바운드 작업에는 이점 없음
- synchronized 블록 내에서 I/O 시 pinning 발생 주의 → ReentrantLock 사용 권장
- ThreadLocal 사용에 주의 (수백만 스레드 × ThreadLocal = 메모리 문제)

## 면접 예상 질문

**Q: Stream의 중간 연산과 최종 연산의 차이는?**
A: 중간 연산(filter, map 등)은 lazy하게 동작하여 최종 연산이 호출될 때까지 실행되지 않는다. 최종 연산(collect, forEach 등)이 호출되어야 파이프라인 전체가 실행된다.

**Q: Optional을 사용할 때 주의할 점은?**
A: Optional은 반환 타입에만 사용하고, 필드나 메서드 파라미터에는 사용하지 않는다. get() 대신 orElse(), orElseThrow() 등 안전한 메서드를 사용해야 한다. Optional 자체가 null일 수 있으므로 null을 반환하면 안 된다.

**Q: Virtual Thread란?**
A: Java 21에서 도입된 경량 스레드로, JVM이 관리하며 OS 스레드와 다대일(M:N) 매핑된다. 수백만 개 생성이 가능하여 I/O 바운드 작업에서 thread-per-request 모델을 효율적으로 구현할 수 있다.

**Q: Record 클래스란?**
A: Java 16에서 도입된 불변 데이터 클래스이다. 생성자, getter, equals, hashCode, toString이 자동 생성되며 모든 필드가 final이다. DTO, VO 등에 적합하다.

## 참고
- [Oracle - Java Language Updates](https://docs.oracle.com/en/java/javase/21/language/)
- [Oracle - Stream API](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/stream/package-summary.html)
- [JEP 444: Virtual Threads](https://openjdk.org/jeps/444)
