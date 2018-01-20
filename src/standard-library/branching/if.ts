import {
  BooleanType,
  makeFunctionType,
  makeUnionType,
} from '../../type/type';
import { BooleanValue, LazyValue } from '../../value';
import { LibraryEntry } from '../library';
import 'rxjs/add/operator/switchMap';


function ifFunc(condition: LazyValue<BooleanValue>, truth: LazyValue, fallacy: LazyValue): LazyValue {
  return condition.switchMap(c => c ? truth : fallacy);
}

export const _if: LibraryEntry = {
  type: makeFunctionType([ BooleanType, 'T', 'F', ],
    makeUnionType([ 'T', 'F' ])),
  impl: ifFunc,
};
