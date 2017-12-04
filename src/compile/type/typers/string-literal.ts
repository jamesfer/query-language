import { UntypedStringLiteralExpression } from '../../../untyped-expression.model';
import { TypedStringLiteralExpression, } from '../../../typed-expression.model';
import { TypedScope } from '../typed-scope.model';

export function parseStringLiteral(scope: TypedScope, expression: UntypedStringLiteralExpression): TypedStringLiteralExpression {
  return {
    kind: 'StringLiteral',
    resultType: { kind: 'String' },
    value: expression.value,
    messages: [],
    expression,
  };
}
