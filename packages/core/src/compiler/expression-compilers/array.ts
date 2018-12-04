import { ArrayExpression, Expression } from '../../expression';
import { makeMessage, Message } from '../../message';
import { assignTypeVariableInScope, Scope } from '../../scope';
import { Token, TokenKind } from '../../token';
import { Type } from '../../type/type';
import { UntypedArrayExpression } from '../../untyped-expression';
import { ExpressionTyper, typeExpression } from '../type-expression';
import { buildListInterpreter } from '../compiler-utils/interpret-list';
import { ArrayValue, LazyValue, makeLazyArrayValue, Value } from '../../value';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/from';
import 'rxjs/add/operator/filter';
import { evaluateExpression } from '../evaluate-expression';
import { isTypeOf } from '../../type/is-type-of';
import { makeArrayType, makeTypeVariable, noneType } from '../../type/constructors';
import { normalizeMessageResult } from '../compiler-utils/message-store';


const buildArrayList
  = buildListInterpreter(TokenKind.OpenBracket, TokenKind.CloseBracket, TokenKind.Comma);

export function interpretArray(tokens: Token[]): UntypedArrayExpression | undefined {
  const result = buildArrayList(tokens);
  if (result) {
    const [list, messages] = result;
    return {
      kind: 'Array',
      elements: list.expressions,
      tokens: list.tokens,
      messages: normalizeMessageResult(messages),
    };
  }
}

export const typeArray: ExpressionTyper<UntypedArrayExpression> = (scope, typeVariables, expression) => {
  const messages: Message[] = [];
  const elements: Expression[] = Array(expression.elements.length);
  let elementType: Type | null = null;
  let nextScope = typeVariables;

  // Process each element expression
  for (let index = 0; index < expression.elements.length; index += 1) {
    const [inferredScope, typedExpression] = typeExpression(scope, typeVariables, expression.elements[index]);
    elements[index] = typedExpression;
    nextScope = inferredScope;

    // Check the type with the existing element type
    if (typedExpression.resultType) {
      if (!elementType) {
        elementType = typedExpression.resultType;
      } else if (!isTypeOf(elementType, typedExpression.resultType)) {
        messages.push(makeMessage(
          'Error',
          'Element type does not fit into array',
          typedExpression.tokens[0],
          typedExpression.tokens[typedExpression.tokens.length],
        ));
      }
    }
  }

  return [nextScope, {
    elements,
    kind: expression.kind,
    tokens: expression.tokens,
    resultType: makeArrayType(elementType || makeTypeVariable('T')),
    messages: expression.messages.concat(messages),
  }];
};

export function evaluateArray(scope: Scope, expression: ArrayExpression): LazyValue<ArrayValue> {
  const elements = Observable.from(expression.elements)
    .map(element => evaluateExpression(scope, element))
    .filter(element => !!element) as Observable<Observable<Value>>;
  return makeLazyArrayValue(elements.mergeAll());
}
