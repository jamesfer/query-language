import { UntypedExpression } from '../../untyped-expression.model';
import { assertNever } from '../../utils';

export function printExpression(expression: UntypedExpression): string {
  switch (expression.kind) {
    case 'Numeric':
    case 'String':
      return expression.tokens[0].value;
    case 'Array':
      return '[' + expression.elements.map(printExpression).join(', ') + ']';
    case 'FunctionCall':
      let funcExp = printExpression(expression.functionExpression);
      if (funcExp.match(/[a-zA-Z_][a-zA-Z0-9_]*/) || expression.args.length > 2) {
        return funcExp + '(' + expression.args.map(printExpression).join(', ') + ')';
      }
      let args = expression.args.map(printExpression);
      return '(' + args[0] + ' ' + funcExp + ' ' + args[1] + ')';
    case 'Identifier':
      return expression.value;
    case 'None':
      return 'none';
    case 'Unrecognized':
      return 'unrecognized';
    default:
      return assertNever(expression);
  }
}
