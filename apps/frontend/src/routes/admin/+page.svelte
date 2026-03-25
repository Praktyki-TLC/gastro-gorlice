<script lang="ts">
  import { enhance } from "$app/forms";
  let { data } = $props();
</script>

<main class="p-4 md:p-8 lg:px-20 max-w-screen-2xl mx-auto">
  <div
    class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8"
  >
    <div>
      <h1 class="text-3xl font-bold tracking-tight">Panel Administratora</h1>
      <p class="text-base-content/60">Zarządzaj bazą restauracji w systemie</p>
    </div>
    <a href="/admin/new" class="btn btn-primary shadow-md"
      >Dodaj nową restaurację</a
    >
  </div>

  <div
    class="bg-base-100 border border-base-300 rounded-box shadow-sm overflow-hidden"
  >
    <table class="table w-full">
      <thead class="bg-base-200/50">
        <tr>
          <th>Nazwa</th>
          <th>Slug (URL)</th>
          <th class="text-right">Akcje</th>
        </tr>
      </thead>
      <tbody>
        {#each data.restaurants as restaurant}
          <tr class="hover">
            <td
              ><span class="font-semibold text-base">{restaurant.name}</span
              ></td
            >
            <td
              ><code class="text-xs bg-base-300 px-2 py-1 rounded"
                >{restaurant.slug}</code
              ></td
            >
            <td class="text-right">
              <div class="flex justify-end gap-1">
                <a href="/admin/{restaurant.id}" class="btn btn-ghost btn-sm"
                  >Edytuj</a
                >
                <form
                  method="POST"
                  action="?/delete"
                  use:enhance={() => {
                    return async ({ result, update }) => {
                      if (confirm(`Czy na pewno usunąć ${restaurant.name}?`)) {
                        await update();
                      }
                    };
                  }}
                >
                  <input type="hidden" name="id" value={restaurant.id} />
                  <button class="btn btn-ghost btn-sm text-error">Usuń</button>
                </form>
              </div>
            </td>
          </tr>
        {:else}
          <tr>
            <td colspan="3" class="text-center py-10 opacity-50"
              >Brak zarejestrowanych restauracji</td
            >
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</main>
