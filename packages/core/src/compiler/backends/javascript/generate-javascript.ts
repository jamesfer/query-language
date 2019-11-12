import { flatten, uniq } from 'lodash';
import { assertNever } from '../../../utils';
import { Expression, ExpressionKind } from '../../expression';

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

function generateJavascriptExpression(expression: Expression): BackendExpression {
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
      const elements = expression.elements.map(generateJavascriptExpression);
      return mapN(elements, values => `[${values.join(',')}]`);
    }
    case ExpressionKind.Record: {
      const keys = Object.keys(expression.properties);
      const expressions = keys.map(key => generateJavascriptExpression(expression.properties[key]));
      return mapN(expressions, values => (
        `{${values.map((value, index) => `${keys[index]}: ${value}`).join(',')}}`
      ));
    }
    case ExpressionKind.Lambda: {
      const parameters = expression.parameterNames.join(',');
      const body = generateJavascriptExpression(expression.body);

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
      const callee = generateJavascriptExpression(expression.callee);
      const parameters = expression.parameters.map(parameter => {
        if (parameter === null) {
          throw new Error('A parameter in an application was null');
        }
        return generateJavascriptExpression(parameter)
      });

      return mapN([callee, ...parameters], ([calleeValue, ...parameterValues]) => (
        `${calleeValue}(${parameterValues.join(',')})`
      ));
    }
    case ExpressionKind.Binding: {
      const value = generateJavascriptExpression(expression.value);
      const body = generateJavascriptExpression(expression.body);
      return bind(value, value => bind(body, body => ({
        value: body,
        dependents: [],
        blockStatements: [`const ${expression.name} = ${value}`],
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

export function generateJavascript(expression: Expression): string {
  const result = generateJavascriptExpression(expression);
  const value = `module.exports = ${result.value};`;
  const dependents = result.dependents.map(dependent => (
    javascriptStandardLibrary[dependent].value
  ));
  return [...dependents, ...result.blockStatements, value].join('\n');
}
