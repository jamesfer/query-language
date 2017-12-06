import { execute } from './api';
import { expect } from 'chai';

export function testExecute(code: string, cb?: (value: any) => void): Promise<any> {
  let program = execute(code);
  if (!program.compiled) {
    throw new Error('Code failed to compile.');
  }
  if (!program.evaluated) {
    throw new Error('Code failed to evaluate.');
  }
  if (!program.result) {
    throw new Error('Code failed to produce a result.');
  }
  return program.result
    .map(value => {
      if (cb) {
        cb(value);
      }
      return value;
    })
    .toPromise();
}

export function executeExpect(code: string, expected: any): Promise<any> {
  return testExecute(code, actual => {
    expect(actual).to.equal(expected);
  });
}
