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

  // Rejestracja modułów Chart.js
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

  // svelte-ignore state_referenced_locally
  let menu = $state(lastMenu);
  let chartView = $state<"day" | "week">("day");

  function updateMenu(e: Event) {
    fetch(
      `${data.backendUrl}/menus/${restaurant.slug}/${(e.target as any)?.value}`,
    )
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
      legend: {
        display: false,
      },
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

    <div class="flex flex-col md:flex-row items-stretch gap-2">
      <div class="flex-1 md:flex-none">
        <!-- svelte-ignore event_directive_deprecated -->
        <calendar-date
          class="cally bg-base-100 border border-base-300 shadow-lg rounded-box w-full menu-date-picker"
          bind:this={calendarRef}
          {isDateDisallowed}
          value={lastMenu
            ? new Date(lastMenu.date).toISOString().split("T")[0]
            : undefined}
          today="1970-01-01"
        >
          <svg
            aria-label="Poprzednie"
            class="fill-current size-4"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            slot="previous"
            ><path fill="currentColor" d="M15.75 19.5 8.25 12l7.5-7.5"
            ></path></svg
          >
          <svg
            aria-label="Następne"
            class="fill-current size-4"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            slot="next"
            ><path fill="currentColor" d="m8.25 4.5 7.5 7.5-7.5 7.5"
            ></path></svg
          >
          <calendar-month></calendar-month>
        </calendar-date>
      </div>

      <div class="p-5 flex flex-col justify-between flex-1">
        {#if menu?.content}
          <div>
            <div class="space-y-4">
              <section>
                <h3
                  class="text-xs font-semibold tracking-wider text-base-content/50 uppercase mb-2"
                >
                  Zupy
                </h3>
                <div class="space-y-1">
                  {#each menu.content.soups as soup}
                    <div class="flex justify-between items-start group">
                      <span class="text-sm leading-tight text-base-content/80"
                        >{soup.name}</span
                      >
                      {#if soup.price}<span class="text-xs font-mono ml-2"
                          >{soup.price}zł</span
                        >{/if}
                    </div>
                  {/each}
                </div>
              </section>
              <section>
                <h3
                  class="text-xs font-semibold tracking-wider text-base-content/50 uppercase mb-2"
                >
                  Drugie dania
                </h3>
                <div class="space-y-1">
                  {#each menu.content.courses as course}
                    <div class="flex justify-between items-start">
                      <span class="text-sm leading-tight text-base-content/80"
                        >{course.name}</span
                      >
                      {#if course.price}<span class="text-xs font-mono ml-2"
                          >{course.price}zł</span
                        >{/if}
                    </div>
                  {/each}
                </div>
              </section>
            </div>
          </div>
          {#if menu.content.fullSetPrice}
            <div
              class="mt-6 pt-4 border-t border-dashed border-base-300 flex justify-between items-center"
            >
              <span class="text-xs uppercase font-semibold text-base-content/50"
                >Danie dnia</span
              >
              <div class="text-xl font-bold">
                {menu.content.fullSetPrice}
                <span class="text-sm font-normal">zł</span>
              </div>
            </div>
          {/if}
        {:else}
          <p>Brak danych w tym dniu</p>
        {/if}
      </div>
    </div>
  </section>

  {#if menuPriceHistory.byDay.filter((x) => x.price != null).length > 0}
    <section class="mt-8">
      <div
        class="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-4 gap-4"
      >
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

      <div
        class="bg-base-100 border border-base-300 shadow-lg rounded-box p-4 h-72 w-full"
      >
        {#key chartView}
          <Line data={chartData} options={chartOptions} />
        {/key}
      </div>
    </section>
  {/if}
</div>
