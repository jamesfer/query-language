import {
  booleanType, floatType, makeFunctionType,
  makeInterfaceType,
} from '../../type/constructors';
import { InterfaceType } from '../../type/type';
import { makeFunctionValue } from '../../value';
import { bindBooleanFunction } from '../library-utils';

// const equalsFunction = bindBooleanFunction((a, b) => a === b);
// const equateable: InterfaceType = makeInterfaceType(null, {
//   '==': {
//     kind: 'Method',
//     resultType: makeFunctionType([ 'self', 'self' ], booleanType),
//     messages: [],
//     tokens: [],
//     implementations: {
//       'float': {
//         instance: floatType,
//         value: makeFunctionValue(equalsFunction),
//         argumentNames: [],
//       }
//     }
//   },
// });
