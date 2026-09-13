# Custom Metrics in k6

This guide explains the custom metrics used in `test2.js`.

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
