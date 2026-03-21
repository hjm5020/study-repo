# 알고리즘

## 핵심 개념
> 알고리즘은 문제를 해결하기 위한 절차로, 시간/공간 복잡도를 분석하여 효율적인 방법을 선택하는 것이 핵심이다.

## 시간 복잡도 (Big-O)

```
O(1)       < O(log n) < O(n)    < O(n log n) < O(n²)    < O(2ⁿ)
상수         로그       선형       선형로그       이차       지수
HashMap조회  이진탐색    순회       정렬          이중루프    부분집합
```

```java
// O(1) — 상수 시간
map.get(key);

// O(log n) — 로그 시간
Arrays.binarySearch(sorted, target);

// O(n) — 선형 시간
for (int i = 0; i < n; i++) { }

// O(n log n) — 선형 로그 시간
Arrays.sort(arr);

// O(n²) — 이차 시간
for (int i = 0; i < n; i++)
    for (int j = 0; j < n; j++) { }
```

## 정렬 알고리즘

| 알고리즘 | 평균 | 최악 | 공간 | 안정 | 특징 |
|----------|------|------|------|------|------|
| **Merge Sort** | O(n log n) | O(n log n) | O(n) | ✅ | 항상 일정한 성능 |
| **Quick Sort** | O(n log n) | O(n²) | O(log n) | ❌ | 실무에서 가장 빠름 |
| **Heap Sort** | O(n log n) | O(n log n) | O(1) | ❌ | 추가 메모리 불필요 |
| **Tim Sort** | O(n log n) | O(n log n) | O(n) | ✅ | Java 기본 정렬 |
| Bubble Sort | O(n²) | O(n²) | O(1) | ✅ | 교육용 |
| Insertion Sort | O(n²) | O(n²) | O(1) | ✅ | 소규모 데이터에 빠름 |

**Java 정렬:**
- `Arrays.sort()` (기본형): Dual-Pivot Quick Sort
- `Arrays.sort()` (객체): Tim Sort (Merge Sort + Insertion Sort)
- `Collections.sort()`: Tim Sort

### Quick Sort 핵심

```java
// 피벗을 기준으로 작은 값은 왼쪽, 큰 값은 오른쪽으로 분할
void quickSort(int[] arr, int low, int high) {
    if (low < high) {
        int pivot = partition(arr, low, high);
        quickSort(arr, low, pivot - 1);
        quickSort(arr, pivot + 1, high);
    }
}
```

### Merge Sort 핵심

```java
// 반으로 나누고 정렬된 부분을 병합
void mergeSort(int[] arr, int left, int right) {
    if (left < right) {
        int mid = (left + right) / 2;
        mergeSort(arr, left, mid);
        mergeSort(arr, mid + 1, right);
        merge(arr, left, mid, right);
    }
}
```

## 탐색 알고리즘

### 이진 탐색 (Binary Search)

```java
// 정렬된 배열에서 O(log n) 탐색
int binarySearch(int[] arr, int target) {
    int left = 0, right = arr.length - 1;
    while (left <= right) {
        int mid = left + (right - left) / 2;
        if (arr[mid] == target) return mid;
        else if (arr[mid] < target) left = mid + 1;
        else right = mid - 1;
    }
    return -1;
}
```

### BFS (너비 우선 탐색)

```java
// 큐 사용, 레벨 순서 탐색, 최단 경로
void bfs(int start, List<List<Integer>> graph) {
    Queue<Integer> queue = new LinkedList<>();
    boolean[] visited = new boolean[graph.size()];

    queue.offer(start);
    visited[start] = true;

    while (!queue.isEmpty()) {
        int node = queue.poll();

        for (int next : graph.get(node)) {
            if (!visited[next]) {
                visited[next] = true;
                queue.offer(next);
            }
        }
    }
}
```

**활용:** 최단 경로(가중치 없는 그래프), 레벨 순서 탐색

### DFS (깊이 우선 탐색)

```java
// 스택/재귀 사용, 깊이 우선 탐색
void dfs(int node, boolean[] visited, List<List<Integer>> graph) {
    visited[node] = true;

    for (int next : graph.get(node)) {
        if (!visited[next]) {
            dfs(next, visited, graph);
        }
    }
}
```

**활용:** 경로 탐색, 사이클 감지, 위상 정렬, 백트래킹

## 주요 알고리즘 패턴

### 동적 프로그래밍 (DP)

```
큰 문제를 작은 부분 문제로 나누어 해결, 결과를 저장(메모이제이션)하여 중복 계산 방지

조건:
1. 최적 부분 구조: 부분 문제의 최적해로 전체 최적해 구성
2. 겹치는 부분 문제: 동일한 부분 문제가 반복
```

```java
// 피보나치 — Top-Down (메모이제이션)
int fib(int n, int[] memo) {
    if (n <= 1) return n;
    if (memo[n] != 0) return memo[n];
    memo[n] = fib(n - 1, memo) + fib(n - 2, memo);
    return memo[n];
}

// 피보나치 — Bottom-Up (타뷸레이션)
int fib(int n) {
    int[] dp = new int[n + 1];
    dp[0] = 0; dp[1] = 1;
    for (int i = 2; i <= n; i++) {
        dp[i] = dp[i - 1] + dp[i - 2];
    }
    return dp[n];
}
```

### 그리디 (Greedy)

```
매 순간 최선의 선택 → 전체 최적해 (항상 성립하는 것은 아님)

활용: 활동 선택 문제, 허프만 코딩, 다익스트라
```

### 백트래킹 (Backtracking)

```
모든 경우를 탐색하되, 유망하지 않은 경우를 조기에 포기 (가지치기)

활용: N-Queen, 순열/조합, 스도쿠
```

## 면접 예상 질문

**Q: 시간 복잡도 O(n log n)이 의미하는 것은?**
A: 데이터 크기 n에 대해 log n번의 분할을 하고, 각 단계에서 n개의 데이터를 처리하는 것이다. 대표적으로 Merge Sort, Quick Sort(평균)가 해당한다. n이 두 배가 되면 실행 시간은 두 배보다 약간 더 증가한다.

**Q: Quick Sort와 Merge Sort의 차이는?**
A: Quick Sort는 피벗으로 분할 후 정렬하며 평균 O(n log n)이지만 최악 O(n²)이다. Merge Sort는 반으로 나눈 후 병합하며 항상 O(n log n)이지만 O(n) 추가 공간이 필요하다. 실무에서는 Quick Sort가 캐시 효율성이 높아 더 빠르다.

**Q: BFS와 DFS의 차이와 사용 상황은?**
A: BFS는 큐를 사용하여 가까운 노드부터 탐색하며, 최단 경로 문제에 적합하다. DFS는 스택/재귀를 사용하여 깊이 우선 탐색하며, 경로 탐색, 백트래킹에 적합하다.

**Q: DP를 사용해야 하는 문제의 특징은?**
A: 최적 부분 구조(부분 문제의 최적해로 전체 해를 구성)와 겹치는 부분 문제(동일한 계산이 반복)의 두 조건을 만족할 때 사용한다. 피보나치, 배낭 문제, 최장 공통 부분 수열 등이 대표적이다.
