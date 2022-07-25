<script>
	import Cropper from "svelte-easy-crop";
	import getCroppedImg from "./canvasUtils";

	export let crop = { x: 0, y: 0 };
	let zoom = 1;
	export let image, imgEl, fileinput, imageFile, pixelCrop, croppedImage, croppedBlob;
  export let cropperWidth = 150; 
  export let cropperHeight = 150;
  export let aspect = 1;
  export let showPreview = false;
  export let autoSetCropped = true; // so you don't forget to save

  let imageSize = {}

	function onFileSelected(e) {
	  imageFile = e.target.files[0];
	  let reader = new FileReader();
	  reader.onload = e => {
	    image = e.target.result;
	  };
	  reader.readAsDataURL(imageFile);
	}

	let profilePicture, style;

	function previewCrop(e) {
      
    // restricts position when zooming out
    crop = restrictPosition(crop, {width: imgEl.width, height: imgEl.height}, getCropSize(imgEl.width, imgEl.height, aspect), zoom)

    pixelCrop = e.detail.pixels;
    const { x, y, width } = e.detail.pixels;
    const scale = 200 / width;
    profilePicture.style = `margin: ${-y * scale}px 0 0 ${-x * scale}px; width: ${profilePicture.naturalWidth * scale}px;`;

    if(autoSetCropped) {
      cropImage()
      cropBlob()
    }
	}

	async function cropImage() {
	  croppedImage = await getCroppedImg(image, pixelCrop, 'fileurl');
	}

	async function cropBlob() {
	  croppedBlob = await getCroppedImg(image, pixelCrop);
	}

	function reset() {
	  croppedImage = null;
	  croppedBlob = null;
	  image = null;
    fileinput.value = '';
	}





  /**
   * Ensure a new image position stays in the crop area.
   * @param {{x: number, y: number}} position new x/y position requested for the image
   * @param {{width: number, height: number}} imageSize width/height of the src image
   * @param {{width: number, height: number}} cropSize width/height of the crop area
   * @param {number} zoom zoom value
   * @returns {{x: number, y: number}}
   */
  export function restrictPosition(position, imageSize, cropSize, zoom) {
    return {
      x: restrictPositionCoord(position.x, imageSize.width, cropSize.width, zoom),
      y: restrictPositionCoord(position.y, imageSize.height, cropSize.height, zoom),
    }
  }

  function restrictPositionCoord(position, imageSize, cropSize, zoom) {
    const maxPosition = (imageSize * zoom) / 2 - cropSize / 2
    return Math.min(maxPosition, Math.max(position, -maxPosition))
  }

  export function getCropSize(imgWidth, imgHeight, aspect) {
    if (imgWidth >= imgHeight * aspect) {
      return {
        width: imgHeight * aspect,
        height: imgHeight,
      }
    }
    return {
      width: imgWidth,
      height: imgWidth / aspect,
    }
  }

</script>


<slot></slot>
<input type="file" accept=".jpg, .jpeg, .png, .webp" on:change={(e)=>onFileSelected(e)} bind:this={fileinput} >

{#if image}
	<div class="mt-4" style="position: relative; width: {cropperWidth}px; height: {cropperHeight}px;">

    <!-- required for when restricts position when zooming out -->
    <img src={image} bind:this={imgEl} class="image" alt="tmp" style="opacity: 0;"/>

		<Cropper
			{image}
			bind:crop 
      bind:zoom
      maxZoom={9}
      aspect={aspect}
      croppedAreaPixels={true}
      restrictPosition={true}
			on:cropcomplete={previewCrop}
		/>
	</div>
  <div>
    <label class="block">
      <input bind:value={zoom} min=1 max=9 step="0.02" type="range" class="mt-1">
    </label>
  </div>
  <!-- {#if showPreview} -->
    <slot name="preview"></slot>
    <div class="prof-pic-wrapper" class:hidden={!showPreview}>
      <img
        bind:this={profilePicture}
        class="prof-pic"
        src={image}
        alt="Profile example"
        {style}
      />
    </div>
  <!-- {/if} -->
	{#if croppedImage}
		<!-- <img
			src={croppedImage}
			alt="Cropped profile"
		/><br> -->
  {/if}

	{#if image}
    <div class="flex gap-2">
      <button class="Btn-light" type="button" on:click={reset}>Cancel</button> 
      <button class="Btn-solid" type="button" on:click={async () => {
        cropImage();
        cropBlob();
        image = null; // closes the preview
      }}>Use image</button>
    </div>
  {/if}
	
{/if}

<style global>
  .prof-pic-wrapper {
    height: 200px;
    width: 200px;
    position: relative;
    border: solid;
    overflow: hidden;
  }

  .prof-pic {
    position: absolute;
    max-width: inherit;
  }

  .image {
    max-width: 100%;
    max-height: 100%;
    margin: auto;
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    will-change: transform;
  }
</style>