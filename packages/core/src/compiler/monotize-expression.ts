import { Expression } from '../expression';
import { assertNever } from '../utils';
import { Type } from '../type/type';
import { keys, map, pickBy, filter } from 'lodash';
import { makeFunctionType } from '../type/constructors';
import { instantiateMethodSignature, isTypeOf } from '../type/is-type-of';

export function monotizeExpression(expression: Expression, expectedType: Type): Expression {
  switch (expression.kind) {
    case 'Integer':
    case 'Float':
    case 'Boolean':
    case 'String':
    case 'Function':
    case 'None':
    case 'Unrecognized':
      // All of these literals always have a mono-type
      return expression;

    case 'Identifier':
      // if (expression.expression) {
      //   const newExpression = monotizeExpression(expression.expression, expectedType);
      //   if (newExpression !== expression.expression) {
      //     return {
      //       ...expression,
      //       expression: newExpression,
      //     };
      //   }
      // }
      return expression;

    case 'Array':
      if (expectedType.kind === 'Array') {
        const elementType = expectedType.elementType;
        if (elementType !== null) {
          const elements = map(expression.elements, element => (
            monotizeExpression(element, elementType)
          ));
          return {
            ...expression,
            elements,
          };
        }
      }
      return expression;

    case 'FunctionCall':
      // Monotize the callee
      const usedArgTypes: Type[] = map(expression.args, 'resultType');
      const returnType = expectedType.kind === 'Function' ? expectedType.returnType : expectedType;
      const argTypes: Type[] = expectedType.kind === 'Function'
        ? [...usedArgTypes, ...expectedType.argTypes]
        : usedArgTypes;
      const calleeType = makeFunctionType(argTypes, returnType);
      const callee = monotizeExpression(expression.functionExpression, calleeType);
      const calleeMonoType = callee.resultType;

      // Monotize the arguments
      let monoArgs: (Expression | null)[];
      if (calleeMonoType && calleeMonoType.kind === 'Function') {
        monoArgs = map(expression.args, (arg, index) => {
          return arg === null ? arg : monotizeExpression(arg, calleeMonoType.argTypes[index]);
        });
      } else {
        monoArgs = expression.args;
      }

      // Return the new monotized expression
      return {
        ...expression,
        functionExpression: callee,
        args: monoArgs,
      };

    case 'Method':
      const expressionType = expression.resultType;
      if (expressionType
        && expressionType.kind === 'Function'
        && expectedType.kind === 'Function'
      ) {
        const implementationValues = filter(expression.implementations, (implementation) => {
          const type = instantiateMethodSignature(expressionType, implementation.instance);
          return isTypeOf(expectedType, type);
        });

        if (implementationValues.length > 1) {
          throw new Error('Method could not be narrowed to a monotype');
        }

        const [implementationValue] = implementationValues;
        if (!implementationValue) {
          throw new Error('No method types match the expected monotype');
        }

        return {
          kind: 'Function',
          tokens: expression.tokens,
          resultType: expectedType,
          value: implementationValue.value,
          argumentNames: implementationValue.argumentNames,
        };
      }
      return expression;

    default:
      return assertNever(expression);
  }
}

export function monotizeBaseExpression(expression: Expression): Expression {
  if (!expression.resultType) {
    return expression;
  }

  return monotizeExpression(expression, expression.resultType);
}
