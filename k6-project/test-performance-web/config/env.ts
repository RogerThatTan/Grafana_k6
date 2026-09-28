export const env = {
  baseUrl: __ENV.BASE_URL ?? 'http://localhost:3333',
  password: __ENV.AUTH_PASSWORD ?? '',
  requestTimeout: __ENV.REQUEST_TIMEOUT ?? '30s',
};
