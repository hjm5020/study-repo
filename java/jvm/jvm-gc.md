# JVM 구조 & 가비지 컬렉션

## 핵심 개념
> JVM은 자바 바이트코드를 실행하는 가상 머신으로, 클래스 로딩 → 메모리 할당 → 실행 → GC의 과정으로 동작한다.

## JVM 구조

```
┌─────────────────────────────────────┐
│              JVM                     │
│                                      │
│  ┌──────────────┐                   │
│  │ Class Loader  │ ← .class 파일 로드 │
│  └──────┬───────┘                   │
│         ↓                            │
│  ┌──────────────────────────────┐   │
│  │    Runtime Data Area          │   │
│  │  ┌────────┐  ┌────────────┐  │   │
│  │  │ Method  │  │   Heap     │  │   │
│  │  │  Area   │  │ (객체 저장) │  │   │
│  │  └────────┘  └────────────┘  │   │
│  │  ┌────────┐  ┌────────────┐  │   │
│  │  │ Stack  │  │  PC Register│  │   │
│  │  │(스레드별)│  └────────────┘  │   │
│  │  └────────┘  ┌────────────┐  │   │
│  │              │Native Method│  │   │
│  │              │   Stack     │  │   │
│  │              └────────────┘  │   │
│  └──────────────────────────────┘   │
│         ↓                            │
│  ┌──────────────┐                   │
│  │  Execution    │ ← 바이트코드 실행  │
│  │   Engine      │   (JIT Compiler)  │
│  └──────────────┘                   │
└─────────────────────────────────────┘
```

## 메모리 영역

### 모든 스레드가 공유하는 영역

| 영역 | 저장하는 것 |
|------|-------------|
| **Method Area (Metaspace)** | 클래스 메타데이터, static 변수, 상수 풀 |
| **Heap** | 객체 인스턴스, 배열 |

### 스레드별 독립 영역

| 영역 | 저장하는 것 |
|------|-------------|
| **Stack** | 메서드 호출 시 프레임 (지역 변수, 매개변수, 반환값) |
| **PC Register** | 현재 실행 중인 명령어 주소 |
| **Native Method Stack** | JNI를 통한 네이티브 메서드 호출 정보 |

### Stack vs Heap

```java
public void example() {
    int x = 10;            // Stack에 저장 (기본형)
    String name = "hello"; // Stack에 참조값, Heap에 실제 객체
    Order order = new Order(); // Stack에 참조값, Heap에 Order 객체
}
// 메서드 종료 → Stack 프레임 제거
// Heap의 객체는 GC가 수거
```

## Class Loader

```
1. Loading    — .class 파일을 읽어 바이트코드를 메모리에 로드
2. Linking
   - Verify   — 바이트코드 검증
   - Prepare  — static 변수 메모리 할당 & 기본값 초기화
   - Resolve  — 심볼릭 레퍼런스를 실제 레퍼런스로 변환
3. Initialization — static 변수에 실제 값 할당, static 블록 실행
```

**클래스 로더 종류 (위임 모델):**
```
Bootstrap ClassLoader    ← JDK 핵심 클래스 (java.lang.*)
    ↓
Extension ClassLoader    ← 확장 라이브러리
    ↓
Application ClassLoader  ← 애플리케이션 클래스패스
```

## Heap 메모리 구조

```
┌──────────────────────────────────────────┐
│                  Heap                     │
│  ┌──────────────────┐  ┌──────────────┐  │
│  │   Young Generation│  │Old Generation│  │
│  │  ┌─────┐ ┌─────┐ │  │              │  │
│  │  │Eden │ │S0│S1│ │  │  (오래 살아남은│  │
│  │  │     │ │  │  │ │  │    객체)      │  │
│  │  └─────┘ └─────┘ │  │              │  │
│  └──────────────────┘  └──────────────┘  │
└──────────────────────────────────────────┘

Eden: 새 객체가 생성되는 곳
S0/S1 (Survivor): Minor GC에서 살아남은 객체
Old: 여러 번 GC에서 살아남은 객체 (age 임계값 초과)
```

## 가비지 컬렉션 (GC)

### GC 기본 원리 — 도달 가능성 (Reachability)

```
GC Root에서 참조 체인으로 도달할 수 있는 객체 → 살아있음
도달할 수 없는 객체 → 가비지 → 수거 대상

GC Root:
- Stack의 지역 변수
- Static 변수
- 실행 중인 스레드
```

### Minor GC (Young Generation)

```
1. 새 객체가 Eden에 생성
2. Eden이 가득 참 → Minor GC 발생
3. 살아있는 객체를 Survivor 영역으로 이동 (age +1)
4. Eden 비움
5. age가 임계값을 넘으면 Old Generation으로 이동 (Promotion)
```

- 빈번하게 발생
- 대부분의 객체는 금방 사라짐 (Weak Generational Hypothesis)
- Stop-the-World 시간이 짧음

### Major GC (Old Generation)

- Old 영역이 가득 차면 발생
- Minor GC보다 오래 걸림
- Stop-the-World 시간이 김

### Stop-the-World

- GC 실행 시 모든 애플리케이션 스레드가 일시 정지
- GC 튜닝의 핵심 = Stop-the-World 시간 최소화

## GC 알고리즘

| GC | 특징 | 적합한 상황 |
|----|------|-------------|
| **Serial GC** | 단일 스레드 | 소규모, 클라이언트 앱 |
| **Parallel GC** | 멀티 스레드 (Java 8 기본) | 처리량 우선 |
| **G1 GC** | Region 기반, 예측 가능한 pause (Java 9+ 기본) | 대부분의 서버 앱 |
| **ZGC** | 초저지연 (pause < 1ms), 대용량 힙 | 지연 시간이 중요한 앱 |
| **Shenandoah** | 초저지연, Concurrent compaction | ZGC와 유사 |

### G1 GC

```
Heap을 동일 크기의 Region으로 분할
각 Region은 Eden / Survivor / Old / Humongous 중 하나로 역할

장점:
- 가비지가 많은 Region부터 우선 수거 (Garbage First)
- 예측 가능한 pause time (-XX:MaxGCPauseMillis)
- 대부분의 상황에서 좋은 성능
```

## JVM 주요 옵션

```bash
# 힙 메모리 설정
java -Xms512m -Xmx1024m -jar app.jar
# -Xms: 초기 힙 크기
# -Xmx: 최대 힙 크기

# GC 선택
-XX:+UseG1GC          # G1 GC (Java 9+ 기본)
-XX:+UseZGC           # ZGC

# GC 로그
-Xlog:gc*:file=gc.log:time,level,tags

# Metaspace
-XX:MaxMetaspaceSize=256m

# 실무 권장 (Spring Boot)
java -Xms512m -Xmx512m \
     -XX:+UseG1GC \
     -XX:MaxGCPauseMillis=200 \
     -jar app.jar
```

## OOM (OutOfMemoryError) 원인과 대응

| 에러 메시지 | 원인 | 대응 |
|------------|------|------|
| `Java heap space` | 힙 메모리 부족 | -Xmx 증가, 메모리 누수 확인 |
| `Metaspace` | 클래스 메타데이터 공간 부족 | -XX:MaxMetaspaceSize 증가 |
| `GC overhead limit exceeded` | GC에 98% 시간을 쓰지만 2% 미만 회수 | 메모리 누수 확인 |

```bash
# 힙 덤프 자동 생성 (OOM 발생 시)
-XX:+HeapDumpOnOutOfMemoryError
-XX:HeapDumpPath=/path/to/dump
```

## 면접 예상 질문

**Q: JVM 메모리 구조를 설명해주세요.**
A: 크게 스레드 공유 영역(Method Area, Heap)과 스레드별 영역(Stack, PC Register, Native Method Stack)으로 나뉜다. 객체는 Heap에, 클래스 메타데이터는 Method Area(Metaspace)에, 지역 변수와 메서드 호출 정보는 Stack에 저장된다.

**Q: GC의 동작 원리는?**
A: GC Root에서 참조 체인을 따라 도달할 수 없는 객체를 가비지로 판단하여 수거한다. Heap은 Young/Old Generation으로 나뉘며, 대부분의 객체는 Young에서 빠르게 수거(Minor GC)되고, 오래 살아남은 객체만 Old로 이동하여 Major GC 대상이 된다.

**Q: G1 GC의 특징은?**
A: Heap을 동일 크기의 Region으로 분할하고, 가비지가 많은 Region부터 우선 수거한다. 목표 pause time을 설정할 수 있어 예측 가능한 GC 성능을 제공하며, Java 9부터 기본 GC이다.

**Q: Stack과 Heap의 차이는?**
A: Stack은 스레드별로 존재하며 기본형 변수, 참조값, 메서드 호출 정보를 저장한다. Heap은 모든 스레드가 공유하며 객체 인스턴스를 저장한다. Stack은 메서드 종료 시 자동 해제되고, Heap은 GC가 관리한다.

## 참고
- [Oracle - JVM Specification](https://docs.oracle.com/javase/specs/jvms/se21/html/)
- [Oracle - GC Tuning Guide](https://docs.oracle.com/en/java/javase/21/gctuning/)
