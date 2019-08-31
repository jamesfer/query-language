import { assertNever } from '../../utils';
import { pMap } from '../utils';
import { LazyValue, LazyValueList, Value, ValueKind } from '../value';
import { Type } from './type';
// import { AsymmetricMatcher } from 'expect/build/asymmetricMatchers';

// class VariableMatching extends AsymmetricMatcher<string> {
//   constructor(private id: string, private state: { [k: string]: string }, public inverse: boolean = false) {
//     super(id);
//   }
//
//   asymmetricMatch(value: string) {
//     if (!(this.id in this.state)) {
//       this.state[this.id] = value;
//       console.log('updated state', this.state);
//     }
//
//     const result = value === this.state[this.id];
//     return this.inverse ? !result : result;
//   }
//
//   toString() {
//     return `Variable${this.inverse ? 'Not' : ''}Matching<${this.id}>`;
//   }
//
//   getExpectedType() {
//     return 'string';
//   }
//
//   toAsymmetricMatcher() {
//     return this.toString();
//   }
// }

async function serializeValueWithState(lazyValue: LazyValue | Value | undefined, state: { [k: string]: string }): Promise<any> {
  if (!lazyValue) {
    return undefined;
  }

  const value: Value = typeof lazyValue === 'function' ? await lazyValue() : lazyValue;
  switch (value.kind) {
    case ValueKind.Anything:
    case ValueKind.Nothing:
    case ValueKind.Boolean:
    case ValueKind.Float:
    case ValueKind.Integer:
    case ValueKind.String:
    case ValueKind.UserDefinedLiteral:
      return value;

    case ValueKind.UnboundVariable:
      return {
        ...value,
        uniqueIdentifier: expect.any(String)
      };

    case ValueKind.BoundVariable:
      return {
        ...value,
        uniqueIdentifier: expect.any(String)
      };

    case ValueKind.List:
      return {
        ...value,
        values: await serializeValueListWithState(value.values, state),
      };

    case ValueKind.Lambda:
      return {
        ...value,
        body: await serializeValueWithState(value.body, state),
      };

    case ValueKind.Application:
      return {
        ...value,
        callee: await serializeValueWithState(value.callee, state),
        parameters: await serializeValueListWithState(value.parameters, state),
      };

    case ValueKind.NativeLambda:
      return value;

    default:
      return assertNever(value);
  }
}

async function serializeValueListWithState(lazyValueList: LazyValueList, state: { [k: string]: string }): Promise<any[]> {
  return pMap(Array.from(lazyValueList()), element => serializeValueWithState(element, state));
}

export function serializeValue(value: LazyValue | Value | undefined): Promise<any> {
  return serializeValueWithState(value, {});
}

export function serializeValueList(lazyValueList: LazyValueList): Promise<any[]> {
  return serializeValueListWithState(lazyValueList, {});
}

export async function serializeType(type: Type): Promise<any> {
  const state = {};
  return {
    ...type,
    value: await serializeValueWithState(type.value, state),
    constraints: pMap(type.constraints, async constraint => ({
      ...constraint,
      child: await serializeValueWithState(constraint.child, state),
      parents: await serializeValueListWithState(constraint.parents, state),
    })),
  };
}

