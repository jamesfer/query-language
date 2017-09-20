import { ValueFunction } from '../value.model';

export type EvaluationScope = {
  [k: string]: ValueFunction,
};
