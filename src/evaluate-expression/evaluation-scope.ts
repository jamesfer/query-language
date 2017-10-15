import { LazyValue } from '../value.model';

export type EvaluationScope = {
  [k: string]: LazyValue,
};
