export const thresholds = {
  http_req_duration: ['p(95)<350'],
  checks: ['rate>0.90'],
  iteration_duration: ['p(95)<8000'],
  'group_duration{group:::Order Management}': ['p(95)<550'],
  Authentication_rate: ['rate>0.90'],
  sucessful_orders: ['count>5'],
};
