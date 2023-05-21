<!-- 

Official letterhead: The visa letter should be printed on the official letterhead of the conference host or organizing institution.
- Full name and contact details: Include the full name, job title, and contact details (email address and phone number) of the person responsible for issuing the visa letter.
- Participant's information: Obtain the participant's full name, gender, date of birth, nationality, passport number, and passport expiration date. Ensure that the participant provides accurate and up-to-date information.
- Conference details: Include the name, date(s), and location of the conference. Provide a brief overview of the conference, its theme, and the significance of the event in the respective academic field.
- Participant's role: Specify the participant's role in the conference, such as presenter, speaker, or attendee. If applicable, mention the title of their presentation or session.
- Invitation statement: Clearly state that the participant is invited to attend the conference. Highlight the importance of their participation and their contribution to the academic or professional exchange of ideas during the event.
- Duration of stay: Specify the exact dates of the conference, including the arrival and departure dates.
- Financial responsibility: Indicate whether the conference organizer will cover any expenses related to the participant's attendance (e.g., registration fees, accommodation, or travel). If the conference organizer is not providing financial support, mention that the participant will be responsible for their own expenses.
- Contact information: Provide the contact details of the conference organizer, including the name, address, email address, and phone number. This allows the embassy or consulate to verify the authenticity of the invitation if necessary.
Signature: The visa letter should be signed by an authorized representative of the conference host or organizing institution.




 -->



<div class="font-serif">
  <div class="">
    {#if event.logoUrl}
      <div class="logo">
        <img src={event.logoUrl} width={event.logoWidth} alt="Logo Header"/>
      </div>
    {/if}
    
    <div class="event-name">
      <h1 class="text-2xl pt-6 pb-2 pfix">{@html marked(event.name)}</h1>
    </div>
    <!-- <div class="event-date">
      <div class="text-xl | pt-0 pfix">{@html marked(event.date)}</div>
    </div> -->
    <div class="event-organizer">
      <div class="| pt-0 pb-0 pfix | text-sm">{@html marked(event.organizer)}</div>
      <!-- <div class="">Issuing Country: {event.country}</div> -->
    </div>
    <div class="event-attendee-info | my-4 text-sm">
      <div class="| pt-0 pb-0 pfix | "> 
        <div class="flex gap-8 | ">
          <!-- left half -->
          <div>
            <!-- get first half of array length of getPairs() -->
            {#each getPairs().slice(0, Math.floor(getPairs().length / 2)) as [key, value]}
              <dl class="grid grid-cols-1-2 gap-x-2">
                <dt class="capitalize">{key}:</dt>
                <dd>{value}</dd>
              </dl>
            {/each}
          </div>
          <!-- right half -->
          <div>
            {#each getPairs().slice(Math.floor(getPairs().length / 2)) as [key, value]}
              <dl class="grid grid-cols-1-2 gap-x-2">
                <dt class="capitalize">{key}:</dt>
                <dd>{value}</dd>
              </dl>
            {/each}
          </div>
        </div>
      </div>
      {#if attendee.notes}
        <div class="event-attendee-notes | mt-2">{@html marked(attendee.notes)}</div>
      {/if}
    </div>
    
    <div class="event-invitation | my-4">
      <!-- <div class="">Dear {attendee?.fname || attendee?.name},</div> -->
      <div class="| pt-0 pb-0 pfix">{@html marked(event.invitation)}</div>
    </div>

    <div class="event-signature | mt-4">
      <div class="pfix">{@html marked(event.signature)}</div>
    </div>
  </div>
</div>

<script>
  import { marked } from 'marked';
  marked.use({
    breaks: true,
  })

  export let event = {
    logoUrl: "https://f2.phage.directory/airscripts/-evergreen-2023-live/content/rectaUjlWh18lEZzG/evg23-full-logo.png",
    logoWidth: "120px",

    name: `25<sup>th</sup> Biennial Evergreen International Phage Meeting`,
    // date: `August 6-11, 2023`,
    organizer: `
August 6-11, 2023 — The Biennial Evergreen International Phage Meeting is a conference where participants present their latest research in bacteriophage biology and applications.
<div class=""> The Evergreen State College Olympia, WA 98505</div>
Dr. Elizabeth Kutter, Organizing Committee Chair | Evergreen Phage Lab | tescphage@gmail.com
    `,
    invitation: `
As you know, the 25th Biennial Evergreen International Phage Meeting will be held August 6-11 at The Evergreen State College. We invite you to attend and encourage you to present any related research in the field of bacteriophage. Bring a poster presentation to be displayed throughout the meeting, facilitating discussions about all aspects of your work and furthering efforts to develop international collaborations. If you wish for your work to be considered for a speaking slot in this meeting, please submit a draft abstract to tescphage@gmail.com by May 15th, 2023.

Let us know if you need anything further from us to support your application to attend the meeting.
    `,

    signature: `Sincerely,
    Dr. Elizabeth Kutter
    The Evergreen State College
    [kutterb@evergreen.edu](kutterb@evergreen.edu)
    `,
  };

  export let attendee = {
    name: "John Doe",
    affiliation: "UNSW, Sydney",
    email: "jondoe@gmail.com",
    pairs: `Passport #: 123-4567-89
Passport Expiration: Jan 1, 2025
Date of Birth: January 1, 1980
Place of Birth: Sydney, Australia
    `,
    notes: "This is a test note",
    country: `Australia`,
  };

  function getPairs() {
    let pairs = []
    pairs.push(...Object.entries(attendee))
    pairs.push(...splitPairs(attendee.pairs).map(pair=>[pair.key, pair.value]))
    pairs = pairs.filter(p=>![ 'pairs', 'notes' ].includes(p[0]))
    // console.log('---> pairs:', pairs)
    return pairs
  }


  function splitPairs(pairs) {
    const lines = pairs.split('\n');
    const keyValuePairs = lines.map(line => {
      line = line.trim()
      // console.log(`line: [${line}]`, line.length)
      if(line && line.length > 0) {
        const [key, value] = line.split(':');
        return { key: key?.trim(), value: value?.trim() };
      }
    });
    // console.log('pairs:', keyValuePairs)
    return keyValuePairs.filter(x=>x); // filter out null
  }
</script>
