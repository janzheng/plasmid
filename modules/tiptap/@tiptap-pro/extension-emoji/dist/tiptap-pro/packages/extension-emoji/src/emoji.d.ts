import { Node } from '@tiptap/core';
import { SuggestionOptions } from '@tiptap/suggestion';
import { PluginKey } from '@tiptap/pm/state';
declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        emoji: {
            /**
             * Add an emoji
             */
            setEmoji: (shortcode: string) => ReturnType;
        };
    }
}
export type EmojiItem = {
    /**
     * A unique name of the emoji which will be stored as attribute
     */
    name: string;
    /**
     * The emoji unicode character
     */
    emoji?: string;
    /**
     * A list of unique shortcodes that are used by input rules to find the emoji
     */
    shortcodes: string[];
    /**
     * A list of tags that can help for searching emojis
     */
    tags: string[];
    /**
     * A name that can help to group emojis
     */
    group?: string;
    /**
     * A list of unique emoticons
     */
    emoticons?: string[];
    /**
     * The unicode version the emoji was introduced
     */
    version?: number;
    /**
     * A fallback image if the current system doesn't support the emoji or for custom emojis
     */
    fallbackImage?: string;
    /**
     * Store some custom data
     */
    [key: string]: any;
};
export type EmojiOptions = {
    HTMLAttributes: Record<string, any>;
    emojis: EmojiItem[];
    enableEmoticons: boolean;
    forceFallbackImages: boolean;
    suggestion: Omit<SuggestionOptions, 'editor'>;
};
export type EmojiStorage = {
    emojis: EmojiItem[];
    isSupported: (item: EmojiItem) => boolean;
};
export declare const EmojiSuggestionPluginKey: PluginKey<any>;
export declare const inputRegex: RegExp;
export declare const pasteRegex: RegExp;
export declare const Emoji: Node<EmojiOptions, EmojiStorage>;
