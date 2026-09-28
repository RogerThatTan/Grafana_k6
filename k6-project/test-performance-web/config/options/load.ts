import { thresholds } from '../thresholds';

export const loadOptions = {
  stages: [
    { duration: '5s', target: 2 },
    { duration: '5s', target: 4 },
    { duration: '3s', target: 0 },
  ],
  thresholds,
};
