# What Is Performance Testing?

Performance testing validates how an application behaves under expected and extreme traffic conditions.

## Measures

1. Response time
2. Scalability
3. Stability
4. Reliability

# What Is Grafana k6?

Grafana k6 is a modern performance testing tool based on JavaScript for APIs and browser applications. It enables realistic load simulation and integrates with Grafana Cloud for real-time monitoring and observability.

## What Is Smoke Testing?

Smoke testing is a minimal load test that verifies whether a system can handle a small amount of traffic without issues. It is a sanity check before running more intensive tests.

Start with two or three users before applying an intensive load. If the system fails with a small number of users, there is no point in testing with a larger number of users.

### k6 Configuration Pattern

```javascript
export const options = {
  vus: 2,
  duration: '1m',
};
```

## What Is Load Testing?

Load testing evaluates system performance under expected normal and peak load conditions. It helps you understand how the system behaves when multiple users access it simultaneously.

### Measures

1. Assess system performance under typical load.
2. Measure response time.
3. Identify performance bottlenecks.
4. Validate that the system meets performance requirements.

- **Virtual users:** 10-100
- **Duration:** 5-30 minutes

### k6 Configuration Pattern

```javascript
export const options = {
  stages: [
    { duration: '5m', target: 50 },
    { duration: '10m', target: 50 },
    { duration: '5m', target: 100 },
    { duration: '10m', target: 100 },
    { duration: '5m', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<1000'],
    http_req_failed: ['rate<0.05'],
  },
};
```

## What Is Stress Testing?

Stress testing pushes a system beyond normal operational capacity to identify breaking points and observe system behavior under extreme conditions.

### Measures

1. Determine maximum system capacity.
2. Identify when and how the system fails.
3. Test system recovery after failure.
4. Find performance degradation points.
5. Validate error handling under stress.

- **Virtual users:** Beyond peak load (100-500+)
- **Duration:** Medium to long (10-60 minutes)
- **Load pattern:** Gradually increases until the system breaks.
- **When to run:** Periodically to understand system limits.

### Questions to Ask Before Production

1. What is the maximum capacity?
2. How does the system fail: gracefully or catastrophically?
3. Can the system recover automatically?
4. What errors occur under extreme load?

### k6 Configuration Pattern

```javascript
export const options = {
  stages: [
    { duration: '5m', target: 100 },
    { duration: '5m', target: 200 },
    { duration: '5m', target: 300 },
    { duration: '5m', target: 400 },
    { duration: '5m', target: 500 },
    { duration: '10m', target: 500 },
    { duration: '5m', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<3000'],
    http_req_failed: ['rate<0.1'],
  },
};
```

## What Is Spike Testing?

Spike testing validates system behavior when there is a sudden, dramatic increase in load for a short period. This simulates real-world events such as flash sales and breaking news.

### Measures

1. Test the system response to sudden traffic surges.
2. Validate auto-scaling mechanisms.
3. Assess recovery time after a spike.
4. Identify whether the system maintains stability during spikes.

- **Virtual users:** Sudden jump to very high load
- **Duration:** Short spike (5-10 minutes)
- **Load pattern:** Rapid increase, brief sustain, and rapid decrease.
- **When to run:** Before major events, sales, or launches.

### k6 Configuration Pattern

```javascript
export const options = {
  stages: [
    { duration: '2m', target: 50 },
    { duration: '30s', target: 500 },
    { duration: '3m', target: 500 },
    { duration: '30s', target: 50 },
    { duration: '2m', target: 50 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'],
    http_req_failed: ['rate<0.1'],
  },
};
```

## What Is Soak Testing? (Endurance Testing)

Soak testing runs a moderate load over an extended period to identify issues that appear only after prolonged system operation, such as memory leaks, database connection exhaustion, or file growth.

### Measures

1. Detect memory leaks and resource exhaustion.
2. Identify degradation over time.
3. Test database connection pooling.
4. Validate log rotation and disk space management.
5. Assess system reliability over extended periods.

- **Virtual users:** Normal to slightly above normal load
- **Duration:** Very long (hours to days)
- **Load pattern:** Constant sustained load.
- **When to run:** Before major releases and periodically.

### Common Issues Found

1. Memory leaks causing gradual slowdown.
2. Database connection pool exhaustion.
3. Log files filling available disk space.
4. Cache invalidation issues.
5. Gradual degradation in response times.

### k6 Configuration Pattern

```javascript
export const options = {
  stages: [
    { duration: '5m', target: 50 },
    { duration: '8h', target: 50 },
    { duration: '5m', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<1000'],
    http_req_failed: ['rate<0.05'],
  },
};
```

> The extended eight-hour duration at constant load can reveal issues that shorter tests cannot detect.

## Comparison Table: All Testing Types

| Test Type | VUs         | Duration   | Load Pattern                 | Primary Goal               |
| --------- | ----------- | ---------- | ---------------------------- | -------------------------- |
| Smoke     | 1-2         | 1-5 min    | Minimal constant             | Verify basic functionality |
| Load      | 10-100      | 5-30 min   | Gradual ramp up/down         | Measure normal performance |
| Stress    | 100-500+    | 10-60 min  | Increasing to breaking point | Find capacity limits       |
| Spike     | Sudden jump | 5-10 min   | Rapid increase/decrease      | Test surge handling        |
| Soak      | 50-100      | Hours/Days | Extended constant            | Find long-term issues      |
