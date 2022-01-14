

// https://stackoverflow.com/questions/61873119/sapper-svelte-how-to-fetch-periodically

// poll.js
import { onMount } from 'svelte';

export const poll = (fn, ms) => {
  onMount(() => {
    const interval = setInterval(fn, ms);
    fn()

    return () => clearInterval(interval)
  })
}