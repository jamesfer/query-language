export interface Logger {
  (message: string): void;
}

export const consoleLogger: Logger = console.log;
