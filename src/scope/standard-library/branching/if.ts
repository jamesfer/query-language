import {
  BooleanType,
  makeFunctionType,
  makeUnionType,
} from '../../../type.model';
import { BooleanValue, LazyValue } from '../../../value.model';
import { LibraryEntry } from '../../library';

function ifFunc(condition: LazyValue<BooleanValue>, truth: LazyValue, fallacy: LazyValue): LazyValue {
  return condition.switchMap(c => c ? truth : fallacy);
}

export const ifBranch: LibraryEntry = {
  type: makeFunctionType([ BooleanType, 'T', 'F', ],
    makeUnionType([ 'T', 'F' ])),
  impl: ifFunc,
};
