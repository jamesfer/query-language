import { BooleanValue, LazyValue } from '../../value';
import { LibraryFunction } from '../library';
import 'rxjs/add/operator/switchMap';
import { booleanType, makeFunctionType } from '../../type/constructors';


function ifFunc(condition: LazyValue<BooleanValue>, truth: LazyValue, fallacy: LazyValue): LazyValue {
  return condition.switchMap(c => c ? truth : fallacy);
}

export const _if: LibraryFunction = {
  type: makeFunctionType([ booleanType, 'T', 'T', ], 'T'),
  impl: ifFunc,
};
