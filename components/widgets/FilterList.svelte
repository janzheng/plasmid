



<div id="filterlist-top" class="FilterList {classes}">
  <div class="FilterList-sidebar {sidebarClasses}">
    <div class="FilterList-sidebar-content _sticky _top-0">
    <!-- <div class="FilterList-sidebar-content "> -->
      <form id="formlet-top" class="Formlet-container">
        <div id="formlet--filterstring" class="Formlet Formlet-input ">
          <div class="_md-pfix"><label class="Formlet-label" for="filterString"><h3 class="_color-brand">Search &amp; Filter</label> </div> 
          <input id="filterString" name="filterString" bind:value={filterString} placeholder="{placeholder}" class="_form-input _width-full "> 
          <!-- <input id="filterString" name="filterString" bind:value={filterString} placeholder="{placeholder}" type="search" class="_form-input _width-full ">  -->
        </div> 

        
        <!-- <Switch classes="_button __action-outline _width-full _margin-top" value="{true}" hideText="Hide filters" showText="Show filters" handler={()=>{console.log('boop')}} /> -->

        {#if options && options.length > 0}
          <details class="_margin-top"> 
            <summary class="_pointer">Filter by Topics</summary>
            <div id="formlet--options" class="Formlet Formlet-input _margin-top">
              {#each options as item}
                <label class="_form-checkbox-label __checkbox" for={item}>

                  <input type="checkbox" 
                    id={item}
                    value={item}
                    name={item}
                    bind:group={filterOptions}
                    class={`_form-input`}
                  />

                  <div class="checkbox _padding _padding-top-half _padding-bottom-half " for={item}>
                    <div class="checkbox-content _padding-left-2 _font-small">
                      {item}
                    </div>
                  </div>

                </label>
              {/each}
            </div>
          </details>
        {/if}

        {#if showScrollTop}
          <div class="_margin-top">
            <!-- <button class="_button __action-outline __short __width-full" on:click={()=>scrollToAnchor('filterlist-top')}>Scroll to top</button> -->
            <span class="_link" on:click={()=>scrollToAnchor('filterlist-top')}>Scroll back up</span>
          </div>
        {/if}

      </form>
      
    </div>
  </div>
  <div class="FilterList-content">
    <slot></slot>
  </div>
</div>


<script>

// import Switch from '@/components/widgets/Switch.svelte'
import { scrollToAnchor } from "@/_utils/scrollto.js";

export let classes = '_grid-1-2 _grid-gap-large', sidebarClasses = '', placeholder='phage'
export let filterString, showScrollTop=true
export let filterOptions = []

export let options = []


</script>