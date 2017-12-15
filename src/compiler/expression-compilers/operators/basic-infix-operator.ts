import { keyBy } from 'lodash';
import {
  UntypedExpression,
  UntypedFunctionCallExpression,
} from '../../../untyped-expression.model';
import { Token, TokenKind } from '../../../token.model';
import { interpretExpression } from '../../interpret-expression';
import {
  makeFunctionCallExpression,
} from '../function/interpret-function-call';
import { makeIdentifierExpression } from '../identifier';

// From Wikipedia:
// 99 ()            Function call,
// 13 [] . &        Array/member access, function composition
// 12 -             Unary minus
// 11 **            Exponentiation
// 10 ! - +         (most) unary operators, sizeof and type casts (right to left)
// 9  * / %         Multiplication, division, modulo
// 8  + -           Addition and subtraction
// 7  < <= > >=     Comparisons: less-than and greater-than
// 6  == !=         Comparisons: equal and not equal
// 6  ..            Range operator
// 5  in            In operator
// 4  &&            Logical AND
// 3  ||            Logical OR
// 2  ? :           Conditional expression (ternary)
// 1  =             Assignment operators (right to left)

export interface InfixOperator {
  type: TokenKind;
  associativity: 'Left' | 'Right';
  precedence: number;
}

const operators: InfixOperator[] = [
  { type: TokenKind.ComposeOperator, associativity: 'Right', precedence: 13 },
  { type: TokenKind.PowerOperator, associativity: 'Right', precedence: 11 },
  { type: TokenKind.MultiplyOperator, associativity: 'Left', precedence: 10 },
  { type: TokenKind.DivideOperator, associativity: 'Left', precedence: 10 },
  { type: TokenKind.ModuloOperator, associativity: 'Left', precedence: 10 },
  { type: TokenKind.AddOperator, associativity: 'Left', precedence: 9 },
  { type: TokenKind.SubtractOperator, associativity: 'Left', precedence: 9 },
  { type: TokenKind.LessThan, associativity: 'Left', precedence: 7 },
  { type: TokenKind.LessEqual, associativity: 'Left', precedence: 7 },
  { type: TokenKind.GreaterThan, associativity: 'Left', precedence: 7 },
  { type: TokenKind.GreaterEqual, associativity: 'Left', precedence: 7 },
  { type: TokenKind.Equal, associativity: 'Left', precedence: 6 },
  { type: TokenKind.NotEqual, associativity: 'Left', precedence: 6 },
  { type: TokenKind.InOperator, associativity: 'Right', precedence: 5 },
];

type InfixOperatorMap = { [k: string]: InfixOperator };
let operatorMap: InfixOperatorMap = keyBy(operators, op => op.type);


function hasHigherPrecedence(
  op: InfixOperator | undefined,
  precedence: number
): boolean {
  if (op) {
    if (op.precedence > precedence
      || op.precedence === precedence && op.associativity === 'Right') {
      return true;
    }
  }
  return false;
}

export function interpretInfixOperator(
  tokens: Token[],
  leftExpression: UntypedExpression | null,
  operatorPrecedence: number
): UntypedFunctionCallExpression | undefined {
  const opToken = tokens[0];
  const matchingOp = operatorMap[opToken.kind];
  if (hasHigherPrecedence(matchingOp, operatorPrecedence)) {
    const newPrecedence = matchingOp.precedence;
    const rightExpression = interpretExpression(tokens.slice(1), null, newPrecedence);
    const identifierExpression = makeIdentifierExpression(opToken);
    return makeFunctionCallExpression(identifierExpression, [
      leftExpression,
      rightExpression
    ]);
  }
}
