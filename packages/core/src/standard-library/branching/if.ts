import { type } from '../../compiler/type/type';
import { Boolean, LazyValue } from '../../compiler/value';
import {
  booleanType,
  functionType,
  lazyValue,
  unboundVariable,
} from '../../compiler/value-constructors';
import { NativeLibraryLambda } from '../../library';
import 'rxjs/add/operator/switchMap';

function ifImpl(condition: LazyValue<Boolean>, truth: LazyValue, fallacy: LazyValue)
: LazyValue {
  return async () => await condition() ? await truth() : await fallacy();
}

export const ifFunc: NativeLibraryLambda = {
  type: type(functionType(lazyValue(booleanType), lazyValue(unboundVariable('T')), lazyValue(unboundVariable('T')))),
  implementation: ifImpl,
};
