import { Token, TokenKind } from '../../token';
import {
  makeUntypedUnrecognizedExpression, UntypedDataTypeExpression,
  UntypedFunctionExpression,
} from '../../untyped-expression';
import {
  bindInterpreter,
  matchAll,
  matchList, matchNothing, matchSeparatedList,
  matchSome,
  matchToken, optionallyMatch,
} from '../compiler-utils/matchers';
import { Log, LogValue } from '../compiler-utils/monoids/log';
import { ExpressionInterpreter, interpretExpression } from '../interpret-expression';
import { interpretFunction } from './function';

interface FunctionDeclaration {
  identifier?: Token;
  colon?: Token;
  func?: UntypedFunctionExpression;
  tokens: Token[];
}

const interpretDataTypeDeclaration: ExpressionInterpreter<FunctionDeclaration> = bindInterpreter(
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
export const interpretDataType: ExpressionInterpreter = (t, p, pre) => bindInterpreter(
  matchAll([
    matchAll([
      matchToken(TokenKind.Keyword, ({ value }) => value === 'datatype'),
      matchToken(TokenKind.Identifier),
      matchSome([
        matchList(
          matchToken(TokenKind.OpenParen),
          matchToken(TokenKind.Identifier),
          matchToken(TokenKind.Comma),
          matchToken(TokenKind.CloseParen),
          'Missing comma in data type parameter list',
          'Missing identifier in data type parameter list',
          'Missing closing parenthesis in data type parameter list',
        ),
        matchToken(TokenKind.Equal),
        matchToken(TokenKind.Pipe)
      ]),
      matchSeparatedList(
        matchSome([
          matchToken(TokenKind.Identifier),
          matchList(
            matchToken(TokenKind.OpenParen),
            matchToken(TokenKind.Identifier),
            matchToken(TokenKind.Comma),
            matchToken(TokenKind.CloseParen),
            'Missing comma in data type parameter list',
            'Missing identifier in data type parameter list',
            'Missing closing parenthesis in data type parameter list',
          ),
        ]),
        matchToken(TokenKind.Pipe),
        'Missing pipe in data type constructor list',
        'Missing identifier in type parameter list',
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
          {
            results: [
              parameters,
            ]
          },
          constructors,
        ],
      },
      body,
    ],
  }) => Log.of<UntypedDataTypeExpression>({
    body,
    tokens,
    kind: 'DataType',
    name: identifier?.tokens?.[0]?.value || '',
    parameters: parameters?.items?.map(({ tokens: [token] }) => token) || [],
    constructors: constructors?.items?.map(({ results: [constructorIdentifier, parameters] }) => ({
      name: constructorIdentifier?.tokens?.[0]?.value || '',
      parameters: parameters?.items.map(({ tokens: [token] }) => token) || [],
    })),
  }),
)(t, p, pre);
