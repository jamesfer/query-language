import {
  UntypedBooleanExpression,
  UntypedStringExpression,
} from '../../../untyped-expression.model';
import {
  addType, BooleanExpression,
  StringExpression,
} from '../../../expression.model';
import { TypedScope } from '../typed-scope.model';
import { BooleanType, StringType } from '../../../type.model';

export function parseBooleanExpression(scope: TypedScope, expression: UntypedBooleanExpression): BooleanExpression {
  return addType(expression, BooleanType);
}
