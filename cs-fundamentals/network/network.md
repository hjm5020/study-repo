# 네트워크

## 핵심 개념
> 네트워크는 컴퓨터 간 데이터를 주고받는 체계로, 백엔드 개발자는 HTTP, TCP/IP, DNS를 중심으로 이해해야 한다.

## OSI 7계층 vs TCP/IP 4계층

```
OSI 7계층           TCP/IP 4계층        프로토콜         데이터 단위
─────────────────────────────────────────────────────────────
7. 응용             응용                HTTP, DNS, FTP   메시지
6. 표현                                SSL/TLS
5. 세션
─────────────────────────────────────────────────────────────
4. 전송             전송                TCP, UDP          세그먼트
─────────────────────────────────────────────────────────────
3. 네트워크         인터넷              IP, ICMP          패킷
─────────────────────────────────────────────────────────────
2. 데이터링크       네트워크 접근       Ethernet, WiFi    프레임
1. 물리                                                   비트
─────────────────────────────────────────────────────────────
```

## TCP vs UDP

| | TCP | UDP |
|---|---|---|
| 연결 | 연결 지향 (3-way handshake) | 비연결 |
| 신뢰성 | 순서 보장, 재전송, 흐름/혼잡 제어 | 보장 없음 |
| 속도 | 상대적으로 느림 | 빠름 |
| 용도 | HTTP, 이메일, 파일 전송 | DNS, 스트리밍, 게임 |

### TCP 3-Way Handshake (연결)

```
Client                Server
  │── SYN ──────────→ │   1. 연결 요청
  │←── SYN + ACK ──── │   2. 요청 수락 + 확인
  │── ACK ──────────→ │   3. 확인
  │    연결 완료        │
```

### TCP 4-Way Handshake (종료)

```
Client                Server
  │── FIN ──────────→ │   1. 종료 요청
  │←── ACK ────────── │   2. 확인
  │←── FIN ────────── │   3. 서버도 종료 요청
  │── ACK ──────────→ │   4. 확인
  │   TIME_WAIT        │
```

## HTTP

### HTTP 메서드

| 메서드 | 용도 | 멱등성 | 안전 |
|--------|------|--------|------|
| **GET** | 리소스 조회 | ✅ | ✅ |
| **POST** | 리소스 생성 | ❌ | ❌ |
| **PUT** | 리소스 전체 수정 | ✅ | ❌ |
| **PATCH** | 리소스 부분 수정 | ❌ | ❌ |
| **DELETE** | 리소스 삭제 | ✅ | ❌ |

**멱등성:** 같은 요청을 여러 번 보내도 결과가 같음

### HTTP 상태 코드

```
2xx 성공
  200 OK
  201 Created (POST 성공)
  204 No Content (DELETE 성공)

3xx 리다이렉션
  301 Moved Permanently (영구 이동)
  302 Found (임시 이동)
  304 Not Modified (캐시 사용)

4xx 클라이언트 오류
  400 Bad Request (잘못된 요청)
  401 Unauthorized (인증 필요)
  403 Forbidden (권한 없음)
  404 Not Found
  405 Method Not Allowed
  409 Conflict (충돌)
  429 Too Many Requests (Rate Limit)

5xx 서버 오류
  500 Internal Server Error
  502 Bad Gateway
  503 Service Unavailable
  504 Gateway Timeout
```

### HTTP/1.1 vs HTTP/2 vs HTTP/3

| | HTTP/1.1 | HTTP/2 | HTTP/3 |
|---|---|---|---|
| 프로토콜 | TCP | TCP | QUIC (UDP) |
| 멀티플렉싱 | ❌ (파이프라인) | ✅ | ✅ |
| 헤더 압축 | ❌ | HPACK | QPACK |
| HOL Blocking | 있음 | TCP 레벨 있음 | 해결 |

### HTTPS

```
HTTP + TLS(SSL) = HTTPS

TLS Handshake:
1. Client Hello (지원 암호화 알고리즘)
2. Server Hello (인증서 + 선택된 알고리즘)
3. 인증서 검증 (CA 체인)
4. 대칭키 교환 (비대칭 암호화로)
5. 대칭키로 암호화 통신 시작

비대칭 암호화: 키 교환 시 사용 (RSA, ECDHE) — 느림
대칭 암호화: 실제 데이터 전송 시 사용 (AES) — 빠름
```

## DNS

```
브라우저에 www.example.com 입력

1. 브라우저 캐시 확인
2. OS 캐시 확인 (/etc/hosts)
3. Local DNS 서버 (ISP)
4. Root DNS → .com DNS → example.com DNS
5. IP 주소 반환 (93.184.216.34)
6. 해당 IP로 HTTP 요청
```

## REST API 설계 원칙

```
1. URI는 리소스를 표현 (명사, 복수형)
   ✅ GET /api/orders
   ❌ GET /api/getOrders

2. 행위는 HTTP 메서드로 표현
   ✅ DELETE /api/orders/1
   ❌ POST /api/deleteOrder/1

3. 계층 관계는 /로 표현
   GET /api/users/1/orders  (user 1의 주문 목록)

4. 필터, 정렬, 페이징은 쿼리 파라미터
   GET /api/orders?status=active&sort=created_at,desc&page=0&size=20
```

## 로드 밸런싱

```
              ┌─────────────┐
Client ────→  │Load Balancer │
              └──┬──┬──┬────┘
                 ↓  ↓  ↓
              [S1][S2][S3]

알고리즘:
- Round Robin: 순서대로 분배
- Least Connections: 연결 수가 적은 서버로
- IP Hash: 클라이언트 IP 기반 (세션 유지)
- Weighted: 서버 성능에 따라 가중치

L4 로드 밸런서: TCP/UDP 레벨 (IP, 포트 기반)
L7 로드 밸런서: HTTP 레벨 (URL, 헤더 기반, 더 세밀한 제어)
```

## 면접 예상 질문

**Q: TCP와 UDP의 차이는?**
A: TCP는 연결 지향적이며 3-way handshake로 연결을 수립하고, 순서 보장과 재전송으로 신뢰성을 제공한다. UDP는 비연결형으로 신뢰성은 없지만 오버헤드가 적어 빠르다. HTTP는 TCP, DNS는 UDP를 사용한다.

**Q: 브라우저에 URL을 입력하면 어떤 일이 일어나는가?**
A: DNS 조회로 도메인을 IP로 변환 → TCP 3-way handshake로 연결 → TLS handshake(HTTPS) → HTTP 요청 전송 → 서버 처리 → HTTP 응답 → 브라우저 렌더링 순서로 진행된다.

**Q: HTTP의 멱등성이란?**
A: 같은 요청을 여러 번 보내도 결과가 동일한 성질이다. GET, PUT, DELETE는 멱등하고, POST는 멱등하지 않다. 네트워크 장애 시 재시도 가능 여부를 판단하는 기준이 된다.

**Q: HTTPS의 동작 원리는?**
A: TLS handshake를 통해 비대칭 암호화로 대칭키를 안전하게 교환한 후, 대칭키로 실제 데이터를 암호화하여 통신한다. 서버 인증서로 신원을 확인하고, CA 체인으로 인증서의 진위를 검증한다.

**Q: REST API 설계 시 주의할 점은?**
A: URI는 리소스를 명사로 표현하고, 행위는 HTTP 메서드로 구분한다. 적절한 상태 코드를 반환하고, 버전 관리와 일관된 응답 형식을 유지해야 한다.
