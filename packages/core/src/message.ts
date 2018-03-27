import { Position, Token } from './token';
import { isArray } from 'lodash';

export type MessageLevel = 'Info' | 'Warning' | 'Error';

export interface Message {
  text: string;
  level: MessageLevel;
  begin: Position;
  end: Position;
}

/* tslint:disable:max-line-length */
export function makeMessage(level: MessageLevel, text: string, begin: Position, end?: Position): Message;
export function makeMessage(level: MessageLevel, text: string, begin: Token, end?: Token): Message;
export function makeMessage(level: MessageLevel, text: string, begin: Position | Token, end?: Position | Token): Message {
  const messageBegin = isArray(begin) ? begin : begin.begin;
  const messageEnd = end
    ? isArray(end) ? end : end.end
    : isArray(begin) ? begin : begin.end;
  return { text, level, begin: messageBegin, end: messageEnd };
}
/* tslint:enable:max-line-length */
