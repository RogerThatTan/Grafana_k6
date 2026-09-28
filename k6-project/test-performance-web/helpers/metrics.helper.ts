import { Counter, Rate, Trend } from 'k6/metrics';

export const loginDuration = new Trend('login_duration', true);
export const loginFailures = new Rate('login_failures');
export const businessRequests = new Counter('business_requests');
export const authenticationRate = new Rate('Authentication_rate');
export const successfulOrders = new Counter('sucessful_orders');
