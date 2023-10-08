import { Transaction } from '@tiptap/pm/state';
type StepRange = [from: number, to: number];
export declare const getUpdatedRanges: ({ mapping }: Transaction) => StepRange[];
export default getUpdatedRanges;
