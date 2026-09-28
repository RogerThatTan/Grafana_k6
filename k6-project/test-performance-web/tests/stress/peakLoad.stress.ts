import { stressOptions } from '../../config/options/stress';
import { analysisHappyPathScenario } from '../../scenarios/analysisHappyPath.scenario';

export const options = stressOptions;

export default function () {
  analysisHappyPathScenario();
}
