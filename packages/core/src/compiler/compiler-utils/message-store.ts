import { Message } from '../../message';
import { isArray, castArray } from 'lodash';

export type MessageResult<V> = [ V,
  Message | Message[] | MessageStore | undefined | null ];

export function normalizeMessageResult(
  messages: Message | Message[] | MessageStore | undefined | null
): Message[] {
  if (messages) {
    if (messages instanceof MessageStore) {
      return messages.messages;
    }
    return castArray(messages);
  }
  return [];
}

export class MessageStore {
  messages: Message[] = [];

  store<V>(result: MessageResult<V>): V {
    const [ value, newMessages ] = result;

    this.add(newMessages);

    return value;
  }

  add(newMessages: Message | Message[] | MessageStore | null | undefined) {
    if (newMessages) {
      if (newMessages instanceof MessageStore) {
        this.messages = this.messages.concat(newMessages.messages);
      }
      else if (isArray(newMessages)) {
        this.messages = this.messages.concat(newMessages);
      }
      else {
        this.messages.push(newMessages);
      }
    }
  }

  makeResult<V>(value: V): MessageResult<V> {
    if (this.messages.length) {
      return [ value, this.messages ];
    }
    return [ value, null ];
  }
}
