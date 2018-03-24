import 'codemirror/addon/hint/show-hint';
import 'codemirror/addon/hint/show-hint.css';
import { Editor, registerHelper, Pos, Hint, Hints, Position as CMPosition, Token } from 'codemirror';
import { Position, IdentifierExpression, Expression, standardLibrary, ExecutionResult, Type } from 'query-language';
import { QLCompiler } from './ql-compiler';
import { assertNever } from './utils';
import { startsWith, bind, join, reject, filter, omitBy, first, last, map, pickBy, defer } from 'lodash';
import { QLCompilerService } from './ql-compiler.service';
import { QLEditorService } from './ql-editor.service';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import { Injectable } from '@angular/core';
import { showHint } from 'codemirror';


export interface QLHint {
  name: string,
  type: Type,
}

// We only want to show completions for standard functions that
// do not contain symbols.
const isOperatorRegex = /[^a-z]/i;
const completableLibrary = reject(map(standardLibrary, (value, name) => ({
  name,
  type: value.type,
})), hint => isOperatorRegex.test(hint.name));


function typeToString(type: Type): string {
  switch (type.kind) {
    case 'Integer':
    case 'Float':
    case 'Boolean':
    case 'None':
    case 'String':
      return type.kind;

    case 'Generic':
      return type.name;

    case 'Union':
      return join(map(type.types, typeToString), ' | ');

    case 'Record':
      const fieldsString = map(type.fields, (fieldType, name) => {
        const fieldTypeString = typeToString(fieldType);
        return `${name}: ${fieldTypeString}`;
      });
      return '{ ${fieldString} }';

    case 'Array':
      if (type.elementType) {
        const elementString = typeToString(type.elementType);
        return elementString + '[]';
      }
      return 'any[]';

    case 'Function':
      const returnString = typeToString(type.returnType);
      let argString = join(map(type.argTypes, typeToString), ', ');
      if (type.argTypes.length > 1) {
        argString = `(${argString})`;
      }

      return `${argString} -> ${returnString}`;

    default:
      return assertNever(type);
  }
}


@Injectable()
export class QLHinterService {
  hintPanelOpen$ = this.editorService.onHintsShown$
    .mapTo(true)
    .merge(this.editorService.onHintsClosed$.mapTo(false))
    .startWith(false);

  constructor(
    protected compilerService: QLCompilerService,
    protected editorService: QLEditorService,
  ) {
    registerHelper('hint', 'QL', bind(this.getCMHints, this));

    this.editorService.onKeyup$
      .withLatestFrom(this.hintPanelOpen$, ({ editor, event }, open) => {
        return { editor, event, open };
      })
      .filter(({ event, open }) => {
        return /^[a-z]$/i.test(event.key)
          || event.key === 'Delete' && open;
      })
      .subscribe(({ editor }) => {
        this.displayHints(editor);
      });
  }

  /**
   * Displays the hint selection box.
   */
  displayHints(editor: Editor) {
    showHint(editor, undefined, {
      completeSingle: false,
      hint: () => this.getCMHints(editor),
    });
  }

  /**
   * Returns possible hint completions in the codemirror format.
   */
  getCMHints(editor: Editor): Hints {
    const cursor = editor.getDoc().getCursor();
    const token = editor.getTokenAt(cursor);

    // Check if the token is an identifier
    const identifierRegex = /^[a-z_][a-z_0-9]*$/i;
    if (identifierRegex.test(token.string)) {
      const hints = this.findMatching(token.string);
      return this.makeHintsObject(hints, cursor, token);
    }
    return this.makeHintsObject([]);
  }

  /**
   * Finds possible matching completions based on the current token.
   */
  protected findMatching(prompt: string): QLHint[] {
    return filter(completableLibrary, hint => {
      return startsWith(hint.name, prompt);
    });
  }

  /**
   * Constructs a codemirror hints object.
   */
  protected makeHintsObject(hints: QLHint[], cursor?: CMPosition, token?: Token): Hints {
    const list = map(hints, hint => {
      const typeString = typeToString(hint.type);
      return {
        text: `${hint.name}##${typeString}`,
        render: this.renderHintFunc,
      };
    });

    const line = cursor ? cursor.line : 0;
    return {
      list,
      from: Pos(line, token ? token.start : 0),
      to: Pos(line, token ? token.end : 0),
    };
  }

  protected renderHintFunc(element: HTMLLIElement, hints: Hints, hint: Hint) {
    const [ name, type ] = hint.text.split('##');
    const nameHtml = `<span class="hint-name">${name}</span>`;
    const typeHtml = `<span class="hint-type">${type}</span>`;
    element.innerHTML = nameHtml + typeHtml;
  }

  /**
   * Called manually by the editor component when a user presses a key.
   * @param {CodeMirror.Editor} editor
   */
  // showHintMenu(editor: Editor) {
  //   editor.showHint({
  //     completeSingle: false,
  //     hint: () => this.getHints(editor),
  //   });
  // }
  //
  // /**
  //  * Called by the show-hint addon whenever the user presses the keyboard
  //  * shortcut.
  //  */
  // getHints(editor: Editor): Hints {
  //   const cursor = editor.getDoc().getCursor();
  //   const pos: Position = [ cursor.line, cursor.ch ];
  //   const result = this.evaluationResult;
  //
  //   if (result && result.expression) {
  //     const expression = this.findCursorExpression(pos, result.expression);
  //
  //     if (expression && expression.kind === 'Identifier') {
  //       const list = this.findMatchingHints(expression);
  //       console.log('found matches', list);
  //       return {
  //         ...this.getPositionOf(expression),
  //         list: list,
  //       };
  //     }
  //   }
  //
  //   return {
  //     ...this.getPositionOf(null),
  //     list: [],
  //   };
  // }
  //
  // protected getPositionOf(expression: Expression | null) {
  //   if (expression) {
  //     const firstToken = first(expression.tokens);
  //     const lastToken = last(expression.tokens);
  //
  //     if (firstToken && lastToken) {
  //       return {
  //         from: Pos(firstToken.begin[0], firstToken.begin[1]),
  //         to: Pos(lastToken.end[0], lastToken.end[1]),
  //       };
  //     }
  //   }
  //   return {
  //     from: Pos(0, 0),
  //     to: Pos(0, 0),
  //   };
  // }
  //
  // protected findMatchingHints(expression: IdentifierExpression): Hint[] {
  //   const matches = this.findMatchingScopeEntries(expression);
  //   return map(matches, (match, name) => {
  //     return {
  //       text: name,
  //       render: (element: HTMLLIElement) => {
  //         element.innerHTML = `<span class="hint-name">${name}</span>`;
  //       },
  //     };
  //   });
  // }
  //
  // protected findMatchingScopeEntries(expression: IdentifierExpression) {
  //   console.log('testing hints');
  //   return pickBy(completableLibrary, (entry, name) => {
  //     return startsWith(name, expression.value);
  //   });
  // }
  //
  // protected findCursorExpression(pos: Position, expression: Expression): Expression | null {
  //   switch (expression.kind) {
  //     case 'Identifier':
  //     case 'Integer':
  //     case 'Float':
  //     case 'String':
  //     case 'Boolean':
  //     case 'Unrecognized':
  //     case 'None':
  //       if (this.isInside(pos, expression)) {
  //         return expression;
  //       }
  //       return null;
  //
  //     case 'FunctionCall':
  //       // Check function expression
  //       const functionExpression = expression.functionExpression;
  //       let child = this.findCursorExpression(pos, functionExpression);
  //       if (child) {
  //         return child;
  //       }
  //
  //       // Check argument
  //       for (const arg of expression.args) {
  //         if (arg) {
  //           child = this.findCursorExpression(pos, arg);
  //           if (child) {
  //             return child;
  //           }
  //         }
  //       }
  //       return null;
  //
  //     case 'Array':
  //       // Check argument
  //
  //       for (const el of expression.elements) {
  //         if (el) {
  //           const childEl = this.findCursorExpression(pos, el);
  //           if (childEl) {
  //             return childEl;
  //           }
  //         }
  //       }
  //       return null;
  //
  //     default:
  //       return assertNever(expression);
  //   }
  // }
  //
  // protected isInside(pos: Position, expression: Expression): boolean {
  //   const firstToken = expression.tokens[0];
  //   const lastToken = expression.tokens[expression.tokens.length - 1];
  //   return firstToken
  //     && lastToken
  //     && this.isBefore(firstToken.begin, pos)
  //     && this.isBefore(pos, lastToken.end);
  // }
  //
  // protected isBefore(a: Position, b: Position): boolean {
  //   return a[0] < b[0] || a[0] === b[0] && a[1] <= b[1];
  // }
}
