import {
  UntypedArrayExpression,
  UntypedExpression,
  UntypedFunctionCallExpression,
} from '../untyped-expression';
import { Expression, IdentifierExpression } from './expression';
import { TypeScope } from './scope';
import { type, Type } from './type/type';
import { LazyValue } from './value';
import {
  applyInferredSubstitutions,
  applySubstitutions,
  VariableSubstitution,
} from './type/variable-substitutions';
import { lazyValue, unboundVariable } from './value-constructors';

async function convergeValues(
  left: LazyValue,
  right: LazyValue,
): Promise<{ left: VariableSubstitution[], right: VariableSubstitution[], inferences: VariableSubstitution[] }> {

}

function convergeValuesWithInferred(
  left: LazyValue,
  right: LazyValue,
): (inferred: VariableSubstitution[]) => Promise<{ left: VariableSubstitution[], right: VariableSubstitution[], inferences: VariableSubstitution[] }> {
  return inferred => convergeValues(
    applyInferredSubstitutions(inferred, left),
    applyInferredSubstitutions(inferred, right)
  );
}

function combine(
  left: (inferred: VariableSubstitution[]) => Promise<{ left: VariableSubstitution[], right: VariableSubstitution[], inferences: VariableSubstitution[] }>,
  right: (inferred: VariableSubstitution[]) => Promise<{ left: VariableSubstitution[], right: VariableSubstitution[], inferences: VariableSubstitution[] }>
) {

}

// async function findImplicits(
//   type: Type,
//   replacements: VariableSubstitution[],
//   inferrences: VariableSubstitution[],
// ): Promise<{ type: Type, implicits: IdentifierExpression }> {
//
// }

// function findSubstitutions()
//   : (inferred: VariableSubstitution[])
//       => Promise<[
//         { left: VariableSubstitution[], right: VariableSubstitution[], inferrences: VariableSubstitution[] },
//         ()
//       ]> {
//
// }

async function typeArrayElements(
  elements: LazyValue[],
): Promise<{ allReplacements: VariableSubstitution[], individualReplacements: VariableSubstitution[][], allInferred: VariableSubstitution[] }> {
  if (elements.length === 0) {
    throw new Error('Empty list');
  }

  if (elements.length === 1) {
    return ({
      allReplacements: [],
      allInferred: [],
      individualReplacements: [[]],
    });
  }

  const [first, second, ...rest] = elements;
  const { allReplacements, individualReplacements, allInferred } = await typeArrayElements([second, ...rest]);
  const value = applySubstitutions(allReplacements, applyInferredSubstitutions(allInferred, second));
  return typeUniversal(first, value)({ allReplacements, individualReplacements, allInferred });
}

async function typeParameters(
  expectedParameters: LazyValue[],
  parameters: LazyValue[],
): Promise<{ allReplacements: VariableSubstitution[], individualReplacements: VariableSubstitution[][], allInferred: VariableSubstitution[] }> {
  if (expectedParameters.length !== parameters.length) {
    throw new Error('Mismatched parameter lengths');
  }

  const [firstExpected, ...otherExpected] = expectedParameters;
  const [firstParameter, ...otherParameters] = parameters;
  const { allReplacements, individualReplacements, allInferred } = await typeParameters(otherExpected, otherParameters);

  return typeUniversal(
    firstParameter,
    applySubstitutions(allReplacements, firstExpected),
  )({ allReplacements, individualReplacements, allInferred });
}

function typeUniversal(
  a: LazyValue,
  b: LazyValue,
): (a: { allReplacements: VariableSubstitution[], individualReplacements: VariableSubstitution[][], allInferred: VariableSubstitution[] }) => Promise<{ allReplacements: VariableSubstitution[], individualReplacements: VariableSubstitution[][], allInferred: VariableSubstitution[] }> {
  return async ({ allReplacements, individualReplacements, allInferred }) => {
    if (a.length !== b.length) {
      throw new Error('Mismatched parameter lengths');
    }

    const { left, right, inferences } = await convergeValuesWithInferred(a, b)(allInferred);

    return {
      allReplacements: [...allReplacements, ...right],
      // TODO safely append new replacements
      individualReplacements: [left, ...individualReplacements.map(replacements => [...replacements, ...right])],
      allInferred: [...allInferred, ...inferences],
    };
  }
}

async function typeExpression(
  scope: TypeScope,
  expression: UntypedExpression
): Promise<[Type, (inferredParameters: IdentifierExpression[]) => Expression]> {
  switch (expression.kind) {
    case 'Array': {
      const elements = await Promise.all(expression.elements.map(element => typeExpression(scope, element)));
      const { value, allInferred, elementReplacements } = await typeArrayElements(elements.map(element => element[0].value));
      return [type(value), () => 0 as any];
    }

    case 'FunctionCall': {
      const callee = await typeExpression(scope, expression.functionExpression);
      const expectedParameters = [] as LazyValue[];
      const parameters = await Promise.all((expression.args as UntypedExpression[]).map(parameter => typeExpression(scope, parameter)));
      const { allInferred, elementReplacements } = await typeParameters(expectedParameters, parameters.map(parameter => parameter[0].value));
    }
  }
}


type Result = ({ substitutions: VariableSubstitution[], inferred: VariableSubstitution[] });
type M<T> = Promise<[
  { left: VariableSubstitution[], inferences: VariableSubstitution[] },
  (nextLeft: VariableSubstitution[], nextInferred: VariableSubstitution[]) => T
]>;

type N<T> = (previousLeft: VariableSubstitution[], previousInferred: VariableSubstitution[]) => Promise<[
  { left: VariableSubstitution[], inferences: VariableSubstitution[] },
  (nextLeft: VariableSubstitution[], nextInferred: VariableSubstitution[]) => T
]>;

function fullConverge(leftValue: LazyValue, rightValue: LazyValue): N<Result> {
  return async (previousLeft: VariableSubstitution[], previousInferences: VariableSubstitution[]) => {
    const newLeft = applySubstitutions(previousLeft, applyInferredSubstitutions(previousInferences, leftValue));
    const newRight = applyInferredSubstitutions(previousInferences, rightValue);

    const { left, right, inferences } = await convergeValues(newLeft, newRight);

    return [{ left, inferences }, (nextLeft, nextInferred) => {
      return {
        // TODO safely combine subs
        substitutions: [...right, ...nextLeft],
        inferred: nextInferred,
      };
    }];
  };
}

async function sequenceConverges(converges: N<Result>[]): M<Result[]> {
  const [top, ...rest] = converges;
  const [{ left, inferences }, func] = await sequenceConverges(rest);
  const [{ left: topLeft, inferences: topInferences }, topFunc] = await top(left, inferences);
  return [{ left: [...left, ...topLeft], inferences: [...inferences, ...topInferences] }, (nextLeft, nextInferred) => {
    return [topFunc(nextLeft, nextInferred), ...func(nextLeft, nextInferred)]
  }];
}

async function runM<T>(sequenceResult: M<T>): Promise<T> {
  const [{ left, inferences }, func] = await sequenceResult;
  return func(left, inferences);
}

async function typeArray(expression: UntypedArrayExpression) {
  const elements = await Promise.all(expression.elements.map(element => typeExpression({}, element)));
  const converges = elements.map(element => (
    fullConverge(lazyValue(unboundVariable('T')), element[0].value)
  ));
  const substitutions = await runM(sequenceConverges(converges));
  const lastSubs = substitutions.length > 0 ? substitutions[0] : { substitutions: [], inferred: [] };
  const result = applySubstitutions(lastSubs.substitutions, lazyValue(unboundVariable('T')))
}

async function typeFunction(expression: UntypedFunctionCallExpression) {
  const callee = await typeExpression({}, expression.functionExpression);
  const elements = await Promise.all((expression.args as UntypedExpression[]).map(arg => typeExpression({}, arg)));
  const acceptedParameters: LazyValue[] = [];
  if (elements.length > acceptedParameters.length) {
    throw new Error('asdf');
  }

  const expectedParameters = acceptedParameters.slice(0, elements.length);
  const converges = elements.map((element, index) => (
    fullConverge(expectedParameters[index], element[0].value)
  ));
  const substitutions = await runM(sequenceConverges(converges));
}


