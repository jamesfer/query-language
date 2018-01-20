import {
  makeUnionType,
} from '../../type/constructors';
import { BooleanValue, LazyValue } from '../../value';
import { LibraryEntry } from '../library';
import 'rxjs/add/operator/switchMap';
import { booleanType, makeFunctionType } from '../../type/constructors';


function ifFunc(condition: LazyValue<BooleanValue>, truth: LazyValue, fallacy: LazyValue): LazyValue {
  return condition.switchMap(c => c ? truth : fallacy);
}

export const _if: LibraryEntry = {
  type: makeFunctionType([ booleanType, 'T', 'F', ],
    makeUnionType([ 'T', 'F' ])),
  impl: ifFunc,
};
