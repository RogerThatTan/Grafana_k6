# Understanding k6 Response-Time Metrics

The k6 test made 30 HTTP requests. Its summary included these values for
`http_req_duration`:

| Metric                    |               Result |
| ------------------------- | -------------------: |
| Average (`avg`)           |              1.23 ms |
| Minimum (`min`)           | 995.1 us (0.9951 ms) |
| Median (`med`)            |              1.16 ms |
| Maximum (`max`)           |              1.89 ms |
| 90th percentile (`p(90)`) |               1.4 ms |
| 95th percentile (`p(95)`) |              1.67 ms |

> `us` means microseconds. `1 ms = 1,000 us`, so `995.1 us = 0.9951 ms`.

## What Does `http_req_duration` Measure?

`http_req_duration` is the time k6 spends sending an HTTP request and
receiving the response. It does not describe only the server processing time;
it includes the request and response time measured by k6.

## How Each Value Is Calculated

Assume the measured response times, already sorted from fastest to slowest, are:

```text
10 ms, 12 ms, 15 ms, 18 ms, 20 ms, 25 ms, 30 ms, 40 ms, 60 ms, 100 ms
```

There are 10 measurements in this example.

### Minimum (`min`)

The minimum is the fastest request:

```text
min = 10 ms
```

In the k6 output, the fastest request was `995.1 us`.

### Maximum (`max`)

The maximum is the slowest request:

```text
max = 100 ms
```

In the k6 output, the slowest request was `1.89 ms`.

### Median (`med`)

The median is the middle value after sorting the measurements.

With an even number of values, take the average of the two middle values. In
the example, the middle values are 20 ms and 25 ms:

```text
med = (20 + 25) / 2 = 22.5 ms
```

The median is also called the 50th percentile (`p(50)`). It means about half
of the requests were no slower than this value.

### Average (`avg`)

The average is the sum of all measurements divided by the number of
measurements:

```text
avg = (10 + 12 + 15 + 18 + 20 + 25 + 30 + 40 + 60 + 100) / 10
    = 33 ms
```

Unlike the median, the average can be pulled upward by a few very slow
requests.

### 90th Percentile (`p(90)`)

The 90th percentile is the response-time point at or below which about 90% of
the measurements fall. It is not the average of the fastest 90% of requests.

For the 10-value example, the approximate rank is:

```text
rank = 0.90 * (10 - 1) = 8.1
```

This falls between the 9th value (60 ms) and the 10th value (100 ms). Using
linear interpolation:

```text
p(90) = 60 + 0.1 * (100 - 60)
      = 64 ms
```

The exact percentile can vary slightly depending on the percentile algorithm
and the number of measurements. k6 calculates it from all individual samples,
not from the displayed `min`, `med`, and `max` values.

### 95th Percentile (`p(95)`)

The 95th percentile is the response-time point at or below which about 95% of
the measurements fall. It is useful for seeing slower requests that the
median hides.

Using the same example:

```text
rank = 0.95 * (10 - 1) = 8.55
p(95) = 60 + 0.55 * (100 - 60)
      = 82 ms
```

So about 95% of requests are expected to be no slower than approximately
82 ms, according to this example's interpolation method.

## Reading the k6 Result Correctly

For the reported test:

- The fastest request took `995.1 us`.
- The slowest request took `1.89 ms`.
- Half of the requests took `1.16 ms` or less, approximately.
- About 90% of requests took `1.4 ms` or less, approximately.
- About 95% of requests took `1.67 ms` or less, approximately.

The exact individual response times are not included in the terminal summary,
so the displayed k6 values cannot be recalculated from the summary alone. Also,
`p(90)` and `p(95)` are not calculated by simply taking 90% or 95% of the
maximum. k6 derives them from the complete set of recorded request durations.

## Thresholds

The test also configured this threshold:

```javascript
thresholds: {
      http_req_duration: ['p(95) < 100'],
      http_req_failed: ['rate<0.5'],
},
```

The threshold passed:

```text
http_req_duration: p(95) = 1.67 ms; requirement: p(95) < 100 ms; passed
http_req_failed:   rate = 0.00%;    requirement: rate < 0.5; passed
```

The `http_req_duration` threshold value is in milliseconds. Since `1.67 ms` is
less than `100 ms`, that threshold passed. The `http_req_failed` threshold is a
failure rate: `0.00%` is below `0.5` (50%), so it also passed. A threshold is a
pass/fail rule; it is not another metric.

## Other k6 Metrics in This Output

| Metric               | Meaning                                                                                |            Result in this run |
| -------------------- | -------------------------------------------------------------------------------------- | ----------------------------: |
| `http_req_failed`    | Percentage and count of HTTP requests that failed.                                     |         `0.00%` (`0` of `30`) |
| `http_reqs`          | Total number of HTTP requests and the request rate per second.                         |          `30` at `2.992711/s` |
| `iteration_duration` | Time needed to complete one full iteration, including the HTTP request and `sleep(1)`. | Average `1s`, maximum `1.01s` |
| `iterations`         | Total completed iterations and the iteration rate per second.                          |          `30` at `2.992711/s` |
| `vus`                | Number of virtual users active during the test.                                        |        `3` throughout the run |
| `vus_max`            | Maximum number of virtual users available to the test.                                 |                           `3` |
| `data_received`      | Total response data received and the transfer rate.                                    |         `81 kB` at `8.1 kB/s` |
| `data_sent`          | Total request data sent and the transfer rate.                                         |         `2.1 kB` at `210 B/s` |

### `http_req_duration` and `iteration_duration`

These metrics are different:

- `http_req_duration` measures the HTTP request and response: `1.23 ms` on
  average in this run.
- `iteration_duration` measures the entire k6 function loop. This includes the
  HTTP request plus `sleep(1)`, so its average was about `1s`.

### `http_reqs` and `iterations`

The script has 3 virtual users, and each iteration sends one HTTP request. As a
result, this run recorded 30 iterations and 30 HTTP requests. The rate was
approximately 3 requests and iterations per second because the script sleeps
for 1 second after each request.
