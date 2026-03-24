<script lang="ts">
  import "./page.css";
  import { onMount } from "svelte";
  import { Line } from "svelte-chartjs";
  import { enhance } from "$app/forms";
  import { defaultChartOptions } from "$lib/utils/chartConfig";

  import RestaurantInfo from "$lib/components/RestaurantInfo.svelte";
  import MenuCard from "$lib/components/MenuCard.svelte";

  import type { MenuContent } from "shared";

  let { data } = $props();

  const { restaurant, menuPriceHistory, menusDates } = $derived(data);

  const lastMenuDate = $derived(new Date(data.lastMenu?.date || 0));
  const now = new Date();
  const calendarDate = $derived(
    (lastMenuDate > now ? now : lastMenuDate).toISOString().split("T")[0],
  );

  // svelte-ignore state_referenced_locally
  let menu = $state(data.lastMenu);
  let chartView = $state<"day" | "week">("day");

  let formRef: HTMLFormElement;
  let calendarRef: HTMLElement & {
    value: string;
    isDateDisallowed: (date: Date) => boolean;
  };

  function updateMenu() {
    formRef.requestSubmit();
  }

  onMount(async () => {
    await import("cally");
    try {
      calendarRef.addEventListener("change", updateMenu);
      calendarRef.isDateDisallowed = isDateDisallowed;
    } catch (err) {}
  });

  const isDateDisallowed = (date: Date) =>
    !menusDates.includes(date.toISOString().split("T")[0]);

  let chartData = $derived.by(() => {
    const isDay = chartView === "day";
    const sourceData = isDay
      ? menuPriceHistory.byDay.filter((d: any) => d.price !== null)
      : menuPriceHistory.byWeek;

    return {
      labels: sourceData.map((d: any) =>
        new Date(d.date || d.week).toLocaleDateString("pl-PL", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }),
      ),
      datasets: [
        {
          label: isDay ? "Cena (zł)" : "Średnia cena (zł)",
          data: sourceData.map((d: any) => d.price),
          borderColor: isDay
            ? "oklch(42% 0.199 265.638)"
            : "oklch(43% 0.095 166.913)",
          backgroundColor: isDay
            ? "rgba(59, 130, 246, 0.2)"
            : "rgba(16, 185, 129, 0.2)",
          tension: 0.3,
          pointRadius: 4,
          pointHoverRadius: 6,
        },
      ],
    };
  });
</script>

<main class="p-4 md:p-8 lg:px-20 max-w-screen-2xl mx-auto">
  <RestaurantInfo {restaurant} />

  <section class="mb-12">
    <h2 class="text-xl lg:text-2xl font-bold mb-4">Dania dnia</h2>

    <!-- Menus archive -->
    <div class="flex flex-col md:flex-row items-stretch gap-6">
      <div class="flex-none w-full md:w-auto">
        <form
          action="?/updateDate"
          method="post"
          bind:this={formRef}
          use:enhance={({ formData }) => {
            formData.set("date", calendarRef.value);

            return async ({ update, result }) => {
              if (result.type === "success" && result.data) {
                menu = result.data as { date: Date; content: MenuContent };
              }
              await update({ reset: false });
            };
          }}
        >
          <calendar-date
            class="cally bg-base-100 border border-base-200 shadow-sm rounded-box w-full menu-date-picker"
            bind:this={calendarRef}
            {isDateDisallowed}
            value={calendarDate}
            today="1970-01-01"
          >
            <svg
              slot="previous"
              class="fill-current size-4"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              ><path fill="currentColor" d="M15.75 19.5 8.25 12l7.5-7.5" /></svg
            >
            <svg
              slot="next"
              class="fill-current size-4"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              ><path fill="currentColor" d="m8.25 4.5 7.5 7.5-7.5 7.5" /></svg
            >
            <calendar-month></calendar-month>
          </calendar-date>
        </form>
      </div>

      <MenuCard {menu} />
    </div>
  </section>

  <!-- Price chart -->
  {#if menuPriceHistory.byDay.some((x: any) => x.price != null)}
    <section>
      <div
        class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4"
      >
        <h2 class="text-xl lg:text-2xl font-bold">Historia cen</h2>

        <div role="tablist" class="tabs tabs-boxed">
          <button
            role="tab"
            class="tab {chartView === 'day' ? 'tab-active' : ''}"
            onclick={() => (chartView = "day")}>Dzienny</button
          >
          <button
            role="tab"
            class="tab {chartView === 'week' ? 'tab-active' : ''}"
            onclick={() => (chartView = "week")}>Tygodniowy</button
          >
        </div>
      </div>

      <div
        class="bg-base-100 border border-base-200 shadow-sm rounded-box p-4 h-80 w-full"
      >
        {#key chartView}
          <Line data={chartData} options={defaultChartOptions} />
        {/key}
      </div>
    </section>
  {/if}
</main>
