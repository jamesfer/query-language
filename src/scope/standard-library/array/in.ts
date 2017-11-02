import {
  BooleanType, FloatType, makeArrayType,
  makeFunctionType,
} from '../../../type.model';
import {
  ArrayValue, BooleanValue, LazyValue,
  Value, makeBooleanValue,
} from '../../../value.model';
import { LibraryEntry } from '../../library';
import { evaluateArguments } from '../../library-utils';
import 'rxjs/add/operator/first';
import 'rxjs/add/operator/combineLatest';
import 'rxjs/add/operator/find';
import 'rxjs/add/operator/isEmpty';

// function inFunc(item: Value, list: ArrayValue): PromiseValue<BooleanValue> {
//   // return Promise.all([a(), b()]).then(([item, list]) => {
//     let iterator = list.value/* as Iterator<Promise<Value>>*/;
//     let { value: element, done } = iterator.next();
//
//     return new Promise<BooleanValue>(resolve => {
//       if (done) {
//         resolve(TrueValue);
//       }
//       else {
//         let promise: Promise<Value | undefined>;
//         let checkValue = (el: Value | undefined) => {
//           if (!el) {
//             resolve(FalseValue);
//             return;
//           }
//
//           if (el.value === item.value) {
//             resolve(TrueValue);
//             return;
//           }
//
//           let next = iterator.next();
//           if (next.done) {
//             resolve(FalseValue);
//             return;
//           }
//
//           promise = promise.then<Value | undefined>(checkValue);
//           return next.value;
//         };
//         promise = Promise.resolve(element).then<Value | undefined>(checkValue);
//       }
//     });
//   // });
// }

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

function inFunc(item: Value, list: ArrayValue): LazyValue<BooleanValue> {
  return list.value.find(el => el.value === item.value)
    .isEmpty()
    .map(makeBooleanValue);
}

export const inArray: LibraryEntry = {
  // TODO fix type
  type: makeFunctionType([ FloatType, makeArrayType(FloatType) ], BooleanType),
  impl: evaluateArguments(inFunc),
};
