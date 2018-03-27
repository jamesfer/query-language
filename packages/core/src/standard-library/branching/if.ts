import { BooleanValue, LazyValue } from '../../value';
import { LibraryFunction } from '../library';
import 'rxjs/add/operator/switchMap';
import { booleanType, makeFunctionType } from '../../type/constructors';

function ifImpl(condition: LazyValue<BooleanValue>, truth: LazyValue, fallacy: LazyValue)
: LazyValue {
  return condition.switchMap(c => c.value ? truth : fallacy);
}

export const ifFunc: LibraryFunction = {
  type: makeFunctionType([booleanType, 'T', 'T'], 'T'),
  impl: ifImpl,
};
