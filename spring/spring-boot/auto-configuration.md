# Spring Boot Auto Configuration

## 핵심 개념
> Auto Configuration은 클래스패스에 있는 라이브러리와 설정을 기반으로 Spring Bean을 자동으로 구성해주는 Spring Boot의 핵심 기능이다.

## 왜 필요한가?

순수 Spring에서는 모든 설정을 직접 해야 했다:

```java
// Spring만 사용할 때 — DataSource 설정을 직접 해야 함
@Configuration
public class DataSourceConfig {
    @Bean
    public DataSource dataSource() {
        HikariDataSource ds = new HikariDataSource();
        ds.setJdbcUrl("jdbc:mysql://localhost:3306/mydb");
        ds.setUsername("root");
        ds.setPassword("password");
        ds.setDriverClassName("com.mysql.cj.jdbc.Driver");
        return ds;
    }

    @Bean
    public JdbcTemplate jdbcTemplate(DataSource dataSource) {
        return new JdbcTemplate(dataSource);
    }
}
```

Spring Boot에서는 의존성 추가 + application.yml만으로 끝난다:

```yaml
# application.yml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/mydb
    username: root
    password: password
```

## 동작 원리

```
@SpringBootApplication
    ├── @SpringBootConfiguration  → @Configuration
    ├── @ComponentScan            → 컴포넌트 스캔
    └── @EnableAutoConfiguration  → 자동 구성 활성화
            ↓
        META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports
            ↓
        조건(@Conditional)에 맞는 설정 클래스만 적용
```

### @Conditional 조건들

| 어노테이션 | 조건 |
|------------|------|
| `@ConditionalOnClass` | 특정 클래스가 클래스패스에 있을 때 |
| `@ConditionalOnMissingBean` | 해당 타입의 Bean이 없을 때 |
| `@ConditionalOnProperty` | 특정 프로퍼티 값이 설정되어 있을 때 |
| `@ConditionalOnMissingClass` | 특정 클래스가 없을 때 |

### 예시: DataSource 자동 구성 흐름

```
1. spring-boot-starter-data-jpa 의존성 추가
2. 클래스패스에 HikariDataSource 존재
3. @ConditionalOnClass(DataSource.class) → 조건 충족
4. @ConditionalOnMissingBean(DataSource.class) → 직접 등록한 게 없으면
5. application.yml의 spring.datasource.* 값으로 HikariDataSource 자동 생성
```

## Starter 의존성

Starter는 관련 라이브러리를 묶어놓은 의존성 세트이다.

| Starter | 포함하는 것 |
|---------|-------------|
| `spring-boot-starter-web` | Spring MVC, Tomcat, Jackson |
| `spring-boot-starter-data-jpa` | Spring Data JPA, Hibernate, HikariCP |
| `spring-boot-starter-security` | Spring Security |
| `spring-boot-starter-data-redis` | Spring Data Redis, Lettuce |
| `spring-boot-starter-test` | JUnit 5, Mockito, AssertJ |

## application.yml 주요 설정

```yaml
server:
  port: 8080
  servlet:
    context-path: /api

spring:
  # DataSource
  datasource:
    url: jdbc:mysql://localhost:3306/mydb
    username: root
    password: ${DB_PASSWORD}  # 환경변수 참조
    hikari:
      maximum-pool-size: 10

  # JPA
  jpa:
    hibernate:
      ddl-auto: validate  # 운영에서는 validate 또는 none
    show-sql: false
    properties:
      hibernate:
        format_sql: true

  # Redis
  data:
    redis:
      host: localhost
      port: 6379

# Logging
logging:
  level:
    root: INFO
    com.example: DEBUG
    org.hibernate.SQL: DEBUG
```

## Profile

환경별로 설정을 분리할 수 있다.

```
application.yml           # 공통
application-local.yml     # 로컬 개발
application-dev.yml       # 개발 서버
application-prod.yml      # 운영 서버
```

```yaml
# application-local.yml
spring:
  jpa:
    hibernate:
      ddl-auto: create-drop
    show-sql: true
```

```yaml
# application-prod.yml
spring:
  jpa:
    hibernate:
      ddl-auto: validate
    show-sql: false
```

활성화 방법:
```bash
java -jar app.jar --spring.profiles.active=prod
```

## 면접 예상 질문

**Q: Spring Boot Auto Configuration은 어떻게 동작하는가?**
A: @EnableAutoConfiguration이 META-INF 하위의 자동 구성 후보 클래스 목록을 읽어들이고, 각 클래스의 @Conditional 조건을 평가하여 조건에 맞는 것만 Bean으로 등록한다. 예를 들어 클래스패스에 HikariDataSource가 있고 직접 DataSource Bean을 등록하지 않았다면 자동으로 DataSource를 구성한다.

**Q: spring.jpa.hibernate.ddl-auto 옵션의 종류와 운영 환경 권장값은?**
A: create(테이블 새로 생성), create-drop(종료 시 삭제), update(변경분 반영), validate(검증만), none(아무것도 안 함). 운영에서는 validate 또는 none을 사용해야 한다.

**Q: 자동 구성을 커스터마이징하려면?**
A: 같은 타입의 Bean을 직접 @Bean으로 등록하면 @ConditionalOnMissingBean 조건에 의해 자동 구성이 적용되지 않고 직접 등록한 Bean이 사용된다.

## 참고
- [Spring Boot 공식 문서 - Auto Configuration](https://docs.spring.io/spring-boot/reference/using/auto-configuration.html)
- [Spring Boot 공식 문서 - Common Properties](https://docs.spring.io/spring-boot/appendix/application-properties/index.html)
