import { Arguments, Argv, CommandModule } from 'yargs';

type CommandHandler<T> = (argv: Arguments<T>) => Promise<void>;

export interface Module<T> extends Omit<CommandModule<T, T>, 'handler'> {
  handler: CommandHandler<T>;
}

interface QueuedCommand<T> {
  argv: Arguments<T>;
  handler: CommandHandler<T>;
}

class CommandRunner<T> {
  private commandQueue: QueuedCommand<T>[] = [];

  constructor(public parser: Argv<T>) {}

  command(module: Module<T>): CommandRunner<T> {
    this.parser.command({
      ...module,
      handler: (argv) => {
        this.commandQueue.push({ argv, handler: module.handler });
      },
    });
    return this;
  }

  async parse(argv: ReadonlyArray<string>): Promise<void> {
    this.commandQueue = [];
    await this.runParserAsync(argv);
    for (const { argv, handler } of this.commandQueue) {
      await handler(argv);
    }
  }

  private runParserAsync(argv: ReadonlyArray<string>): Promise<void> {
    return new Promise((resolve, reject) => {
      this.parser.parse(argv, {}, (error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }
}

export default CommandRunner;
