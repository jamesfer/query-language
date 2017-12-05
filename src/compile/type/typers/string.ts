import { UntypedStringExpression } from '../../../untyped-expression.model';
import { addType, StringExpression, } from '../../../expression.model';
import { TypedScope } from '../typed-scope.model';
import { StringType } from '../../../type.model';

export function parseStringExpression(scope: TypedScope, expression: UntypedStringExpression): StringExpression {
  return addType(expression, StringType);
}
