import { Token, TokenKind } from '../../token';
import {
  makeUntypedUnrecognizedExpression,
  UntypedExpression, UntypedFunctionExpression,
  UntypedInterfaceExpression,
} from '../../untyped-expression';
import {
  bindInterpreter,
  matchAll,
  matchList,
  matchSome,
  matchToken,
} from '../compiler-utils/matchers';
import { Log } from '../compiler-utils/monoids/log';
import { lazy } from '../compiler-utils/utils';
import { ExpressionInterpreter, interpretExpression } from '../interpret-expression';
import { interpretFunction } from './function';

interface FunctionDeclaration {
  identifier?: Token;
  colon?: Token;
  func?: UntypedFunctionExpression;
  tokens: Token[];
}

const interpretFunctionDeclaration: ExpressionInterpreter<FunctionDeclaration> = bindInterpreter(
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

// TODO We have to wrap this in a pointless function because of circular import issues
export const interpretInterface: ExpressionInterpreter = lazy(() => bindInterpreter(
  matchAll([
    matchAll([
      matchToken(TokenKind.Keyword, ({ value }) => value === 'interface'),
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
        interpretFunctionDeclaration,
        matchToken(TokenKind.Comma),
        matchToken(TokenKind.CloseBrace),
        'Missing comma in interface',
        'Missing method definition in interface',
        'Missing closing brace of interface',
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
  }) => Log.of<UntypedInterfaceExpression>({
    body,
    tokens,
    kind: 'Interface',
    name: identifier?.tokens?.[0]?.value || '',
    typeParameters: typeParameters?.items?.map(({ tokens: [token] }) => token) || [],
    memberFunctions: memberFunctions?.items?.map(({ identifier, func }) => ({
      name: identifier?.value || '',
      expression: func || makeUntypedUnrecognizedExpression([]),
    })) || [],
  }),
));
