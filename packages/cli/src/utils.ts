import { CommandModule } from 'yargs';

export function handler(commandHandler: CommandModule<any, any>['handler']): CommandModule<any, any>['handler'] {
  return async (...args) => {
    const result: unknown = commandHandler(...args);
    return Promise.resolve(result).catch((error) => {
      console.log(error);
      setTimeout(() => process.exit(1), 0);
    });
  }
}
