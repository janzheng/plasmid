import { EditorState, Plugin, PluginKey } from '@tiptap/pm/state';
import { DecorationSet } from '@tiptap/pm/view';
import { InvisibleCharactersOptions, PluginState } from '../types';
export declare const InvisibleCharactersPluginKey: PluginKey<PluginState>;
export declare const InvisibleCharactersPlugin: (state: EditorState, options: InvisibleCharactersOptions) => Plugin<{
    visible: boolean;
    decorations: DecorationSet;
}>;
export default InvisibleCharactersPlugin;
