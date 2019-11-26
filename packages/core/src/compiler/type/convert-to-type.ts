import { UntypedExpression } from '../../untyped-expression';
import { assertNever } from '../../utils';
import { LazyValue } from '../value';
import {
  functionType,
  lazyValue,
  unboundVariable,
  userDefinedLiteral,
} from '../value-constructors';

export function convertToType(expression: UntypedExpression): LazyValue {
  switch (expression.kind) {
    case 'Function':
      return functionType(
        ...expression.arguments.map(parameter => lazyValue(unboundVariable(parameter.value))),
        convertToType(expression.value),
      );
    case 'Identifier':
      return lazyValue(userDefinedLiteral(expression.value));

    case 'String':
      // return lazyValue(userDefinedLiteral(expression.value));
    case 'Float':
      // return lazyValue(userDefinedLiteral(expression.value.toString()));
    case 'Integer':
      // break;
    case 'Boolean':
      // break;
    case 'None':
      // break;
    case 'Array':
      // break;
    case 'FunctionCall':
      // break;
    case 'Unrecognized':
      // break;
    case 'Binding':
      // break;
    case 'Interface':
      // break;
    case 'DataType':
      // break;
    case 'Implementation':
      // break;
      throw new Error('Not sure how to type these expressions right now');

    default:
      return assertNever(expression);
  }
}
