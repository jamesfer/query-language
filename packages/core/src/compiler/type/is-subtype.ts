import { assertNever } from '../../utils';
import { pEvery } from '../utils';
import { LazyValue, LazyValueList, ValueKind } from '../value';

async function isLazyListSubtype(
  lazyChildList: LazyValueList,
  lazyParentList: LazyValueList,
): Promise<boolean> {
  const parentElements = Array.from(lazyParentList());
  const childElements = Array.from(lazyChildList());
  if (parentElements.length !== childElements.length) {
    return false;
  }

  return pEvery(parentElements, (element, index) => isSubtype(childElements[index], element));
}

export async function isSubtype(lazyChild: LazyValue, lazyParent: LazyValue): Promise<boolean> {
  const parent = await lazyParent();
  const child = await lazyChild();
  switch (parent.kind) {
    case ValueKind.Anything:
      return true;

    case ValueKind.Nothing:
      return false;

    case ValueKind.UnboundVariable:
      return true;

    case ValueKind.BoundVariable:
    case ValueKind.UserDefinedLiteral:
      return child.kind === ValueKind.UserDefinedLiteral && child.name === parent.name;

    case ValueKind.String:
    case ValueKind.Integer:
    case ValueKind.Float:
    case ValueKind.Boolean:
      return child.kind === parent.kind && child.value === parent.value;

    case ValueKind.List: {
      if (child.kind !== ValueKind.List) {
        return false;
      }

      return isLazyListSubtype(child.values, parent.values);
    }

    case ValueKind.Record: {
      if (child.kind !== ValueKind.Record) {
        return false;
      }

      return pEvery(Object.keys(parent.values), async key => (
        child.values[key] && await isSubtype(child.values[key], parent.values[key])
      ));
    }

    case ValueKind.Application: {
      if (child.kind !== ValueKind.Application) {
        return false;
      }

      return await isSubtype(parent.callee, child.callee)
        && await isLazyListSubtype(child.parameters, parent.parameters);
    }

    case ValueKind.Lambda:
    case ValueKind.NativeLambda:
      // TODO I'm not sure how to implement these
      return false;

    default:
      return assertNever(parent);
  }
}
