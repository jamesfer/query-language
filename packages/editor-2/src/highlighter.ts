import { EditorConfiguration, Mode, StringStream } from 'codemirror';
import 'codemirror/addon/comment/comment';
import rules from 'query-language/dist/compiler/tokenizer/rules';
import { createLexer, nextToken } from 'query-language/dist/compiler/tokenizer/tokenize';
import { TokenKind } from 'query-language';
import { assertNever } from './utils';

export type Many<T> = T | T[];

export interface HighlighterState {
  inString?: string | undefined;
}

export default class Highlighter implements Mode<HighlighterState> {
  lineComment = '--';

  private lexer = createLexer();

  constructor(
    private readonly config: EditorConfiguration,
    private readonly modeOptions?: any,
  ) {}

  token(stream: StringStream, state: HighlighterState): string | null {
    if (stream.eatSpace()) {
      return null;
    }

    const style = this.nextTokenStyle(stream);
    if (style) {
      return style;
    }

    // Unknown token
    stream.eat(/./);
    return null;
  }

  private nextTokenStyle(stream: StringStream): string | null {
    this.lexer.reset(stream.string.slice(stream.pos));
    const token = nextToken(this.lexer);
    console.log(token);
    if (!token) {
      return null;
    }

    // Eat characters from the stream
    stream.match(token.value);

    return this.mapTokenKindToStyle(token.kind);
  }

  private mapTokenKindToStyle(kind: TokenKind): string | null {
    switch (kind) {
      case TokenKind.Keyword:
        return 'keyword';

      case TokenKind.Identifier:
        return 'variable-1';

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
        return '{';

      case TokenKind.CloseBrace:
        return '}';

      case TokenKind.OpenParen:
        return '(';

      case TokenKind.CloseParen:
        return ')';

      case TokenKind.OpenBracket:
        return '[';

      case TokenKind.CloseBracket:
        return ']';

      case TokenKind.Comma:
        return ',';

      case TokenKind.Pipe:
        return '|';

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
      case TokenKind.FatArrow:
        return 'operator';

      case TokenKind.WhiteSpace:
        return null;

      default:
        assertNever(kind);
    }
  }
}
