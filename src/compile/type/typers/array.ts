import { UntypedArrayExpression } from '../../../untyped-expression.model';
import { Message } from '../../../message.model';
import {
  isTypeOf, makeArrayType, makeUnionType,
  Type,
} from '../../../type.model';
import {
  ArrayExpression,
  Expression,
} from '../../../expression.model';
import { typeSyntaxTree } from '../type-expression';
import { TypedScope } from '../typed-scope.model';

export function parseArrayExpression(scope: TypedScope, expression: UntypedArrayExpression): ArrayExpression {
  let messages: Message[] = [];
  let elements: Expression[] = new Array(expression.elements.length);
  let elementType: Type | null = null;

  // Process each element expression
  let index = -1;
  while (++index < expression.elements.length) {
    let typedExpression = typeSyntaxTree(scope, expression.elements[index]);
    elements[index] = typedExpression;

    // Check the type with the existing element type
    if (typedExpression.resultType) {
      if (!elementType) {
        elementType = typedExpression.resultType;
      }
      else if (!isTypeOf(elementType, typedExpression.resultType)) {
        // Combine that elements type into the existing definition
        elementType = makeUnionType([elementType, typedExpression.resultType]);
      }
    }
  }

  // Extract the internal type of the union if it only has one.
  if (elementType && elementType.kind === 'Union' && elementType.types.length === 1) {
    elementType = elementType.types[0];
  }

  return {
    kind: expression.kind,
    tokens: expression.tokens,
    resultType: makeArrayType(elementType),
    messages: expression.messages.concat(messages),
    elements,
  };
}