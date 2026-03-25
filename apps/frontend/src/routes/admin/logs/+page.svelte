<script lang="ts">
  let { data } = $props();

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleString("pl-PL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  }
</script>

<main class="p-4 md:p-8 lg:px-20 max-w-4xl mx-auto">
  <div class="flex justify-between items-center mb-8">
    <div>
      <h1 class="text-3xl font-bold tracking-tight">Logi Systemowe</h1>
      <p class="text-base-content/60">Historia operacji i błędów scrapowania</p>
    </div>
    <a href="/admin" class="btn btn-ghost">← Powrót</a>
  </div>

  <div
    class="bg-base-100 border border-base-300 rounded-box shadow-sm overflow-hidden"
  >
    <table class="table w-full">
      <thead class="bg-base-200/50">
        <tr>
          <th class="w-20">ID</th>
          <th>Data zdarzenia</th>
          <th class="text-right">Akcja</th>
        </tr>
      </thead>
      <tbody>
        {#each data.logs as log}
          <tr class="hover">
            <td class="font-mono text-xs opacity-70">#{log.id}</td>
            <td class="font-medium">{formatDate(log.createdAt)}</td>
            <td class="text-right">
              <a
                href="/admin/logs/{log.id}"
                class="btn btn-primary btn-xs btn-outline"
              >
                Pokaż treść
              </a>
            </td>
          </tr>
        {:else}
          <tr>
            <td colspan="3" class="text-center py-10 opacity-50"
              >Brak logów w bazie</td
            >
          </tr>
        {/each}
      </tbody>
    </table>
  </div>

  {#if data.pages > 1}
    <div class="flex justify-center mt-8">
      <div class="join shadow-sm">
        {#each Array(data.pages) as _, i}
          <a
            href="?page={i + 1}"
            class="join-item btn btn-sm {data.currentPage === i + 1
              ? 'btn-active'
              : ''}"
          >
            {i + 1}
          </a>
        {/each}
      </div>
    </div>
  {/if}
</main>
