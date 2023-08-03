

<div class="outer font-serif">
  <div class="frame">
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
      <div class="event-attendee | my-4">
        <div class="| pt-0 pb-0 pfix">{@html marked(attendee.text || 'no attendee')}</div>
      </div>
      <div class="event-message | my-4">
        <div class="| pt-0 pb-0 pfix">{@html marked(event.message)}</div>
      </div>
  
      <div class="event-signature | mt-4">
        <div class="pfix">{@html marked(event.signature)}</div>
      </div>

    </div>
  </div>
  <img alt="footer" style="padding-top: 8px; width: 100%; height: 280px; object-fit: cover; object-position: bottom" src='https://f2.phage.directory/airscripts/-evergreen-2023-live/content/rectaUjlWh18lEZzG/evg23_twitter_dates.jpg' >
</div>




<script>
  import { marked } from 'marked';



  marked.use({
    breaks: true,
  })

  export let attendee = {
    name: `Jan Zheng`,
    text:`Jan Zheng
Phage Directory
Sydney, Australia
jan@phage.directory`
  };


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
    message: `To Whom It May Concern:

This is to certify that ${attendee.name} registered for the 25th Biennial Evergreen International Phage Meeting, held August 6nd - 11th, 2023 at the Evergreen State College, in Olympia Washington. We hope to see them again in the future.

Sincerely,
    `,

    signature: `<img src="/betty_sig.png" width="380px" />

Dr. Elizabeth Kutter
Head, Lab of Phage Biology and Emerita Member of the Faculty in Biophysics, The Evergreen State College
[kutterb@evergreen.edu](kutterb@evergreen.edu)
    `,
  };

</script>


<style lang="scss" global>

  .outer {
    @apply bg-evg-green-lightest p-2;
  }
  .frame {
    @apply bg-white border-evg-active-green border-spacing-2 border-2 p-8 rounded-lg;
  }
  h4 {
    padding-bottom: 0 !important; 
  }
</style>