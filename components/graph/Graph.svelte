<script>
  import { onMount, setContext } from 'svelte'
  import cytoscape from 'cytoscape'
  import dagre from 'cytoscape-dagre'
  import GraphStyles from './GraphStyles.js'

  setContext('graphSharedState', {
    getCyInstance: () => cyInstance
  })

  export let graphClasses = 'block w-full h-[100vh]';
  let refElement = null
  let cyInstance = null

  onMount(() => {
    cytoscape.use(dagre)

    cyInstance = cytoscape({
      container: refElement,
      style: GraphStyles
    })

    cyInstance.on('add', () => {
      cyInstance
        .makeLayout({
          name: 'dagre',
          rankDir: 'TB',
          nodeSep: 150
        })
        .run()
    })

  });

</script>

<!-- note: need to set the height of graph in parent! -->
<div class="Graph {graphClasses}" bind:this={refElement}>
  {#if cyInstance}
    <slot></slot>
  {/if}
</div>