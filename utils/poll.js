

// https://stackoverflow.com/questions/61873119/sapper-svelte-how-to-fetch-periodically

// poll.js
import { onMount, onDestroy } from 'svelte';

export const poll = (fn, ms) => {
  let interval
  onMount(() => {
    interval = setInterval(fn, ms);
    fn()

    return () => clearInterval(interval)
  })

  onDestroy(() => {
    clearInterval(interval);
  });
}