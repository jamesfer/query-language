// import { parseTokens } from './parse-tokens';
// import { TokenKind } from '../token.model';
// import { expect } from 'chai';
//
// describe('parseTokens', function () {
//   it('should recognise all symbol tokens', function () {
//     let input = `{}()[]+-%*/,`;
//     let expectedTypes: TokenKind[] = [
//         'OpenBrace',
//         'CloseBrace',
//         'OpenParen',
//         'CloseParen',
//         'OpenBracket',
//         'CloseBracket',
//         'AddOperator',
//         'SubtractOperator',
//         'ModuloOperator',
//         'MultiplyOperator',
//         'DivideOperator',
//         'Comma',
//     ];
//     let results = parseTokens(input);
//     expect(results.length).equal(expectedTypes.length);
//     results.forEach((token, index) => {
//       expect(token.kind).equal(expectedTypes[index]);
//       expect(token.begin).equal(index);
//       expect(token.end).equal(index + 1);
//       expect(token.value).equal(input.slice(index, index + 1));
//     });
//   });
//
//   describe('string literal parsing', function () {
//     it('should recognise single quoted strings', function () {
//       let input = "'string'";
//       let results = parseTokens(input);
//       expect(results.length).equal(1);
//
//       let result = results[0];
//       expect(result.kind).equal('StringLiteral');
//       expect(result.begin).equal(0);
//       expect(result.end).equal(input.length);
//       expect(result.value).equal("'string'");
//     });
//
//     it('should recognise single quoted strings containing escaped single quotes', function () {
//       let input = "'\\'str\\'ing\\''";
//       let results = parseTokens(input);
//       expect(results.length).equal(1);
//
//       let result = results[0];
//       expect(result.kind).equal('StringLiteral');
//       expect(result.begin).equal(0);
//       expect(result.end).equal(input.length);
//       expect(result.value).equal("'\\'str\\'ing\\''");
//     });
//
//     it('should recognise single quoted strings containing unescaped single quotes', function () {
//       let input = "'first\\\\''second\\\\'";
//       let results = parseTokens(input);
//       expect(results.length).equal(2);
//
//       let result = results[0];
//       expect(result.kind).equal('StringLiteral');
//       expect(result.begin).equal(0);
//       expect(result.end).equal(9);
//       expect(result.value).equal("'first\\\\'");
//
//       result = results[1];
//       expect(result.kind).equal('StringLiteral');
//       expect(result.begin).equal(9);
//       expect(result.end).equal(input.length);
//       expect(result.value).equal("'second\\\\'");
//     });
//
//     it('should recognise double quoted strings', function () {
//       let input = '"string"';
//       let results = parseTokens(input);
//       expect(results.length).equal(1);
//
//       let result = results[0];
//       expect(result.kind).equal('StringLiteral');
//       expect(result.begin).equal(0);
//       expect(result.end).equal(input.length);
//       expect(result.value).equal('"string"');
//     });
//
//     it('should recognise double quoted strings containing escaped double quotes', function () {
//       let input = '"\\"str\\"ing\\""';
//       let results = parseTokens(input);
//       expect(results.length).equal(1);
//
//       let result = results[0];
//       expect(result.kind).equal('StringLiteral');
//       expect(result.begin).equal(0);
//       expect(result.end).equal(input.length);
//       expect(result.value).equal(input);
//     });
//
//     it('should recognise single quoted strings containing unescaped double quotes', function () {
//       let input = '"first\\\\""second\\\\"';
//       let results = parseTokens(input);
//       expect(results.length).equal(2);
//
//       let result = results[0];
//       expect(result.kind).equal('StringLiteral');
//       expect(result.begin).equal(0);
//       expect(result.end).equal(9);
//       expect(result.value).equal('"first\\\\"');
//
//       result = results[1];
//       expect(result.kind).equal('StringLiteral');
//       expect(result.begin).equal(9);
//       expect(result.end).equal(input.length);
//       expect(result.value).equal('"second\\\\"');
//     });
//   });
//
//   describe('numeric literal parsing', function () {
//     it('should recognise integer literals', function () {
//       let input = '1234';
//       let results = parseTokens(input);
//       expect(results.length).equal(1);
//
//       let result = results[0];
//       expect(result.kind).equal('NumericLiteral');
//       expect(result.begin).equal(0);
//       expect(result.end).equal(input.length);
//       expect(result.value).equal(input);
//     });
//
//     it('should recognise floating literals', function () {
//       let input = '23.54';
//       let results = parseTokens(input);
//       expect(results.length).equal(1);
//
//       let result = results[0];
//       expect(result.kind).equal('NumericLiteral');
//       expect(result.begin).equal(0);
//       expect(result.end).equal(input.length);
//       expect(result.value).equal(input);
//     });
//
//     it('should recognise scientific literals', function () {
//       let input = '12.64e10';
//       let results = parseTokens(input);
//       expect(results.length).equal(1);
//
//       let result = results[0];
//       expect(result.kind).equal('NumericLiteral');
//       expect(result.begin).equal(0);
//       expect(result.end).equal(input.length);
//       expect(result.value).equal(input);
//     });
//   });
// });
