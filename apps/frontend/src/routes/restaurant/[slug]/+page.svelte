<script lang="ts">
  import "cally";

  import FacebookIcon from "$lib/components/icons/FacebookIcon.svelte";
  import MapPinIcon from "$lib/components/icons/MapPinIcon.svelte";
  import PhoneIcon from "$lib/components/icons/PhoneIcon.svelte";
  import WebsiteIcon from "$lib/components/icons/WebsiteIcon.svelte";

  const { data } = $props();

  const restaurant = $derived(data.restaurant);
</script>

<div class="p-4 md:p-8 lg:px-25">
  <div class="flex justify-between">
    <div class="hidden lg:block"></div>
    <h1 class="text-2xl lg:text-4xl font-bold">{restaurant.name}</h1>
    <a href={restaurant.facebookUrl} class="btn btn-circle">
      <FacebookIcon />
    </a>
  </div>

  <section
    class="flex flex-col lg:flex-row flex-wrap lg:justify-center lg:items-center mt-4 gap-2 lg:gap-8 lg:mx-10"
  >
    {#if restaurant.phoneNumber}
      <a
        href={`tel:${restaurant.phoneNumber}`}
        class="link link-hover flex text-sm gap-1.5 items-center"
      >
        <PhoneIcon />
        {restaurant.phoneNumber}
      </a>
    {/if}
    {#if restaurant.address}
      <a
        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(restaurant.address)}`}
        target="_blank"
        rel="noopener noreferrer"
        class="link link-hover flex text-sm gap-1.5 items-center"
      >
        <MapPinIcon />
        {restaurant.address}
      </a>
    {/if}
    {#if restaurant.webpage}
      <a
        href={restaurant.webpage}
        class="link link-hover flex text-sm gap-1.5 items-center"
        target="_blank"
      >
        <WebsiteIcon />
        {restaurant.webpage}
      </a>
    {/if}
  </section>

  <section>
    <h2 class="text-xl lg:text-2xl font-bold my-4">Dania dnia</h2>

    <div class="flex">
      <calendar-date
        class="cally bg-base-100 border border-base-300 shadow-lg rounded-box"
      >
        <svg
          aria-label="Previous"
          class="fill-current size-4"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          slot="previous"
          ><path fill="currentColor" d="M15.75 19.5 8.25 12l7.5-7.5"
          ></path></svg
        >
        <svg
          aria-label="Next"
          class="fill-current size-4"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          slot="next"
          ><path fill="currentColor" d="m8.25 4.5 7.5 7.5-7.5 7.5"></path></svg
        >
        <calendar-month></calendar-month>
      </calendar-date>
    </div>
  </section>
</div>
