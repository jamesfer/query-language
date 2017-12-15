import { TokenKind } from '../../../token.model';

export interface Operator {
  associativity: 'Left' | 'Right',
  precedence: number,
}

export interface PrecedenceMap {
  [ k: number ]: Operator,
  slice: Operator,
  unaryMinus: Operator,
  range: Operator,
}


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
export const precedences: PrecedenceMap = {
  slice: {
    associativity: 'Left',
    precedence: 12,
  },
  unaryMinus: {
    associativity: 'Right',
    precedence: 12,
  },
  range: {
    associativity: 'Left',
    precedence: 6,
  },
  [TokenKind.ComposeOperator]: {
    associativity: 'Right',
    precedence: 13,
  },
  [TokenKind.PowerOperator]: {
    associativity: 'Right',
    precedence: 11,
  },
  [TokenKind.MultiplyOperator]: {
    associativity: 'Left',
    precedence: 10,
  },
  [TokenKind.DivideOperator]: {
    associativity: 'Left',
    precedence: 10,
  },
  [TokenKind.ModuloOperator]: {
    associativity: 'Left',
    precedence: 10,
  },
  [TokenKind.AddOperator]: {
    associativity: 'Left',
    precedence: 9,
  },
  [TokenKind.SubtractOperator]: {
    associativity: 'Left',
    precedence: 9,
  },
  [TokenKind.LessThan]: {
    associativity: 'Left',
    precedence: 7,
  },
  [TokenKind.LessEqual]: {
    associativity: 'Left',
    precedence: 7
  },
  [TokenKind.GreaterThan]: {
    associativity: 'Left',
    precedence: 7,
  },
  [TokenKind.GreaterEqual]: {
    associativity: 'Left',
    precedence: 7,
  },
  [TokenKind.Equal]: {
    associativity: 'Left',
    precedence: 6,
  },
  [TokenKind.NotEqual]: {
    associativity: 'Left',
    precedence: 6,
  },
  [TokenKind.InOperator]: {
    associativity: 'Right',
    precedence: 5,
  },
};


/**
 * Returns true if the operator can override the given precedence.
 */
export function hasHigherPrecedence(op: Operator, precedence: number): boolean {
  return op.precedence > precedence
    || op.precedence === precedence
    && op.associativity === 'Right';
}
