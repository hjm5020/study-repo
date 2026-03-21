# OOP & SOLID 원칙

## 핵심 개념
> OOP는 객체를 중심으로 프로그래밍하는 패러다임이고, SOLID는 유지보수하기 좋은 객체지향 설계를 위한 5가지 원칙이다.

## OOP 4대 특성

### 1. 캡슐화 (Encapsulation)

데이터와 행위를 하나로 묶고, 외부에 구현 세부사항을 숨긴다.

```java
// ❌ 캡슐화 위반 — 외부에서 직접 상태 변경
public class Account {
    public int balance;
}

account.balance -= 10000; // 잔액 검증 없이 직접 변경 가능

// ✅ 캡슐화 적용 — 메서드를 통해 제어
public class Account {
    private int balance;

    public void withdraw(int amount) {
        if (balance < amount) {
            throw new InsufficientBalanceException();
        }
        this.balance -= amount;
    }

    public int getBalance() {
        return balance;
    }
}
```

### 2. 상속 (Inheritance)

부모 클래스의 속성과 행위를 자식 클래스가 물려받는다.

```java
public class Animal {
    protected String name;

    public void eat() {
        System.out.println(name + " is eating");
    }
}

public class Dog extends Animal {
    public void bark() {
        System.out.println(name + " is barking");
    }
}
```

**주의:** 상속보다 **조합(Composition)** 을 선호하라 — Effective Java Item 18

```java
// 조합 사용
public class OrderService {
    private final OrderRepository repository; // 상속 대신 필드로 가짐
    private final PaymentService paymentService;
}
```

### 3. 다형성 (Polymorphism)

같은 타입으로 다양한 구현체를 사용할 수 있다.

```java
public interface PaymentService {
    void pay(int amount);
}

public class CardPayment implements PaymentService {
    public void pay(int amount) { /* 카드 결제 */ }
}

public class CashPayment implements PaymentService {
    public void pay(int amount) { /* 현금 결제 */ }
}

// 클라이언트는 구현체를 몰라도 됨
public class OrderService {
    private final PaymentService paymentService;

    public void order(int amount) {
        paymentService.pay(amount); // 어떤 구현체든 동작
    }
}
```

### 4. 추상화 (Abstraction)

복잡한 내부 구현을 숨기고 핵심적인 개념만 노출한다.

```java
// 추상화 — "어떻게"가 아닌 "무엇을" 하는지만 정의
public interface NotificationSender {
    void send(String to, String message);
}

// 구현은 각자 다름
public class EmailSender implements NotificationSender { ... }
public class SmsSender implements NotificationSender { ... }
public class SlackSender implements NotificationSender { ... }
```

## SOLID 원칙

### S — 단일 책임 원칙 (Single Responsibility)

> 클래스는 하나의 책임만 가져야 한다.

```java
// ❌ 여러 책임
public class OrderService {
    public void createOrder() { /* 주문 생성 */ }
    public void sendEmail() { /* 이메일 발송 */ }
    public void generatePdf() { /* PDF 생성 */ }
}

// ✅ 책임 분리
public class OrderService { /* 주문 생성 */ }
public class EmailService { /* 이메일 발송 */ }
public class PdfService { /* PDF 생성 */ }
```

### O — 개방-폐쇄 원칙 (Open/Closed)

> 확장에는 열려 있고, 변경에는 닫혀 있어야 한다.

```java
// ❌ 새 할인 정책 추가 시 기존 코드 수정 필요
public class DiscountService {
    public int discount(String type, int price) {
        if (type.equals("VIP")) return price * 20 / 100;
        if (type.equals("GOLD")) return price * 10 / 100;
        // 새 타입 추가할 때마다 수정...
        return 0;
    }
}

// ✅ 인터페이스로 확장 가능
public interface DiscountPolicy {
    int discount(int price);
}

public class VipDiscount implements DiscountPolicy {
    public int discount(int price) { return price * 20 / 100; }
}

public class GoldDiscount implements DiscountPolicy {
    public int discount(int price) { return price * 10 / 100; }
}
// 새 정책 추가 시 기존 코드 변경 없이 새 클래스만 추가
```

### L — 리스코프 치환 원칙 (Liskov Substitution)

> 자식 클래스는 부모 클래스를 대체할 수 있어야 한다.

```java
// ❌ 위반 — 정사각형이 직사각형의 동작을 깨뜨림
public class Rectangle {
    protected int width, height;

    public void setWidth(int w) { this.width = w; }
    public void setHeight(int h) { this.height = h; }
    public int area() { return width * height; }
}

public class Square extends Rectangle {
    @Override
    public void setWidth(int w) { this.width = w; this.height = w; }
    @Override
    public void setHeight(int h) { this.width = h; this.height = h; }
    // Rectangle을 기대하는 코드에서 Square를 넣으면 결과가 달라짐
}
```

### I — 인터페이스 분리 원칙 (Interface Segregation)

> 클라이언트가 사용하지 않는 메서드에 의존하지 않아야 한다.

```java
// ❌ 너무 큰 인터페이스
public interface Worker {
    void work();
    void eat();
    void sleep();
}

// 로봇은 eat(), sleep()이 필요 없음
public class Robot implements Worker {
    public void work() { /* 작업 */ }
    public void eat() { /* 불필요 */ }
    public void sleep() { /* 불필요 */ }
}

// ✅ 분리
public interface Workable { void work(); }
public interface Eatable { void eat(); }
public interface Sleepable { void sleep(); }

public class Robot implements Workable {
    public void work() { /* 작업 */ }
}
```

### D — 의존 역전 원칙 (Dependency Inversion)

> 고수준 모듈이 저수준 모듈에 의존하지 않고, 둘 다 추상화에 의존해야 한다.

```java
// ❌ 구체 클래스에 의존
public class OrderService {
    private final MySqlOrderRepository repository = new MySqlOrderRepository();
}

// ✅ 추상화에 의존
public class OrderService {
    private final OrderRepository repository; // 인터페이스

    public OrderService(OrderRepository repository) {
        this.repository = repository; // DI
    }
}
```

## 인터페이스 vs 추상 클래스

| | 인터페이스 | 추상 클래스 |
|---|---|---|
| 다중 구현/상속 | 여러 개 구현 가능 | 하나만 상속 가능 |
| 상태(필드) | 상수만 (static final) | 인스턴스 변수 가능 |
| 생성자 | 없음 | 있음 |
| 접근 제어자 | public만 | 모두 가능 |
| 용도 | "무엇을 할 수 있는가" (능력) | "무엇인가" (분류) |

```java
// 인터페이스 — 능력, 역할 정의
public interface Payable { void pay(int amount); }
public interface Refundable { void refund(int amount); }

// 추상 클래스 — 공통 상태와 기본 구현
public abstract class BaseEntity {
    private Long id;
    private LocalDateTime createdAt;

    public abstract void validate();
}
```

## 면접 예상 질문

**Q: OOP의 4대 특성을 설명해주세요.**
A: 캡슐화(데이터와 행위를 묶고 외부에 숨김), 상속(부모의 속성을 자식이 물려받음), 다형성(같은 타입으로 다양한 구현을 사용), 추상화(핵심 개념만 노출하고 내부 구현을 숨김)이다.

**Q: SOLID 중 가장 중요하다고 생각하는 원칙은?**
A: 개방-폐쇄 원칙(OCP)이다. 새로운 기능을 추가할 때 기존 코드를 변경하지 않고 확장할 수 있으면 유지보수성이 크게 향상된다. Spring의 DI도 이 원칙을 실현하기 위한 것이다.

**Q: 상속보다 조합을 선호하는 이유는?**
A: 상속은 부모와 자식 사이에 강한 결합을 만들고, 부모 변경이 자식에게 영향을 준다. 조합은 필요한 기능을 가진 객체를 필드로 가지므로 결합도가 낮고, 런타임에 교체가 가능하며, 여러 클래스의 기능을 조합할 수 있다.

## 참고
- Effective Java (Joshua Bloch) — Item 18: 상속보다는 컴포지션을 사용하라
- Clean Architecture (Robert C. Martin) — SOLID 원칙
