import 'rxjs/add/operator/combineLatest';
import 'rxjs/add/operator/first';
import {
  BooleanType,
  makeArrayType,
  makeFunctionType,
} from '../../../type.model';
import {
  ArrayValue,
  BooleanValue,
  LazyValue,
  makeBooleanValue,
  Value,
} from '../../../value.model';
import { LibraryEntry } from '../../library';
import { evaluateArguments } from '../../library-utils';

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
  return list.value.first(el => el.value === item.value, () => true, false)
    .map(makeBooleanValue);
}

export const inArray: LibraryEntry = {
  type: makeFunctionType([ 'T', makeArrayType('T') ], BooleanType),
  impl: evaluateArguments(inFunc),
};
