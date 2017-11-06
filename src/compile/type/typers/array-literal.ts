import { Message } from '../../../message.model';
import { ArrayType, isTypeOf, makeUnionType, Type } from '../../../type.model';
import {
  TypedExpression,
  TypedExpressionInterface,
} from '../../../typed-expression.model';
import { ArrayLiteralExpression } from '../../interpret/interpreters/literal/array-literal';
import { typeSyntaxTree } from '../type-expression';
import { TypedScope } from '../typed-scope.model';

export interface TypedArrayLiteralExpression extends TypedExpressionInterface<'ArrayLiteral'> {
  resultType: ArrayType;
  elements: TypedExpression[];
}

export function parseArrayLiteral(scope: TypedScope, expression: ArrayLiteralExpression): TypedArrayLiteralExpression {
  let messages: Message[] = [];
  let elements: TypedExpression[] = new Array(expression.elements.length);
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
    kind: 'ArrayLiteral',
    resultType: {
      kind: 'Array',
      elementType,
    },
    elements,
    messages,
    expression,
  }
}
