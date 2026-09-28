import { thresholds } from '../thresholds';

export const stressOptions = {
  stages: [
    { duration: '2m', target: 25 },
    { duration: '5m', target: 50 },
    { duration: '2m', target: 100 },
    { duration: '2m', target: 0 },
  ],
  thresholds,
};
