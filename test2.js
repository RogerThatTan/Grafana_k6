import http from 'k6/http';
import { sleep, check } from 'k6';
import { Trend } from 'k6/metrics';

//Custom Metrics
//Trend

const pizzaResponseTime = new Trend('pizza_response_time'); //Track response times
const pizzaRequestTime = new Trend('pizza_request_time'); //Track response times

export const options = {
  stages: [
    { duration: '4s', target: 2 }, //Ramp up to 2 users over 4s
    { duration: '5s', target: 5 }, //Ramp up to 5 users over 4s (2 from prev + 3 form new == 5) -> Stay at 5vus for 5seconds
    { duration: '3s', target: 0 }, //Ramp down to 0 user over 3 seconds
  ],

  thresholds: {
    http_req_duration: ['p(95) < 400'],
    http_req_failed: ['rate<0.1'],
    checks: ['rate>0.9'], //more than 90% should passs
    'http_req_duration{name:api}': ['p(95) < 500'],
    'http_req_failed{name:api}': ['rate<0.1'],
    pizza_response_time: ['p(95) < 200'],
    pizza_request_time: ['p(95) < 200'],
  },
};

export default function () {
  //http.get('http://localhost:3333/');
  const response = http.get('https://quickpizza.grafana.com/');

  pizzaResponseTime.add(response.timings.waiting);
  pizzaRequestTime.add(response.timings.sending);
  check(response, {
    'status is 200': (r) => r.status === 200,
    'page contains pizza': (r) => {
      // console.log(r.body);
      r.body.includes('Pizza');
    },
  });

  http.get('https://quickpizza.grafana.com/api/pizza', {
    tags: { name: 'api' },
  });

  sleep(1);
}
