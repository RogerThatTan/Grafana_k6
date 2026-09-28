import { check } from 'k6';
import { env } from '../config/env';
import { postJson } from './http.helper';
import { authenticationRate, loginDuration, loginFailures } from './metrics.helper';

export const randomString = (length: number): string => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';

  for (let index = 0; index < length; index += 1) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }

  return result;
};

export const register = (username: string) =>
  postJson('/api/users', { username, password: env.password }, { tags: { name: 'registration' } });

export const login = (username: string): string | null => {
  const startedAt = Date.now();
  const response = postJson(
    '/api/users/token/login',
    { username, password: env.password },
    { tags: { name: 'login' } },
  );
  const token = response.status === 200 ? response.json('token') : undefined;
  const successful = check(response, {
    'login status is 200': (res) => res.status === 200,
    'login response contains token': () => token !== undefined,
    'token is valid string': () => typeof token === 'string' && token.length > 4,
  });

  loginDuration.add(Date.now() - startedAt);
  loginFailures.add(!successful);
  authenticationRate.add(successful);
  return successful && typeof token === 'string' ? token : null;
};
