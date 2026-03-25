<script lang="ts">
  import { enhance } from "$app/forms";
  let { data, form } = $props();

  const isNew = $derived(data.id === "new");
  const r = $derived(data.restaurant || {});

  let name = $state(r.name ?? "");
  let slug = $state(r.slug ?? "");
  let isSlugCustom = $state(false);

  function createSlug(text: string) {
    const a =
      "àáâäæãåāăąçćčđďèéêëēėęěğǵḧîïíīįìıĵķłľĺñńňòóôöœøõőōṕŕřßśšşșťțûüúūųůűųẃẍÿýžźż·/_,:;";
    const b =
      "aaaaaaaaaacccddeeeeeeeegghiiiiiiijklllnnnoooooooooprrsssssttuuuuuuuuwwxyyzzz------";
    const p = new RegExp(a.split("").join("|"), "g");

    return text
      .toString()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(p, (c) => b.charAt(a.indexOf(c)))
      .replace(/&/g, "-and-")
      .replace(/[^\w\-]+/g, "")
      .replace(/\-\-+/g, "-")
      .replace(/^-+/, "")
      .replace(/-+$/, "");
  }

  $effect(() => {
    if (isNew && !isSlugCustom) {
      slug = createSlug(name);
    }
  });
</script>

<div class="p-4 md:p-8 max-w-4xl mx-auto mb-20">
  <div class="flex items-center justify-between mb-8">
    <div class="flex items-center gap-4">
      <a href="/admin" class="btn btn-circle btn-ghost btn-sm">←</a>
      <h1 class="text-3xl font-bold tracking-tight">
        {isNew ? "Nowa Restauracja" : "Edycja Restauracji"}
      </h1>
    </div>
  </div>

  <form method="POST" action="?/save" use:enhance class="space-y-6">
    <div class="card bg-base-100 border border-base-300 shadow-sm">
      <div class="card-body p-0">
        <h2 class="px-8 pt-6 pb-2 text-sm uppercase opacity-50 font-bold">
          Informacje podstawowe
        </h2>

        <div class="divide-y divide-base-300">
          <div
            class="flex flex-col sm:flex-row sm:items-center justify-between px-8 py-4 gap-4"
          >
            <label class="font-bold text-base-content/80 min-w-[150px]"
              >Nazwa</label
            >
            <input
              name="name"
              bind:value={name}
              placeholder="np. Karczma u Jana"
              class="input input-bordered w-full sm:max-w-md focus:input-primary"
              required
            />
          </div>

          <div
            class="flex flex-col sm:flex-row sm:items-center justify-between px-8 py-4 gap-4"
          >
            <div class="flex flex-col">
              <label class="font-bold text-base-content/80 min-w-[150px]"
                >Slug (URL)</label
              >
              {#if isSlugCustom}
                <button
                  type="button"
                  class="text-xs link text-primary text-left"
                  onclick={() => (isSlugCustom = false)}
                >
                  Przywróć automat
                </button>
              {/if}
            </div>
            <input
              name="slug"
              bind:value={slug}
              oninput={() => (isSlugCustom = true)}
              placeholder="np. karczma-u-jana"
              class="input input-bordered w-full sm:max-w-md font-mono text-sm"
              required
            />
          </div>

          <div
            class="flex flex-col sm:flex-row sm:items-center justify-between px-8 py-4 gap-4"
          >
            <label class="font-bold text-base-content/80 min-w-[150px]"
              >Telefon</label
            >
            <input
              name="phoneNumber"
              value={r.phoneNumber ?? ""}
              placeholder="+48..."
              class="input input-bordered w-full sm:max-w-md"
            />
          </div>

          <div
            class="flex flex-col sm:flex-row sm:items-center justify-between px-8 py-4 gap-4"
          >
            <label class="font-bold text-base-content/80 min-w-[150px]"
              >Adres</label
            >
            <input
              name="address"
              value={r.address ?? ""}
              placeholder="ul. Prosta 1, Miasto"
              class="input input-bordered w-full sm:max-w-md"
            />
          </div>

          <div
            class="flex flex-col sm:flex-row sm:items-center justify-between px-8 py-4 gap-4"
          >
            <label class="font-bold text-base-content/80 min-w-[150px]"
              >Strona WWW</label
            >
            <input
              name="webpage"
              value={r.webpage ?? ""}
              type="url"
              placeholder="https://..."
              class="input input-bordered w-full sm:max-w-md"
            />
          </div>
        </div>
      </div>
    </div>

    <div class="card bg-base-100 border border-base-300 shadow-sm">
      <div class="card-body p-0">
        <h2 class="px-8 pt-6 pb-2 text-sm uppercase opacity-50 font-bold">
          Pobieranie danych
        </h2>

        <div class="divide-y divide-base-300">
          <div
            class="flex flex-col sm:flex-row sm:items-center justify-between px-8 py-4 gap-4"
          >
            <label class="font-bold text-base-content/80 min-w-[150px]"
              >URL Facebook</label
            >
            <input
              name="scrapingUrl"
              value={r.scrapingUrl ?? ""}
              type="url"
              placeholder="https://facebook.com/..."
              class="input input-bordered w-full sm:max-w-md"
            />
          </div>

          <div
            class="flex flex-col sm:flex-row sm:items-center justify-between px-8 py-4 gap-4"
          >
            <label class="font-bold text-base-content/80 min-w-[150px]"
              >Provider</label
            >
            <select
              name="provider"
              value={r.provider ?? "facebook"}
              class="select select-bordered w-full sm:max-w-md"
            >
              <option value="facebook">Facebook</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <div class="flex flex-col sm:flex-row gap-3 pt-4">
      <button
        class="btn btn-primary flex-1 shadow-lg text-lg order-2 sm:order-1"
        >Zapisz zmiany</button
      >
      <a href="/admin" class="btn btn-outline flex-1 order-1 sm:order-2"
        >Anuluj</a
      >
    </div>
  </form>
</div>

<style>
  /* Dodatkowy szlif dla lepszego justify na desktopie */
  @media (min-width: 640px) {
    .input,
    .select {
      text-align: right;
    }
    .input:focus,
    .input:active {
      text-align: left; /* Powrót do lewej przy pisaniu dla wygody */
    }
  }
</style>
