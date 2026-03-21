# Spring 테스트

## 핵심 개념
> Spring Boot는 테스트 슬라이스 어노테이션으로 필요한 계층만 로드하여 빠르고 격리된 테스트를 작성할 수 있게 해준다.

## 테스트 종류와 어노테이션

| 어노테이션 | 대상 | 로드 범위 | 속도 |
|------------|------|-----------|------|
| **@SpringBootTest** | 통합 테스트 | 전체 컨텍스트 | 느림 |
| **@WebMvcTest** | Controller | MVC 관련만 | 빠름 |
| **@DataJpaTest** | Repository | JPA 관련만 | 빠름 |
| 없음 (단위 테스트) | Service 등 | 없음 | 가장 빠름 |

## 단위 테스트 — Service 계층

```java
@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @InjectMocks
    private OrderService orderService;

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private PaymentService paymentService;

    @Test
    @DisplayName("주문 생성 성공")
    void createOrder_success() {
        // given
        OrderCreateRequest request = new OrderCreateRequest("상품A", 2, BigDecimal.valueOf(10000));
        Order order = Order.create(request);
        given(orderRepository.save(any(Order.class))).willReturn(order);

        // when
        OrderResponse response = orderService.create(request);

        // then
        assertThat(response.productName()).isEqualTo("상품A");
        then(orderRepository).should().save(any(Order.class));
    }

    @Test
    @DisplayName("존재하지 않는 주문 조회 시 예외 발생")
    void findOrder_notFound() {
        // given
        given(orderRepository.findById(1L)).willReturn(Optional.empty());

        // when & then
        assertThatThrownBy(() -> orderService.findById(1L))
                .isInstanceOf(EntityNotFoundException.class)
                .hasMessage("주문을 찾을 수 없습니다");
    }
}
```

## @WebMvcTest — Controller 계층

```java
@WebMvcTest(OrderController.class)
class OrderControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private OrderService orderService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("주문 생성 API")
    void createOrder() throws Exception {
        // given
        OrderCreateRequest request = new OrderCreateRequest("상품A", 2, BigDecimal.valueOf(10000));
        OrderResponse response = new OrderResponse(1L, "상품A", 2, BigDecimal.valueOf(10000));
        given(orderService.create(any())).willReturn(response);

        // when & then
        mockMvc.perform(post("/api/orders")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.productName").value("상품A"))
                .andExpect(jsonPath("$.quantity").value(2));
    }

    @Test
    @DisplayName("유효성 검증 실패 시 400 반환")
    void createOrder_validationFail() throws Exception {
        // given
        OrderCreateRequest request = new OrderCreateRequest("", 0, null);

        // when & then
        mockMvc.perform(post("/api/orders")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }
}
```

## @DataJpaTest — Repository 계층

```java
@DataJpaTest
class OrderRepositoryTest {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private TestEntityManager em;

    @Test
    @DisplayName("상태별 주문 조회")
    void findByStatus() {
        // given
        Order order1 = Order.create("상품A", OrderStatus.CREATED);
        Order order2 = Order.create("상품B", OrderStatus.COMPLETED);
        em.persist(order1);
        em.persist(order2);
        em.flush();
        em.clear();

        // when
        List<Order> result = orderRepository.findByStatus(OrderStatus.CREATED);

        // then
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getProductName()).isEqualTo("상품A");
    }
}
```

## @SpringBootTest — 통합 테스트

```java
@SpringBootTest
@Transactional
class OrderIntegrationTest {

    @Autowired
    private OrderService orderService;

    @Autowired
    private OrderRepository orderRepository;

    @Test
    @DisplayName("주문 생성 통합 테스트")
    void createOrder() {
        // given
        OrderCreateRequest request = new OrderCreateRequest("상품A", 2, BigDecimal.valueOf(10000));

        // when
        OrderResponse response = orderService.create(request);

        // then
        Order saved = orderRepository.findById(response.id()).orElseThrow();
        assertThat(saved.getProductName()).isEqualTo("상품A");
    }
}
```

## 테스트 작성 패턴

### Given-When-Then

```java
@Test
void 테스트_메서드명() {
    // given — 테스트 데이터 준비
    // when  — 테스트 대상 실행
    // then  — 결과 검증
}
```

### 자주 쓰는 AssertJ 검증

```java
// 값 비교
assertThat(result).isEqualTo(expected);
assertThat(result).isNotNull();

// 컬렉션
assertThat(list).hasSize(3);
assertThat(list).contains(item);
assertThat(list).extracting("name").containsExactly("A", "B", "C");

// 예외
assertThatThrownBy(() -> service.execute())
        .isInstanceOf(IllegalArgumentException.class)
        .hasMessageContaining("잘못된 값");
```

## 면접 예상 질문

**Q: @WebMvcTest와 @SpringBootTest의 차이는?**
A: @WebMvcTest는 MVC 관련 Bean만 로드하여 Controller 계층만 빠르게 테스트한다. @SpringBootTest는 전체 ApplicationContext를 로드하여 통합 테스트에 사용한다. Service, Repository는 @MockBean으로 대체된다.

**Q: @Mock과 @MockBean의 차이는?**
A: @Mock은 Mockito가 관리하는 순수 Mock 객체이고, @MockBean은 Spring ApplicationContext에 등록된 Bean을 Mock으로 교체한다. 단위 테스트에서는 @Mock, Spring 테스트(@WebMvcTest 등)에서는 @MockBean을 사용한다.

**Q: @Transactional을 테스트에 붙이는 이유는?**
A: 테스트 완료 후 자동으로 롤백하여 테스트 간 데이터 격리를 보장한다. DB 상태가 다른 테스트에 영향을 주지 않는다.

## 참고
- [Spring Boot 공식 문서 - Testing](https://docs.spring.io/spring-boot/reference/testing/index.html)
