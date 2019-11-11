import { Monoid, MonoidValue } from './monoid';
import { Message } from '../../../message';

export type LogValue<T> = MonoidValue<Message[], T>;

export class Log extends Monoid<Message[]> {
  static empty() {
    return new Log([]);
  }

  static of<T>(value: T): LogValue<T> {
    return { value, state: [] };
  }

  protected constructor(protected messages: Message[]) {
    super();
  }

  getState() {
    return this.messages;
  }

  append(message: Message[] | Message): void {
    const messages = Array.isArray(message) ? message : [message];
    const initialLength = this.messages.length;
    const messagesLength = messages.length;
    this.messages.length = initialLength + messagesLength;
    for (let i = 0; i < messagesLength; i++) {
      this.messages[initialLength + i] = messages[i];
    }
  }

  push(message: Message): void {
    this.messages.push(message);
  }
}
