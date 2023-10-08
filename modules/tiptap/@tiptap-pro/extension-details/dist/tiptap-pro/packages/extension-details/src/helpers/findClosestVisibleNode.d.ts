import { Editor, Predicate } from '@tiptap/core';
import { ResolvedPos, Node as ProseMirrorNode } from '@tiptap/pm/model';
export declare const findClosestVisibleNode: ($pos: ResolvedPos, predicate: Predicate, editor: Editor) => ({
    pos: number;
    start: number;
    depth: number;
    node: ProseMirrorNode;
} | undefined);
