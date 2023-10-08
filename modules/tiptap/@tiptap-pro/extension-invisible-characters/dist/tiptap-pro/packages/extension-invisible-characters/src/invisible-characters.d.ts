import { Extension } from '@tiptap/core';
import { HardBreakNode } from './plugin/invisible-characters/hardBreak';
import { ParagraphNode } from './plugin/invisible-characters/paragraph';
import { SpaceCharacter } from './plugin/invisible-characters/space';
import { InvisibleCharactersOptions } from './types';
export { HardBreakNode, ParagraphNode, SpaceCharacter, };
declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        invisibleCharacters: {
            /**
            * Show invisible characters
            */
            showInvisibleCharacters: (show?: boolean) => ReturnType;
            /**
            * Hide invisible characters
            */
            hideInvisibleCharacters: () => ReturnType;
            /**
            * Toggle invisible characters
            */
            toggleInvisibleCharacters: () => ReturnType;
        };
    }
}
export declare const InvisibleCharacters: Extension<InvisibleCharactersOptions, any>;
export default InvisibleCharacters;
