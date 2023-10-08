import { DecorationSet } from '@tiptap/pm/view';
import { InvisibleCharacter } from './plugin/InvisibleCharacter';
import { InvisibleNode } from './plugin/InvisibleNode';
export interface InvisibleCharactersOptions {
    visible: boolean;
    builders: Array<InvisibleCharacter | InvisibleNode>;
    injectCSS: boolean;
    injectNonce: string | undefined;
}
export interface Position {
    pos: number;
    text: string;
}
export interface PluginState {
    visible: boolean;
    decorations: DecorationSet;
}
