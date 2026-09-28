import { login, register } from '../helpers/auth.helper';

export const registerClient = (username: string) => register(username);
export const loginClient = (username: string) => login(username);
