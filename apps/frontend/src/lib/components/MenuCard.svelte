<script lang="ts">
  import type { MenuContent } from "shared";

  let { menu } = $props<{ menu: { content: MenuContent } | null | undefined }>();
</script>

<div class="card bg-base-100 border border-base-200 shadow-sm flex-1">
  <div class="card-body p-5 flex flex-col justify-between">
    {#if menu?.content && (menu.content.soups.length > 0 || menu.content.courses.length > 0)}
      <div>
        <div class="space-y-6">
          {#if menu.content.soups.length > 0}
            <section>
              <h3 class="text-xs font-semibold tracking-wider text-base-content/50 uppercase mb-3">Zupy</h3>
              <div class="space-y-2">
                {#each menu.content.soups as soup}
                  <div class="flex justify-between items-start group">
                    <span class="text-sm leading-tight text-base-content/80">{soup.name}</span>
                    {#if soup.price}
                      <span class="text-xs font-mono ml-3 whitespace-nowrap bg-base-200 px-2 py-0.5 rounded">{soup.price} zł</span>
                    {/if}
                  </div>
                {/each}
              </div>
            </section>
          {/if}

          {#if menu.content.courses.length > 0}
            <section>
              <h3 class="text-xs font-semibold tracking-wider text-base-content/50 uppercase mb-3">Drugie dania</h3>
              <div class="space-y-2">
                {#each menu.content.courses as course}
                  <div class="flex justify-between items-start">
                    <span class="text-sm leading-tight text-base-content/80">{course.name}</span>
                    {#if course.price}
                      <span class="text-xs font-mono ml-3 whitespace-nowrap bg-base-200 px-2 py-0.5 rounded">{course.price} zł</span>
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