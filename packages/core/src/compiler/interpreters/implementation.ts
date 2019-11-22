import { Token, TokenKind } from '../../token';
import {
  makeUntypedUnrecognizedExpression,
  UntypedFunctionExpression,
  UntypedImplementationExpression,
} from '../../untyped-expression';
import {
  bindInterpreter,
  matchAll,
  matchList,
  matchSome,
  matchToken,
} from '../compiler-utils/matchers';
import { Log } from '../compiler-utils/monoids/log';
import { ExpressionInterpreter, interpretExpression } from '../interpret-expression';
import { interpretFunction } from './function';

interface FunctionImplementation {
  identifier?: Token;
  colon?: Token;
  func?: UntypedFunctionExpression;
  tokens: Token[];
}

const interpretFunctionImplementation: ExpressionInterpreter<FunctionImplementation> = bindInterpreter(
  matchSome([
    matchToken(TokenKind.Identifier),
    matchToken(TokenKind.Colon),
    interpretFunction,
  ]),
  ({ tokens, results: [identifier, colon, func] }) => Log.of({
    func,
    tokens,
    identifier: identifier?.tokens?.[0],
    colon: colon?.tokens?.[0],
  }),
);

export const interpretImplementation: ExpressionInterpreter = (t, p, pre) => bindInterpreter(
  matchAll([
    matchAll([
      matchToken(TokenKind.Keyword, ({ value }) => value === 'implement'),
      matchToken(TokenKind.Identifier),
      matchList(
        matchToken(TokenKind.OpenParen),
        matchToken(TokenKind.Identifier),
        matchToken(TokenKind.Comma),
        matchToken(TokenKind.CloseParen),
        'Missing comma in type parameter list',
        'Missing identifier in type parameter list',
        'Missing closing parenthesis in type parameter list',
        'Missing identifier in type parameter list',
      ),
      matchList(
        matchToken(TokenKind.OpenBrace),
        interpretFunctionImplementation,
        matchToken(TokenKind.Comma),
        matchToken(TokenKind.CloseBrace),
        'Missing comma in interface implementation',
        'Missing method definition in interface implementation',
        'Missing closing brace of interface implementation',
      ),
    ]),
    interpretExpression,
  ]),
  ({
    tokens,
    results: [
      {
        results: [
          _,
          identifier,
          typeParameters,
          memberFunctions,
        ],
      },
      body,
    ],
  }) => Log.of<UntypedImplementationExpression>({
    body,
    tokens,
    kind: 'Implementation',
    parentName: identifier?.tokens?.[0]?.value || '',
    parentTypeParameters: typeParameters?.items?.map(({ tokens: [token] }) => token),
    memberFunctions: memberFunctions?.items?.map(({ identifier, func }) => ({
      name: identifier?.value || '',
      expression: func || makeUntypedUnrecognizedExpression([]),
    })) || [],
  }),
)(t, p, pre);
