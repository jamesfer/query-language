import { TypedScope } from '../typed-scope.model';
import { TypedExpressionInterface } from '../../typed-expression.model';
import { StringType } from 'type.model';
import { StringLiteralExpression } from '../../build-expression/parsers/literal/string-literal';

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
