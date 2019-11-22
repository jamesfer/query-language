import { flatten, uniq } from 'lodash';
import { assertNever } from '../../../utils';
import { Expression, ExpressionKind } from '../../expression';
import { ValueKind } from '../../value';

export type BackendExpression = {
  value: string,
  dependents: string[],
  blockStatements: string[],
};

export type BackendLibraryEntry = {
  value: string;
  name?: string;
  dependents?: string[];
}

function result(value: string, ...dependents: string[]): BackendExpression {
  return { value, dependents, blockStatements: [] };
}

function map(result: BackendExpression, f: (value: string) => string): BackendExpression {
  const value = f(result.value);
  return {
    value,
    dependents: result.dependents,
    blockStatements: result.blockStatements,
  };
}

function mapN(results: BackendExpression[], f: (values: string[]) => string): BackendExpression {
  return {
    value: f(results.map(result => result.value)),
    dependents: uniq(flatten(results.map(result => result.dependents))),
    blockStatements: flatten(results.map(result => result.blockStatements)),
  };
}

function bind(result: BackendExpression, f: (value: string) => BackendExpression): BackendExpression {
  const { value, dependents, blockStatements } = f(result.value);
  return {
    value,
    dependents: uniq([...result.dependents, ...dependents]),
    blockStatements: [...result.blockStatements, ...blockStatements],
  };
}

function bindAll(results: BackendExpression[], f: (values: string[]) => string): BackendExpression {
  return results.reduceRight<BackendExpression>(
    (finalResult, result) => bind(result, () => finalResult),
    {
      value: f(results.map(result => result.value)),
      dependents: [],
      blockStatements: [],
    },
  );
}

const javascriptStandardLibrary: { [k: string]: BackendLibraryEntry } = {
  $partial: {
    value: `const $partial = (f, total, args = []) => {
      return (...newArgs) => {
        if (args.length + newArgs.length >= total) {
          return f(...args, ...newArgs);
        } else {
          return $partial(f, total, [...args, ...newArgs]);
        }
      };
    };`,
  },
  integerNumberImplementation: {
    value:`const integerNumberImplementation = {
      plus: (a, b) => a + b,
    };`,
  },
  '+': {
    value: `const plus = $partial((l, a, b) => l.plus(a, b), 3);`,
    name: 'plus',
    dependents: ['$partial'],
  },
};

async function generateJavascriptExpression(expression: Expression): Promise<BackendExpression> {
  switch (expression.kind) {
    case ExpressionKind.Nothing:
      return result('null');
    case ExpressionKind.Anything:
      return result('null');
    case ExpressionKind.String:
      return result(`'${expression.value}'`);
    case ExpressionKind.Integer:
      return result(`${expression.value}`);
    case ExpressionKind.Float:
      return result(`${expression.value}`);
    case ExpressionKind.Boolean:
      return result(`${expression.value}`);

    case ExpressionKind.Identifier: {
      const entry = javascriptStandardLibrary[expression.name];
      if (entry) {
        return {
          value: entry.name || expression.name,
          dependents: [...(entry.dependents || []), expression.name],
          blockStatements: [],
        };
      }
      return {
        value: expression.name,
        dependents: [],
        blockStatements: [],
      };
    }

    case ExpressionKind.List: {
      const elements = await Promise.all(expression.elements.map(generateJavascriptExpression));
      return mapN(elements, values => `[${values.join(',')}]`);
    }

    case ExpressionKind.Record: {
      const keys = Object.keys(expression.properties);
      const expressions = await Promise.all(keys.map(key => (
        generateJavascriptExpression(expression.properties[key])
      )));
      return mapN(expressions, values => (
        `{${values.map((value, index) => `${keys[index]}: ${value}`).join(',')}}`
      ));
    }

    case ExpressionKind.Lambda: {
      const parameters = expression.parameterNames.join(',');
      const body = await generateJavascriptExpression(expression.body);

      if (body.blockStatements.length > 0) {
        const statements = body.blockStatements.join(';\n');
        return {
          value: `(${parameters}) => {
            ${statements}
            return ${body.value};
          }`,
          dependents: body.dependents,
          blockStatements: [],
        };
      }
      return map(body, value => `(${parameters}) => ${value}`);
    }

    case ExpressionKind.Application: {
      const callee = await generateJavascriptExpression(expression.callee);
      const parameters = await Promise.all(expression.parameters.map(parameter => {
        if (parameter === null) {
          throw new Error('A parameter in an application was null');
        }
        return generateJavascriptExpression(parameter)
      }));

      return mapN([callee, ...parameters], ([calleeValue, ...parameterValues]) => (
        `${calleeValue}(${parameterValues.join(',')})`
      ));
    }

    case ExpressionKind.Binding: {
      const value = await generateJavascriptExpression(expression.value);
      const body = await generateJavascriptExpression(expression.body);
      return bind(value, value => bind(body, body => ({
        value: body,
        dependents: [],
        blockStatements: [`const ${expression.name} = ${value}`],
      })));
    }

    case ExpressionKind.Interface: {
      const memberFunctions = await Promise.all(expression.memberFunctions.map(async ({ name, type }, index) => {
        const value = await type.value();
        if (value.kind !== ValueKind.Application) {
          throw new Error('Type of member function was not function');
        }

        const callee = await value.callee();
        if (callee.kind !== ValueKind.UserDefinedLiteral || callee.name !== 'function') {
          throw new Error('Type of member function was not function');
        }

        const parameterCount = Array.from(value.parameters()).length;
        return `const ${name} = $partial((implementation, ...args) => implementation[${index}](...args), ${parameterCount});`;
      }));
      const body = await generateJavascriptExpression(expression.body);
      return bind(body, body => ({
        value: body,
        dependents: memberFunctions.length > 0 ? ['$partial'] : [],
        blockStatements: memberFunctions,
      }));
    }

    case ExpressionKind.Implementation: {
      const methods = await Promise.all(expression.memberFunctions.map(({ implementation }) => (
        generateJavascriptExpression(implementation)
      )));
      const joinedMethods = bindAll(methods, strings => strings.join(', '));
      const body = await generateJavascriptExpression(expression.body);
      const name = [
        expression.parentName,
        ...expression.parentTypeParameters.map(token => token.value),
        'Implementation',
      ].join('');
      return bind(joinedMethods, joinedMethods => bind(body, body => ({
        value: body,
        dependents: [],
        blockStatements: [`const ${name} = [${joinedMethods}];`],
      })));
    }

    case ExpressionKind.NativeLambda:
      throw new Error('Not sure how to generate native lambda');
    case ExpressionKind.PolymorphicLambda:
      throw new Error('Not sure how to generate polymorphic lambda');

    default:
      return assertNever(expression);
  }
}

export async function generateJavascript(expression: Expression): Promise<string> {
  const result = await generateJavascriptExpression(expression);
  const value = `module.exports = ${result.value};`;
  const dependents = result.dependents.map(dependent => (
    javascriptStandardLibrary[dependent].value
  ));
  return [...dependents, ...result.blockStatements, value].join('\n');
}
