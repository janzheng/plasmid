
<div class="">
  <div class="page-container">
    <div id="footer-message text-xxs" class="hidden">This abstract book is not a formal conference proceedings. Information can not be referenced without explicit permission of the author(s).</div>
    <div class="container-green | font-serif p-2">
      <div class="pageframe-border bg-white">
        <div class="text-center">
          {#if event.logoUrl}
            <div class="logo w-full mx-auto">
              <img class="mx-auto" src={event.logoUrl} width={event.logoWidth} alt="Logo Header"/>
            </div>
          {/if}
      
          <div class="event-name">
            <h1 class="text-2xl pt-2 pb-2 pfix">{@html marked(event.name)}</h1>
          </div>
          <div class="event-header">
            <div class="| pt-0 pb-0 pfix | text-sm">{@html marked(event.header)}</div>
          </div>
        </div>
        <div>
          <div class="event-message | my-4">
            <div class="| pt-0 pb-0 pfix">{@html marked(event.message)}</div>
          </div>
      
          <div class="event-signature | mt-4">
            <div class="pfix">{@html marked(event.signature)}</div>
          </div>
    
        </div>
        <img alt="footer" style="padding-top: 8px; width: 100%; height: 280px; object-fit: cover; object-position: bottom" src='https://f2.phage.directory/airscripts/-evergreen-2023-live/content/rectaUjlWh18lEZzG/evg23_twitter_dates.jpg' >
      </div>
    </div>
  </div>
  
  <section class="tableofcontents pagebreak reset-toc-page text-xs" id="toc" >
    {#each sessions as session}
      <div class="session-container mb-2">
        <div class="text-base font-serif">{session}</div>
        <ul>
          {#each abstracts.filter(abs => abs['Assignment'] == session) as abstract}
            <a id="toc-{abstract['AbstractId']}" href="#abstract-{abstract['AbstractId']}" 
              class="Abstract-session-toc | underline-none text-black relative ">
              <li class="list-none mb-0 pr-8 pfix">
                <span>{@html abstract['TitlePlain']}</span>
              </li>
            </a>
          {/each}
        </ul>
      </div>
    {/each}
  </section>   

  
  <div class="Session-Abstracts">
    {#each sessions as session}
      <div class="Session">
        <div class="session-title pagebreak font-serif text-4xl mt-80 w-[505px] text-center px-8">{session}</div>
        <div class="">
          {#each abstracts.filter(abs => abs['Assignment'] == session) as abstract}
            {@const authorAffiliations = getAuthorAffiliations(abstract)}
            {@const textLen = abstract['Body'].length + JSON.stringify(authorAffiliations).length}
            <div id={'abstract-'+abstract['AbstractId']}></div>
            <div class="Abstract page-container pagebreak w-full bg-blue-200 text-xs">
              <div class="header text-xxs">
                {session} — Abstract ID: {abstract.AbstractId}
              </div>
              <hr class="pb-1"/>
              {#if abstract?.Keywords}
                <div class="tags">
                  {#each abstract?.Keywords?.split(",") as tag}
                    <span class="Btn --tag --snug --thin text-xxs text-gray-900 bg-gray-100 | mr-1 mb-1-i">{tag}</span>
                  {/each}
                </div>
              {/if}
              <div class="font-serif text-base leading-tight w-full pfix mb-1">{@html marked(abstract['TitlePlain']||'')}</div>
              <div class="Abstract-textbody
                {textLen <= 2600 ? 'text-xs' : ''}
                {textLen > 2600 && textLen <= 3900 ? 'text-xxs' : ''}
                {textLen > 3900 ? 'text-[9px] leading-[11px]' : ''}
              ">
                {#if authorAffiliations}
                  <div class="Author-Affiliations">
                    <div class="pfix mb-[0.2rem]">{@html marked(authorAffiliations?.authors.join(", ") || '')}</div>
                    <ol class="">
                      {#each authorAffiliations?.affiliations as aff}
                        <li class="">{aff}</li>
                      {/each}
                    </ol>
                  </div>
                {:else}
                  <div class="pfix">{@html marked(abstract.authors || '')}</div>
                  <div class="whitespace-pre-line affiliations pfix">{@html marked(abstract.affiliations || '')}</div>
                {/if}

                {#if abstract.correspondence}
                  <div class="pfix">{@html marked(abstract.correspondence || '')}</div>
                {/if}

                <div class="mt-2">
                  {@html marked(abstract['Body']||'')}
                </div>
              </div>
            </div>
          {/each}
        </div>
      </div>
    {/each}
  </div>

  {#if renderAuthorIndex}
    <div id="author-index" class="author-index pagebreak text-xxs"> 
      <div class="">
        <div class="mb-2 text-2xl font-serif text-evg-green-dark">Author Index</div>
        <p class="">
          Authors listed alphabetically, with associated abstract and page numbers. Some authors may appear multiple times based on how their names were entered in respective abstracts.
        </p>
      </div>
      <ol>
        {#each authors as author}
          <li class="mb-0 pfix" id="{"toc-author-"+slugify(author)}">
            <span class="author-index-name">{author}</span>
            <span class="author-index-links">
              {#each abstracts.filter(abs => abs['Authors'].includes(author)) as abstract, i}
                <a class="author-index-link {i>0?"_second-link":""}" href={'#abstract-'+abstract.AbstractId}></a>
              {/each}
            </span>
          </li>
        {/each}
        </ol> 
    </div>
  {/if}
</div>








<script>
  import { marked } from 'marked';
  import slugify from 'slugify'

  marked.use({
    breaks: true,
  })

  export let abstracts, sessions, authors;
  export let renderAuthorIndex = false;
  // abstracts = abstracts.slice(0,10); // limit for dev
  console.log('author list:', authors)

  export let event = {
    logoUrl: "https://f2.phage.directory/airscripts/-evergreen-2023-live/content/rectaUjlWh18lEZzG/evg23-full-logo.png",
    // logoUrl: "https://f2.phage.directory/airscripts/-evergreen-2023-live/content/rectaUjlWh18lEZzG/evg23_twitter_dates.jpg",
    logoWidth: "190px",

    name: `25<sup>th</sup> Biennial Evergreen International Phage Meeting`,
    header: `#### Olympia, Washington 98505
http://evergreen.phage.directory

Dr. Elizabeth Kutter, Organizing Committee Chair 
+1 (360) 867 6099; tescphage@gmail.com 
Lab of Phage Biology http://www.evergreen.edu/phage
    `,
    message: ``,

    signature: `<img src="/betty_sig.png" width="380px" />

Dr. Elizabeth Kutter
Head, Lab of Phage Biology and Emerita Member of the Faculty in Biophysics, The Evergreen State College
[kutterb@evergreen.edu](kutterb@evergreen.edu)
    `,
  };


  function getAuthorAffiliations(abstractObj) {
    try {
      return abstractObj.AuthorAffiliations && JSON.parse(abstractObj.AuthorAffiliations)
    } catch(e) {
      console.error(e)
    }
    return null
  }

</script>







<style lang="scss" global>

  .container-green {
    @apply bg-evg-green-lightest;
  }
  .pageframe-border {
    @apply border-evg-active-green border-spacing-2 border-2 p-8 rounded-lg;
  }
  .page-container {
    @apply bg-white;
  }
  h4 {
    padding-bottom: 0 !important; 
  }

  ol li {
    &::marker {
      background: white;
      padding: 2px;
    }

    &:last-child {
      margin-bottom: 0.2rem;
    }
  }


  .author-index ul, .author-index ol {
    column-count: 2;
  }


  ul li:last-child {
    margin-bottom: 0;
  }

  a {
    color: black;
  }

  .text-xs {
    @apply text-[13px] leading-[16px];
  }
  .text-xxs {
    @apply text-[10px] leading-[13px];
  }

  .Abstract-textbody {
    p {
      padding-bottom: 0.5rem;
    }
  }
</style>