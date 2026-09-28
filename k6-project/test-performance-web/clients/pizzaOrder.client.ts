import { get, postJson } from '../helpers/http.helper';
import { successfulOrders } from '../helpers/metrics.helper';

export const orderPayload = {
  maxCaloriesPerSlice: 100,
  mustBeVegetarian: true,
  excludedIngredients: [],
  excludedTools: ['Pizza cutter'],
  maxNumberOfToppings: 9,
  minNumberOfToppings: 2,
  customName: 'Hello',
};

export const createOrder = (token: string) => {
  const response = postJson('/api/pizza', orderPayload, {
    tags: { name: 'create-order' },
    headers: { Authorization: `Bearer ${token}` },
  });
  const created = response.status === 200 && response.json('pizza.id') !== undefined;
  if (created) successfulOrders.add(1);
  return response;
};

export const retrieveOrder = (token: string, orderId: string | number) =>
  get(`/api/pizza/${orderId}`, {
    tags: { name: 'retrieve-order' },
    headers: { Authorization: `Bearer ${token}` },
  });