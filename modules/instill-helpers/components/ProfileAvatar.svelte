
<!-- 
  renders a user — requires the user object to have at least a name or the avatar image
  - this requires a full user object to be passed in, not just the user id
-->

<!-- preload styles -->
<span class="hidden w-40 h-40 w-12 h-12 w-8 h-8 w-6 h-6 | text-xl  text-lg text-md text-sm | object-cover rounded-full border-4"></span>

{#if imgSrc || user.Name}
  {#if imgSrc}
    <img class="ProfileAvatar {imgClass}" src={imgSrc} alt="{user.Name} profile"/>
  {:else}
    <span class="ProfileAvatar --placeholder {imgClass} inline-block flex | items-center align-center" src={imgSrc} alt="avatar">
      <span class="w-full text-center mx-auto {placeholderSize}">{getInitials(user.Name)}</span>
    </span>
  {/if}
{/if}

<script>
  import { commentUser } from '$instill/instill-store';
  export let user = $commentUser;
  export let imgSrc = user?.['ProfileImage:URL'] || user?.['ProfileImage'];
  export let size = 'md';
  export let imgClass, placeholderSize

  if(size == 'lg') {
    imgClass = 'w-40 h-40 object-cover rounded-full border-4 border-white'
    placeholderSize = 'text-4xl'
  } else if(size == 'md') {
    imgClass = 'w-16 h-16 object-cover rounded-full border-2 border-white'
    placeholderSize = 'text-2xl'
  } else if(size == 'sm') {
    imgClass = 'w-12 h-12 object-cover rounded-full border border-white'
    placeholderSize = 'text-2xl'
  } else if(size == 'xs') {
    imgClass = 'w-6 h-6 object-cover rounded-full border-white'
    placeholderSize = 'text-lg'
  }

  // $: console.log('profileavatar', user, $commentUser)

  function getInitials(name) {
    if(!name) return '';
    let initials = name.match(/\b\w/g) || [];
    initials = ((initials.shift() || '') + (initials.pop() || '')).toUpperCase();
    return initials;
  }

</script>