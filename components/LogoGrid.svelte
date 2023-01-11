
<script>

  import Lazy from 'svelte-lazy';

  export let items = [];
  export let type = 'logo'; // logo | profile

/* 
  rough schema of [item]
    data = data.map(item => ({
      name: item['Name'],
      profileUrl: item['Profile URL'],
      location: item['Location'],
      short: item['Short Description'],
      tags: item['Category'],
      twitter: item['Twitter'],
      linkedin: item['Linkedin'],
      website: item['Website'],
      affiliation: item['Affiliation'],
    }))

*/
</script>


<div class="LogoGrid | text-sm grid md:grid-cols-3 gap-4">
  {#each items as item}

    {#if type == 'logo'}
      <div class="LogoGrid-item rounded-lg bg-pa_blue-100 p-4 shadow-sm | flex flex-row place-content-center | mb-1 sm:mb-0">
        <!-- {JSON.stringify(item)} -->
        <div class="profileimg | flex items-center">
          {#if item.website}
            <a href="{item.website}"><img src="{item.profileImgUrl || '/phaus_icon.png'}" alt="{item.name} profile" /></a>
          {:else}
            <Lazy height={80}>
              <img src="{item.profileImgUrl || '/phaus_icon.png'}" alt="{item.name} profile" />
            </Lazy>
          {/if}
        </div>
      </div>



    {:else if type == 'profile'}
      <div class="LogoGrid-item rounded-lg bg-pa_blue-100 p-4 shadow-sm | flex flex-col | mb-1 sm:mb-0">
        <!-- {JSON.stringify(item)} -->
        <!-- {#if item.profileImgUrl && item.profileImgUrl != '' && typeof(item.profileImgUrl) != 'undefined'} -->
          <div class="profile person | flex items-center pb-2">
            <Lazy height={111}>
              <a sveltekit:prefetch href="/profile/{item.slug}"><img async src="{item.profileImgUrl || '/phaus_icon.png'}" alt="{item.name} profile" /></a>
            </Lazy>
          </div>
        <!-- {/if} -->

        <div class="name pb-1"><a class="no-underline" sveltekit:prefetch href="/profile/{item.slug}">{item.name}</a></div>
        {#if item.short}
          <div class="short">{item.short}</div>
        {/if}
      </div>
    {/if}




  {/each}
</div>


<style lang="scss">
  .LogoGrid-item {
    min-height: 100px;
    // max-height: 150px;
  }
  .profileimg {
    img {
      max-height: 50px;
      min-height: 40px;
      // max-width: 240px;
      max-width: 100%;
      object-fit: contain;
    }
  }

  .person {
    img {
      width: 100px;
      height: 100px;
      max-width: 100%;
      object-fit: cover;
      border-radius: 100%;
    }
  }

  .name {
    font-weight: 600;
  }

</style>