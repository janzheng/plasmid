<!-- tablericons.com -->
<svg style="stroke: {strokeColor||`var(--color-base)`}; padding-right: {paddingRight}px; bottom: {bottom}px" xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-arrow-up-circle" width="{size}" height="{size}" viewBox="0 0 24 24" stroke-width="{strokeWidth}" stroke="{strokeColor}" fill="none" stroke-linecap="round" stroke-linejoin="round">
  <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
  <circle cx="12" cy="12" r="9" />
  <line x1="12" y1="8" x2="8" y2="12" />
  <line x1="12" y1="8" x2="12" y2="16" />
  <line x1="16" y1="12" x2="12" y2="8" />
</svg>

<style>
  svg {
    display: inline-block;
    position: relative;
    bottom: 2px;
  }
</style>

<script>
  export let strokeColor; // = "#673AB7";
  export let size = 24;
  export let strokeWidth = 1.5;
  export let paddingRight = 2;
  export let bottom = 2;
</script>