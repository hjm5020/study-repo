# 컬렉션 프레임워크

## 핵심 개념
> Java 컬렉션 프레임워크는 데이터를 저장하고 처리하기 위한 표준화된 자료구조와 알고리즘을 제공하는 라이브러리이다.

## 컬렉션 계층 구조

```
Iterable
  └── Collection
        ├── List       ← 순서 O, 중복 O
        │     ├── ArrayList
        │     ├── LinkedList
        │     └── Vector (레거시)
        │
        ├── Set        ← 순서 X, 중복 X
        │     ├── HashSet
        │     ├── LinkedHashSet (삽입 순서 유지)
        │     └── TreeSet (정렬)
        │
        └── Queue      ← FIFO
              ├── LinkedList
              ├── PriorityQueue
              └── ArrayDeque

Map (Collection을 상속하지 않음)  ← Key-Value
  ├── HashMap
  ├── LinkedHashMap (삽입 순서 유지)
  ├── TreeMap (키 정렬)
  ├── ConcurrentHashMap (스레드 안전)
  └── Hashtable (레거시)
```

## List

### ArrayList vs LinkedList

| | ArrayList | LinkedList |
|---|---|---|
| 내부 구조 | 동적 배열 | 이중 연결 리스트 |
| 인덱스 접근 | **O(1)** | O(n) |
| 앞에 삽입/삭제 | O(n) (요소 이동) | **O(1)** |
| 뒤에 삽입 | O(1) (amortized) | O(1) |
| 중간 삽입/삭제 | O(n) | O(n) (탐색 + O(1) 삽입) |
| 메모리 | 연속된 공간 | 노드마다 prev/next 포인터 |

**결론:** 대부분의 경우 **ArrayList**가 더 빠르다. (캐시 친화적)

### ArrayList 내부 동작

```java
// 기본 용량: 10
// 용량 초과 시 기존의 1.5배로 새 배열 생성 후 복사
ArrayList<String> list = new ArrayList<>(); // capacity: 10
// 11번째 요소 추가 시 → capacity: 15로 확장

// 초기 크기를 알면 미리 지정 → 불필요한 배열 복사 방지
ArrayList<String> list = new ArrayList<>(1000);
```

## Map

### HashMap 동작 원리

```
1. key.hashCode() 호출 → 해시값 계산
2. 해시값으로 버킷 인덱스 결정 (hash % capacity)
3. 해당 버킷에 저장

충돌(같은 버킷) 발생 시:
- Java 8 이전: 연결 리스트 (O(n))
- Java 8 이후: 연결 리스트 → 트리(Red-Black Tree)로 변환 (O(log n))
  - 하나의 버킷에 8개 이상 → Tree로 변환
  - 6개 이하로 줄면 → 다시 연결 리스트로
```

```java
// 기본 capacity: 16, load factor: 0.75
// 요소 수 > 16 * 0.75 = 12 → 32로 리사이징
HashMap<String, Integer> map = new HashMap<>();
```

### HashMap에서 key로 사용하려면

```java
// equals()와 hashCode()를 반드시 함께 오버라이드
public class OrderId {
    private final Long id;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof OrderId that)) return false;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
```

**왜 둘 다 오버라이드해야 하는가?**
- `hashCode()`로 버킷 위치를 찾고, `equals()`로 같은 키인지 최종 확인
- hashCode만 같고 equals가 다르면 → 다른 키로 인식 (충돌)
- equals가 같은데 hashCode가 다르면 → 다른 버킷에 저장되어 찾을 수 없음

### HashMap vs HashTable vs ConcurrentHashMap

| | HashMap | Hashtable | ConcurrentHashMap |
|---|---|---|---|
| 스레드 안전 | ❌ | ✅ (전체 락) | ✅ (세그먼트 락) |
| null key | 허용 | 불허 | 불허 |
| 성능 | 가장 빠름 | 느림 | 빠름 (동시성) |
| 사용 | 단일 스레드 | 사용하지 않음 | 멀티 스레드 |

```java
// 멀티 스레드 환경
ConcurrentHashMap<String, Integer> map = new ConcurrentHashMap<>();

// 원자적 연산
map.putIfAbsent("key", 1);
map.compute("key", (k, v) -> v == null ? 1 : v + 1);
```

## Set

```java
// HashSet — 내부적으로 HashMap 사용 (value는 더미 객체)
Set<String> set = new HashSet<>();
set.add("A");
set.contains("A"); // O(1)

// LinkedHashSet — 삽입 순서 유지
Set<String> ordered = new LinkedHashSet<>();

// TreeSet — 정렬된 상태 유지 (Red-Black Tree)
Set<Integer> sorted = new TreeSet<>(); // 오름차순
```

## Queue / Deque

```java
// Queue — FIFO
Queue<String> queue = new LinkedList<>();
queue.offer("A");  // 삽입
queue.poll();      // 제거 + 반환
queue.peek();      // 조회만

// PriorityQueue — 우선순위 큐 (Heap)
Queue<Integer> pq = new PriorityQueue<>(); // 최소 힙
Queue<Integer> maxPq = new PriorityQueue<>(Comparator.reverseOrder()); // 최대 힙

// Deque — 양방향 큐 (Stack 대체로도 사용)
Deque<String> deque = new ArrayDeque<>();
deque.offerFirst("A"); // 앞에 삽입
deque.offerLast("B");  // 뒤에 삽입
deque.pollFirst();     // 앞에서 제거
deque.pollLast();      // 뒤에서 제거

// Stack 대신 Deque 사용 권장
Deque<String> stack = new ArrayDeque<>();
stack.push("A");  // 삽입
stack.pop();      // 제거
stack.peek();     // 조회
```

## Collections 유틸리티

```java
// 불변 컬렉션
List<String> immutable = List.of("A", "B", "C");           // Java 9+
Map<String, Integer> map = Map.of("A", 1, "B", 2);         // Java 9+
List<String> unmodifiable = Collections.unmodifiableList(list);

// 정렬
Collections.sort(list);
list.sort(Comparator.comparing(Order::getPrice).reversed());

// 동기화 래퍼 (ConcurrentHashMap 사용 권장)
List<String> syncList = Collections.synchronizedList(new ArrayList<>());
```

## 면접 예상 질문

**Q: ArrayList와 LinkedList의 차이는?**
A: ArrayList는 내부적으로 배열을 사용하여 인덱스 접근이 O(1)이고, LinkedList는 이중 연결 리스트로 양 끝 삽입/삭제가 O(1)이다. 대부분의 경우 ArrayList가 캐시 지역성 덕분에 더 좋은 성능을 보인다.

**Q: HashMap의 동작 원리를 설명해주세요.**
A: key의 hashCode()로 버킷 인덱스를 결정하고 해당 위치에 저장한다. 해시 충돌 시 Java 8부터는 연결 리스트(8개 미만)와 Red-Black Tree(8개 이상)를 사용하여 성능을 보장한다.

**Q: equals()와 hashCode()를 함께 오버라이드해야 하는 이유는?**
A: HashMap은 hashCode()로 버킷을 찾고, equals()로 같은 키인지 확인한다. hashCode()만 같으면 같은 버킷에 들어가지만 다른 키로 취급되고, equals()만 같으면 다른 버킷에 저장되어 검색이 불가능하다. 둘의 일관성이 보장되어야 한다.

**Q: HashMap과 ConcurrentHashMap의 차이는?**
A: HashMap은 스레드 안전하지 않고, ConcurrentHashMap은 세그먼트(버킷) 단위 락을 사용하여 스레드 안전하면서도 높은 동시성을 제공한다. Hashtable은 전체 맵에 락을 걸어 성능이 낮으므로 사용하지 않는다.

## 참고
- [Java Collections Framework 공식 문서](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/package-summary.html)
- Effective Java — Item 28: 배열보다는 리스트를 사용하라
