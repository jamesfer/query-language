import { UntypedExpression } from '../../untyped-expression.model';
import { assertNever } from '../../utils';
import { toString } from 'lodash';

export function printExpression(expression: UntypedExpression): string {
  switch (expression.kind) {
    case 'Integer':
    case 'Float':
    case 'String':
    case 'Identifier':
      return toString(expression.value);
    case 'Array':
      return '[' + expression.elements.map(printExpression).join(', ') + ']';
    case 'FunctionCall':
      let funcExp = printExpression(expression.functionExpression);
      let args = expression.args.map(printExpression);
      if (funcExp.match(/[a-zA-Z_][a-zA-Z0-9_]*/) || args.length > 2) {
        return funcExp + '(' + args.join(', ') + ')';
      }
      return '(' + args[0] + ' ' + funcExp + ' ' + args[1] + ')';

    case 'None':
      return 'none';
    case 'Unrecognized':
      return 'unrecognized';
    default:
      return assertNever(expression);
  }
}
