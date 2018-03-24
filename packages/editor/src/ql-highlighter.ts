import {
  EditorConfiguration, Mode,
  StringStream,
} from 'codemirror';
import { patterns } from 'query-language/src/compiler/tokenize/token-patterns';
import { TokenKind } from 'query-language';
import 'codemirror/addon/comment/comment';
import { assertNever } from './utils';

export interface HighlighterState {
  inString?: string | undefined;
}

const specialTokenMap = {
  [TokenKind.OpenBrace]: '{',
  [TokenKind.CloseBrace]: '}',
  [TokenKind.OpenParen]: '(',
  [TokenKind.CloseParen]: ')',
  [TokenKind.OpenBracket]: '[',
  [TokenKind.CloseBracket]: ']',
  [TokenKind.Comma]: ',',
};


export class QLHighlighter implements Mode<HighlighterState> {
  lineComment = '--';

  constructor(
    protected config: EditorConfiguration,
    protected modeOptions?: any,
  ) {}

  token(stream: StringStream, state: HighlighterState): string | null {
    if (stream.eatSpace()) {
      return null;
    }

    const tokenKind = this.nextTokenKind(stream);
    if (tokenKind !== undefined) {
      return this.mapTokenKindToStyle(tokenKind);
    }

    // Unknown token
    stream.eat(/./);
    return null;
  }

  private nextTokenKind(stream: StringStream): TokenKind | undefined {
    for (const pattern of patterns) {
      if (stream.match(pattern.test)) {
        return pattern.type;
      }
    }
  }

  private mapTokenKindToStyle(kind: TokenKind): string | null {
    switch (kind) {
      case TokenKind.Identifier:
        return 'variable-3';

      case TokenKind.IntegerLiteral:
      case TokenKind.FloatLiteral:
        return 'number';

      case TokenKind.BooleanLiteral:
        return 'atom';

      case TokenKind.StringLiteral:
        return 'string';

      case TokenKind.Comment:
        return 'comment';

      case TokenKind.OpenBrace:
      case TokenKind.CloseBrace:
      case TokenKind.OpenParen:
      case TokenKind.CloseParen:
      case TokenKind.OpenBracket:
      case TokenKind.CloseBracket:
      case TokenKind.Comma:
        if (specialTokenMap[kind] !== undefined) {
          return specialTokenMap[kind];
        }
        return null;

      case TokenKind.AddOperator:
      case TokenKind.SubtractOperator:
      case TokenKind.MultiplyOperator:
      case TokenKind.DivideOperator:
      case TokenKind.ModuloOperator:
      case TokenKind.PowerOperator:
      case TokenKind.LessThan:
      case TokenKind.LessEqual:
      case TokenKind.GreaterThan:
      case TokenKind.GreaterEqual:
      case TokenKind.Equal:
      case TokenKind.NotEqual:
      case TokenKind.InOperator:
      case TokenKind.RangeOperator:
      case TokenKind.ComposeOperator:
      case TokenKind.Colon:
      case TokenKind.SpreadOperator:
      case TokenKind.FatArrow:
        return 'operator';

      default:
        return assertNever(kind);
    }
  }
}
