import { TokenKind } from '../../token';
import {
  UntypedDataTypeExpression,
} from '../../untyped-expression';
import {
  bindInterpreter,
  matchAll,
  matchList, matchSeparatedList,
  matchSome,
  matchToken,
} from '../compiler-utils/matchers';
import { Log } from '../compiler-utils/monoids/log';
import { lazy } from '../compiler-utils/utils';
import { ExpressionInterpreter, interpretExpression } from '../interpret-expression';

// TODO We have to wrap this in a pointless function because of circular import issues
export const interpretDataType: ExpressionInterpreter = lazy(() => bindInterpreter(
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
));
