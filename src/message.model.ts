import { Position, Token } from './token.model';
import { isArray } from 'lodash';

export type MessageLevel = 'Info' | 'Warning' | 'Error';

export interface Message {
  text: string;
  level: MessageLevel;
  begin: Position;
  end: Position;
}

export function makeMessage(level: MessageLevel, text: string, begin: Position, end?: Position): Message;
export function makeMessage(level: MessageLevel, text: string, begin: Token, end?: Token): Message;
export function makeMessage(level: MessageLevel, text: string, begin: Position | Token, end?: Position | Token): Message {
  // If end is a token
  if (end && !isArray(end)) {
    end = end.end;
  }

  // If begin is a token
  if (!isArray(begin)) {
    if (!end) {
      end = begin.end;
    }
    begin = begin.begin;
  }

  if (!end) {
    end = begin;
  }

  return { text, level, begin, end };
}
