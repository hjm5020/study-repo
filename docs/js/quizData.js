const QUIZ_DATA = [
  // ===== Java: OOP & SOLID =====
  {
    id: "java-oop-1",
    type: "ox",
    question: "OOP에서 상속(Inheritance)보다 조합(Composition)을 선호하는 이유는 상속이 부모와 자식 사이에 강한 결합을 만들고, 부모 변경이 자식에게 영향을 주기 때문이다.",
    correctAnswer: true,
    explanation: "상속은 강한 결합을 만들어 부모 변경이 자식에 영향을 준다. 조합은 필요한 기능을 가진 객체를 필드로 가지므로 결합도가 낮고, 런타임에 교체가 가능하다. (Effective Java Item 18)",
    category: "java",
    subtopic: "OOP & SOLID"
  },
  {
    id: "java-oop-2",
    type: "multiple",
    question: "SOLID 원칙 중 '확장에는 열려 있고, 변경에는 닫혀 있어야 한다'는 원칙은?",
    choices: ["단일 책임 원칙 (SRP)", "개방-폐쇄 원칙 (OCP)", "리스코프 치환 원칙 (LSP)", "의존 역전 원칙 (DIP)"],
    correctAnswer: 1,
    explanation: "개방-폐쇄 원칙(OCP)이다. 새로운 기능을 추가할 때 기존 코드를 변경하지 않고 확장할 수 있어야 한다. 인터페이스/추상 클래스를 통해 구현한다.",
    category: "java",
    subtopic: "OOP & SOLID"
  },
  {
    id: "java-oop-3",
    type: "ox",
    question: "인터페이스는 다중 구현이 가능하고 인스턴스 변수를 가질 수 있다.",
    correctAnswer: false,
    explanation: "인터페이스는 다중 구현이 가능하지만, 인스턴스 변수는 가질 수 없고 상수(static final)만 가능하다. 인스턴스 변수는 추상 클래스에서 가질 수 있다.",
    category: "java",
    subtopic: "OOP & SOLID"
  },
  {
    id: "java-oop-4",
    type: "multiple",
    question: "다음 중 OOP의 4대 특성이 아닌 것은?",
    choices: ["캡슐화", "상속", "다형성", "동시성"],
    correctAnswer: 3,
    explanation: "OOP의 4대 특성은 캡슐화(Encapsulation), 상속(Inheritance), 다형성(Polymorphism), 추상화(Abstraction)이다. 동시성(Concurrency)은 OOP의 특성이 아니다.",
    category: "java",
    subtopic: "OOP & SOLID"
  },

  // ===== Java: JVM & GC =====
  {
    id: "java-jvm-1",
    type: "ox",
    question: "JVM의 Heap 영역은 모든 스레드가 공유하며, 객체 인스턴스와 배열이 저장된다.",
    correctAnswer: true,
    explanation: "Heap은 모든 스레드가 공유하며 객체 인스턴스와 배열이 저장된다. Stack은 스레드별로 독립적으로 존재하며 지역 변수, 매개변수, 반환값이 저장된다.",
    category: "java",
    subtopic: "JVM & GC"
  },
  {
    id: "java-jvm-2",
    type: "multiple",
    question: "Java 9+ 에서 기본 GC 알고리즘은?",
    choices: ["Serial GC", "Parallel GC", "G1 GC", "ZGC"],
    correctAnswer: 2,
    explanation: "Java 9부터 G1 GC(Garbage First GC)가 기본이다. Heap을 동일 크기의 Region으로 분할하고, 가비지가 많은 Region부터 우선 수거한다. 예측 가능한 pause time을 제공한다.",
    category: "java",
    subtopic: "JVM & GC"
  },
  {
    id: "java-jvm-3",
    type: "ox",
    question: "Stop-the-World는 GC 실행 시 모든 애플리케이션 스레드가 일시 정지되는 현상으로, GC 튜닝의 핵심 목표는 이 시간을 최소화하는 것이다.",
    correctAnswer: true,
    explanation: "Stop-the-World(STW)는 GC 실행 중 모든 앱 스레드가 멈추는 현상이다. G1 GC의 -XX:MaxGCPauseMillis로 목표 pause time을 설정할 수 있다. ZGC는 pause < 1ms를 목표로 한다.",
    category: "java",
    subtopic: "JVM & GC"
  },
  {
    id: "java-jvm-4",
    type: "multiple",
    question: "JVM의 Young Generation에서 Minor GC 시 살아남은 객체가 이동하는 곳은?",
    choices: ["Old Generation으로 바로 이동", "Survivor 영역 (age +1)", "Method Area로 이동", "Native Method Stack으로 이동"],
    correctAnswer: 1,
    explanation: "Minor GC에서 살아남은 객체는 Survivor(S0/S1) 영역으로 이동하며 age가 +1 된다. age 임계값을 초과하면 Old Generation으로 이동(Promotion)된다.",
    category: "java",
    subtopic: "JVM & GC"
  },

  // ===== Java: Collections =====
  {
    id: "java-col-1",
    type: "ox",
    question: "HashMap은 스레드 안전하지 않으며, 멀티 스레드 환경에서는 ConcurrentHashMap을 사용해야 한다.",
    correctAnswer: true,
    explanation: "HashMap은 스레드 안전하지 않다. 멀티 스레드에서는 ConcurrentHashMap(세그먼트 락)을 사용한다. Hashtable은 전체 맵에 락을 걸어 성능이 낮아 사용하지 않는다.",
    category: "java",
    subtopic: "컬렉션"
  },
  {
    id: "java-col-2",
    type: "multiple",
    question: "HashMap에서 key로 객체를 사용할 때 반드시 함께 오버라이드해야 하는 메서드는?",
    choices: ["toString()과 compareTo()", "equals()와 hashCode()", "clone()과 finalize()", "wait()와 notify()"],
    correctAnswer: 1,
    explanation: "HashMap은 hashCode()로 버킷을 찾고, equals()로 같은 키인지 확인한다. 둘의 일관성이 보장되어야 한다. hashCode만 같으면 충돌, equals만 같으면 다른 버킷에 저장되어 검색 불가.",
    category: "java",
    subtopic: "컬렉션"
  },
  {
    id: "java-col-3",
    type: "ox",
    question: "ArrayList는 인덱스 접근이 O(1)이고, 앞에 삽입/삭제가 O(1)이다.",
    correctAnswer: false,
    explanation: "ArrayList는 인덱스 접근 O(1)이지만, 앞/중간 삽입·삭제는 요소 이동으로 O(n)이다. LinkedList는 앞 삽입·삭제가 O(1)이지만 인덱스 접근이 O(n)이다.",
    category: "java",
    subtopic: "컬렉션"
  },
  {
    id: "java-col-4",
    type: "multiple",
    question: "Java 8에서 HashMap의 해시 충돌 시 동작 방식은?",
    choices: ["항상 연결 리스트만 사용", "8개 이상 충돌 시 Red-Black Tree로 변환", "충돌 발생 시 즉시 리사이징", "개방 주소법으로 다른 버킷 탐색"],
    correctAnswer: 1,
    explanation: "Java 8부터 하나의 버킷에 8개 이상 충돌 시 연결 리스트에서 Red-Black Tree로 변환하여 O(n)에서 O(log n)으로 성능 개선. 6개 이하로 줄면 다시 연결 리스트로 변환.",
    category: "java",
    subtopic: "컬렉션"
  },

  // ===== Java: Concurrency =====
  {
    id: "java-conc-1",
    type: "ox",
    question: "volatile 키워드는 가시성(Visibility)과 원자성(Atomicity)을 모두 보장한다.",
    correctAnswer: false,
    explanation: "volatile은 가시성(CPU 캐시가 아닌 메인 메모리에서 읽기/쓰기)만 보장한다. 원자성은 보장하지 않는다. count++처럼 복합 연산에는 synchronized 또는 AtomicInteger를 사용해야 한다.",
    category: "java",
    subtopic: "동시성"
  },
  {
    id: "java-conc-2",
    type: "multiple",
    question: "데드락(Deadlock)의 4가지 필요 조건이 아닌 것은?",
    choices: ["상호 배제", "점유 대기", "선점 가능", "순환 대기"],
    correctAnswer: 2,
    explanation: "데드락의 4가지 조건은 상호 배제, 점유 대기, 비선점(강제로 빼앗을 수 없음), 순환 대기이다. '선점 가능'은 데드락 조건이 아니라 오히려 데드락을 방지하는 특성이다.",
    category: "java",
    subtopic: "동시성"
  },
  {
    id: "java-conc-3",
    type: "ox",
    question: "CAS(Compare-And-Swap)는 락 없이 원자적 연산을 수행하며, AtomicInteger가 이를 사용한다.",
    correctAnswer: true,
    explanation: "CAS는 현재 값이 기대값과 같으면 새 값으로 교체하고, 아니면 재시도하는 Lock-Free 알고리즘이다. 경합이 적을 때 synchronized보다 성능이 좋다.",
    category: "java",
    subtopic: "동시성"
  },
  {
    id: "java-conc-4",
    type: "multiple",
    question: "Java에서 synchronized와 비교하여 ReentrantLock이 제공하는 추가 기능은?",
    choices: ["더 빠른 락 획득", "tryLock()으로 타임아웃 설정 가능", "자동 언락", "멀티 스레드 생성"],
    correctAnswer: 1,
    explanation: "ReentrantLock은 synchronized의 확장으로 tryLock(타임아웃 설정), lockInterruptibly(인터럽트 가능), 공정한 락 등 추가 기능을 제공한다. 단, finally에서 반드시 unlock()을 호출해야 한다.",
    category: "java",
    subtopic: "동시성"
  },

  // ===== Java: Modern Java =====
  {
    id: "java-modern-1",
    type: "ox",
    question: "Stream의 중간 연산(filter, map 등)은 최종 연산이 호출될 때까지 실행되지 않는 lazy 방식으로 동작한다.",
    correctAnswer: true,
    explanation: "중간 연산은 lazy하게 동작하여 최종 연산(collect, forEach 등)이 호출되어야 파이프라인 전체가 실행된다. 이를 통해 불필요한 연산을 최소화할 수 있다.",
    category: "java",
    subtopic: "Modern Java"
  },
  {
    id: "java-modern-2",
    type: "multiple",
    question: "Optional 사용 시 올바른 방법은?",
    choices: ["필드 타입으로 Optional<String> name 사용", "메서드 파라미터로 Optional 사용", "반환 타입으로만 사용 (Optional<User> findById)", "null 체크 후 Optional 반환"],
    correctAnswer: 2,
    explanation: "Optional은 반환 타입에만 사용하는 것이 권장된다. 필드, 파라미터, 컬렉션에 사용하면 안 된다. get() 대신 orElse(), orElseThrow() 등 안전한 메서드를 사용해야 한다.",
    category: "java",
    subtopic: "Modern Java"
  },
  {
    id: "java-modern-3",
    type: "ox",
    question: "Java 21의 Virtual Thread는 OS 스레드와 1:1 매핑되며, I/O 바운드 작업에서 큰 성능 향상을 제공한다.",
    correctAnswer: false,
    explanation: "Virtual Thread는 JVM이 관리하며 OS 스레드와 다대일(M:N) 매핑된다(OS 스레드와 1:1이 아님). 수백만 개 생성이 가능하여 I/O 바운드 작업에서 성능이 크게 향상된다.",
    category: "java",
    subtopic: "Modern Java"
  },
  {
    id: "java-modern-4",
    type: "multiple",
    question: "Java 16에서 도입된 Record 클래스의 특징은?",
    choices: ["가변(mutable) 필드를 가질 수 있음", "모든 필드가 final인 불변 데이터 클래스", "상속이 자유로움", "인터페이스 구현 불가"],
    correctAnswer: 1,
    explanation: "Record는 Java 16에서 도입된 불변 데이터 클래스로, 모든 필드가 final이다. 생성자, getter, equals, hashCode, toString이 자동 생성된다. DTO, VO에 적합하다.",
    category: "java",
    subtopic: "Modern Java"
  },

  // ===== Spring: IoC & DI =====
  {
    id: "spring-di-1",
    type: "ox",
    question: "Spring에서 생성자 주입을 권장하는 이유 중 하나는 final 키워드 사용이 가능하여 불변을 보장할 수 있기 때문이다.",
    correctAnswer: true,
    explanation: "생성자 주입이 권장되는 이유: final 키워드로 불변 보장, 컴파일 시점에 의존성 누락 확인, 순환 참조를 시작 시점에 감지, 테스트에서 Mock 주입이 쉬움. 필드 주입은 final 사용 불가.",
    category: "spring",
    subtopic: "IoC & DI"
  },
  {
    id: "spring-di-2",
    type: "multiple",
    question: "@Component와 @Bean의 차이는?",
    choices: [
      "@Component는 메서드 레벨, @Bean은 클래스 레벨에 붙인다",
      "@Component는 클래스 레벨(컴포넌트 스캔), @Bean은 @Configuration 클래스 안 메서드 레벨(수동 등록)이다",
      "둘 다 동일하게 자동 등록된다",
      "@Bean이 더 빠른 Bean 로딩을 제공한다"
    ],
    correctAnswer: 1,
    explanation: "@Component는 클래스 레벨에 붙여 컴포넌트 스캔으로 자동 등록한다. @Bean은 @Configuration 클래스 안 메서드에 붙여 수동 등록한다. 외부 라이브러리처럼 소스코드를 수정할 수 없는 경우 @Bean을 사용한다.",
    category: "spring",
    subtopic: "IoC & DI"
  },
  {
    id: "spring-di-3",
    type: "ox",
    question: "같은 타입의 Bean이 여러 개일 때 @Qualifier로 특정 Bean의 이름을 지정하여 주입할 수 있다.",
    correctAnswer: true,
    explanation: "동일 타입 Bean이 여러 개일 때 해결 방법: @Primary(우선순위 지정), @Qualifier(이름으로 지정), Map<String, BeanType>으로 모든 구현체를 주입받기.",
    category: "spring",
    subtopic: "IoC & DI"
  },
  {
    id: "spring-di-4",
    type: "multiple",
    question: "Spring 컨테이너의 Bean 생명주기 순서로 올바른 것은?",
    choices: [
      "Bean 생성 → DI → 사용 → @PostConstruct → 소멸",
      "Bean 생성 → @PostConstruct → DI → 사용 → 소멸",
      "Bean 생성 → DI → @PostConstruct → 사용 → @PreDestroy",
      "DI → Bean 생성 → @PostConstruct → 사용 → 소멸"
    ],
    correctAnswer: 2,
    explanation: "Bean 생명주기: 인스턴스 생성 → 의존관계 주입(DI) → @PostConstruct(초기화 콜백) → 사용 → @PreDestroy(소멸 전 콜백) → 컨테이너 종료 순서이다.",
    category: "spring",
    subtopic: "IoC & DI"
  },

  // ===== Spring: Bean =====
  {
    id: "spring-bean-1",
    type: "ox",
    question: "Spring Bean의 기본 스코프는 Singleton으로, 컨테이너당 하나의 인스턴스만 생성된다.",
    correctAnswer: true,
    explanation: "Spring Bean의 기본 스코프는 Singleton이다. 컨테이너에 1개만 존재하며 모든 곳에서 같은 인스턴스를 공유한다. 상태를 가지면 동시성 문제가 발생할 수 있으므로 stateless하게 설계해야 한다.",
    category: "spring",
    subtopic: "Bean 생명주기"
  },
  {
    id: "spring-bean-2",
    type: "multiple",
    question: "Prototype 스코프 Bean에 대한 설명으로 올바른 것은?",
    choices: [
      "컨테이너가 생성부터 소멸까지 완전히 관리한다",
      "요청할 때마다 새 인스턴스가 생성되며 @PreDestroy가 호출되지 않는다",
      "HTTP 요청마다 새 인스턴스가 생성된다",
      "Singleton Bean에서 사용할 때 문제가 없다"
    ],
    correctAnswer: 1,
    explanation: "Prototype Bean은 조회할 때마다 새 인스턴스가 생성된다. 컨테이너는 생성과 DI까지만 관여하고 이후 관리하지 않아 @PreDestroy가 호출되지 않는다.",
    category: "spring",
    subtopic: "Bean 생명주기"
  },

  // ===== Spring: AOP =====
  {
    id: "spring-aop-1",
    type: "ox",
    question: "Spring AOP는 프록시 기반으로 동작하며, 같은 클래스 내부 호출에서는 AOP가 적용되지 않는다.",
    correctAnswer: true,
    explanation: "Spring AOP는 프록시 패턴 기반이다. this.method()로 내부 호출하면 프록시를 거치지 않고 실제 객체의 메서드가 직접 호출되어 @Transactional 등 AOP가 적용되지 않는다. 클래스 분리로 해결한다.",
    category: "spring",
    subtopic: "AOP"
  },
  {
    id: "spring-aop-2",
    type: "multiple",
    question: "Spring AOP의 @Around Advice에서 실제 메서드를 실행하는 방법은?",
    choices: ["joinPoint.execute()", "joinPoint.proceed()", "joinPoint.invoke()", "joinPoint.run()"],
    correctAnswer: 1,
    explanation: "@Around Advice에서는 ProceedingJoinPoint.proceed()를 호출해야 실제 메서드가 실행된다. proceed() 전후로 부가 기능(로깅, 트랜잭션 등)을 구현할 수 있다.",
    category: "spring",
    subtopic: "AOP"
  },
  {
    id: "spring-aop-3",
    type: "ox",
    question: "Spring Boot는 기본적으로 JDK 동적 프록시를 사용하여 AOP를 구현한다.",
    correctAnswer: false,
    explanation: "Spring Boot는 기본적으로 CGLIB 프록시를 사용한다. CGLIB은 클래스를 상속하여 프록시를 생성한다. JDK 동적 프록시는 인터페이스가 있을 때 사용 가능하다.",
    category: "spring",
    subtopic: "AOP"
  },

  // ===== Spring: @Transactional =====
  {
    id: "spring-tx-1",
    type: "ox",
    question: "@Transactional은 기본적으로 RuntimeException(Unchecked)에서만 롤백되고, CheckedException에서는 커밋된다.",
    correctAnswer: true,
    explanation: "Spring의 기본 롤백 정책은 RuntimeException과 Error에 대해서만 롤백한다. CheckedException은 비즈니스적으로 복구 가능한 예외로 간주한다. rollbackFor = Exception.class로 변경 가능.",
    category: "spring",
    subtopic: "@Transactional"
  },
  {
    id: "spring-tx-2",
    type: "multiple",
    question: "REQUIRED와 REQUIRES_NEW 전파 옵션의 차이는?",
    choices: [
      "REQUIRED는 새 트랜잭션 생성, REQUIRES_NEW는 기존 참여",
      "REQUIRED는 기존 트랜잭션 참여 또는 새로 생성, REQUIRES_NEW는 항상 새 트랜잭션 생성",
      "둘 다 항상 새 트랜잭션을 생성한다",
      "REQUIRED_NEW만 롤백을 지원한다"
    ],
    correctAnswer: 1,
    explanation: "REQUIRED(기본): 기존 트랜잭션 있으면 참여, 없으면 새로 생성. REQUIRES_NEW: 항상 새 트랜잭션 생성, 기존은 일시 중단. REQUIRES_NEW는 독립적인 트랜잭션이 필요할 때(로그 저장 등) 사용.",
    category: "spring",
    subtopic: "@Transactional"
  },
  {
    id: "spring-tx-3",
    type: "ox",
    question: "@Transactional(readOnly = true)는 JPA의 변경 감지(Dirty Checking)를 비활성화하여 성능을 향상시킨다.",
    correctAnswer: true,
    explanation: "readOnly = true의 효과: JPA 변경 감지 비활성화(성능 향상), DB에 읽기 전용 힌트 전달, Replication 환경에서 Slave DB로 라우팅 가능. 조회 메서드에는 적용하는 것이 좋다.",
    category: "spring",
    subtopic: "@Transactional"
  },

  // ===== Spring: MVC =====
  {
    id: "spring-mvc-1",
    type: "ox",
    question: "DispatcherServlet은 Spring MVC의 프론트 컨트롤러로, 모든 HTTP 요청을 받아 처리한다.",
    correctAnswer: true,
    explanation: "DispatcherServlet은 프론트 컨트롤러 패턴의 구현체로, 모든 HTTP 요청을 받아 HandlerMapping으로 적절한 컨트롤러를 찾고, HandlerAdapter로 실행한 뒤 결과를 클라이언트에게 반환한다.",
    category: "spring",
    subtopic: "Spring MVC"
  },
  {
    id: "spring-mvc-2",
    type: "multiple",
    question: "Filter와 Interceptor의 차이로 올바른 것은?",
    choices: [
      "Filter는 Spring 컨테이너 관리, Interceptor는 서블릿 컨테이너 관리",
      "Filter는 서블릿 컨테이너 관리(DispatcherServlet 전후), Interceptor는 Spring 컨테이너 관리(Controller 전후)",
      "둘 다 동일하게 동작한다",
      "Interceptor가 더 낮은 레벨에서 동작한다"
    ],
    correctAnswer: 1,
    explanation: "Filter는 서블릿 컨테이너가 관리하며 DispatcherServlet 전후에 동작한다. Interceptor는 Spring 컨테이너가 관리하며 Controller 전후에 동작한다. Interceptor는 Spring Bean에 자유롭게 접근 가능하다.",
    category: "spring",
    subtopic: "Spring MVC"
  },
  {
    id: "spring-mvc-3",
    type: "ox",
    question: "@RestController는 @Controller + @ResponseBody를 합친 어노테이션으로, 반환값이 JSON으로 변환되어 응답 본문에 직접 쓰인다.",
    correctAnswer: true,
    explanation: "@RestController = @Controller + @ResponseBody. @Controller는 뷰 이름을 반환하지만, @RestController는 반환값이 HttpMessageConverter(Jackson 등)를 통해 JSON으로 변환되어 응답에 쓰인다.",
    category: "spring",
    subtopic: "Spring MVC"
  },

  // ===== Spring: JPA =====
  {
    id: "spring-jpa-1",
    type: "ox",
    question: "N+1 문제는 연관된 엔티티를 조회할 때 1번의 쿼리로 N개를 가져온 후, 각 엔티티의 연관 엔티티를 위해 N번의 추가 쿼리가 실행되는 문제이다.",
    correctAnswer: true,
    explanation: "N+1 문제: 1번 쿼리로 N개 엔티티를 가져온 후, 각각의 연관 엔티티를 조회하기 위해 N번의 추가 쿼리가 실행된다. Fetch Join, @EntityGraph, @BatchSize로 해결할 수 있다.",
    category: "spring",
    subtopic: "JPA"
  },
  {
    id: "spring-jpa-2",
    type: "multiple",
    question: "컬렉션 Fetch Join과 페이징을 함께 사용하면 어떤 문제가 발생하는가?",
    choices: [
      "쿼리가 실행되지 않는다",
      "전체 데이터를 메모리에서 페이징하여 OOM 위험이 있다",
      "자동으로 서브쿼리로 변환된다",
      "페이징이 무시된다"
    ],
    correctAnswer: 1,
    explanation: "컬렉션 Fetch Join + 페이징은 DB에서 전체 데이터를 가져온 후 메모리에서 페이징하므로 OOM(OutOfMemoryError) 위험이 있다. @BatchSize로 해결하거나 쿼리를 분리해야 한다.",
    category: "spring",
    subtopic: "JPA"
  },

  // ===== Spring: 영속성 컨텍스트 =====
  {
    id: "spring-pc-1",
    type: "ox",
    question: "영속성 컨텍스트의 변경 감지(Dirty Checking)는 트랜잭션 커밋 시점에 스냅샷과 현재 상태를 비교하여 자동으로 UPDATE 쿼리를 생성한다.",
    correctAnswer: true,
    explanation: "Dirty Checking: 엔티티 저장 시 스냅샷 보관 → 트랜잭션 커밋 시 flush() → 스냅샷과 비교 → 변경된 필드 UPDATE. save()를 별도 호출하지 않아도 된다.",
    category: "spring",
    subtopic: "영속성 컨텍스트"
  },
  {
    id: "spring-pc-2",
    type: "multiple",
    question: "LazyInitializationException이 발생하는 원인은?",
    choices: [
      "트랜잭션이 너무 오래 걸릴 때",
      "트랜잭션 종료 후(준영속 상태에서) Lazy 로딩을 시도할 때",
      "FetchType.EAGER를 사용할 때",
      "persist()를 두 번 호출할 때"
    ],
    correctAnswer: 1,
    explanation: "LazyInitializationException: 트랜잭션이 종료되어 영속성 컨텍스트가 닫힌 후(준영속 상태)에 Lazy 로딩을 시도하면 발생한다. Fetch Join, @Transactional 범위 확장, DTO 직접 조회로 해결한다.",
    category: "spring",
    subtopic: "영속성 컨텍스트"
  },

  // ===== Spring: Spring Boot =====
  {
    id: "spring-boot-1",
    type: "ox",
    question: "Spring Boot Auto Configuration은 @ConditionalOnMissingBean 조건에 의해, 직접 Bean을 등록하면 자동 구성이 적용되지 않는다.",
    correctAnswer: true,
    explanation: "@ConditionalOnMissingBean: 해당 타입의 Bean이 없을 때만 자동 구성이 적용된다. 같은 타입의 Bean을 직접 등록하면 자동 구성은 건너뛰어진다. 이를 통해 커스터마이징이 가능하다.",
    category: "spring",
    subtopic: "Spring Boot"
  },
  {
    id: "spring-boot-2",
    type: "multiple",
    question: "운영 환경에서 spring.jpa.hibernate.ddl-auto의 권장 설정은?",
    choices: ["create", "create-drop", "update", "validate 또는 none"],
    correctAnswer: 3,
    explanation: "운영에서는 validate(테이블 구조 검증만) 또는 none(아무것도 안 함)을 사용해야 한다. create, create-drop, update는 테이블을 변경할 수 있어 운영 DB에 위험하다.",
    category: "spring",
    subtopic: "Spring Boot"
  },

  // ===== Spring: Security =====
  {
    id: "spring-sec-1",
    type: "ox",
    question: "JWT + Stateless API에서 CSRF를 비활성화해도 되는 이유는 JWT를 Authorization 헤더로 전송하므로 브라우저가 자동으로 토큰을 포함하지 않기 때문이다.",
    correctAnswer: true,
    explanation: "CSRF는 브라우저가 쿠키를 자동으로 포함하는 특성을 악용한다. JWT를 Authorization 헤더로 전송하는 Stateless API에서는 브라우저가 자동으로 토큰을 보내지 않으므로 CSRF 공격이 성립하지 않는다.",
    category: "spring",
    subtopic: "Spring Security"
  },
  {
    id: "spring-sec-2",
    type: "multiple",
    question: "JWT와 세션 기반 인증의 차이로 올바른 것은?",
    choices: [
      "JWT는 서버에 상태를 저장하고, 세션은 클라이언트에 저장한다",
      "세션은 서버에 상태를 저장하고, JWT는 토큰 자체에 정보를 담아 서버가 상태를 저장하지 않는다",
      "둘 다 동일하게 서버에 저장된다",
      "JWT가 세션보다 항상 더 안전하다"
    ],
    correctAnswer: 1,
    explanation: "세션 기반: 서버에 세션 상태 저장, 세션 ID를 쿠키로 관리. JWT: 토큰 자체에 사용자 정보 담음, 서버 Stateless. JWT는 서버 확장에 유리하지만 토큰 탈취 시 만료 전까지 무효화 어려움.",
    category: "spring",
    subtopic: "Spring Security"
  },

  // ===== Spring: Testing =====
  {
    id: "spring-test-1",
    type: "ox",
    question: "@WebMvcTest는 전체 ApplicationContext를 로드하며 통합 테스트에 사용한다.",
    correctAnswer: false,
    explanation: "@WebMvcTest는 MVC 관련 Bean만 로드하여 Controller 계층만 빠르게 테스트한다. 전체 ApplicationContext를 로드하는 것은 @SpringBootTest이다. Service, Repository는 @MockBean으로 대체한다.",
    category: "spring",
    subtopic: "테스트"
  },
  {
    id: "spring-test-2",
    type: "multiple",
    question: "@Mock과 @MockBean의 차이는?",
    choices: [
      "둘 다 동일하다",
      "@Mock은 Mockito가 관리하는 순수 Mock, @MockBean은 Spring ApplicationContext Bean을 Mock으로 교체",
      "@MockBean이 더 빠르게 동작한다",
      "@Mock은 Spring 컨텍스트에서만 사용 가능하다"
    ],
    correctAnswer: 1,
    explanation: "@Mock은 Mockito가 관리하는 순수 Mock 객체로 단위 테스트에 사용한다. @MockBean은 Spring ApplicationContext에 등록된 Bean을 Mock으로 교체하므로 @WebMvcTest 등 Spring 테스트에서 사용한다.",
    category: "spring",
    subtopic: "테스트"
  },

  // ===== Database: Index =====
  {
    id: "db-idx-1",
    type: "ox",
    question: "복합 인덱스 (name, age)에서 WHERE age = 25 조건만 사용하면 인덱스가 활용된다.",
    correctAnswer: false,
    explanation: "B-Tree는 선두 컬럼(name)부터 정렬된다. 선두 컬럼이 WHERE 조건에 없으면 인덱스를 사용할 수 없다. WHERE name = '홍길동' 또는 WHERE name = '홍길동' AND age = 25는 인덱스 사용 가능.",
    category: "database",
    subtopic: "인덱스"
  },
  {
    id: "db-idx-2",
    type: "multiple",
    question: "EXPLAIN의 type 컬럼에서 가장 좋은 성능을 나타내는 값은?",
    choices: ["ALL (전체 테이블 스캔)", "index (인덱스 전체 스캔)", "ref (인덱스로 여러 건)", "const (PK/유니크로 1건)"],
    correctAnswer: 3,
    explanation: "type 성능 순서: const > eq_ref > ref > range > index > ALL. const는 PK/유니크 인덱스로 1건 조회(최고), ALL은 테이블 전체 스캔(최악)이다.",
    category: "database",
    subtopic: "인덱스"
  },
  {
    id: "db-idx-3",
    type: "ox",
    question: "인덱스는 조회 성능을 높이지만, INSERT/UPDATE/DELETE 시 인덱스도 함께 갱신해야 하므로 쓰기 성능이 저하된다.",
    correctAnswer: true,
    explanation: "인덱스는 읽기 성능을 O(log n)으로 향상시키지만, 쓰기 시 인덱스 갱신 비용이 발생한다. 또한 인덱스 자체가 저장 공간을 차지한다. 자주 조회하는 조건에만 적절하게 생성해야 한다.",
    category: "database",
    subtopic: "인덱스"
  },
  {
    id: "db-idx-4",
    type: "multiple",
    question: "인덱스가 사용되지 않는 경우로 올바른 것은?",
    choices: [
      "WHERE name = '홍길동'",
      "WHERE name LIKE '홍%' (앞에서 시작하는 LIKE)",
      "WHERE YEAR(created_at) = 2024 (함수 적용)",
      "WHERE created_at >= '2024-01-01'"
    ],
    correctAnswer: 2,
    explanation: "인덱스 컬럼에 함수를 적용하면(YEAR(created_at)) 인덱스를 사용할 수 없다. 대신 범위 조건으로 변경해야 한다. LIKE '%홍'(앞 와일드카드), 암묵적 타입 변환, NOT/!=도 인덱스 미사용.",
    category: "database",
    subtopic: "인덱스"
  },

  // ===== Database: Transaction =====
  {
    id: "db-tx-1",
    type: "ox",
    question: "MySQL InnoDB의 기본 격리 수준은 REPEATABLE READ이며, Gap Lock으로 Phantom Read도 방지한다.",
    correctAnswer: true,
    explanation: "MySQL InnoDB의 기본 격리 수준은 REPEATABLE READ이다. MVCC를 통해 트랜잭션 시작 시점의 스냅샷을 읽으며, Gap Lock으로 Phantom Read도 방지한다. (표준 REPEATABLE READ는 Phantom Read를 방지하지 못함)",
    category: "database",
    subtopic: "트랜잭션"
  },
  {
    id: "db-tx-2",
    type: "multiple",
    question: "ACID 중 '트랜잭션 전부 성공 또는 전부 실패'를 나타내는 속성은?",
    choices: ["Consistency (일관성)", "Isolation (격리성)", "Atomicity (원자성)", "Durability (지속성)"],
    correctAnswer: 2,
    explanation: "ACID: Atomicity(원자성-전부 성공 또는 전부 실패), Consistency(일관성-무결성 유지), Isolation(격리성-트랜잭션 간 간섭 없음), Durability(지속성-커밋된 데이터는 영구 보존).",
    category: "database",
    subtopic: "트랜잭션"
  },
  {
    id: "db-tx-3",
    type: "ox",
    question: "Dirty Read는 커밋되지 않은 데이터를 다른 트랜잭션이 읽는 현상으로, READ UNCOMMITTED 격리 수준에서 발생한다.",
    correctAnswer: true,
    explanation: "Dirty Read: 커밋되지 않은 데이터를 읽는 현상. READ UNCOMMITTED에서 발생한다. READ COMMITTED 이상에서는 방지된다. Non-Repeatable Read(같은 쿼리 결과가 달라짐)는 READ COMMITTED에서도 발생한다.",
    category: "database",
    subtopic: "트랜잭션"
  },
  {
    id: "db-tx-4",
    type: "multiple",
    question: "MVCC(Multi-Version Concurrency Control)의 핵심 원리는?",
    choices: [
      "모든 읽기에 공유 락을 건다",
      "데이터 변경 시 이전 버전을 Undo 로그에 보관하여 읽기에 락을 걸지 않는다",
      "쓰기 작업을 큐에 저장한다",
      "각 트랜잭션에 별도의 DB를 제공한다"
    ],
    correctAnswer: 1,
    explanation: "MVCC: 데이터 변경 시 이전 버전을 Undo 로그에 보관, 각 트랜잭션은 자신의 시점 스냅샷을 읽음, 읽기에 락을 걸지 않아 읽기와 쓰기가 서로 블로킹하지 않는다.",
    category: "database",
    subtopic: "트랜잭션"
  },

  // ===== Database: MySQL =====
  {
    id: "db-mysql-1",
    type: "ox",
    question: "InnoDB의 Buffer Pool은 디스크의 데이터와 인덱스를 메모리에 캐시하며, 전체 메모리의 50~80%를 할당하는 것이 권장된다.",
    correctAnswer: true,
    explanation: "Buffer Pool: 디스크 I/O를 줄여 성능을 향상시키는 InnoDB의 가장 중요한 메모리 영역. LRU 알고리즘으로 관리. 실무에서는 innodb_buffer_pool_size로 전체 메모리의 50~80%를 할당한다.",
    category: "database",
    subtopic: "MySQL"
  },
  {
    id: "db-mysql-2",
    type: "multiple",
    question: "OFFSET이 큰 페이징이 느린 이유와 해결 방법은?",
    choices: [
      "인덱스가 없어서 느림, 인덱스 추가로 해결",
      "OFFSET까지 모든 행을 읽고 버리기 때문에 느림, 커서 기반 페이징(WHERE id < 마지막ID)으로 해결",
      "테이블이 커서 느림, 파티셔닝으로 해결",
      "ORDER BY가 없어서 느림, ORDER BY 추가로 해결"
    ],
    correctAnswer: 1,
    explanation: "OFFSET이 크면 해당 위치까지 모든 행을 읽고 버리므로 느리다. 커서 기반 페이징(WHERE id < 마지막ID LIMIT n)은 직접 해당 위치부터 읽는다. 커버링 인덱스 서브쿼리도 최적화 방법이다.",
    category: "database",
    subtopic: "MySQL"
  },
  {
    id: "db-mysql-3",
    type: "ox",
    question: "Redo Log는 롤백을 위해 변경 전 데이터를 기록하고, Undo Log는 비정상 종료 시 복구를 위해 변경 내용을 기록한다.",
    correctAnswer: false,
    explanation: "반대이다. Redo Log: 커밋된 변경사항을 기록하여 비정상 종료 시 복구(Durability). Undo Log: 변경 전 데이터를 기록하여 롤백(Atomicity)과 MVCC(Isolation)를 지원한다.",
    category: "database",
    subtopic: "MySQL"
  },

  // ===== Database: Redis =====
  {
    id: "db-redis-1",
    type: "ox",
    question: "Redis는 싱글 스레드 기반으로 동작하며, 메모리 기반이라 디스크 I/O가 없어 빠르다.",
    correctAnswer: true,
    explanation: "Redis가 빠른 이유: 인메모리(디스크 I/O 없음), 이벤트 루프 기반 I/O 멀티플렉싱, 싱글 스레드로 컨텍스트 스위칭 오버헤드 없음. (Redis 6부터 I/O 스레딩은 멀티 스레드 지원)",
    category: "database",
    subtopic: "Redis"
  },
  {
    id: "db-redis-2",
    type: "multiple",
    question: "Cache Aside(Lazy Loading) 패턴에서 쓰기 시 올바른 순서는?",
    choices: [
      "캐시에 먼저 쓰고 → DB에 쓴다",
      "DB를 먼저 업데이트하고 → 캐시를 삭제한다",
      "캐시 삭제 후 → DB 업데이트",
      "DB와 캐시를 동시에 업데이트한다"
    ],
    correctAnswer: 1,
    explanation: "Cache Aside 쓰기: DB를 먼저 업데이트하고 → 캐시를 삭제하는 순서가 더 안전하다. 캐시 먼저 삭제하면 사이에 다른 요청이 구 데이터를 캐시할 수 있다.",
    category: "database",
    subtopic: "Redis"
  },
  {
    id: "db-redis-3",
    type: "ox",
    question: "Redis Sentinel은 데이터를 여러 노드에 분산 저장하여 수평 확장을 지원하는 기능이다.",
    correctAnswer: false,
    explanation: "Sentinel은 고가용성을 위한 것으로, 마스터 장애 시 Replica를 자동으로 마스터로 승격한다. 수평 확장(데이터 분산)은 Redis Cluster의 기능으로, 16384개 해시 슬롯으로 분배한다.",
    category: "database",
    subtopic: "Redis"
  },
  {
    id: "db-redis-4",
    type: "multiple",
    question: "Redis의 Sorted Set(ZSet)이 활용되는 대표적인 사례는?",
    choices: ["세션 저장", "랭킹/리더보드 구현", "채팅 메시지 큐", "파일 캐싱"],
    correctAnswer: 1,
    explanation: "Sorted Set은 점수(score) 기반으로 정렬된 집합이다. ZADD로 점수와 함께 저장하고, ZREVRANGE로 상위 N명을 조회할 수 있어 랭킹/리더보드 구현에 최적이다.",
    category: "database",
    subtopic: "Redis"
  },

  // ===== Infra: Docker =====
  {
    id: "infra-docker-1",
    type: "ox",
    question: "컨테이너는 VM과 달리 호스트 OS의 커널을 공유하고 프로세스만 격리하므로 가볍고 빠르다.",
    correctAnswer: true,
    explanation: "VM은 하이퍼바이저 위에 전체 OS를 가상화하여 GB 단위, 부팅이 분 단위이다. 컨테이너는 호스트 OS 커널을 공유하고 프로세스를 격리하여 MB 단위, 초 단위로 시작된다.",
    category: "infra",
    subtopic: "Docker"
  },
  {
    id: "infra-docker-2",
    type: "multiple",
    question: "Docker 멀티 스테이지 빌드를 사용하는 주요 이유는?",
    choices: [
      "빌드 속도를 높이기 위해",
      "빌드 도구(JDK 등)를 최종 이미지에 포함시키지 않아 이미지 크기를 줄이고 보안을 향상시키기 위해",
      "Docker Compose를 대체하기 위해",
      "멀티 플랫폼 빌드를 위해"
    ],
    correctAnswer: 1,
    explanation: "멀티 스테이지 빌드: 빌드 단계(JDK, Gradle 등)와 실행 단계(JRE만)를 분리하여 최종 이미지에 빌드 도구가 포함되지 않아 이미지 크기 감소 및 보안 향상이 목적이다.",
    category: "infra",
    subtopic: "Docker"
  },
  {
    id: "infra-docker-3",
    type: "ox",
    question: "Dockerfile에서 변경이 잦은 파일(소스코드)은 나중에 복사하고, 변경이 적은 파일(의존성)은 먼저 복사해야 Docker 레이어 캐시를 효과적으로 활용할 수 있다.",
    correctAnswer: true,
    explanation: "Docker 레이어 캐시: 변경이 적은 파일(build.gradle, 의존성)을 먼저 COPY하고 RUN으로 의존성을 설치하면, 소스코드 변경 시에도 의존성 레이어 캐시를 재사용할 수 있어 빌드가 빨라진다.",
    category: "infra",
    subtopic: "Docker"
  },

  // ===== Infra: Kubernetes =====
  {
    id: "infra-k8s-1",
    type: "ox",
    question: "readinessProbe는 컨테이너가 정상 동작하는지 확인하고, 실패하면 컨테이너를 재시작한다.",
    correctAnswer: false,
    explanation: "반대이다. livenessProbe가 컨테이너 정상 여부를 확인하고 실패 시 재시작한다. readinessProbe는 트래픽을 수신할 준비가 되었는지 확인하여 실패하면 Service 엔드포인트에서 제외한다.",
    category: "infra",
    subtopic: "Kubernetes"
  },
  {
    id: "infra-k8s-2",
    type: "multiple",
    question: "Kubernetes에서 Pod에 안정적인 네트워크 엔드포인트를 제공하여 Pod 재시작 후에도 접근 주소가 변하지 않게 하는 오브젝트는?",
    choices: ["Deployment", "ConfigMap", "Service", "Ingress"],
    correctAnswer: 2,
    explanation: "Service는 Pod에 안정적인 IP와 DNS를 제공한다. Pod가 재시작되어 IP가 변경되어도 Service를 통해 접근하면 동일한 주소로 접근 가능하다. ClusterIP, NodePort, LoadBalancer 타입이 있다.",
    category: "infra",
    subtopic: "Kubernetes"
  },
  {
    id: "infra-k8s-3",
    type: "ox",
    question: "Kubernetes HPA(Horizontal Pod Autoscaler)는 CPU 사용률 등 메트릭에 따라 Pod 수를 자동으로 조절한다.",
    correctAnswer: true,
    explanation: "HPA는 CPU, 메모리 사용률 등 메트릭을 기반으로 Deployment의 replicas를 자동으로 조절한다. minReplicas, maxReplicas, targetCPUUtilizationPercentage를 설정할 수 있다.",
    category: "infra",
    subtopic: "Kubernetes"
  },
  {
    id: "infra-k8s-4",
    type: "multiple",
    question: "Kubernetes ConfigMap과 Secret의 차이는?",
    choices: [
      "ConfigMap은 더 빠르게 로드된다",
      "ConfigMap은 일반 설정 데이터, Secret은 민감한 데이터(비밀번호 등)를 저장하며 접근이 제한된다",
      "둘 다 동일하다",
      "Secret은 환경 변수로 사용할 수 없다"
    ],
    correctAnswer: 1,
    explanation: "ConfigMap: 일반 설정 데이터(프로파일, 포트 등). Secret: 민감한 데이터(비밀번호, 토큰)를 Base64 인코딩하여 저장하고 접근이 제한된다. 둘 다 Pod의 환경 변수나 볼륨으로 주입 가능하다.",
    category: "infra",
    subtopic: "Kubernetes"
  },

  // ===== Infra: CI/CD =====
  {
    id: "infra-cicd-1",
    type: "ox",
    question: "Blue/Green 배포는 새 버전을 전체 배포한 후 트래픽을 한번에 전환하여 즉시 롤백이 가능하지만, 2배의 리소스가 필요하다.",
    correctAnswer: true,
    explanation: "Blue/Green 배포: 두 환경(Blue=현재, Green=신버전)을 유지하여 순간 트래픽 전환으로 다운타임 없이 배포. 즉시 롤백 가능. 단점은 2배의 리소스 필요. Canary는 일부 트래픽만 신버전으로 점진적 검증.",
    category: "infra",
    subtopic: "CI/CD"
  },
  {
    id: "infra-cicd-2",
    type: "multiple",
    question: "GitOps의 핵심 원칙은?",
    choices: [
      "개발자가 직접 서버에 SSH로 배포한다",
      "Git을 단일 진실 공급원으로 사용하여 선언적으로 인프라를 관리하고 자동 동기화한다",
      "Jenkins만을 사용하여 배포한다",
      "컨테이너 없이 배포한다"
    ],
    correctAnswer: 1,
    explanation: "GitOps 원칙: Git이 단일 진실 공급원(Single Source of Truth), 선언적 배포(매니페스트=실제 상태), 자동 동기화(Git 변경→자동 반영), 감사 추적(Git 히스토리=배포 히스토리). ArgoCD가 대표 도구.",
    category: "infra",
    subtopic: "CI/CD"
  },
  {
    id: "infra-cicd-3",
    type: "ox",
    question: "GitHub Actions는 별도 서버가 불필요한 SaaS형 CI/CD이고, Jenkins는 자체 서버에 설치하는 오픈소스로 관리 부담이 있다.",
    correctAnswer: true,
    explanation: "GitHub Actions: GitHub 내장 SaaS, 설정 간단, 별도 서버 불필요. Jenkins: 자체 서버 설치, 플러그인 풍부, 커스터마이징 자유, 관리 부담. 소규모는 GitHub Actions, 복잡한 파이프라인은 Jenkins가 적합.",
    category: "infra",
    subtopic: "CI/CD"
  },

  // ===== CS: Data Structures =====
  {
    id: "cs-ds-1",
    type: "ox",
    question: "해시 테이블에서 서로 다른 키가 같은 해시값(버킷)에 매핑되는 현상을 해시 충돌(Hash Collision)이라 하며, 체이닝과 개방 주소법으로 해결한다.",
    correctAnswer: true,
    explanation: "해시 충돌 해결: 체이닝(같은 버킷에 연결 리스트/트리)과 개방 주소법(다른 빈 버킷 탐색-선형/이차 탐사, 이중 해싱). Java HashMap은 체이닝을 사용하고, 충돌이 많으면 Red-Black Tree로 변환.",
    category: "cs",
    subtopic: "자료구조"
  },
  {
    id: "cs-ds-2",
    type: "multiple",
    question: "MySQL InnoDB 인덱스가 B+Tree를 사용하는 이유는?",
    choices: [
      "삽입/삭제가 빠르기 때문에",
      "하나의 노드에 여러 키를 저장하여 트리 높이가 낮고, Leaf 노드 연결로 범위 검색에 유리하기 때문에",
      "메모리 사용량이 적기 때문에",
      "병렬 처리가 가능하기 때문에"
    ],
    correctAnswer: 1,
    explanation: "B+Tree를 DB 인덱스에 사용하는 이유: 하나의 노드에 여러 키 저장(트리 높이 낮음, 디스크 I/O 최소화), Leaf 노드가 연결 리스트로 연결되어 범위 검색(BETWEEN, >=)에 효율적이다.",
    category: "cs",
    subtopic: "자료구조"
  },
  {
    id: "cs-ds-3",
    type: "ox",
    question: "Stack은 LIFO(후입선출)이고, Queue는 FIFO(선입선출)이다.",
    correctAnswer: true,
    explanation: "Stack: LIFO - 마지막에 넣은 것이 먼저 나옴(함수 호출 스택, Undo, DFS). Queue: FIFO - 먼저 넣은 것이 먼저 나옴(작업 대기열, BFS, 캐시).",
    category: "cs",
    subtopic: "자료구조"
  },
  {
    id: "cs-ds-4",
    type: "multiple",
    question: "PriorityQueue(우선순위 큐)의 내부 구현에 사용되는 자료구조는?",
    choices: ["연결 리스트", "배열", "힙(Heap)", "BST(이진 탐색 트리)"],
    correctAnswer: 2,
    explanation: "PriorityQueue는 완전 이진 트리 구조인 Heap으로 구현된다. Java의 PriorityQueue는 최소 힙(Min Heap)으로 구현되어 삽입 O(log n), 최솟값 추출 O(log n), 최솟값 조회 O(1)이다.",
    category: "cs",
    subtopic: "자료구조"
  },

  // ===== CS: Algorithms =====
  {
    id: "cs-algo-1",
    type: "ox",
    question: "Quick Sort의 최악 시간 복잡도는 O(n²)이지만, 평균적으로는 O(n log n)이며 캐시 효율성이 좋아 실무에서 가장 빠르다.",
    correctAnswer: true,
    explanation: "Quick Sort: 피벗으로 분할, 평균 O(n log n), 최악 O(n²)(이미 정렬된 경우). Merge Sort는 항상 O(n log n)이지만 O(n) 추가 공간 필요. Quick Sort가 캐시 효율성 높아 실무에서 더 빠름.",
    category: "cs",
    subtopic: "알고리즘"
  },
  {
    id: "cs-algo-2",
    type: "multiple",
    question: "최단 경로 탐색에 적합한 알고리즘은?",
    choices: ["DFS (깊이 우선 탐색)", "BFS (너비 우선 탐색)", "동적 프로그래밍(DP)", "그리디(Greedy)"],
    correctAnswer: 1,
    explanation: "BFS는 가중치 없는 그래프에서 최단 경로를 찾는 데 적합하다. 큐를 사용하여 레벨 순서로 탐색하므로 처음 목적지에 도달했을 때가 최단 경로이다. DFS는 경로 탐색, 백트래킹에 적합.",
    category: "cs",
    subtopic: "알고리즘"
  },
  {
    id: "cs-algo-3",
    type: "ox",
    question: "동적 프로그래밍(DP)은 최적 부분 구조와 겹치는 부분 문제라는 두 조건을 만족할 때 사용하며, 메모이제이션으로 중복 계산을 방지한다.",
    correctAnswer: true,
    explanation: "DP 조건: 최적 부분 구조(부분 문제의 최적해로 전체 구성), 겹치는 부분 문제(동일한 계산 반복). Top-Down(메모이제이션)과 Bottom-Up(타뷸레이션) 방식이 있다. 피보나치, 배낭 문제가 대표적.",
    category: "cs",
    subtopic: "알고리즘"
  },
  {
    id: "cs-algo-4",
    type: "multiple",
    question: "Java의 Arrays.sort()가 객체 배열에 사용하는 정렬 알고리즘은?",
    choices: ["Quick Sort", "Merge Sort", "Tim Sort (Merge Sort + Insertion Sort)", "Heap Sort"],
    correctAnswer: 2,
    explanation: "Java Arrays.sort(객체): Tim Sort(Merge Sort + Insertion Sort 혼합), 항상 O(n log n), 안정 정렬. Arrays.sort(기본형): Dual-Pivot Quick Sort. Collections.sort()도 Tim Sort를 사용한다.",
    category: "cs",
    subtopic: "알고리즘"
  },

  // ===== CS: OS =====
  {
    id: "cs-os-1",
    type: "ox",
    question: "프로세스와 스레드의 차이는 스레드가 프로세스 내에서 Stack만 독립적으로 가지고 나머지(Code, Data, Heap)를 공유한다는 것이다.",
    correctAnswer: true,
    explanation: "프로세스: 독립적인 메모리 공간(Code, Data, Heap, Stack). 스레드: 같은 프로세스 내에서 Stack만 독립, Code/Data/Heap은 공유. 스레드는 생성 비용이 낮고 통신이 쉽지만 동기화 문제가 발생할 수 있다.",
    category: "cs",
    subtopic: "운영체제"
  },
  {
    id: "cs-os-2",
    type: "multiple",
    question: "가상 메모리(Virtual Memory)의 주요 목적은?",
    choices: [
      "CPU 성능을 향상시키기 위해",
      "각 프로세스에 독립적인 가상 주소 공간을 제공하여 물리 메모리보다 큰 프로그램을 실행할 수 있게 하기 위해",
      "디스크 속도를 높이기 위해",
      "네트워크 통신을 효율적으로 하기 위해"
    ],
    correctAnswer: 1,
    explanation: "가상 메모리: 각 프로세스에 독립적인 가상 주소 공간 제공, 물리 메모리보다 큰 프로그램 실행 가능, 페이징으로 가상 주소를 물리 주소로 변환, 필요한 페이지만 물리 메모리에 올려 효율적 사용.",
    category: "cs",
    subtopic: "운영체제"
  },
  {
    id: "cs-os-3",
    type: "ox",
    question: "뮤텍스(Mutex)는 락을 건 스레드만 해제할 수 있고, 세마포어(Semaphore)는 누구나 signal을 보낼 수 있다.",
    correctAnswer: true,
    explanation: "뮤텍스: 이진(0/1), 락을 건 스레드만 해제 가능, 상호 배제용. 세마포어: 카운팅(0 이상), 누구나 signal 가능, 자원 카운팅과 동기화에 사용. 뮤텍스는 세마포어의 특수한 형태라고 볼 수 있다.",
    category: "cs",
    subtopic: "운영체제"
  },

  // ===== CS: Network =====
  {
    id: "cs-net-1",
    type: "ox",
    question: "TCP 3-Way Handshake는 SYN → SYN+ACK → ACK 순서로 연결을 수립한다.",
    correctAnswer: true,
    explanation: "TCP 3-Way Handshake: 1.Client→Server: SYN(연결 요청) 2.Server→Client: SYN+ACK(수락+확인) 3.Client→Server: ACK(확인). 연결 종료는 4-Way Handshake: FIN → ACK → FIN → ACK.",
    category: "cs",
    subtopic: "네트워크"
  },
  {
    id: "cs-net-2",
    type: "multiple",
    question: "HTTP 메서드 중 멱등성(Idempotent)이 없는 것은?",
    choices: ["GET", "PUT", "DELETE", "POST"],
    correctAnswer: 3,
    explanation: "멱등성: 같은 요청을 여러 번 보내도 결과가 같음. GET/PUT/DELETE는 멱등. POST는 멱등하지 않음(매번 새 리소스 생성). 멱등성은 네트워크 장애 시 재시도 가능 여부 판단 기준이 된다.",
    category: "cs",
    subtopic: "네트워크"
  },
  {
    id: "cs-net-3",
    type: "ox",
    question: "HTTPS는 TLS 핸드셰이크 시 비대칭 암호화로 대칭키를 교환하고, 실제 데이터는 대칭키로 암호화한다.",
    correctAnswer: true,
    explanation: "HTTPS(HTTP+TLS): TLS 핸드셰이크에서 비대칭 암호화(RSA/ECDHE)로 대칭키를 안전하게 교환하고, 이후 빠른 대칭 암호화(AES)로 실제 데이터를 전송한다. 서버 인증서로 신원 확인.",
    category: "cs",
    subtopic: "네트워크"
  },
  {
    id: "cs-net-4",
    type: "multiple",
    question: "TCP와 UDP의 차이로 올바른 것은?",
    choices: [
      "TCP는 비연결형, UDP는 연결 지향",
      "TCP는 연결 지향으로 신뢰성 보장, UDP는 비연결형으로 빠르지만 신뢰성 없음",
      "둘 다 신뢰성을 보장한다",
      "UDP가 더 느리다"
    ],
    correctAnswer: 1,
    explanation: "TCP: 연결 지향(3-way handshake), 순서 보장, 재전송, 신뢰성 높음, 상대적으로 느림. HTTP, 이메일, 파일 전송에 사용. UDP: 비연결형, 신뢰성 없음, 빠름. DNS, 스트리밍, 게임에 사용.",
    category: "cs",
    subtopic: "네트워크"
  },

  // ===== Design Patterns =====
  {
    id: "etc-dp-1",
    type: "ox",
    question: "전략 패턴(Strategy Pattern)은 알고리즘을 인터페이스로 정의하고, 클라이언트 코드 변경 없이 런타임에 알고리즘을 교체할 수 있게 한다.",
    correctAnswer: true,
    explanation: "전략 패턴: 알고리즘을 인터페이스로 캡슐화하여 런타임에 교체 가능. Spring의 DI가 전략 패턴을 자연스럽게 구현. 예) DiscountPolicy 인터페이스 → VipDiscount, NormalDiscount 구현체.",
    category: "etc",
    subtopic: "디자인 패턴"
  },
  {
    id: "etc-dp-2",
    type: "multiple",
    question: "Spring AOP(@Transactional 등)에서 사용되는 디자인 패턴은?",
    choices: ["Observer 패턴", "Singleton 패턴", "Proxy 패턴", "Factory 패턴"],
    correctAnswer: 2,
    explanation: "프록시 패턴: 실제 객체 대신 대리 객체가 요청을 받아 부가 기능(로깅, 트랜잭션, 캐시 등)을 수행한 후 실제 객체에 위임. Spring AOP, @Transactional, @Cacheable이 모두 프록시 패턴으로 동작.",
    category: "etc",
    subtopic: "디자인 패턴"
  },
  {
    id: "etc-dp-3",
    type: "ox",
    question: "템플릿 메서드 패턴은 상속으로 알고리즘의 일부를 오버라이드하고, 전략 패턴은 조합(Composition)으로 알고리즘 전체를 교체한다.",
    correctAnswer: true,
    explanation: "템플릿 메서드: 상속으로 골격 정의, 세부 단계를 하위 클래스에서 구현(JdbcTemplate, RestTemplate). 전략 패턴: 조합으로 알고리즘 전체 교체(더 유연, 선호). 전략 패턴이 상속 대신 조합 원칙에 더 부합.",
    category: "etc",
    subtopic: "디자인 패턴"
  },
  {
    id: "etc-dp-4",
    type: "multiple",
    question: "Builder 패턴의 주요 장점은?",
    choices: [
      "실행 속도 향상",
      "가독성, 선택적 매개변수 처리, 불변 객체 생성",
      "메모리 사용량 감소",
      "스레드 안전성 보장"
    ],
    correctAnswer: 1,
    explanation: "Builder 패턴: 복잡한 객체를 단계별로 구성. 장점: 가독성(명시적 필드명), 선택적 매개변수 처리, 불변 객체 생성, 유효성 검증. 실무에서는 Lombok @Builder를 주로 사용한다.",
    category: "etc",
    subtopic: "디자인 패턴"
  },

  // ===== System Design =====
  {
    id: "etc-sd-1",
    type: "ox",
    question: "CAP 정리에서 분산 시스템은 일관성(C), 가용성(A), 분할 내성(P) 세 가지를 동시에 만족할 수 없다.",
    correctAnswer: true,
    explanation: "CAP 정리: 네트워크 파티션(P)은 현실에서 불가피하므로 CP(일관성 우선-금융 시스템)와 AP(가용성 우선-SNS, 캐시) 중 선택해야 한다. 세 가지를 동시에 만족하는 것은 불가능하다.",
    category: "etc",
    subtopic: "시스템 설계"
  },
  {
    id: "etc-sd-2",
    type: "multiple",
    question: "메시지 큐(Kafka, RabbitMQ 등)를 사용하는 주요 이유는?",
    choices: [
      "DB 쿼리 속도를 높이기 위해",
      "서비스 간 결합도를 낮추고, 부하를 분산하며, 장애 전파를 방지하기 위해",
      "코드를 단순화하기 위해",
      "보안을 강화하기 위해"
    ],
    correctAnswer: 1,
    explanation: "메시지 큐 사용 이유: 서비스 간 비동기 통신으로 결합도 감소, 버퍼 역할로 부하 분산, 장애 전파 방지. Kafka(이벤트 스트리밍, 높은 처리량)와 RabbitMQ(작업 큐, Push 방식)로 용도가 다름.",
    category: "etc",
    subtopic: "시스템 설계"
  },
  {
    id: "etc-sd-3",
    type: "ox",
    question: "MSA(마이크로서비스 아키텍처)의 장점 중 하나는 서비스별 독립 배포가 가능하다는 것이고, 단점은 분산 트랜잭션과 운영 복잡도가 증가한다는 것이다.",
    correctAnswer: true,
    explanation: "MSA 장점: 서비스별 독립 배포/확장, 기술 스택 자유도, 장애 격리. MSA 단점: 분산 트랜잭션, 네트워크 통신 오버헤드, 데이터 일관성, 운영 복잡도(모니터링, 로깅, 배포 파이프라인) 증가.",
    category: "etc",
    subtopic: "시스템 설계"
  }
];

// 카테고리 정보
const CATEGORIES = [
  {
    id: "java",
    name: "Java",
    icon: "☕",
    subtopics: ["OOP & SOLID", "JVM & GC", "컬렉션", "동시성", "Modern Java"]
  },
  {
    id: "spring",
    name: "Spring",
    icon: "🌱",
    subtopics: ["IoC & DI", "Bean 생명주기", "AOP", "@Transactional", "Spring MVC", "JPA", "영속성 컨텍스트", "Spring Boot", "Spring Security", "테스트"]
  },
  {
    id: "database",
    name: "Database",
    icon: "🗄️",
    subtopics: ["인덱스", "트랜잭션", "MySQL", "Redis"]
  },
  {
    id: "infra",
    name: "Infra",
    icon: "🐳",
    subtopics: ["Docker", "Kubernetes", "CI/CD"]
  },
  {
    id: "cs",
    name: "CS 기초",
    icon: "💻",
    subtopics: ["자료구조", "알고리즘", "운영체제", "네트워크"]
  },
  {
    id: "etc",
    name: "기타",
    icon: "🔧",
    subtopics: ["디자인 패턴", "시스템 설계"]
  }
];
