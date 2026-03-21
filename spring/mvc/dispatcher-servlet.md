# DispatcherServlet과 Spring MVC 요청 처리 흐름

## 핵심 개념
> DispatcherServlet은 Spring MVC의 프론트 컨트롤러로, 모든 HTTP 요청을 받아 적절한 핸들러에게 분배하고 응답을 반환하는 중앙 제어 역할을 한다.

## 요청 처리 흐름

```
Client (HTTP 요청)
    ↓
[Filter Chain]              ← 서블릿 필터 (Spring Security 등)
    ↓
[DispatcherServlet]         ← 프론트 컨트롤러
    ↓
[HandlerMapping]            ← 어떤 컨트롤러가 처리할지 결정
    ↓
[HandlerAdapter]            ← 핸들러 실행 방식 결정
    ↓
[Interceptor - preHandle]   ← 전처리
    ↓
[Controller]                ← 비즈니스 로직 실행
    ↓
[Interceptor - postHandle]  ← 후처리
    ↓
[ViewResolver / HttpMessageConverter]  ← 응답 변환
    ↓
[Interceptor - afterCompletion]
    ↓
Client (HTTP 응답)
```

## Filter vs Interceptor vs AOP

| | Filter | Interceptor | AOP |
|---|--------|-------------|-----|
| **관리** | 서블릿 컨테이너 | Spring 컨테이너 | Spring 컨테이너 |
| **위치** | DispatcherServlet 전후 | Controller 전후 | 메서드 전후 |
| **대상** | HTTP 요청/응답 | Controller | 모든 Bean 메서드 |
| **용도** | 인코딩, 보안, CORS | 인증, 로깅, 권한 | 트랜잭션, 로깅 |
| **접근** | ServletRequest/Response | HttpServletRequest/Response | JoinPoint |

### Filter 예시

```java
@Component
public class LogFilter implements Filter {

    @Override
    public void doFilter(ServletRequest request, ServletResponse response,
                         FilterChain chain) throws IOException, ServletException {
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        log.info("Request: {} {}", httpRequest.getMethod(), httpRequest.getRequestURI());

        chain.doFilter(request, response); // 다음 필터 또는 서블릿 호출

        log.info("Response: {}", ((HttpServletResponse) response).getStatus());
    }
}
```

### Interceptor 예시

```java
@Component
public class AuthInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest request,
                             HttpServletResponse response,
                             Object handler) {
        String token = request.getHeader("Authorization");
        if (token == null) {
            response.setStatus(401);
            return false; // 컨트롤러 실행 안 함
        }
        return true; // 컨트롤러 실행
    }

    @Override
    public void postHandle(HttpServletRequest request,
                           HttpServletResponse response,
                           Object handler, ModelAndView modelAndView) {
        // 컨트롤러 실행 후
    }

    @Override
    public void afterCompletion(HttpServletRequest request,
                                HttpServletResponse response,
                                Object handler, Exception ex) {
        // 뷰 렌더링 후 (항상 호출)
    }
}

// 등록
@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(new AuthInterceptor())
                .addPathPatterns("/api/**")
                .excludePathPatterns("/api/auth/**");
    }
}
```

## Controller

### REST API 기본

```java
@RestController // @Controller + @ResponseBody
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @GetMapping
    public ResponseEntity<List<OrderResponse>> getOrders() {
        return ResponseEntity.ok(orderService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderResponse> getOrder(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.findById(id));
    }

    @PostMapping
    public ResponseEntity<OrderResponse> createOrder(
            @RequestBody @Valid OrderCreateRequest request) {
        OrderResponse response = orderService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<OrderResponse> updateOrder(
            @PathVariable Long id,
            @RequestBody @Valid OrderUpdateRequest request) {
        return ResponseEntity.ok(orderService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOrder(@PathVariable Long id) {
        orderService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
```

## 예외 처리

### @ExceptionHandler + @RestControllerAdvice

```java
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(EntityNotFoundException e) {
        ErrorResponse error = new ErrorResponse("NOT_FOUND", e.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(
            MethodArgumentNotValidException e) {
        String message = e.getBindingResult().getFieldErrors().stream()
                .map(fe -> fe.getField() + ": " + fe.getDefaultMessage())
                .collect(Collectors.joining(", "));
        ErrorResponse error = new ErrorResponse("VALIDATION_ERROR", message);
        return ResponseEntity.badRequest().body(error);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleException(Exception e) {
        log.error("Unexpected error", e);
        ErrorResponse error = new ErrorResponse("INTERNAL_ERROR", "서버 오류가 발생했습니다");
        return ResponseEntity.internalServerError().body(error);
    }
}

public record ErrorResponse(String code, String message) { }
```

## Validation

```java
public record OrderCreateRequest(
    @NotBlank(message = "상품명은 필수입니다")
    String productName,

    @Min(value = 1, message = "수량은 1 이상이어야 합니다")
    int quantity,

    @NotNull(message = "가격은 필수입니다")
    @Positive(message = "가격은 양수여야 합니다")
    BigDecimal price
) { }
```

## 면접 예상 질문

**Q: DispatcherServlet의 역할은?**
A: 프론트 컨트롤러 패턴의 구현체로, 모든 HTTP 요청을 받아 HandlerMapping으로 적절한 컨트롤러를 찾고, HandlerAdapter로 실행한 뒤 결과를 클라이언트에게 반환한다.

**Q: Filter와 Interceptor의 차이는?**
A: Filter는 서블릿 컨테이너가 관리하며 DispatcherServlet 전후에 동작하고, Interceptor는 Spring 컨테이너가 관리하며 Controller 전후에 동작한다. Filter는 Spring Bean에 접근하기 어렵지만 Interceptor는 Spring의 기능을 자유롭게 사용할 수 있다.

**Q: @Controller와 @RestController의 차이는?**
A: @RestController는 @Controller + @ResponseBody이다. @Controller는 뷰 이름을 반환하고, @RestController는 반환값이 HttpMessageConverter를 통해 JSON 등으로 변환되어 응답 본문에 직접 쓰인다.

## 참고
- [Spring 공식 문서 - MVC](https://docs.spring.io/spring-framework/reference/web/webmvc.html)
- [Spring 공식 문서 - DispatcherServlet](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-servlet.html)
