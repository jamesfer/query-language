import { makeMessage } from '../../message';
import { Token, TokenKind } from '../../token';
import {
  makeUntypedUnrecognizedExpression,
  UntypedBindingExpression,
  UntypedExpression,
} from '../../untyped-expression';
import { tokenArrayMatches } from '../../utils';
import { Log } from '../compiler-utils/monoids/log';
import { ExpressionInterpreter, interpretExpression } from '../interpret-expression';

function makeBindingExpression(name: string, value: UntypedExpression, body: UntypedExpression, tokens: Token[]): UntypedBindingExpression {
  return {
    tokens,
    name,
    value,
    body,
    kind: 'Binding',
  };
}

export const interpretBinding: ExpressionInterpreter = (tokens) => {
  if (tokenArrayMatches(tokens, TokenKind.Keyword) && tokens[0].value === 'let') {
    const log = Log.empty();
    let tokenCount = 1;
    let nameToken: Token | undefined;

    if (tokens.length <= tokenCount || tokens[tokenCount].kind !== TokenKind.Identifier) {
      log.append(makeMessage(
        'Error',
        'Missing identifier after let keyword',
        tokens[tokenCount - 1].end,
      ));
    } else {
      nameToken = tokens[tokenCount];
      tokenCount += 1;
    }

    if (tokens[tokenCount].kind !== TokenKind.Equal) {
      log.append(makeMessage(
        'Error',
        'Missing equals sign after variable name in let binding',
        tokens[tokenCount - 1].end,
      ));
    } else {
      tokenCount += 1;
    }

    const value = log.combine(interpretExpression(tokens.slice(tokenCount)))
      || makeUntypedUnrecognizedExpression([]);
    if (value.kind === 'Unrecognized') {
      log.append(makeMessage(
        'Error',
        'Missing variable value in let binding',
        tokens[tokenCount - 1].end,
      ));
    }

    const body = value.kind === 'Unrecognized'
      ? makeUntypedUnrecognizedExpression([])
      : log.combine(interpretExpression(tokens.slice(tokenCount + value.tokens.length)))
        || makeUntypedUnrecognizedExpression([]);
    if (body.kind === 'Unrecognized') {
      log.append(makeMessage(
        'Error',
        'Missing program body after let binding',
        tokens[tokenCount - 1].end,
      ));
    }

    return Log.of(makeBindingExpression(
      nameToken ? nameToken.value : '',
      value,
      body,
      tokens.slice(0, tokenCount + value.tokens.length + body.tokens.length),
    ));
  }
  return Log.of(undefined);
};
