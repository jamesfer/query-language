import { ExpressionKind, IdentifierExpression } from '../compiler/expression';
import { type } from '../compiler/type/type';
import { lazyValue, userDefinedLiteral } from '../compiler/value-constructors';
import { Library, mergeLibraries } from '../library';
// import branching from './branching/branching';
import { math } from './math/math';
import { otherOperators } from './other-operators';
// import { array } from './array/array';

// Explicit type annotation is required here for generating .d.ts files
const standardLibrary: Library = mergeLibraries(
  math,
  otherOperators,
  // array,
  // branching,
  {
    variables: {
      String: {
        kind: ExpressionKind.Identifier,
        tokens: [],
        resultType: type(lazyValue(userDefinedLiteral('String'))),
        name: 'String',
      },
      Integer: {
        kind: ExpressionKind.Identifier,
        tokens: [],
        resultType: type(lazyValue(userDefinedLiteral('Integer'))),
        name: 'Integer',
      },
    }
  }
);

export default standardLibrary;
