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
  stages: [
    { duration: '5s', target: 2 },
    { duration: '5s', target: 4 },
    { duration: '3s', target: 0 },
  ],

  thresholds: {
    http_req_duration: ['p(95)<350'],
    checks: ['rate>0.90'],
    iteration_duration: ['p(95) < 8000'],
  },
};

export default function () {
  let userRegistered = false;
  let userAuthenticated = false;
  let authToken = null;
  const USERNAME = `tanvir${randomString(7)}1`;
  let orderCreated = false;
  let orderId = null;

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
      'verify that login response contains token': (loginResponse) => loginResponse.json('token') !== undefined,
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

  group('Order Management', function () {
    const orderPayload = {
      maxCaloriesPerSlice: 100,
      mustBeVegetarian: true,
      excludedIngredients: [],
      excludedTools: ['Pizza cutter'],
      maxNumberOfToppings: 9,
      minNumberOfToppings: 2,
      customName: 'Hello',
    };
    const params = {
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
    };

    const createOrderResponse = http.post(`${BASE_URL}/api/pizza`, JSON.stringify(orderPayload), params);
    orderCreated = check(createOrderResponse, {
      'Order creation status is 200': (createOrderResponse) => createOrderResponse.status === 200,
      'verify that order response contains pizza id': (createOrderResponse) =>
        createOrderResponse.json('pizza.id') !== undefined,
      'Order name matches': (createOrderResponse) => createOrderResponse.json('pizza.name') === orderPayload.customName,
    });

    if (orderCreated) {
      orderId = createOrderResponse.json('pizza.id');
      console.log(`Order created successfully: ${orderId}`);
    } else {
      console.error(`Order creation failed: ${USERNAME} - ${createOrderResponse.status} - ${createOrderResponse.body}`);
    }
    sleep(0.5);
  });
}
