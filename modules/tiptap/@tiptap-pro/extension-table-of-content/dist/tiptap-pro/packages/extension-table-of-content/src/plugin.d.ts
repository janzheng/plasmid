import { NodeType } from '@tiptap/pm/model';
import { Plugin } from '@tiptap/pm/state';
export declare const TableOfContentPlugin: ({ getId, headingType, }: {
    getId?: ((textContent: string) => string) | undefined;
    headingType?: string | NodeType | undefined;
}) => Plugin<any>;
