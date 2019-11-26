import { execute } from './api';

export async function testExecute(code: string, cb?: (value: any) => void): Promise<any> {
  const program = await execute(code);
  if (!program.compiled) {
    throw new Error('Code failed to compile.');
  }
  if (!program.evaluated) {
    throw new Error('Code failed to evaluate.');
  }
  if (!program.result) {
    throw new Error('Code failed to produce a result.');
  }
  cb(program.result);
}

export function executeExpect(code: string, expected: any): Promise<any> {
  return testExecute(code, (actual) => {
    expect(actual).toEqual(expected);
  });
}
