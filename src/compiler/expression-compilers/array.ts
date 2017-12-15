import { ArrayExpression, Expression } from '../../expression.model';
import { Message } from '../../message.model';
import { Token, TokenKind, } from '../../token.model';
import { isTypeOf, makeArrayType, makeUnionType, Type } from '../../type.model';
import {
  UntypedArrayExpression,
  UntypedExpression,
} from '../../untyped-expression.model';
import { typeSyntaxTree } from '../type-expression';
import { TypedScope } from '../typed-scope.model';
import { buildList } from '../compiler-utils/list';
import { EvaluationScope } from '../evaluation-scope';
import {
  ArrayValue, LazyValue, makeLazyArrayValue,
  Value,
} from '../../value.model';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/from';
import 'rxjs/add/operator/filter';
import { evaluateExpression } from '../evaluate-expression';

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

function makeArrayExpression(elements: UntypedExpression[], tokens: Token[] = [], messages: Message[] = []): UntypedArrayExpression {
  return {
    kind: 'Array',
    elements,
    tokens,
    messages,
  };
}

let buildArrayList = buildList(TokenKind.OpenBracket, TokenKind.CloseBracket, TokenKind.Comma);

export function buildArrayExpression(tokens: Token[]): UntypedArrayExpression | undefined {
  let list = buildArrayList(tokens);
  if (list) {
    return makeArrayExpression(list.expressions, list.tokens, list.messages);
  }
}

export function evaluateArrayLiteral(scope: EvaluationScope, expression: ArrayExpression): LazyValue<ArrayValue> {
  let elements = Observable.from(expression.elements)
    .map(element => evaluateExpression(scope, element))
    .filter(element => !!element) as Observable<Observable<Value>>;
  return makeLazyArrayValue(elements.mergeAll());
}
