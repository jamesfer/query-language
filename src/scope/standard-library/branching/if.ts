import { BooleanValue, LazyValue, PromiseValue } from '../../../value.model';
import { LibraryEntry } from '../../library';
import {
  BooleanType, makeFunctionType, makeGenericType,
  makeUnionType,
} from '../../../type.model';

function ifFunc(condition: LazyValue<BooleanValue>, truth: LazyValue, fallacy: LazyValue): PromiseValue {
  return condition().then(result => result.value ? truth() : fallacy());
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
