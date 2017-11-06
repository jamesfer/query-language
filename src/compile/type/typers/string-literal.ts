import { StringType } from '../../../type.model';
import { TypedExpressionInterface } from '../../../typed-expression.model';
import { StringLiteralExpression } from '../../interpret/interpreters/literal/string-literal';
import { TypedScope } from '../typed-scope.model';

export interface TypedStringLiteralExpression extends TypedExpressionInterface<'StringLiteral'> {
  resultType: StringType;
}

export function parseStringLiteral(scope: TypedScope, expression: StringLiteralExpression): TypedStringLiteralExpression {
  return {
    kind: 'StringLiteral',
    resultType: { kind: 'String' },
    messages: [],
    expression,
  };
}
