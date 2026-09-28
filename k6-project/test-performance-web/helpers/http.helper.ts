import http, { type RefinedResponse, type RequestBody } from 'k6/http';
import { env } from '../config/env';

type RequestOptions = {
  tags?: Record<string, string>;
  headers?: Record<string, string>;
};

export const get = (path: string, options: RequestOptions = {}): RefinedResponse<'text'> =>
  http.get(`${env.baseUrl}${path}`, {
    timeout: env.requestTimeout,
    tags: options.tags,
    headers: options.headers,
  });

export const post = (path: string, body: RequestBody, options: RequestOptions = {}): RefinedResponse<'text'> =>
  http.post(`${env.baseUrl}${path}`, body, {
    timeout: env.requestTimeout,
    headers: { 'Content-Type': 'application/json', ...options.headers },
    tags: options.tags,
  });

export const postJson = (path: string, body: object, options: RequestOptions = {}): RefinedResponse<'text'> =>
  post(path, JSON.stringify(body), options);
