import { loadOptions } from '../../config/options/load';
import { analysisHappyPathScenario } from '../../scenarios/analysisHappyPath.scenario';

export const options = loadOptions;

export default function () {
  analysisHappyPathScenario();
}
