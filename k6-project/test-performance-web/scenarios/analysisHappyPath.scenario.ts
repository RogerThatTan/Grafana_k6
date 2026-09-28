import { sleep, check, group } from 'k6';
import { loginClient, registerClient } from '../clients/login.client';
import { createOrder, orderPayload, retrieveOrder } from '../clients/pizzaOrder.client';
import { randomString } from '../helpers/auth.helper';

export const analysisHappyPathScenario = (): void => {
  const username = `tanvir${randomString(7)}1`;
  let token: string | null = null;
  let orderId: string | number | undefined;

  group('User Registration', () => {
    const response = registerClient(username);
    check(response, { 'response code was 201': (res) => res.status === 201 });
    sleep(1);
  });

  group('Login', () => {
    token = loginClient(username);
  });

  group('Order Management', () => {
    if (!token) return;

    const createResponse = createOrder(token);
    const orderCreated = check(createResponse, {
      'order creation status is 200': (res) => res.status === 200,
      'order response contains pizza id': (res) => res.json('pizza.id') !== undefined,
      'order name matches': (res) => res.json('pizza.name') === orderPayload.customName,
    });
    if (!orderCreated) return;

    orderId = createResponse.json('pizza.id') as string | number;
    sleep(0.5);

    const retrieveResponse = retrieveOrder(token, orderId);
    check(retrieveResponse, {
      'order retrieval status is 200': (res) => res.status === 200,
      'retrieved order id matches': (res) => res.json('id') === orderId,
      'retrieved order name matches': (res) => res.json('name') === orderPayload.customName,
    });
  });
};
