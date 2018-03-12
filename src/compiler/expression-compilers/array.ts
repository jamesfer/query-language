import { ArrayExpression, Expression } from '../../expression';
import { makeMessage, Message } from '../../message';
import { Token, TokenKind, } from '../../token';
import { Type } from '../../type/type';
import {
  UntypedArrayExpression,
} from '../../untyped-expression';
import { typeExpression } from '../type-expression';
import { TypedScope } from '../../scope';
import { buildListInterpreter } from '../compiler-utils/interpret-list';
import { EvaluationScope } from '../../scope';
import {
  ArrayValue, LazyValue, makeLazyArrayValue,
  Value,
} from '../../value';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/from';
import 'rxjs/add/operator/filter';
import { evaluateExpression } from '../evaluate-expression';
import { isTypeOf } from '../../type/is-type-of';
import { makeArrayType } from '../../type/constructors';
import { normalizeMessageResult } from '../compiler-utils/message-store';


let buildArrayList = buildListInterpreter(TokenKind.OpenBracket, TokenKind.CloseBracket, TokenKind.Comma);

export function interpretArray(tokens: Token[]): UntypedArrayExpression | undefined {
  let result = buildArrayList(tokens);
  if (result) {
    const [ list, messages ] = result;
    return {
      kind: 'Array',
      elements: list.expressions,
      tokens: list.tokens,
      messages: normalizeMessageResult(messages),
    };
  }
}

export function typeArray(scope: TypedScope, expression: UntypedArrayExpression): ArrayExpression {
  let messages: Message[] = [];
  let elements: Expression[] = new Array(expression.elements.length);
  let elementType: Type | null = null;

  // Process each element expression
  let index = -1;
  while (++index < expression.elements.length) {
    let typedExpression = typeExpression(scope, expression.elements[index]);
    elements[index] = typedExpression;

    // Check the type with the existing element type
    if (typedExpression.resultType) {
      if (!elementType) {
        elementType = typedExpression.resultType;
      }
      else if (!isTypeOf(elementType, typedExpression.resultType)) {
        messages.push(makeMessage(
          'Error',
          'Element type does not fit into array',
          typedExpression.tokens[0],
          typedExpression.tokens[typedExpression.tokens.length],
        ));
      }
    }
  }

  return {
    kind: expression.kind,
    tokens: expression.tokens,
    resultType: makeArrayType(elementType),
    messages: expression.messages.concat(messages),
    elements,
  };
}

export function evaluateArray(scope: EvaluationScope, expression: ArrayExpression): LazyValue<ArrayValue> {
  let elements = Observable.from(expression.elements)
    .map(element => evaluateExpression(scope, element))
    .filter(element => !!element) as Observable<Observable<Value>>;
  return makeLazyArrayValue(elements.mergeAll());
}
