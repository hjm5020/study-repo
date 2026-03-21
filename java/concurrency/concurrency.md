# Java 동시성 (Concurrency)

## 핵심 개념
> Java 동시성은 여러 스레드가 동시에 실행될 때 발생하는 문제(경쟁 조건, 가시성, 원자성)를 안전하게 처리하기 위한 메커니즘이다.

## Thread 생성 방법

```java
// 1. Runnable (반환값 없음)
Runnable task = () -> System.out.println("Hello from " + Thread.currentThread().getName());
Thread thread = new Thread(task);
thread.start();

// 2. Callable (반환값 있음)
Callable<Integer> callable = () -> {
    Thread.sleep(1000);
    return 42;
};

// 3. ExecutorService (권장)
ExecutorService executor = Executors.newFixedThreadPool(4);
Future<Integer> future = executor.submit(callable);
Integer result = future.get(); // 블로킹 대기
executor.shutdown();
```

## 동시성 문제 3가지

### 1. 경쟁 조건 (Race Condition)

```java
public class Counter {
    private int count = 0;

    public void increment() {
        count++; // read → modify → write (원자적이지 않음!)
    }
}

// 두 스레드가 동시에 increment() 호출
// 기대값: 2, 실제값: 1이 될 수 있음
```

### 2. 가시성 (Visibility)

```java
public class Flag {
    private boolean running = true; // 다른 스레드의 변경이 안 보일 수 있음

    public void stop() {
        running = false; // 스레드 A가 변경
    }

    public void run() {
        while (running) { // 스레드 B는 변경을 못 볼 수 있음 (CPU 캐시)
            // ...
        }
    }
}
```

### 3. 순서 보장 (Ordering)

- 컴파일러와 CPU가 최적화를 위해 명령어 순서를 변경할 수 있음 (Instruction Reordering)

## synchronized

```java
public class Counter {
    private int count = 0;

    // 메서드 레벨 — this 락
    public synchronized void increment() {
        count++;
    }

    // 블록 레벨 — 특정 객체 락
    public void increment2() {
        synchronized (this) {
            count++;
        }
    }

    // static 메서드 — 클래스 락
    public static synchronized void staticMethod() {
        // Class 객체에 락
    }
}
```

**특징:**
- 상호 배제(Mutual Exclusion): 하나의 스레드만 임계 영역 진입
- 가시성 보장: 락 해제 시 변경 사항이 다른 스레드에 보임
- 재진입 가능(Reentrant): 같은 스레드가 같은 락을 다시 획득 가능

## volatile

```java
public class Flag {
    private volatile boolean running = true;

    public void stop() {
        running = false; // 메인 메모리에 즉시 반영
    }

    public void run() {
        while (running) { // 항상 메인 메모리에서 읽음
            // ...
        }
    }
}
```

**volatile의 역할:**
- 가시성 보장: CPU 캐시가 아닌 메인 메모리에서 읽기/쓰기
- 순서 보장: Reordering 방지

**volatile의 한계:**
- 원자성은 보장하지 않음 → `count++` 같은 복합 연산에는 부적합
- 단순 플래그(boolean)에 적합

## Atomic 클래스

```java
public class Counter {
    private final AtomicInteger count = new AtomicInteger(0);

    public void increment() {
        count.incrementAndGet(); // CAS(Compare-And-Swap) 기반 원자적 연산
    }

    public int get() {
        return count.get();
    }
}

// CAS 동작 원리
// 1. 현재 값을 읽음 (expected)
// 2. 새 값을 계산 (new)
// 3. 현재 값이 여전히 expected면 → new로 교체 (성공)
//    아니면 → 1번부터 재시도
// 락 없이 동작 → Lock-Free 알고리즘
```

주요 Atomic 클래스:
- `AtomicInteger`, `AtomicLong`, `AtomicBoolean`
- `AtomicReference<T>`
- `LongAdder` (높은 경합 상황에서 AtomicLong보다 빠름)

## java.util.concurrent

### ExecutorService

```java
// 고정 스레드 풀
ExecutorService fixed = Executors.newFixedThreadPool(4);

// 캐시 스레드 풀 (필요에 따라 스레드 생성/제거)
ExecutorService cached = Executors.newCachedThreadPool();

// 단일 스레드
ExecutorService single = Executors.newSingleThreadExecutor();

// 직접 설정 (실무 권장)
ExecutorService custom = new ThreadPoolExecutor(
    4,                // corePoolSize
    8,                // maximumPoolSize
    60L,              // keepAliveTime
    TimeUnit.SECONDS,
    new LinkedBlockingQueue<>(100), // 작업 큐
    new ThreadPoolExecutor.CallerRunsPolicy() // 거절 정책
);
```

### CompletableFuture

```java
// 비동기 실행
CompletableFuture<String> future = CompletableFuture
    .supplyAsync(() -> fetchData())        // 비동기로 데이터 가져오기
    .thenApply(data -> process(data))       // 변환
    .thenApply(result -> format(result))    // 변환
    .exceptionally(ex -> "Error: " + ex.getMessage()); // 예외 처리

String result = future.join(); // 블로킹 대기

// 여러 비동기 작업 병렬 실행
CompletableFuture<String> userFuture = CompletableFuture.supplyAsync(() -> getUser());
CompletableFuture<String> orderFuture = CompletableFuture.supplyAsync(() -> getOrders());

CompletableFuture.allOf(userFuture, orderFuture).join(); // 모두 완료 대기
```

### 동시성 컬렉션

```java
// ConcurrentHashMap — 세그먼트 락
ConcurrentHashMap<String, Integer> map = new ConcurrentHashMap<>();

// CopyOnWriteArrayList — 읽기가 많고 쓰기가 적을 때
CopyOnWriteArrayList<String> list = new CopyOnWriteArrayList<>();

// BlockingQueue — 생산자-소비자 패턴
BlockingQueue<String> queue = new LinkedBlockingQueue<>(100);
queue.put("item");    // 큐가 가득 차면 대기
queue.take();         // 큐가 비어있으면 대기
```

### 동기화 도구

```java
// CountDownLatch — N개의 작업이 완료될 때까지 대기
CountDownLatch latch = new CountDownLatch(3);
// 각 스레드에서 latch.countDown();
latch.await(); // count가 0이 될 때까지 대기

// Semaphore — 동시 접근 수 제한
Semaphore semaphore = new Semaphore(5); // 최대 5개 스레드
semaphore.acquire(); // 허가 획득
try {
    // 임계 영역
} finally {
    semaphore.release(); // 허가 반환
}

// ReentrantLock — synchronized의 확장
ReentrantLock lock = new ReentrantLock();
lock.lock();
try {
    // 임계 영역
} finally {
    lock.unlock(); // 반드시 finally에서 해제
}
```

## 데드락 (Deadlock)

```java
// 스레드 A: lock1 → lock2 획득 시도
// 스레드 B: lock2 → lock1 획득 시도
// → 서로 상대방의 락을 기다리며 영원히 대기

// 예방: 락 순서 통일
// 스레드 A: lock1 → lock2
// 스레드 B: lock1 → lock2 (같은 순서)
```

**데드락 조건 4가지 (모두 충족 시 발생):**
1. 상호 배제 — 한 번에 하나의 스레드만 자원 사용
2. 점유 대기 — 자원을 점유한 채 다른 자원 대기
3. 비선점 — 다른 스레드의 자원을 강제로 빼앗을 수 없음
4. 순환 대기 — 스레드들이 원형으로 자원을 대기

## 면접 예상 질문

**Q: synchronized와 volatile의 차이는?**
A: synchronized는 상호 배제 + 가시성 + 원자성을 보장하고, volatile은 가시성만 보장한다. count++ 같은 복합 연산에는 synchronized 또는 AtomicInteger를 사용해야 한다.

**Q: CAS(Compare-And-Swap)란?**
A: 락 없이 원자적 연산을 수행하는 방식이다. 현재 메모리 값이 기대값과 같으면 새 값으로 교체하고, 다르면 재시도한다. AtomicInteger 등이 이를 사용한다. 경합이 적을 때 synchronized보다 성능이 좋다.

**Q: 스레드 풀을 직접 설정할 때 고려할 점은?**
A: core/max pool size, 작업 큐 크기, 거절 정책을 설정해야 한다. CPU 바운드 작업은 CPU 코어 수에 맞추고, I/O 바운드 작업은 대기 시간을 고려하여 더 많은 스레드를 설정한다. Executors.newFixedThreadPool() 등은 내부적으로 무제한 큐를 사용하여 OOM 위험이 있다.

**Q: 데드락이란 무엇이고 어떻게 예방하는가?**
A: 두 개 이상의 스레드가 서로의 락을 기다리며 영원히 대기하는 상태이다. 락 획득 순서를 통일하거나, tryLock()으로 타임아웃을 설정하여 예방할 수 있다.

## 참고
- [Java Concurrency in Practice](https://jcip.net/)
- [Oracle - Concurrency Tutorial](https://docs.oracle.com/javase/tutorial/essential/concurrency/)
