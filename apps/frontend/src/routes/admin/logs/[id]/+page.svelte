<script lang="ts">
  let { data } = $props();

  const formattedDate = new Date(data.log.createdAt).toLocaleString("pl-PL");
</script>

<main class="p-4 md:p-8 lg:px-20 max-w-5xl mx-auto">
  <div
    class="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4"
  >
    <div>
      <a
        href="/admin/logs"
        class="text-sm link link-hover text-primary mb-2 inline-block"
        >← Powrót do listy logów</a
      >
      <h1 class="text-2xl font-bold">Log #{data.log.id}</h1>
      <p class="text-sm opacity-60">Utworzono: {formattedDate}</p>
    </div>

    <button
      class="btn btn-sm btn-outline"
      onclick={() => window.location.reload()}
    >
      Odśwież
    </button>
  </div>

  <div class="relative">
    <button
      class="absolute top-4 right-4 btn btn-xs btn-ghost bg-base-300/50"
      onclick={() => navigator.clipboard.writeText(data.log.log)}
    >
      Kopiuj
    </button>

    <div
      class="bg-neutral text-neutral-content p-6 rounded-box shadow-inner overflow-x-auto border border-white/10"
    >
      <pre class="font-mono text-sm leading-relaxed whitespace-pre-wrap">{data
          .log.log}</pre>
    </div>
  </div>
</main>
