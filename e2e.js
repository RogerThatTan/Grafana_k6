import { sleep, check } from 'k6';
import http from 'k6/http';
const BASE_URL = 'http://localhost:3333';
const USERNAME = 'tata22223';
const PASSWORD = 'tata22223@yopmail.com1!A';

export const options = {
  vus: 1,
  duration: '3s',
  iterations: 1,
};

export default function () {
  let userRegistered = false;

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
}
