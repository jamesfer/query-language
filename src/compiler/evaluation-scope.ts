import { LazyValue } from '../value';

export type EvaluationScope = {
  [k: string]: LazyValue,
};
