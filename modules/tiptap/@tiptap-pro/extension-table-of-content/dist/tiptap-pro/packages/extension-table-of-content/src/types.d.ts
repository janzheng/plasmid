import { Editor } from '@tiptap/core';
import { Node, NodeType } from '@tiptap/pm/model';
export type TableOfContentOptions = {
    getId?: (textContent: string) => string;
    onUpdate?: (data: TableOfContentData) => void;
    scrollParent?: HTMLElement | Window;
    headingType?: NodeType | string;
};
export type TableOfContentStorage = {
    content: TableOfContentData;
    headlines: Array<HTMLHeadingElement>;
    scrollHandler: () => void;
    scrollPosition: number;
};
export type TableOfContentData = Array<TableOfContentDataItem>;
export type TableOfContentDataItem = {
    dom: HTMLHeadingElement;
    editor: Editor;
    id: string;
    isActive: boolean;
    isScrolledOver: boolean;
    itemIndex: number;
    level: number;
    node: Node;
    originalLevel: number;
    pos: number;
    textContent: string;
};
