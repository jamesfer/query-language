import {
  BooleanType,
  makeFunctionType,
  makeGenericType,
  makeUnionType,
} from '../../../type.model';
import { BooleanValue, LazyValue } from '../../../value.model';
import { LibraryEntry } from '../../library';

function ifFunc(condition: LazyValue<BooleanValue>, truth: LazyValue, fallacy: LazyValue): LazyValue {
  return condition.switchMap(c => c ? truth : fallacy);
}

export const ifBranch: LibraryEntry = {
  type: makeFunctionType([
    BooleanType,
    makeGenericType('T'),
    makeGenericType('F'),
  ], makeUnionType([
    makeGenericType('T'),
    makeGenericType('F'),
  ])),
  impl: ifFunc,
};
