<script lang="ts">
  import "./page.css";
  import "cally";

  import { Line } from "svelte-chartjs";
  import { onMount } from "svelte";
  import {
    Chart as ChartJS,
    Title,
    Tooltip,
    Legend,
    LineElement,
    LinearScale,
    PointElement,
    CategoryScale,
  } from "chart.js";

  ChartJS.register(
    Title,
    Tooltip,
    Legend,
    LineElement,
    LinearScale,
    PointElement,
    CategoryScale,
  );

  import type { MenuByDateResponse } from "shared";

  import FacebookIcon from "$lib/components/icons/FacebookIcon.svelte";
  import WebsiteIcon from "$lib/components/icons/WebsiteIcon.svelte";
  import MapPinIcon from "$lib/components/icons/MapPinIcon.svelte";
  import PhoneIcon from "$lib/components/icons/PhoneIcon.svelte";

  let { data } = $props();

  let restaurant = $derived(data.restaurant);
  let lastMenu = $derived(data.lastMenu);
  let menuPriceHistory = $derived(data.menuPriceHistory);

  const lastMenuDate = $derived(new Date(lastMenu?.date || 0));
  const now = new Date();
  const targetDate = $derived(lastMenuDate > now ? now : lastMenuDate);
  const calendarDate = $derived(targetDate.toISOString().split("T")[0]);

  // svelte-ignore state_referenced_locally
  let menu = $state(lastMenu);
  let chartView = $state<"day" | "week">("day");

  function updateMenu(e: Event) {
    const selectedDate = (e.target as HTMLInputElement)?.value;
    if (!selectedDate) return;

    fetch(`${data.backendUrl}/menus/${restaurant.slug}/${selectedDate}`)
      .then((res) => res.json())
      .then((res: MenuByDateResponse) => {
        menu = res;
      })
      .catch(() => {
        menu = undefined;
      });
  }

  let calendarRef: HTMLElement;
  onMount(() => {
    calendarRef.addEventListener("change", updateMenu);
    return () => calendarRef?.removeEventListener("change", updateMenu);
  });

  const isDateDisallowed = (date: Date) =>
    !data.menusDates.includes(date.toISOString().split("T")[0]);

  let chartData = $derived.by(() => {
    if (chartView === "day") {
      const validData = menuPriceHistory.byDay.filter((d) => d.price !== null);
      return {
        labels: validData.map((d) =>
          new Date(d.date).toLocaleDateString("pl-PL", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          }),
        ),
        datasets: [
          {
            label: "Cena (zł)",
            data: validData.map((d) => d.price as number),
            borderColor: "oklch(42% 0.199 265.638)",
            backgroundColor: "rgba(59, 130, 246, 0.2)",
            tension: 0.3,
            pointRadius: 4,
            pointHoverRadius: 6,
          },
        ],
      };
    } else {
      const validData = menuPriceHistory.byWeek;
      return {
        labels: validData.map((d) =>
          new Date(d.week).toLocaleDateString("pl-PL", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          }),
        ),
        datasets: [
          {
            label: "Średnia cena (zł)",
            data: validData.map((d) => d.price),
            borderColor: "oklch(43% 0.095 166.913)",
            backgroundColor: "rgba(16, 185, 129, 0.2)",
            tension: 0.3,
            pointRadius: 4,
            pointHoverRadius: 6,
          },
        ],
      };
    }
  });

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context: any) => `${context.parsed.y} zł`,
        },
      },
    },
    scales: {
      y: {
        ticks: {
          callback: (value: any) => `${value} zł`,
        },
      },
    },
  };
</script>

<main class="p-4 md:p-8 lg:px-20 max-w-screen-2xl mx-auto">
  <header class="flex justify-between items-start gap-4 mb-2">
    <h1 class="text-2xl md:text-4xl font-extrabold tracking-tight text-base-content">
      {restaurant.name}
    </h1>
    {#if restaurant.facebookUrl}
      <a
        href={restaurant.facebookUrl}
        target="_blank"
        rel="noopener noreferrer"
        class="btn btn-circle btn-ghost bg-base-200 shadow-sm"
        aria-label="Facebook"
      >
        <FacebookIcon />
      </a>
    {/if}
  </header>

  <section class="flex flex-wrap items-center gap-x-6 gap-y-2 mb-8 text-base-content/80">
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
        href={`https://maps.google.com/?q=${encodeURIComponent(restaurant.address)}`}
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
        rel="noopener noreferrer"
      >
        <WebsiteIcon />
        {restaurant.webpage}
      </a>
    {/if}
  </section>

  <section class="mb-12">
    <h2 class="text-xl lg:text-2xl font-bold mb-4">Dania dnia</h2>

    <div class="flex flex-col md:flex-row items-stretch gap-6">
      <div class="flex-none w-full md:w-auto">
        <calendar-date
          class="cally bg-base-100 border border-base-200 shadow-sm rounded-box w-full menu-date-picker"
          bind:this={calendarRef}
          {isDateDisallowed}
          value={calendarDate}
          today="1970-01-01"
        >
          <svg
            aria-label="Poprzednie"
            class="fill-current size-4"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            slot="previous"
            ><path fill="currentColor" d="M15.75 19.5 8.25 12l7.5-7.5" /></svg>
          <svg
            aria-label="Następne"
            class="fill-current size-4"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            slot="next"
            ><path fill="currentColor" d="m8.25 4.5 7.5 7.5-7.5 7.5" /></svg>
          <calendar-month></calendar-month>
        </calendar-date>
      </div>

      <div class="card bg-base-100 border border-base-200 shadow-sm flex-1">
        <div class="card-body p-5 flex flex-col justify-between">
          {#if menu?.content && (menu.content.soups.length > 0 || menu.content.courses.length > 0)}
            <div>
              <div class="space-y-6">
                {#if menu.content.soups.length > 0}
                  <section>
                    <h3 class="text-xs font-semibold tracking-wider text-base-content/50 uppercase mb-3">
                      Zupy
                    </h3>
                    <div class="space-y-2">
                      {#each menu.content.soups as soup}
                        <div class="flex justify-between items-start group">
                          <span class="text-sm leading-tight text-base-content/80">
                            {soup.name}
                          </span>
                          {#if soup.price}
                            <span class="text-xs font-mono ml-3 whitespace-nowrap bg-base-200 px-2 py-0.5 rounded">
                              {soup.price} zł
                            </span>
                          {/if}
                        </div>
                      {/each}
                    </div>
                  </section>
                {/if}

                {#if menu.content.courses.length > 0}
                  <section>
                    <h3 class="text-xs font-semibold tracking-wider text-base-content/50 uppercase mb-3">
                      Drugie dania
                    </h3>
                    <div class="space-y-2">
                      {#each menu.content.courses as course}
                        <div class="flex justify-between items-start">
                          <span class="text-sm leading-tight text-base-content/80">
                            {course.name}
                          </span>
                          {#if course.price}
                            <span class="text-xs font-mono ml-3 whitespace-nowrap bg-base-200 px-2 py-0.5 rounded">
                              {course.price} zł
                            </span>
                          {/if}
                        </div>
                      {/each}
                    </div>
                  </section>
                {/if}
              </div>
            </div>

            {#if menu.content.fullSetPrice}
              <div class="mt-8 pt-4 border-t border-dashed border-base-300 flex justify-between items-center bg-base-100">
                <span class="text-xs uppercase font-semibold text-base-content/50">Danie dnia</span>
                <div class="text-2xl font-extrabold">
                  {menu.content.fullSetPrice}
                  <span class="text-sm font-normal text-base-content">zł</span>
                </div>
              </div>
            {/if}
          {:else}
            <div class="grow flex flex-col items-center justify-center opacity-40 py-10 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 class="text-lg font-bold">Brak menu</h3>
              <p class="text-sm italic mt-1">Nie dodano jeszcze menu na ten dzień.</p>
            </div>
          {/if}
        </div>
      </div>
    </div>
  </section>

  {#if menuPriceHistory.byDay.filter((x) => x.price != null).length > 0}
    <section>
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
        <h2 class="text-xl lg:text-2xl font-bold">Historia cen</h2>

        <div role="tablist" class="tabs tabs-boxed">
          <button
            role="tab"
            class="tab {chartView === 'day' ? 'tab-active' : ''}"
            onclick={() => (chartView = "day")}
          >
            Dzienny
          </button>
          <button
            role="tab"
            class="tab {chartView === 'week' ? 'tab-active' : ''}"
            onclick={() => (chartView = "week")}
          >
            Tygodniowy
          </button>
        </div>
      </div>

      <div class="bg-base-100 border border-base-200 shadow-sm rounded-box p-4 h-80 w-full">
        {#key chartView}
          <Line data={chartData} options={chartOptions} />
        {/key}
      </div>
    </section>
  {/if}
</main>