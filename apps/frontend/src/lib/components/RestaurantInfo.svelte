<script lang="ts">
  import FacebookIcon from "$lib/components/icons/FacebookIcon.svelte";
  import WebsiteIcon from "$lib/components/icons/WebsiteIcon.svelte";
  import MapPinIcon from "$lib/components/icons/MapPinIcon.svelte";
  import PhoneIcon from "$lib/components/icons/PhoneIcon.svelte";

  type Props = {
    restaurant: {
        name: string;
        facebookUrl?: string | null;
        phoneNumber: string | null;
        address: string | null;
        webpage: string | null;
    }
  }

  let { restaurant }: Props = $props();
</script>

<header class="flex justify-between items-start gap-4 mb-2">
  <h1 class="text-2xl md:text-4xl font-extrabold tracking-tight text-base-content">
    {restaurant.name}
  </h1>
  {#if restaurant.facebookUrl}
    <a href={restaurant.facebookUrl} target="_blank" rel="noopener noreferrer" class="btn btn-circle btn-ghost bg-base-200 shadow-sm" aria-label="Facebook">
      <FacebookIcon />
    </a>
  {/if}
</header>

<section class="flex flex-wrap items-center gap-x-6 gap-y-2 mb-8 text-base-content/80">
  {#if restaurant.phoneNumber}
    <a href={`tel:${restaurant.phoneNumber}`} class="link link-hover flex text-sm gap-1.5 items-center">
      <PhoneIcon /> {restaurant.phoneNumber}
    </a>
  {/if}
  {#if restaurant.address}
    <a href={`https://maps.google.com/?q=${encodeURIComponent(restaurant.address)}`} target="_blank" rel="noopener noreferrer" class="link link-hover flex text-sm gap-1.5 items-center">
      <MapPinIcon /> {restaurant.address}
    </a>
  {/if}
  {#if restaurant.webpage}
    <a href={restaurant.webpage} class="link link-hover flex text-sm gap-1.5 items-center" target="_blank" rel="noopener noreferrer">
      <WebsiteIcon /> {restaurant.webpage}
    </a>
  {/if}
</section>