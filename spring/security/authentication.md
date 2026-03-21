# Spring Security

## 핵심 개념
> Spring Security는 인증(Authentication)과 인가(Authorization)를 처리하는 프레임워크로, 필터 체인 기반으로 동작한다.

## 인증 vs 인가

| | 인증 (Authentication) | 인가 (Authorization) |
|---|---|---|
| **의미** | 누구인가? (신원 확인) | 무엇을 할 수 있는가? (권한 확인) |
| **시점** | 먼저 처리 | 인증 이후 처리 |
| **예시** | 로그인 | ADMIN만 접근 가능 |

## Spring Security 필터 체인

```
HTTP 요청
    ↓
SecurityFilterChain
    ├── SecurityContextPersistenceFilter  → SecurityContext 복원
    ├── LogoutFilter                      → 로그아웃 처리
    ├── UsernamePasswordAuthenticationFilter → 폼 로그인
    ├── BearerTokenAuthenticationFilter   → JWT 토큰
    ├── ExceptionTranslationFilter        → 인증/인가 예외 처리
    └── FilterSecurityInterceptor         → 인가 처리
    ↓
DispatcherServlet
```

## SecurityFilterChain 설정

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        return http
            .csrf(csrf -> csrf.disable())  // REST API는 보통 비활성화
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/posts/**").permitAll()
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
            .build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
```

## JWT 인증 구현

### JWT 필터

```java
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider jwtTokenProvider;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String token = resolveToken(request);

        if (token != null && jwtTokenProvider.validateToken(token)) {
            Authentication auth = jwtTokenProvider.getAuthentication(token);
            SecurityContextHolder.getContext().setAuthentication(auth);
        }

        filterChain.doFilter(request, response);
    }

    private String resolveToken(HttpServletRequest request) {
        String bearer = request.getHeader("Authorization");
        if (bearer != null && bearer.startsWith("Bearer ")) {
            return bearer.substring(7);
        }
        return null;
    }
}
```

### JWT Token Provider

```java
@Component
public class JwtTokenProvider {

    @Value("${jwt.secret}")
    private String secretKey;

    @Value("${jwt.expiration}")
    private long expiration;

    public String createToken(String username, List<String> roles) {
        return Jwts.builder()
                .subject(username)
                .claim("roles", roles)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSigningKey())
                .compact();
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parser().verifyWith(getSigningKey()).build()
                .parseSignedClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    public Authentication getAuthentication(String token) {
        Claims claims = Jwts.parser().verifyWith(getSigningKey()).build()
                .parseSignedClaims(token).getPayload();

        String username = claims.getSubject();
        List<SimpleGrantedAuthority> authorities =
                ((List<String>) claims.get("roles")).stream()
                        .map(SimpleGrantedAuthority::new)
                        .toList();

        UserDetails userDetails = new User(username, "", authorities);
        return new UsernamePasswordAuthenticationToken(
                userDetails, null, authorities);
    }

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(secretKey.getBytes());
    }
}
```

## CORS 설정

```java
@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:3000")
                .allowedMethods("GET", "POST", "PUT", "DELETE")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }
}
```

## CSRF

- **CSRF(Cross-Site Request Forgery):** 사용자가 의도하지 않은 요청을 보내게 하는 공격
- 세션 기반 인증에서는 CSRF 토큰으로 방어 필요
- **JWT + Stateless API에서는 일반적으로 비활성화** — 토큰이 쿠키가 아닌 헤더로 전송되므로

## 면접 예상 질문

**Q: Spring Security의 동작 원리는?**
A: 서블릿 필터 체인 기반으로 동작한다. HTTP 요청이 들어오면 SecurityFilterChain에 등록된 필터들이 순서대로 실행되며, 인증 필터에서 사용자 신원을 확인하고 인가 필터에서 접근 권한을 검사한다.

**Q: JWT와 세션 기반 인증의 차이는?**
A: 세션 기반은 서버에 세션 상태를 저장하고 세션 ID를 쿠키로 관리한다. JWT는 토큰 자체에 사용자 정보를 담아 서버가 상태를 저장하지 않는다(Stateless). JWT는 서버 확장에 유리하지만 토큰 탈취 시 만료 전까지 무효화가 어려운 단점이 있다.

**Q: REST API에서 CSRF를 비활성화해도 되는 이유는?**
A: CSRF는 브라우저가 쿠키를 자동으로 포함하는 특성을 악용하는 공격이다. JWT를 Authorization 헤더로 전송하는 Stateless API에서는 브라우저가 자동으로 토큰을 포함하지 않으므로 CSRF 공격이 성립하지 않는다.

## 참고
- [Spring Security 공식 문서](https://docs.spring.io/spring-security/reference/)
