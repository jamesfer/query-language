import 'rxjs/add/observable/from';
import 'rxjs/add/operator/filter';
import { Observable } from 'rxjs/Observable';
import { ArrayExpression, Expression } from '../../expression';
import { makeMessage, Message } from '../../message';
import { Scope } from '../../scope';
import { TokenKind } from '../../token';
import { makeArrayType, makeTypeVariable } from '../../type/constructors';
import { isTypeOf } from '../../type/is-type-of';
import { Type } from '../../type/type';
import { UntypedArrayExpression } from '../../untyped-expression';
import { ArrayValue, LazyValue, makeLazyArrayValue, Value } from '../../value';
import { buildListInterpreter } from '../compiler-utils/interpret-list';
import { Log } from '../compiler-utils/monoids/log';
import { evaluateExpression } from '../evaluate-expression';
import { ExpressionInterpreter } from '../interpret-expression';
import { ExpressionTyper, typeExpression } from '../type-expression';
import { LogTypeScope } from '../compiler-utils/monoids/log-type-scope';


const buildArrayList
  = buildListInterpreter(TokenKind.OpenBracket, TokenKind.CloseBracket, TokenKind.Comma);

export const interpretArray: ExpressionInterpreter = (tokens) => {
  const log = Log.empty();
  const result = log.combine(buildArrayList(tokens));
  if (result) {
    return log.wrap<UntypedArrayExpression>({
      kind: 'Array',
      elements: result.expressions,
      tokens: result.tokens,
    });
  }
  return Log.of(undefined);
};

export const typeArray: ExpressionTyper<UntypedArrayExpression> = (scope, typeVariables, expression) => {
  const logScope = LogTypeScope.fromVariables(typeVariables);
  let elementType: Type | null = null;

  // Process each element expression
  const elements = expression.elements.map((element) => {
    const typedExpression = logScope.combine(typeExpression(scope, typeVariables, element));

    // Check the type with the existing element type
    if (typedExpression.resultType) {
      if (!elementType) {
        elementType = typedExpression.resultType;
      } else if (!isTypeOf(elementType, typedExpression.resultType)) {
        logScope.push(makeMessage(
          'Error',
          'Element type does not fit into array',
          typedExpression.tokens[0],
          typedExpression.tokens[typedExpression.tokens.length],
        ));
      }
    }

    return typedExpression;
  });

  return logScope.wrap<ArrayExpression>({
    elements,
    kind: expression.kind,
    tokens: expression.tokens,
    resultType: makeArrayType(elementType || makeTypeVariable('T')),
  });
};

export function evaluateArray(scope: Scope, expression: ArrayExpression): LazyValue<ArrayValue> {
  const elements = Observable.from(expression.elements)
    .map(element => evaluateExpression(scope, element))
    .filter(element => !!element) as Observable<Observable<Value>>;
  return makeLazyArrayValue(elements.mergeAll());
}
