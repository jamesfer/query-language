import { StringLiteralExpression } from '../../../expression.model';
import { TypedStringLiteralExpression, } from '../../../typed-expression.model';
import { TypedScope } from '../typed-scope.model';

export function parseStringLiteral(scope: TypedScope, expression: StringLiteralExpression): TypedStringLiteralExpression {
  return {
    kind: 'StringLiteral',
    resultType: { kind: 'String' },
    messages: [],
    expression,
  };
}
