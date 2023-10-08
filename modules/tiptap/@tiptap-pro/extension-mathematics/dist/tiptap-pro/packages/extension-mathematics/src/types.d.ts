import { Editor } from '@tiptap/core';
import { KatexOptions } from 'katex';
export type MathematicsOptions = {
    regex: RegExp;
    katexOptions?: KatexOptions;
};
export type MathematicsOptionsWithEditor = MathematicsOptions & {
    editor: Editor;
};
