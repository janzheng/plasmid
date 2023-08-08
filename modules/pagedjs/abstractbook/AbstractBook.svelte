

<!-- <h1 class="font-serif" style="font-family: 'Fraunces'; font-size: 12px;">font preload</h1> -->
<!-- <div class="font-serif font-bold" style="font-family: 'Fraunces'; font-weight: 900;">font preload</div> -->
<!-- <div class="font-serif text-3xl font-bold" style="font-family: 'Fraunces'; ">preload</div> -->
<!-- <div class="font-serif text-3xl" style="font-family: 'Fraunces'; ">preload</div> -->


<div class="frontmatter">
  <h1 class="font-serif" style="font-family: 'Fraunces'; font-size: 12px; color: white; height: 0px;">font preload 2</h1>
  <div class="font-serif font-bold" style="font-family: 'Fraunces'; font-size: 12px; font-weight: 900; color: white; height: 0px;">font preload 2 </div>
  <div id="footer-message text-xxs" class="hidden">This abstract book is not a formal conference proceedings. Information can not be referenced without explicit permission of the author(s).</div>
  <!-- used for printing to "preset" the font -->

  <div class=" | font-serif p-2 | mt-12">
    <div class="text-center">
      <div class="event-name">
        <h1 class="font-serif font-bold text-4xl pt-2 pb-4 pfix" style="font-family: 'Fraunces'">{@html marked(event.name)}</h1>
      </div>
      <div class="logo w-full mx-auto">
        <img class="block mx-auto my-4" height="350px" width="700px" src={"/evg23_card_dates.jpg"} alt="Logo Header"/>
      </div>
      <div class="event-header">
        <div class="| pt-0 pb-0 pfix | text-sm">{@html marked(event.simpleHeader)}</div>
      </div>
      <div class="mx-auto mt-12"><img alt="logo double" class="blog mx-auto" width="80px" src="/logo-double.png"></div>
    </div>
  </div>
</div>

<!-- title page back [color] -->
<div class="Sponsor TAILOR one frontmatter">
  <!-- <h2 class="pt-0 pb-0">Sponsor page | TAILOR 1 Full [color]</h2> -->
  <div class="ad">
    <!-- <h2 class="pt-0 pb-0">TAILOR 1 Full [color]</h2> -->
  <img src="https://f2.phage.directory/airscripts/-evergreen-2023-live/content/recWWe5f4DTy0SOza/TAILOR-Evg2023-Ad-1.jpg" width="100%" height="705px" alt="Ad Placement"/>
  </div>
</div>




<div class="Sponsor temp content holder pagebreak text-[10px]">
  <div class="text-center mb-2">
    {@html marked(`
  ### 25th Biennial Evergreen International Phage Meeting
  The Evergreen State College, Olympia, WA`)}
  </div>

  {@html marked(`

**Coordinating Committee & Organizational Staff**: Elizabeth Kutter, Chair; Ria Kaelin, Jan Zheng, Jessica Sacher

**Science Committee**: Evelien Adriaenssens, Jeremy Barr, Sandra Morales, Sabrina Green, Steve Abedon, Hany Anany, Ria Kaelin, Jessica Sacher

**Workshop Presenters:** Evelien Adriaenssens, Ryan Cook, Claire Elek, Andrea Telatin, Justin Clark, Ramy Aziz, Rebecca Wattam, Tobi Nagel, Fran Hodges, Jason Gill

**Meeting Goals** Building on the original Cold Spring Harbor phage meetings, the Evergreen meeting's primary goal is to provide an opportunity for members of the ever-broadening phage community from various backgrounds, ages and places to build strong working relationships and share skills and ideas, leading to new insights and collaborations and, in recent years, helping spur on many kinds of applications. People are encouraged to present work that is still in progress. Posters are strongly encouraged, both as independent presentations with their own abstracts (grouped by general topic) and as a way of letting participants more closely examine the detailed data of those giving talks. They remain up throughout the meeting, rather than having specific presentation times for individual groups of posters.

**Citation Notice:** Presenting at this meeting does not constitute a publication and the abstract book is not a formal (i.e. citable) conference proceedings. Abstracts will not be published online, and permission must be obtained from the respective authors before quoting any of their abstracts or data or applying it in a way that may be inappropriate.

**Thanks to contributors**: The Evergreen State College and the Phagebiotics Research Foundation, cosponsors and planners; Phage Directory: Jessica Sacher and Jan Zheng, Jake Lind, Evergreen's Conference Services coordinator, and the Evergreen food services crew, for their special efforts of a variety of sorts to make the meeting accommodate so many of you and run smoothly; and the many of you who have helped in other ways. Premier Shuttle Service, for help with transport; Vic's Pizzeria, Charter Up, First Student. 

**Special thanks to the following organizations** for their financial help in supporting young scholars and participants from underdeveloped countries; please look at their postings at the end of the abstract book: TAILOR, JAFRAL, Phase Genomics, PHAGE Therapy, Applications, and Research, Phages for Global Health, Rime Bioinformatics, DPI Drugs and Drug Candidates, Vésale Bioscience, Phage Directory, Phagebiotics Research Foundation
`)}
</div>

<!-- <div class="Backpage back pagebreak frontmatter mx-auto">
  <img class="mx-auto mt-20" src="/logo-wall-hex.png" width="80%" height="705px" alt="Evergreen"/>
</div> -->

{#if renderSessions}
  <section class="tableofcontents pagebreak reset-toc-page text-xs" id="toc" >
    {#each sessions as session}
      <!-- <div class="session-container mb-2 {["Poster Session",  "Session 10: Ecology & Informatics II"].includes(session) ? 'pagebreak':''}"> -->
      <div class="session-container mb-2 {["Poster Session"].includes(session) ? 'pagebreak':''}">
        <div class="text-base font-serif ">{session}</div>
        <ul>
          {#each abstracts.filter(abs => abs['Assignment'] == session) as abstract}
            <a id="toc-{abstract['AbstractId']}" href="#abstract-{abstract['AbstractId']}" 
              class="Abstract-session-toc | underline-none text-black relative ">
              <li class="list-none mb-0 pr-8 pb-1 pfix">
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
        <div class="session-title pagebreak font-serif text-4xl mt-80 w-[505px] text-center px-8 ">{session}</div>
        <div class="">
          {#each abstracts.filter(abs => abs['Assignment'] == session) as abstract}
            {@const authorAffiliations = getAuthorAffiliations(abstract)}
            {@const textLen = abstract['Body'].length + JSON.stringify(authorAffiliations||"").length}
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
                {textLen <= 2800 ? 'text-xs' : ''}
                {textLen > 2800 && textLen <= 3900 ? 'text-xxs' : ''}
                {textLen > 3900 ? 'text-[9px] leading-[11px]' : ''}
                {textLen > 5500 ? 'text-[7.5px] leading-[9px]' : ''}
              ">
                {#if authorAffiliations}
                  <div class="Author-Affiliations py-1">
                    <div class="pfix 
                      {textLen <= 3900 ? 'mb-[0.35rem]' : ''}
                    ">{@html marked(authorAffiliations?.authors.join(", ") || '')}</div>
                    <ol class="">
                      {#each authorAffiliations?.affiliations || [] as aff}
                        <li class="pt-0.5">{aff}</li>
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
{/if}

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



<!-- 

  Back Pages

 -->
<!-- sponsor page front [color] -->
<div class="Sponsor TAILOR two backpage frontmatter pagebreak">
  <!-- <h2 class="pt-0 pb-0">TAILOR 2 Full [color]</h2> -->
  <!-- <img src="/ad-placeholder.png" width="100%" height="705px" alt="Ad Placement"/> -->
  <img src="https://f2.phage.directory/airscripts/-evergreen-2023-live/content/recWWe5f4DTy0SOza/TAILOR-Evg2023-Ad-2.jpg" width="100%" height="705px" alt="Ad Placement"/>
</div>

<div class="Sponsor JAFRAL frontmatter pagebreak">
  <!-- <h2 class="pt-0 pb-0">JAFRAL Full [color]</h2> -->
  <!-- <img src="/ad-placeholder.png" width="100%" height="705px" alt="Ad Placement"/> -->
  <img src="https://f2.phage.directory/airscripts/-evergreen-2023-live/content/recWWe5f4DTy0SOza/jafral-ad-2.png" width="100%" height="705px" alt="Ad Placement"/>
</div>

<div class="Sponsor PHASEGenomics frontmatter pagebreak">
  <!-- <h2 class="pt-0 pb-0">PHASEGenomics Full [color]</h2> -->
  <!-- <img src="/ad-placeholder.png" width="100%" height="705px" alt="Ad Placement"/> -->
  <img src="https://f2.phage.directory/airscripts/-evergreen-2023-live/content/recWWe5f4DTy0SOza/phasegenomics-ProxiMeta_ad-1.jpg" width="100%" height="705px" alt="Ad Placement"/>
</div>

<div class="Sponsor MAL PHAGE halfpage frontmatter pagebreak">
  <!-- <h2 class="pt-0 pb-0">MALPHAGE Genomics Full [color]</h2> -->
  <img src="https://f2.phage.directory/airscripts/-evergreen-2023-live/content/recWWe5f4DTy0SOza/PHAGE-Ad-480x705-080723.jpg" width="100%" height="705px" alt="Ad Placement"/>
  <!-- <img src="/ad-placeholder.png" width="100%" height="705px" alt="Ad Placement"/> -->
</div>


<!-- back page front [color] - logo grid -->
<div class="Backpage front frontmatter pagebreak">
  <h2 class="pt-0 pb-0">Many thanks to our sponsors</h2>
  <div class="block grid grid-cols-2 gap-0">
    <div class=" p-2 text-center | mb-2 mb-0 | flex justify-center items-center">
      <a href="https://www.bcm.edu/research/research-centers/tailor" >
        <img class="inline" src="https://f2.phage.directory/airscripts/-evergreen-live/content/recbkFru4OHILuL7p/tailor-logo-sm1.jpg" alt="TAILOR Labs" />
      </a>
    </div>

    <div class=" p-2 text-center | mb-2 mb-0 | flex flex-col justify-center items-center">
      <a href="https://jafral.com" >
        <img class="inline" src="https://evergreen.phage.directory/JAFRAL.png" alt="JAFRAL" />
      </a>
      <div class="text-xs pt-2">THE phage contract manufacturer for GMP and non-GMP products
      </div>
    </div>

    <div class=" p-2 text-center | mb-2 mb-0 | flex flex-col justify-center items-center">
      <a href="https://phasegenomics.com" >
        <img class="inline" src="https://phasegenomics.com/wp-content/uploads/2016/12/phase-genomics-nav-logo.png" alt="Phase Genomics" />
      </a>
      <div class="text-xs pt-2">Phase Genomics applies ultra-long-range sequencing methods to enable metagenomic discovery, chromosome-scale genome assembly, and more
      </div>
    </div>

    <div class=" p-2 text-center | mb-2 mb-0 |">
      <div class="flex justify-center items-center">
      <a href="https://www.liebertpub.com/phage" >
      <img class="inline" style="width: 100%;" src="https://evergreen.phage.directory/Phage-logo-outlines-color.svg" alt="PHAGE" />
      </a>
      </div>
      <div class="text-xs pt-2">The only peer-reviewed journal dedicated to bacteriophage research and its applications in medicine, agriculture, aquaculture, veterinary applications, animal production, food safety, and food production.</div>
    </div>

    <div class=" p-2 text-center mb-2 mb-0  align-middle | flex justify-center items-center">
      <a href="https://www.phagesforglobalhealth.org/"><img class="inline" style="width: 100%; max-height: 120px" src="https://evergreen.phage.directory/pgh_logo_400.jpeg" alt="Phages for Global Health" /></a>
    </div>

    <div class=" p-2 text-center mb-2 mb-0  align-middle | flex justify-center items-center">
      <a href="https://rime-bioinformatics.com/"><img class="inline" style="width: 100%; max-height: 120px" src="https://f2.phage.directory/airscripts/-evergreen-2023-live/content/reckuB3EZqMu83Z3a/rime_color_sm.png" alt="Phages for Global Health" /></a>
    </div>

    <div class=" p-2 text-center mb-2 mb-0  align-middle | flex justify-center items-center">
      <a href="https://www.mdpi.com/journal/ddc?ci=33011&si=26552&_utm_from=53f6064e67"><img class="inline" style="width: 100%; max-height: 120px" src="https://f2.phage.directory/airscripts/-evergreen-2023-live/content/reckuB3EZqMu83Z3a/Drugs-and-Drug-Candidates-partnership.png" alt="MDPI Drugs and Drug Candidates" /></a>
    </div>

    <div class=" p-2 text-center mb-2 mb-0  align-middle | flex justify-center items-center">
      <a href="https://phage.health"><img class="inline" style="width: 100%; max-height: 120px" src="https://phage.health/wp-content/uploads/2021/09/logo-default.png" alt="Vesale Bioscience" /></a>
    </div>


    <div class=" p-2 text-center mb-2 mb-0 
    align-middle | flex justify-center items-center">
      <a href="https://phage.directory/"><img class="inline" style="width: 100%;" src="https://dl.phage.directory/MpmrA9ETYuIp88eMbpao_full_phagedirectory2x.png" alt="Phage Directory" /></a>
    </div>

    <div class=" p-2 text-center mb-2 mb-0 
    align-middle | flex justify-center items-center">
      <a class="text-evg-green-dark font-bold text-xl font-serif" href="https://phagefound.org">Phagebiotics Research Foundation</a>
    </div>

  </div>
</div>

<!-- back page back [color] -->
<div class="Backpage back pagebreak frontmatter mx-auto">
  <img class="block mx-auto mt-16" src="/evergreen-sd-2.jpg" width="80%" height="705px" alt="Evergreen"/>
</div>






<script>
  import { marked } from 'marked';
  import slugify from 'slugify'

  marked.use({
    breaks: true,
  })

  export let abstracts, sessions, authors;
  export let renderSessions = true;
  export let renderAuthorIndex = true;
  // abstracts = abstracts.slice(0,10); // limit for dev
  console.log('author list:', authors)

  export let event = {
    logoUrl: "https://f2.phage.directory/airscripts/-evergreen-2023-live/content/rectaUjlWh18lEZzG/evg23-full-logo.png",
    // logoUrl: "https://f2.phage.directory/airscripts/-evergreen-2023-live/content/rectaUjlWh18lEZzG/evg23_twitter_dates.jpg",
    logoWidth: "190px",

    name: `25<sup>th</sup> Biennial Evergreen International Phage Meeting`,
    simpleHeader: `#### August 6-11, 2023

#### The Evergreen State College, Olympia, WA
<br />
https://evergreen.phage.directory`,

    header: `#### Olympia, Washington 98505
https://evergreen.phage.directory

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

  @font-face {
    font-family: 'Fraunces';
    src: url('/fraunces/Fraunces-9ptBlack.woff2') format('woff2'),
      url('/fraunces/Fraunces-9ptBlack.woff') format('woff');
    font-weight: 900;
    font-style: normal;
    font-display: swap;
  }
  @font-face {
    font-family: 'Fraunces';
    src: url('/fraunces/Fraunces_72pt_SuperSoft-Light.woff') format('woff2'),
      url('/fraunces/Fraunces-9ptBlack.woff') format('woff');
    font-weight: light;
    font-style: normal;
    font-display: swap;
  }

  .font-serif {
    font-family: 'Fraunces';
    font-weight: light
  }

  .font-serif.font-bold{
    font-family: 'Fraunces';
    font-weight: 900;
  }

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

  .frontmatter {
    page: frontmatter;
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

  ol {
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