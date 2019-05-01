import { makeMessage } from '../../message';
import { Scope } from '../../scope';
import { TokenKind } from '../../token';
import { ExpressionKind, ListExpression } from '../../type6Lazy/expression';
import { isSubtype, makeType, mapIterator, Type } from '../../type6Lazy/type';
import { LazyValue, List, ValueKind } from '../../type6Lazy/value';
import { listType, unboundVariable } from '../../type6Lazy/value-constructors';
import { UntypedArrayExpression } from '../../untyped-expression';
import { buildListInterpreter } from '../compiler-utils/interpret-list';
import { Log } from '../compiler-utils/monoids/log';
import { LogTypeScope } from '../compiler-utils/monoids/log-type-scope';
import { evaluateExpression } from '../evaluate-expression';
import { ExpressionInterpreter } from '../interpret-expression';
import { ExpressionTyper, typeExpression } from '../type-expression';


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

export const typeArray: ExpressionTyper<UntypedArrayExpression> = (scope, inferredTypes, expression) => {
  const logScope = LogTypeScope.fromVariables(inferredTypes);
  let elementType: Type | null = null;

  // Process each element expression
  const elements = expression.elements.map((element) => {
    const typedExpression = logScope.combine(typeExpression(scope, inferredTypes, element));

    // Check the type with the existing element type
    if (typedExpression.resultType) {
      if (!elementType) {
        elementType = typedExpression.resultType;
      } else if (!isSubtype(scope, elementType, typedExpression.resultType)) {
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

  const resultType = makeType(
    async () => (elementType ? listType(await elementType.value()) : unboundVariable('T')),
    // TODO why do I have to use as any here
    elementType ? (elementType as any).constraints : [],
  );

  return logScope.wrap<ListExpression>({
    elements,
    resultType,
    kind: ExpressionKind.List,
    tokens: expression.tokens,
  });
};

export function evaluateArray(scope: Scope, expression: ListExpression): LazyValue<List> {
  return async () => ({
    kind: ValueKind.List,
    values: mapIterator(expression.elements, value => evaluateExpression(scope, value)),
  });
}
