// import 'codemirror/addon/hint/show-hint';
import 'codemirror/addon/hint/show-hint.css';
import { Editor, registerHelper, Pos, Position as CMPosition } from 'codemirror';
import { Position, IdentifierExpression, Expression, standardLibrary, ExecutionResult } from 'query-language';
import { QLCompiler } from './ql-compiler';
import { assertNever } from './utils';
import { startsWith, bind, omitBy, first, last, map, pickBy, defer } from 'lodash';

interface Hints {
  from: CMPosition;
  to: CMPosition;
  list: (Hint | string)[];
}

/** Interface used by showHint.js Codemirror add-on
 When completions aren't simple strings, they should be objects with the following properties: */
interface Hint {
  text: string;
  className?: string;
  displayText?: string;
  from?: Position;
  /** Called if a completion is picked. If provided *you* are responsible for applying the completion */
  hint?: (cm: CodeMirror.Editor, data: Hints, cur: Hint) => void;
  render?: (element: HTMLLIElement, data: Hints, cur: Hint) => void;
  to?: Position;
}




// We only want to show completions for standard functions that
// do not contain symbols.
const isOperatorRegex = /[^a-z]/i;
const completableLibrary = omitBy(standardLibrary, (value, key) => {
  return isOperatorRegex.test(key);
});


export class QLHinter {
  protected evaluationResult: ExecutionResult | null = null;

  constructor(protected compiler: QLCompiler) {
    registerHelper('hint', 'QL', bind(this.getHints, this));

    this.compiler.evaluationResult$
      .subscribe(result => this.evaluationResult = result);
  }

  /**
   * Called manually by the editor component when a user presses a key.
   * @param {CodeMirror.Editor} editor
   */
  showHintMenu(editor: Editor) {
    // editor.showHint({
    //   completeSingle: false,
    //   hint: () => this.getHints(editor),
    // });
  }

  /**
   * Called by the show-hint addon whenever the user presses the keyboard
   * shortcut.
   */
  getHints(editor: Editor): Hints {
    const cursor = editor.getDoc().getCursor();
    const pos: Position = [ cursor.line, cursor.ch ];
    const result = this.evaluationResult;

    if (result && result.expression) {
      const expression = this.findCursorExpression(pos, result.expression);

      if (expression && expression.kind === 'Identifier') {
        const list = this.findMatchingHints(expression);
        console.log('found matches', list);
        return {
          ...this.getPositionOf(expression),
          list: list,
        };
      }
    }

    return {
      ...this.getPositionOf(null),
      list: [],
    };
  }

  protected getPositionOf(expression: Expression | null) {
    if (expression) {
      const firstToken = first(expression.tokens);
      const lastToken = last(expression.tokens);

      if (firstToken && lastToken) {
        return {
          from: Pos(firstToken.begin[0], firstToken.begin[1]),
          to: Pos(lastToken.end[0], lastToken.end[1]),
        };
      }
    }
    return {
      from: Pos(0, 0),
      to: Pos(0, 0),
    };
  }

  protected findMatchingHints(expression: IdentifierExpression): Hint[] {
    const matches = this.findMatchingScopeEntries(expression);
    return map(matches, (match, name) => {
      return {
        text: name,
        render: (element: HTMLLIElement) => {
          element.innerHTML = `<span class="hint-name">${name}</span>`;
        },
      };
    });
  }

  protected findMatchingScopeEntries(expression: IdentifierExpression) {
    console.log('testing hints');
    return pickBy(completableLibrary, (entry, name) => {
      return startsWith(name, expression.value);
    });
  }

  protected findCursorExpression(pos: Position, expression: Expression): Expression | null {
    switch (expression.kind) {
      case 'Identifier':
      case 'Integer':
      case 'Float':
      case 'String':
      case 'Boolean':
      case 'Unrecognized':
      case 'None':
        if (this.isInside(pos, expression)) {
          return expression;
        }
        return null;

      case 'FunctionCall':
        // Check function expression
        const functionExpression = expression.functionExpression;
        let child = this.findCursorExpression(pos, functionExpression);
        if (child) {
          return child;
        }

        // Check argument
        for (const arg of expression.args) {
          if (arg) {
            child = this.findCursorExpression(pos, arg);
            if (child) {
              return child;
            }
          }
        }
        return null;

      case 'Array':
        // Check argument

        for (const el of expression.elements) {
          if (el) {
            const childEl = this.findCursorExpression(pos, el);
            if (childEl) {
              return childEl;
            }
          }
        }
        return null;

      default:
        return assertNever(expression);
    }
  }

  protected isInside(pos: Position, expression: Expression): boolean {
    const firstToken = expression.tokens[0];
    const lastToken = expression.tokens[expression.tokens.length - 1];
    return firstToken
      && lastToken
      && this.isBefore(firstToken.begin, pos)
      && this.isBefore(pos, lastToken.end);
  }

  protected isBefore(a: Position, b: Position): boolean {
    return a[0] < b[0] || a[0] === b[0] && a[1] <= b[1];
  }
}
