import { sleep, check, group } from 'k6';
import http from 'k6/http';
const BASE_URL = 'http://localhost:3333';
const USERNAME = `tanvir${randomString(7)}1`;
const PASSWORD = 'tata22223@yopmail.com1!A';

function randomString(length) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';

  for (let index = 0; index < length; index += 1) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }

  return result;
}

export const options = {
  vus: 2,
  duration: '5s',
};

export default function () {
  let userRegistered = false;
  let userAuthenticated = false;
  let authToken = null;
  const USERNAME = `tanvir${randomString(7)}1`;

  group('User Registration', function () {
    const registerPayload = {
      username: USERNAME,
      password: PASSWORD,
    };

    const params = {
      headers: {
        'Content-Type': 'application/json',
      },
    };
    const regrepsonse = http.post(`${BASE_URL}/api/users`, JSON.stringify(registerPayload), params);

    userRegistered = check(regrepsonse, {
      'response code was 201': (regrepsonse) => {
        return regrepsonse.status === 201;
      },
    });

    if (!userRegistered) {
      console.error(`User Registration Failed ${regrepsonse.status} - ${regrepsonse.body}`);
    }

    sleep(1);
  });

  group('Login', function () {
    const registerPayload = {
      username: USERNAME,
      password: PASSWORD,
    };

    const loginResponse = http.post(`${BASE_URL}/api/users/token/login`, JSON.stringify(registerPayload), {
      headers: { 'Content-Type': 'application/json' },
    });

    userAuthenticated = check(loginResponse, {
      'login status is 200': (loginResponse) => loginResponse.status === 200,
      'verify that login response contains token': (loginResponse) => loginResponse.json('token') != undefined,
      'token is valid string': (loginResponse) => {
        const token = loginResponse.json('token');
        return typeof token === 'string' && token.length > 4;
      },
    });

    if (userAuthenticated) {
      authToken = loginResponse.json('token');
      console.log(`user authencticate successfully: ${USERNAME}`);
    } else {
      console.log(`user authencticate failed: ${USERNAME} - ${loginResponse.status} - ${loginResponse.body}`);
    }
  });
}
