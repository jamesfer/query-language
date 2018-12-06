import { head, last } from 'lodash';
import { addType, StringExpression } from '../../expression';
import { makeMessage, Message } from '../../message';
import { Scope } from '../../scope';
import { Token, TokenKind } from '../../token';
import { stringType } from '../../type/constructors';
import { UntypedStringExpression } from '../../untyped-expression';
import { tokenArrayMatches } from '../../utils';
import { LazyValue, makeStringValue, StringValue } from '../../value';
import { Observable } from 'rxjs/Observable';
import { Log } from '../compiler-utils/monoids/log';
import { ExpressionInterpreter } from '../interpret-expression';
import { ExpressionTyper } from '../type-expression';
import { LogTypeScope } from '../compiler-utils/monoids/log-type-scope';


function makeStringExpression(token: Token): UntypedStringExpression {
  const value = token.value;
  const contents = last(value) === value[0]
    ? value.slice(1, -1)
    : value.slice(1);
  return {
    kind: 'String',
    tokens: [token],
    value: contents,
  };
}

export const interpretString: ExpressionInterpreter = (tokens) => {
  if (tokenArrayMatches(tokens, TokenKind.StringLiteral)) {
    const log = Log.empty();
    const strToken = tokens[0];
    if (head(strToken.value) !== last(strToken.value)) {
      log.push(makeMessage('Error', 'String literal is missing closing quote.', strToken.end));
    }
    return log.wrap(makeStringExpression(strToken));
  }
  return Log.of(undefined);
};

export const typeString: ExpressionTyper<UntypedStringExpression> = (scope, typeVariables, expression) => {
  return LogTypeScope.wrapWithVariables(typeVariables, addType(expression, stringType));
};

export function evaluateString(scope: Scope, expression: StringExpression): LazyValue<StringValue> {
  return Observable.of(makeStringValue(expression.value));
}
