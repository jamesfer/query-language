import { UntypedStringLiteralExpression } from '../../../untyped-expression.model';
import { StringLiteralExpression, } from '../../../expression.model';
import { TypedScope } from '../typed-scope.model';

export function parseStringLiteral(scope: TypedScope, expression: UntypedStringLiteralExpression): StringLiteralExpression {
  return {
    kind: 'StringLiteral',
    resultType: { kind: 'String' },
    value: expression.value,
    messages: [],
    expression,
  };
}
