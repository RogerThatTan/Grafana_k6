import { smokeOptions } from '../../config/options/smoke';
import { analysisHappyPathScenario } from '../../scenarios/analysisHappyPath.scenario';

export const options = smokeOptions;

export default function () {
  analysisHappyPathScenario();
}
