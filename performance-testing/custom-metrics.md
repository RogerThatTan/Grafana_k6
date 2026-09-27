# Custom Metrics in k6

This guide explains the custom metrics used in `test2.js` and `e2e_1.js`.

k6 has three commonly used custom metric types:

| Metric type | What it records                         | Typical question it answers              |
| ----------- | --------------------------------------- | ---------------------------------------- |
| **Trend**   | Numeric measurements                    | How long did this operation take?        |
| **Counter** | The total amount added                  | How many successful operations occurred? |
| **Rate**    | Values treated as successes or failures | What percentage of operations succeeded? |

All three types are imported from `k6/metrics`:

```javascript
import { Counter, Rate, Trend } from 'k6/metrics';
```

Choose a **Trend** for measurements where the distribution matters, a
**Counter** when you need a total, and a **Rate** when you need a success
percentage. A custom metric does not replace k6's built-in metrics; it adds a
business- or operation-specific view to the test results.

## Custom metrics in the test

The test imports `Trend` from k6:

```javascript
import { Trend } from 'k6/metrics';
```

It then creates two custom Trend metrics:

```javascript
const pizzaResponseTime = new Trend('pizza_response_time');
const pizzaRequestTime = new Trend('pizza_request_time');
```

A **Trend** records numeric values. k6 then calculates statistics such as the
average, minimum, maximum, median, and percentiles for those values.

## `pizza_response_time`

This metric is recorded here:

```javascript
pizzaResponseTime.add(response.timings.waiting);
```

`response.timings.waiting` is the time from when the request is sent until the
first byte of the response is received. It mainly represents the time spent
waiting for the server to start responding, including server processing and
network waiting.

In this test, `response` comes from this request:

```javascript
const response = http.get('https://quickpizza.grafana.com/');
```

Therefore, `pizza_response_time` measures the waiting time for the Quick Pizza
homepage request. It does not measure the `/api/pizza` request because that
request is not assigned to `response` and no value from it is added to this
Trend.

## `pizza_request_time`

This metric is recorded here:

```javascript
pizzaRequestTime.add(response.timings.sending);
```

`response.timings.sending` is the time k6 spends sending the request to the
server. It can include the time needed to send the request data over the
network.

In this test, `pizza_request_time` measures the sending time for the Quick Pizza
homepage request. Because the request is a `GET` request with no request body,
this value is usually very small.

## Counter

A **Counter** accumulates the values added to it. It is useful for counting
events such as successful orders, processed messages, or cache hits. Unlike a
Trend, a Counter does not describe the duration or distribution of each event.

The `e2e_1.js` test creates a Counter for successful orders:

```javascript
import { Counter } from 'k6/metrics';

const successfulOrders = new Counter('successful_orders');
```

Add `1` only when the operation succeeds:

```javascript
const orderCreated = check(createOrderResponse, {
  'order creation status is 200': (response) => response.status === 200,
});

if (orderCreated) {
  successfulOrders.add(1);
}
```

k6 reports the accumulated value in the custom metrics section:

```text
successful_orders........: 18
```

Use a Counter when the total number of events is more important than the
percentage of successful events. For example, use it to count successful
orders during a test. Use a Rate instead when you need to know whether the
success percentage meets a requirement.

A Counter threshold can require a minimum total:

```javascript
thresholds: {
  successful_orders: ['count>5'],
},
```

This threshold fails if fewer than six successful orders are recorded during
the test. The threshold name must exactly match the name passed to `new
Counter(...)`.

## Rate

A **Rate** measures the percentage of values that are non-zero. Add `1` for a
success and `0` for a failure. k6 calculates the rate from all recorded
values, so it is useful for business outcomes such as authentication success,
payment success, or message delivery success.

The `e2e_1.js` test records whether authentication succeeds:

```javascript
import { Rate } from 'k6/metrics';

const authenticationRate = new Rate('authentication_rate');

if (userAuthenticated) {
  authenticationRate.add(1);
} else {
  authenticationRate.add(0);
}
```

If 9 of 10 authentication attempts succeed, k6 reports a rate of `90%`:

```text
authentication_rate........: 90.00% 9 out of 10
```

Use a Rate when the denominator matters. It tells you how reliable an
operation was, not only how many times it happened. A Rate is usually a good
choice for an SLO such as "at least 99% of logins must succeed":

```javascript
thresholds: {
  authentication_rate: ['rate>0.99'],
},
```

The metric name is case-sensitive and must match exactly in the metric
definition and threshold. Record both outcomes; recording only successful
attempts would make the rate appear artificially high because failures would
not be included in the denominator.

## Trend, Counter, or Rate?

Use these questions to choose a metric:

1. Do you need percentiles, averages, or minimum and maximum values? Use a
   **Trend**.
2. Do you need the total amount of an event or value? Use a **Counter**.
3. Do you need the percentage of successful attempts? Use a **Rate**.

For example, one order workflow could use all three:

```javascript
const orderDuration = new Trend('order_duration');
const successfulOrders = new Counter('successful_orders');
const orderSuccessRate = new Rate('order_success_rate');

const start = Date.now();
const response = http.post(url, payload);
const succeeded = response.status === 200;

orderDuration.add(Date.now() - start);
successfulOrders.add(succeeded ? 1 : 0);
orderSuccessRate.add(succeeded ? 1 : 0);
```

In this example, the Trend shows how long orders take, the Counter shows the
total amount of successful orders, and the Rate shows the success percentage.

## How `.add()` works

Every time one virtual user runs the test function, these lines add one sample
value to each Trend:

```javascript
pizzaResponseTime.add(response.timings.waiting);
pizzaRequestTime.add(response.timings.sending);
```

For example, if the test runs five iterations and the waiting times are:

```text
20 ms, 25 ms, 18 ms, 30 ms, 22 ms
```

then `pizza_response_time` stores all five values. k6 uses those values to
calculate its summary:

- `avg`: average of all recorded values.
- `min`: smallest recorded value.
- `med`: middle value after sorting the values.
- `max`: largest recorded value.
- `p(90)`: value at or below which about 90% of the values fall.
- `p(95)`: value at or below which about 95% of the values fall.

The Trend does not store only the last value. Each call to `.add()` records a
new sample.

## Custom metric thresholds

The test defines these thresholds:

```javascript
pizza_response_time: ['p(95) < 200'],
pizza_request_time: ['p(95) < 200'],
```

They mean:

- The 95th percentile of homepage waiting time must be less than `200 ms`.
- The 95th percentile of homepage sending time must be less than `200 ms`.

If either condition is false, k6 marks that threshold as failed and the test
command exits with a failure status.

A threshold is a pass/fail rule. It does not change the metric or improve the
response time.

## Custom metrics versus built-in metrics

k6 automatically records built-in HTTP metrics such as:

- `http_req_duration`: total HTTP request duration.
- `http_req_failed`: percentage of failed HTTP requests.
- `http_reqs`: number of HTTP requests.

The custom metrics give the test a more focused view of specific timing parts.
For example, `pizza_response_time` focuses on the waiting portion of the
homepage request instead of the complete `http_req_duration`.

## Important detail about the API request

The test sends a second request:

```javascript
http.get('https://quickpizza.grafana.com/api/pizza', {
  tags: { name: 'api' },
});
```

The `name: 'api'` tag filters the built-in thresholds such as:

```javascript
'http_req_duration{name:api}': ['p(95) < 500'],
'http_req_failed{name:api}': ['rate<0.1'],
```

However, the custom Trend metrics currently record timing values only from the
homepage request. To record API timing in a custom Trend, capture the API
response and add one of its timing values separately:

```javascript
const apiResponse = http.get('https://quickpizza.grafana.com/api/pizza', {
  tags: { name: 'api' },
});

pizzaResponseTime.add(apiResponse.timings.waiting);
```

Use a separate Trend name if you want to keep homepage and API measurements
separate, for example `pizza_api_response_time`.
