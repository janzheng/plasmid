
{#if content}
<div class="{classes}" styles="{styles}">
  <div class=" _margin-center">
    <div class="">{@html marked(content||'')}</div>
  </div>
</div>
{/if}


<script>

import marked from 'marked';
import { _content } from "@/stores/sitedata"

export let name = '', classes = '_section-page _padding-top-2 _margin-center _margin-bottom-2 ', styles = ''
let content = _content(name)

</script>


<!-- <style type="text/scss">

</style> -->