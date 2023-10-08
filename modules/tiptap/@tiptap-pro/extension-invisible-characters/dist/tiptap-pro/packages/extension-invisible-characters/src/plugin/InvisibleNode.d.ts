import { Node } from '@tiptap/pm/model';
import { DecorationSet } from '@tiptap/pm/view';
export interface InvisibleNodeOptions {
    content?: string;
    position?: (node: Node, pos: number) => number;
    predicate: (value: Node) => boolean;
    priority?: number;
    type: string;
}
export declare class InvisibleNode {
    predicate: (value: Node) => boolean;
    position: (node: Node, pos: number) => number;
    content?: string;
    type: string;
    priority: number;
    constructor(options: InvisibleNodeOptions);
    createDecoration(from: number, to: number, doc: Node, decorations: DecorationSet): DecorationSet;
    test(value: Node): boolean;
}
export default InvisibleNode;
