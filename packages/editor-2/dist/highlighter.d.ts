import { EditorConfiguration, Mode, StringStream } from 'codemirror';
import 'codemirror/addon/comment/comment';
export interface HighlighterState {
    inString?: string | undefined;
}
export default class Highlighter implements Mode<HighlighterState> {
    private readonly config;
    private readonly modeOptions?;
    lineComment: string;
    constructor(config: EditorConfiguration, modeOptions?: any);
    token(stream: StringStream, state: HighlighterState): string | null;
    private nextTokenKind;
    private matchTokenPattern;
    private mapTokenKindToStyle;
}
//# sourceMappingURL=highlighter.d.ts.map