<script lang="ts">
  let props = $props();
</script>

<main
  class="md:mx-10 lg:mx-20 my-4 flex flex-wrap gap-4 justify-center items-stretch"
>
  {#each props.data.todayMenus as menu}
    {#if menu.content}
      <div
        class="card card-border bg-base-100 grow basis-full md:basis-[calc(33.333%-1rem)] flex flex-col"
      >
        <div class="card-body flex flex-col h-full">
          <h2 class="card-title text-xl mb-2">{menu.name}</h2>

          <div class="grow">
            <p class="font-bold border-b border-base-200 pb-1 mb-1 mt-2">
              Zupy
            </p>
            <ul class="list-disc list-inside mb-4">
              {#each menu.content.soups as soup}
                <li class="text-sm">{soup.name}</li>
              {/each}
            </ul>

            <p class="font-bold border-b border-base-200 pb-1 mb-1">
              Drugie dania
            </p>
            <ul class="list-disc list-inside">
              {#each menu.content.courses as course}
                <li class="text-sm">{course.name}</li>
              {/each}
            </ul>
          </div>

          {#if menu.content.fullSetPrice}
            <div class="card-actions justify-end mt-4">
              <div class="">
                Cena zestawu: <span class="font-bold"
                  >{menu.content.fullSetPrice} zł</span
                >
              </div>
            </div>
          {/if}
        </div>
      </div>
    {:else}
      <div
        class="card card-border bg-base-100 grow basis-full md:basis-[calc(33.333%-1rem)] flex flex-col"
      >
        <div class="card-body flex flex-col h-full">
          <h2 class="card-title text-xl mb-2">{menu.name}</h2>

          <p>Brak danych</p>
        </div>
      </div>
    {/if}
  {/each}
</main>
