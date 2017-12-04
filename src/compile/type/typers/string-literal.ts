import { UntypedStringLiteralExpression } from '../../../untyped-expression.model';
import { addType, StringLiteralExpression, } from '../../../expression.model';
import { TypedScope } from '../typed-scope.model';
import { StringType } from '../../../type.model';

export function parseStringLiteral(scope: TypedScope, expression: UntypedStringLiteralExpression): StringLiteralExpression {
  return addType(expression, StringType);
}
