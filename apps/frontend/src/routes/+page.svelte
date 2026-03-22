<script lang="ts">
  import { goto } from "$app/navigation";
  import SearchIcon from "$lib/components/icons/SearchIcon.svelte";

  let { data } = $props();

  // Zmienna przechowująca wpisaną frazę
  let searchQuery = $state("");

  // Reaktywne filtrowanie menu na podstawie wpisanej frazy
  let menus = $derived(
    data.todayMenus.filter((menu) =>
      menu.name.toLowerCase().includes(searchQuery.toLowerCase()),
    ),
  );

  let lastUpdate = $derived(
    data.lastUpdate ? new Date(data.lastUpdate).toLocaleString() : null,
  );

  function gotoRestarurantPage(slug: string) {
    goto(`/restaurant/${slug}`);
  }
</script>

<main class="p-4 md:p-8 lg:px-20 max-w-screen-2xl mx-auto">
  <header
    class="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8"
  >
    <div>
      <h1
        class="text-2xl md:text-4xl font-extrabold tracking-tight text-base-content"
      >
        Dania dnia
      </h1>
      <p class="text-base-content/60 mt-2">
        Sprawdź, co dobrego serwują dziś gorlickie restauracje
      </p>
    </div>

    <div class="w-full md:max-w-xs">
      <label
        class="input w-full input-bordered flex items-center gap-2 shadow-sm"
      >
        <SearchIcon />
        <input
          type="search"
          placeholder="Szukaj restauracji..."
          bind:value={searchQuery}
          class="grow"
        />
      </label>
    </div>
  </header>

  {#if menus.length === 0}
    <div class="py-20 text-center">
      <div class="text-4xl mb-4">🍽️</div>
      <h3 class="text-lg font-bold">Brak wyników</h3>
      <p class="text-base-content/60">
        Nie znaleźliśmy restauracji pasującej do "{searchQuery}"
      </p>
    </div>
  {:else}
    <div
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch"
    >
      {#each menus as menu}
        <div
          class="card bg-base-200/20 border border-base-200 shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer"
          onclick={() => gotoRestarurantPage(menu.slug)}
          onkeyup={() => gotoRestarurantPage(menu.slug)}
          role="button"
          tabindex="0"
        >
          <div class="p-5 border-b border-base-100">
            <h2
              class="card-title text-xl font-bold tracking-tight text-base-content"
            >
              {menu.name}
            </h2>
          </div>
          <div class="card-body p-5 flex flex-col h-full">
            {#if menu.content}
              <div class="grow space-y-4">
                <section>
                  <h3
                    class="text-xs font-semibold tracking-wider text-base-content/50 uppercase mb-2"
                  >
                    Zupy
                  </h3>
                  <div class="space-y-1">
                    {#each menu.content.soups as soup}
                      <div class="flex justify-between items-start group">
                        <span
                          class="text-sm leading-tight text-base-content/80"
                        >
                          {soup.name}
                        </span>
                        {#if soup.price}
                          <span class="text-xs font-mono ml-2 whitespace-nowrap"
                            >{soup.price} zł</span
                          >
                        {/if}
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
                        <span
                          class="text-sm leading-tight text-base-content/80"
                        >
                          {course.name}
                        </span>
                        {#if course.price}
                          <span class="text-xs font-mono ml-2 whitespace-nowrap"
                            >{course.price} zł</span
                          >
                        {/if}
                      </div>
                    {/each}
                  </div>
                </section>
              </div>
              {#if menu.content.fullSetPrice}
                <div
                  class="mt-6 pt-4 border-t border-dashed border-base-300 flex justify-between items-center"
                >
                  <span
                    class="text-xs uppercase font-semibold text-base-content/50"
                  >
                    Danie dnia
                  </span>
                  <div class="text-xl font-bold">
                    {menu.content.fullSetPrice}
                    <span class="text-sm font-normal">zł</span>
                  </div>
                </div>
              {/if}
              <div class="card-actions justify-center mt-4">
                <a
                  href={menu.sourceUrl || "#"}
                  target="_blank"
                  onclick={(e) => e.stopPropagation()}
                  class="btn btn-ghost btn-xs no-underline text-base-content/30 hover:text-primary"
                >
                  Zobacz źródło
                </a>
              </div>
            {:else}
              <div
                class="grow flex flex-col items-center justify-center opacity-40 py-10 text-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-10 w-10 mb-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="1.5"
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p class="text-sm italic">
                  Brak danych o dzisiejszym daniu dnia
                </p>
              </div>
            {/if}
          </div>
        </div>
      {/each}
    </div>
  {/if}

  {#if lastUpdate}
    <p class="text-sm text-base-content/70 mt-6 text-center">
      Ostatnia aktualizacja: <span class="font-semibold">{lastUpdate}</span>
    </p>
  {/if}
</main>
