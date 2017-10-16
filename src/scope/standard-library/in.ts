import {
  BooleanType, FloatType, makeArrayType,
  makeFunctionType,
} from '../../type.model';
import {
  ArrayValue, BooleanFalseValue, BooleanTrueValue, BooleanValue, LazyValue,
  PromiseValue,
  Value,
} from '../../value.model';
import { LibraryEntry } from '../library';
import { evaluateArguments } from '../library-utils';

function inFunc(item: Value, list: ArrayValue): PromiseValue<BooleanValue> {
  // return Promise.all([a(), b()]).then(([item, list]) => {
    let iterator = list.value/* as Iterator<Promise<Value>>*/;
    let { value: element, done } = iterator.next();

    return new Promise<BooleanValue>(resolve => {
      if (done) {
        resolve(BooleanTrueValue);
      }
      else {
        let promise: Promise<Value | undefined>;
        let checkValue = (el: Value | undefined) => {
          if (!el) {
            resolve(BooleanFalseValue);
            return;
          }

          if (el.value === item.value) {
            resolve(BooleanTrueValue);
            return;
          }

          let next = iterator.next();
          if (next.done) {
            resolve(BooleanFalseValue);
            return;
          }

          promise = promise.then<Value | undefined>(checkValue);
          return next.value;
        };
        promise = Promise.resolve(element).then<Value | undefined>(checkValue);
      }
    });
  // });
}

// function inFunc(a: Value, b: ArrayValue): BooleanValue {
//   let aValue = a.value;
//   let iterator = b.value;
//   let { value: element, done } = iterator.next();
//
//   while (!done) {
//     if (element.value === aValue) {
//       return BooleanTrueValue;
//     }
//     ({ value: element, done } = iterator.next());
//   }
//   return BooleanFalseValue;
// }

export const inArray: LibraryEntry = {
  // TODO fix type
  type: makeFunctionType([ FloatType, makeArrayType(FloatType) ], BooleanType),
  impl: evaluateArguments(inFunc),
};
