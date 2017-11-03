import { keyBy } from 'lodash';
import { buildExpression } from '../../interpret-expression';
import { Token, TokenKind } from '../../../../token.model';
import { Expression } from '../../../../expression.model';
import { FunctionCallExpression, makeFunctionCallExpression } from '../function-call';
import { makeIdentifierExpression } from '../identifier';

// From Wikipedia:
// 13 () [] .       Function call, scope, array/member access
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
  { type: TokenKind.PowerOperator, associativity: 'Right', precedence: 11 },
  { type: TokenKind.MultiplyOperator, associativity: 'Left', precedence: 10 },
  { type: TokenKind.DivideOperator, associativity: 'Left', precedence: 10 },
  { type: TokenKind.ModuloOperator, associativity: 'Left', precedence: 10 },
  { type: TokenKind.AddOperator, associativity: 'Left', precedence: 9 },
  { type: TokenKind.SubtractOperator, associativity: 'Left', precedence: 9 },
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

export function buildInfixOperatorExpression(
  tokens: Token[],
  leftExpression: Expression | null,
  operatorPrecedence: number
): FunctionCallExpression | undefined {
  const opToken = tokens[0];
  const matchingOp = operatorMap[opToken.kind];
  if (hasHigherPrecedence(matchingOp, operatorPrecedence)) {
    const newPrecedence = matchingOp.precedence;
    const rightExpression = buildExpression(tokens.slice(1), null, newPrecedence);
    const identifierExpression = makeIdentifierExpression(opToken);
    return makeFunctionCallExpression(identifierExpression, [
      leftExpression,
      rightExpression
    ]);
  }
}
