import { fromPairs, unzip, zipObject, zipWith } from 'lodash';
import { makeMessage } from '../../message';
import { UntypedExpression } from '../../untyped-expression';
import { assertNever } from '../../utils';
import {
  ApplicationExpression,
  BindingExpression, DataTypeExpression,
  Expression,
  ExpressionKind,
  ImplementationExpression,
  InterfaceExpression,
  LambdaExpression,
} from '../expression';
import {
  createChildScope,
  findInterfaceInScope,
  findVariableTypeInScope,
  TypeScope,
} from '../scope';
import { lazyElementList, pMap } from '../utils';
import { LazyValue, ValueKind } from '../value';
import {
  anything,
  application,
  booleanType,
  floatType,
  functionLiteralType,
  functionType,
  integerType,
  lazyValue,
  listType,
  nothing,
  stringType,
  unboundVariable,
  userDefinedLiteral,
} from '../value-constructors';
import { convertToType } from './convert-to-type';
import { fullConverge, sequenceConverges } from './full-converge';
import { makeInferredFunctionType } from './make-inferred-function-type';
import { resolveImplicits } from './resolve-implicits';
import { State, StateResult } from './state';
import { serializeType, serializeValue } from './test-utils';
import { Type, type, TypeConstraint, TypeImplementation } from './type';
import { freeBoundVariable } from './utils';
import { applyAllSubstitutions, applyReplacementsToType } from './variable-substitutions';

async function isCallable(value: LazyValue): Promise<boolean> {
  const strictValue = await value();
  if (strictValue.kind !== ValueKind.Application) {
    return false;
  }

  const strictCallee = await strictValue.callee();
  return strictCallee.kind === ValueKind.UserDefinedLiteral
    && strictCallee.name === functionLiteralType.name;
}

async function extractParameterTypes(value: LazyValue, previous: LazyValue[] = []): Promise<[LazyValue[], LazyValue]> {
  const strictValue = await value();
  if (strictValue.kind !== ValueKind.Application) {
    return [previous, value];
  }

  const callee = await strictValue.callee();
  if (callee.kind !== ValueKind.UserDefinedLiteral || callee.name !== functionLiteralType.name) {
    return [previous, value];
  }

  const [left, right] = await Promise.all(Array.from(
    strictValue.parameters(),
    parameter => parameter(),
  ));

  if (!right) {
    return [previous, lazyValue(left)];
  }

  return extractParameterTypes(lazyValue(right), [...previous, lazyValue(left)]);
}

function expressionResult(
  resultType: Type,
  expression: Expression,
): TypeExpressionResult {
  return [resultType, (implicits) => {
    return implicits.length > 0
      ? {
        resultType: type(lazyValue(nothing)),
        kind: ExpressionKind.Application,
        tokens: expression.tokens,
        implicitParameters: [],
        parameters: implicits,
        callee: expression,
      }
      : expression;
  }];
}

function convertImplicitToExpression(implicits: Expression[]) {
  return (reference: string | number): Expression => {
    switch (typeof reference) {
      case 'number':
        return implicits[reference];

      case 'string':
        return {
          kind: ExpressionKind.Identifier,
          // TODO correctly type the implicit
          resultType: type(lazyValue(anything)),
          tokens: [],
          name: reference,
        }
    }
  };
}

export type TypeExpressionResult = [Type, (implicitParameters: Expression[]) => Expression];

export async function typeExpression(
  scope: TypeScope,
  expression: UntypedExpression,
): Promise<StateResult<TypeExpressionResult>> {
  const state = State.of(scope);
  switch (expression.kind) {
    case 'Boolean': {
      const resultType = type(lazyValue(booleanType));
      return state.wrap(expressionResult(resultType, {
        resultType,
        kind: ExpressionKind.Boolean,
        tokens: expression.tokens,
        value: expression.value,
      }));
    }

    case 'String': {
      const resultType = type(lazyValue(stringType));
      return state.wrap(expressionResult(resultType, {
        resultType,
        kind: ExpressionKind.String,
        tokens: expression.tokens,
        value: expression.value,
      }));
    }

    case 'Float': {
      const resultType = type(lazyValue(floatType));
      return state.wrap(expressionResult(resultType, {
        resultType,
        kind: ExpressionKind.Float,
        tokens: expression.tokens,
        value: expression.value,
      }));
    }

    case 'Integer': {
      const resultType = type(lazyValue(integerType));
      return state.wrap(expressionResult(resultType, {
        resultType,
        kind: ExpressionKind.Integer,
        tokens: expression.tokens,
        value: expression.value,
      }));
    }

    case 'None': {
      const resultType = type(lazyValue(nothing));
      return state.wrap(expressionResult(resultType, {
        resultType,
        kind: ExpressionKind.Nothing,
        tokens: expression.tokens,
      }));
    }

    case 'Identifier': {
      const variable = findVariableTypeInScope(state.scope(), expression.value);
      const resultType = variable || type(lazyValue(nothing));
      return state.wrap(expressionResult(resultType, {
        resultType,
        kind: ExpressionKind.Identifier,
        tokens: expression.tokens,
        name: expression.value,
      }));
    }

    case 'Array': {
      const { elements, tokens } = expression;
      const [elementTypes = [], typedElements = []] = unzip(
        await pMap(elements, state.runAsyncP1(typeExpression))
      ) as [Type[], ((i: Expression[]) => Expression)[]] | [];

      const blankVariable = lazyValue(unboundVariable('T'));
      // TODO ensure each of the element resultTypes belong to the same context
      const converges = elementTypes.map(({ value }) => fullConverge(blankVariable, value));
      const { left, right, inferred } = await state.runAsync(sequenceConverges, converges);

      // TODO
      const converged = true;
      if (!converged) {
        state.log(makeMessage(
          'Error',
          'Array element does not match element type',
          tokens[0],
          tokens[tokens.length - 1],
        ));
      }

      // Resolve any implicit parameters
      const resolvedElementTypes = elementTypes.map(type => (
        applyReplacementsToType(right, inferred, type)
      ));
      const { missing, carried } = await state.runAsync(resolveImplicits, resolvedElementTypes);

      const result = applyAllSubstitutions(left, inferred, blankVariable);
      const resultType = type(lazyValue(converged ? listType(result) : nothing), missing);
      const continuation = (implicits: Expression[]): Expression => {
        const convertImplicit = convertImplicitToExpression(implicits);
        return ({
          tokens,
          resultType,
          kind: ExpressionKind.List,
          elements: typedElements.map((element, index) => (
            element(carried[index].map(convertImplicit))
          )),
        });
      };
      return state.wrapWithSubstitutions<TypeExpressionResult>(inferred, [resultType, continuation]);
    }

    case 'Function': {
      // Create an bound variable for each of the parameters
      const argumentNames = expression.arguments.map(argument => argument.value);
      const parameterVariables = expression.arguments.map(argument => (
        freeBoundVariable(state.scope(), `${argument.value}T`)
      ));

      // Extend the scope with the new parameter types
      const childScope = createChildScope(state.scope(), {
        variables: zipObject(argumentNames, parameterVariables.map(value => ({
          valueType: type(lazyValue(value)),
        }))),
      });
      const childState = State.of(childScope);

      // Type the function body which will attempt to infer the parameter types and update the scope
      const [bodyType, typedBody] = await childState.runAsync(typeExpression, expression.value);

      // Determine the type of the whole function
      // TODO this is bugged because it assumes that every parameter's type is in the same scope
      const inferredFunctionType = await childState.runAsync(
        makeInferredFunctionType,
        bodyType,
        argumentNames,
      );

      return state.wrap<TypeExpressionResult>([inferredFunctionType, (implicits): LambdaExpression => ({
        kind: ExpressionKind.Lambda,
        parameterNames: argumentNames,
        // TODO this is probably a bug because we don't do anything with the implicits
        body: typedBody(implicits),
        resultType: inferredFunctionType,
        tokens: expression.tokens,
      })]);
    }

    case 'FunctionCall': {
      // Type the callee expression
      const [calleeType, typedCallee] = await state.runAsync(typeExpression, expression.functionExpression);

      // Type each of the arguments
      const [parameterTypes = [], typedParameters = []] = unzip(
        await pMap(expression.args, state.runAsyncP1(typeExpression))
      ) as [Type[], ((i: Expression[]) => Expression)[]] | [];

      // Check if the callee is callable
      const calleeTypeValue = calleeType.value;
      if (!await isCallable(calleeTypeValue)) {
        state.log(makeMessage(
          'Error',
          'Cannot call that expression',
          expression.tokens[0],
          expression.tokens[expression.tokens.length - 1],
        ));
        const resultType = type(lazyValue(nothing));
        return state.wrap<TypeExpressionResult>([resultType, (): ApplicationExpression => ({
          resultType,
          kind: ExpressionKind.Application,
          tokens: expression.tokens,
          parameters: typedParameters.map(parameter => parameter([])),
          callee: typedCallee([]),
        })]);
      }

      // Check if too many parameters were supplied
      const [acceptedParameters, expectedResult] = await extractParameterTypes(calleeTypeValue);
      if (typedParameters.length > acceptedParameters.length) {
        state.log(makeMessage(
          'Error',
          `Too many parameters. Expected ${acceptedParameters.length}, received ${typedParameters.length}`,
          expression.tokens[0],
          expression.tokens[expression.tokens.length - 1],
        ));
      }

      // TODO handle partial application
      // Converge all parameters with their expected type
      const expectedParameters = acceptedParameters.slice(0, typedParameters.length);
      const converges = parameterTypes.map((parameterTypes, index) => (
        fullConverge(expectedParameters[index], parameterTypes.value)
      ));
      const { left, right, inferred } = await state.runAsync(sequenceConverges, converges);

      // TODO
      // Throw an error message if the result failed to be converged
      const successful = true;
      if (!successful) {
        state.log(makeMessage(
          'Error',
          'One of the parameters failed to converge',
          expression.tokens[0],
          expression.tokens[expression.tokens.length - 1],
        ));
        const resultType = type(lazyValue(nothing));
        return state.wrap<TypeExpressionResult>([resultType, (): ApplicationExpression => ({
          resultType,
          kind: ExpressionKind.Application,
          tokens: expression.tokens,
          parameters: typedParameters.map(parameter => parameter([])),
          callee: typedCallee([]),
        })]);
      }

      // Find any implicits
      const callee = applyReplacementsToType(
        left,
        inferred,
        calleeType,
      );
      const parameters = parameterTypes.map(parameterType => applyReplacementsToType(
        right,
        inferred,
        parameterType,
      ));

      const types = [
        callee,
        ...parameters,
      ];
      const { missing, carried: [carriedCalleeImplicits, ...carriedImplicits] } = (
        await state.runAsync(resolveImplicits, types)
      );

      // Find the result type of the function
      // TODO I don't think implicits are applied to the return value which might cause bugs
      //      with return type polymorphism
      const substitutedResult = applyAllSubstitutions(left, inferred, expectedResult);
      const resultType = !successful
        ? type(lazyValue(nothing))
        : type(
          acceptedParameters.length === typedParameters.length
            ? substitutedResult
            : functionType(
                ...acceptedParameters.slice(typedParameters.length).map(parameter => (
                  applyAllSubstitutions(left, inferred, parameter)
                )),
                substitutedResult,
              ),
          missing,
        );

      return state.wrapWithSubstitutions<TypeExpressionResult>(inferred, [resultType, (implicits): ApplicationExpression => {
        const convertImplicit = convertImplicitToExpression(implicits);
        return ({
          resultType,
          kind: ExpressionKind.Application,
          tokens: expression.tokens,
          parameters: typedParameters.map((typedParameter, index) => (
            typedParameter(carriedImplicits[index].map(convertImplicit))
          )),
          callee: typedCallee(carriedCalleeImplicits.map(convertImplicit)),
        });
      }]);
    }

    case 'Binding': {
      const [valueType, typedValue] = await state.runAsync(typeExpression, expression.value);

      const childScope = createChildScope(state.scope(), {
        variables: { [expression.name]: { valueType } },
      });
      const childState = State.of(childScope);

      // Type the rest of the script after the let binding
      const [bodyType, typedBody] = await childState.runAsync(typeExpression, expression.body);

      return state.wrap<TypeExpressionResult>([
        bodyType,
        (inferred): BindingExpression => ({
          kind: ExpressionKind.Binding,
          name: expression.name,
          tokens: expression.tokens,
          resultType: bodyType,
          body: typedBody(inferred),
          // TODO this breaks if the variable value requires inferred variables
          value: typedValue([]),
        })
      ]);
    }

    case 'Interface': {
      // TODO I think I need to ditch the whole parent child thing. I don't remember why I thought
      //      it was a good idea.
      const constraint: TypeConstraint = {
        kind: 'TypeConstraint',
        parent: lazyValue(anything),
        child: lazyValue(application(
          lazyValue(userDefinedLiteral(expression.name)),
          lazyElementList(expression.typeParameters.map(typeParameter => (
            unboundVariable(typeParameter.value))
          )),
        )),
      };
      const typedMemberFunctions = expression.memberFunctions.map(({ name, expression }) => ({
          name,
          type: type(convertToType(expression), [constraint]),
      }));

      // Construct child scope with functions in interface included
      const childState = State.of(createChildScope(state.scope(), {
        variables: fromPairs(typedMemberFunctions.map(({ name, type }) => (
          [name, { valueType: type }]
        ))),
        interfaces: {
          [expression.name]: {
            memberFunctions: typedMemberFunctions,
            typeParameters: expression.typeParameters,
          },
        },
      }));

      // Type the rest of the script after the interface declaration
      const [bodyType, typedBody] = await childState.runAsync(typeExpression, expression.body);

      return state.wrap<TypeExpressionResult>([
        bodyType,
        (inferred): InterfaceExpression => ({
          kind: ExpressionKind.Interface,
          resultType: bodyType,
          body: typedBody(inferred),
          tokens: expression.tokens,
          name: expression.name,
          memberFunctions: typedMemberFunctions,
          typeParameters: expression.typeParameters,
        }),
      ]);
    }

    case 'Implementation': {
      const typedMemberFunctions: { name: string, implementation: Expression }[] = [];
      for (const memberFunction of expression.memberFunctions) {
        typedMemberFunctions.push({
          name: memberFunction.name,
          // TODO how to handle inferred parameters for member functions
          implementation: (await state.runAsync(typeExpression, memberFunction.expression))[1]([]),
        });
      }

      // Attempt to converge each of the member functions with their parent definition to correctly
      // match up unbound variables in the function with the constraints.
      let convergedMemberFunctions = typedMemberFunctions;
      const parent = findInterfaceInScope(state.scope(), expression.parentName);
      if (!parent) {
        state.log(makeMessage('Error', 'Interface parent does not exist', expression.tokens[0]))
      } else {
        if (expression.parentTypeParameters.length !== parent.typeParameters.length) {
          state.log(makeMessage('Error', 'Incorrect number of arguments to interface', expression.tokens[0]));
        }

        convergedMemberFunctions = await Promise.all(
          typedMemberFunctions.map(async ({ name, implementation }) => {
            const parentFunction = parent.memberFunctions.find(({ name: parentName }) => (
              parentName === name
            ));
            if (!parentFunction) {
              state.log(makeMessage(
                'Error',
                'Function defined in implementation does not exist in parent',
                implementation.tokens[0],
              ));
              return { name, implementation };
            }

            const replacements = await state.runAsync(sequenceConverges, [
              fullConverge(parentFunction.type.value, implementation.resultType.value)
            ]);
            return {
              name,
              implementation: {
                ...implementation,
                resultType: applyReplacementsToType(
                  replacements.right,
                  replacements.inferred,
                  implementation.resultType,
                ),
              },
            };
          }),
        );
      }

      // Construct child scope with functions in interface included
      const name = [
        expression.parentName,
        ...expression.parentTypeParameters.map(token => token.value),
        'Implementation',
      ].join('');
      const childState = State.of(createChildScope(state.scope(), {
        implementations: {
          [name]: {
            kind: 'TypeImplementation',
            parentType: lazyValue(anything),
            childType: lazyValue(application(
              lazyValue(userDefinedLiteral(expression.parentName)),
              lazyElementList(expression.parentTypeParameters.map(typeParameter => (
                findVariableTypeInScope(scope, typeParameter.value)
                  ? userDefinedLiteral(typeParameter.value)
                  : unboundVariable(typeParameter.value))
              )),
            )),
            constraints: [],
            values: fromPairs(convergedMemberFunctions.map(({ name, implementation }) => (
              [name, implementation]
            ))),
          },
        },
      }));

      // Type the rest of the script after the interface declaration
      const [bodyType, typedBody] = await childState.runAsync(typeExpression, expression.body);

      // TODO implicit parameters are not correctly carried for member functions. If on of the
      //      member functions required an implicit, it would be ignored.
      return state.wrap<TypeExpressionResult>([
        bodyType,
        (inferred): ImplementationExpression => ({
          kind: ExpressionKind.Implementation,
          resultType: bodyType,
          body: typedBody(inferred),
          tokens: expression.tokens,
          parentName: expression.parentName,
          parentTypeParameters: expression.parentTypeParameters,
          memberFunctions: typedMemberFunctions,
        }),
      ]);
    }

    case 'DataType': {
      // TODO 1. We have to treat constructors with no parameters differently than those with
      //         parameters because the type system does.
      //      2. The parser lets us specify a separate parameter list for constructors that is
      //         independent to the parameter list for the overall type but I'm not exactly sure how
      //         to combine that with the type parameters.
      const constructorTypes = expression.constructors.map(({ parameters }) => type(
        parameters.length === 0 ? lazyValue(userDefinedLiteral(expression.name)) : functionType(
          ...parameters.map(parameter => lazyValue(unboundVariable(parameter.value))),
          lazyValue(userDefinedLiteral(expression.name)),
        ))
      );

      // Construct child scope with parts of the data type present
      const childState = State.of(createChildScope(state.scope(), {
        variables: {
          [expression.name]: {
            // TODO there is currently no way to type check the number of arguments in a user
            //      defined literal
            valueType: type(lazyValue(userDefinedLiteral(expression.name))),
          },
          ...zipObject(
            expression.constructors.map(({ name }) => name),
            constructorTypes.map(valueType => ({ valueType })),
          ),
        },
      }));

      // Type the rest of the script after the interface declaration
      const [bodyType, typedBody] = await childState.runAsync(typeExpression, expression.body);

      // TODO implicit values aren't correctly carried for constructors.
      //      There isn't a need for them at the moment since you can't specify constraints on a
      //      data type, but it will turn into a bug when that is enabled.
      return state.wrap<TypeExpressionResult>([
        bodyType,
        (inferred): DataTypeExpression => ({
          kind: ExpressionKind.DataType,
          resultType: bodyType,
          body: typedBody(inferred),
          tokens: expression.tokens,
          name: expression.name,
          parameters: expression.parameters,
          constructors: zipWith(
            expression.constructors,
            constructorTypes,
            ({ name, parameters }, type) => ({
              name,
              parameters,
              type,
            }),
          ),
        }),
      ]);
    }

    case 'Unrecognized':
      // TODO handle errors better
      throw new Error('Cannot type unrecognized expression');

    default:
      return assertNever(expression);
  }
}
