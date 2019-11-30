import { promises as fs } from 'fs';
import { resolve } from 'path';
import { compile, generateJavascript } from 'query-language';
import { Module } from '../command-runner';
import { Logger } from '../logger';
import getStdin = require('get-stdin');

async function loadCode(inputFile?: string): Promise<string> {
  if (!inputFile || inputFile === '-') {
    return getStdin();
  } else {
    const relativeFile = /^([.\/])/.test(inputFile) ? inputFile : `./${inputFile}`;
    const path = resolve(relativeFile);
    const buffer = await fs.readFile(path);
    return buffer.toString();
  }
}

function outputCode(logger: Logger) {
  return async (code: string, outputFile?: string): Promise<void> => {
    if (!outputFile || outputFile === '-') {
      logger(code);
    } else {
      await fs.writeFile(outputFile, code);
    }
  }
}

interface CompileInterface {
  file?: string;
  output?: string;
}

function performCompilation(logger: Logger) {
  const outputCodeFunc = outputCode(logger);
  return async (options: CompileInterface) => {
    const code = await loadCode(options.file);
    const result = await compile(code);
    if (!result.expression) {
      throw new Error('Code failed to compile');
    }

    const compiledCode = await generateJavascript(result.expression);
    await outputCodeFunc(compiledCode, options.output);
  }
}

function compileCommand(logger: Logger): Module<CompileInterface> {
  return {
    command: 'compile [file]',
    describe: 'Compile code from a file or stdin to native code',
    builder: argv => argv
      .option('output', {
        alias: 'o',
        type: 'string',
        description: 'Output file or - for stdout',
      }),
    handler: performCompilation(logger),
  };
}

export default compileCommand;
