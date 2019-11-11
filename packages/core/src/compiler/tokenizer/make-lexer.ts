import { compile, Lexer, Token as MooToken } from 'moo';
import { TokenKind } from '../../token';
import rules from './rules';

function shouldSkip({ type }: MooToken): boolean {
  return type === TokenKind.WhiteSpace || type === TokenKind.Comment;
}

export function makeLexer(): Lexer {
  const mooLexer = compile(rules);

  // Replace the next function to skip whitespace
  const next = mooLexer.next.bind(mooLexer);
  mooLexer.next = () => {
    // Don't emit tokens that should be skipped
    let nextToken = next();
    while (nextToken && shouldSkip(nextToken)) {
      nextToken = next();
    }
    return nextToken;
  };

  return mooLexer;
}
