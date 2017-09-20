import { parseTokens } from './src/parse-tokens/parse-tokens';
import { buildSyntaxTree } from './src/build-expression/build-expression';
import { typeSyntaxTree } from './src/type-expression/type-expression';
import { evaluateSyntaxTree } from './src/evaluate-expression/evaluate-expression';
import { extractEvaluationScope, extractTypedScope } from './src/scope/scope';
import { standardLibrary } from './src/scope/standard-library';
import { convertToScope } from './src/scope/library';

let standardScope = convertToScope(standardLibrary);
let typedScope = extractTypedScope(standardScope);
let evaluationScope = extractEvaluationScope(standardScope);

console.log('Compiling...');
console.time('execution');
let tokenList = parseTokens('5 + 10');
// console.log(tokens);
let expressionTree = buildSyntaxTree(tokenList.tokens);
// console.log(expressionTree);
// console.log(printExpression(expressionTree));
let typedExpressionTree = typeSyntaxTree(typedScope, expressionTree);
// console.log(util.inspect(typedExpressionTree, false, null));
let value = evaluateSyntaxTree(evaluationScope, typedExpressionTree);
console.timeEnd('execution');
console.log(value);

