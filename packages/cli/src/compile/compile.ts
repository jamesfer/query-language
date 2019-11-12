import { CommandModule } from 'yargs';
import { writeFile, readFile } from 'fs';
import { resolve } from 'path';
import { compile, generateJavascript } from 'query-language';
import getStdin = require('get-stdin');

interface PerformCompileOptions {
  inputFile?: string;
  outputFile?: string;
}

function loadCode(inputFile?: string): Promise<string> {
  if (!inputFile || inputFile === '-') {
    return getStdin();
  } else {
    return new Promise((res, rej) => {
      readFile(resolve(inputFile), (error) => {
        if (error) {
          rej(error);
        } else {
          res();
        }
      });
    });
  }
}

async function outputCode(code: string, outputFile?: string): Promise<void> {
  if (!outputFile || outputFile === '-') {
    process.stdout.write(code);
  } else {
    await new Promise((res, rej) => {
      writeFile(resolve(outputFile), code, (error) => {
        if (error) {
          rej(error);
        } else {
          res();
        }
      });
    });
  }
}

async function performCompilation(options: PerformCompileOptions) {
  const code = await loadCode(options.inputFile);
  const result = await compile(code);
  if (!result.expression) {
    throw new Error('Code failed to compile');
  }

  const compiledCode = generateJavascript(result.expression);
  await outputCode(compiledCode);
}

interface CompileInterface {
  file?: string;
  output?: string;
}

const compileCommand: CommandModule<CompileInterface, CompileInterface> = {
  command: 'compile [file]',
  describe: 'Compile code from a file or stdin to native code',
  builder: (argv) => (
    argv
      .option('output', {
        alias: 'o',
        type: 'string',
        description: 'Output file or - for stdout',
      })
  ),
  handler: async (args) => {
    await performCompilation({
      inputFile: args.file,
      outputFile: args.output,
    });
  },
};

export default compileCommand;
