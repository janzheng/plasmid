import { Node } from '@tiptap/pm/model';
import { DecorationSet } from '@tiptap/pm/view';
export interface InvisibleCharacterOptions {
    type: string;
    predicate: (value: string) => boolean;
    priority?: number;
    content?: string;
}
export declare class InvisibleCharacter {
    predicate: (value: string) => boolean;
    content?: string;
    type: string;
    priority: number;
    constructor(options: InvisibleCharacterOptions);
    createDecoration(from: number, to: number, doc: Node, decorations: DecorationSet): DecorationSet;
    test(value: string): boolean;
}
export default InvisibleCharacter;
