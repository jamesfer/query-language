import yargs from 'yargs/yargs';
import CommandRunner from './command-runner';
import compileCommand from './compile/compile';
import { consoleLogger, Logger } from './logger';

export default function cli(logger: Logger = consoleLogger) {
  const parser = yargs([]).recommendCommands();
  return new CommandRunner(parser)
    .command(compileCommand(logger));
}
