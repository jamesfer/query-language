import { TypedScope } from '../typed-scope.model';
import { TypedExpressionInterface } from '../../../typed-expression.model';
import { StringLiteralExpression } from '../../interpret/interpreters/literal/string-literal';
import { StringType } from '../../../type.model';

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
