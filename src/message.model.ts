export type MessageLevel = 'Info' | 'Warning' | 'Error';

export interface Message {
  text: string;
  level: MessageLevel;
}

export function makeMessage(level: MessageLevel, text: string): Message {
  return { text, level };
}
