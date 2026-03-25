<script lang="ts">
  import { enhance } from "$app/forms";
  let { form } = $props();
</script>

<main class="p-4 md:p-8 lg:px-20 max-w-2xl mx-auto">
  <div class="text-sm breadcrumbs mb-4">
    <ul>
      <li><a href="/admin">Panel</a></li>
      <li>Nowa restauracja</li>
    </ul>
  </div>

  <h1 class="text-3xl font-bold mb-8">Dodaj Restaurację</h1>

  <div class="card bg-base-100 border border-base-300 shadow-sm">
    <form method="POST" use:enhance class="card-body gap-4">
      <label class="form-control">
        <span class="label-text mb-1 font-medium">Nazwa restauracji</span>
        <input
          name="name"
          type="text"
          placeholder="np. Pizzeria Soprano"
          class="input input-bordered"
          required
        />
      </label>

      <label class="form-control">
        <span class="label-text mb-1 font-medium"
          >Slug (unikalny identyfikator)</span
        >
        <input
          name="slug"
          type="text"
          placeholder="np. pizzeria-soprano"
          class="input input-bordered"
          required
        />
      </label>

      <label class="form-control">
        <span class="label-text mb-1 font-medium"
          >Link źródłowy (opcjonalnie)</span
        >
        <input
          name="sourceUrl"
          type="url"
          placeholder="https://facebook.com/..."
          class="input input-bordered"
        />
      </label>

      {#if form?.message}
        <div class="alert alert-error text-sm">{form.message}</div>
      {/if}

      <div class="card-actions justify-end mt-4">
        <a href="/admin" class="btn btn-ghost">Anuluj</a>
        <button class="btn btn-primary px-8">Zapisz</button>
      </div>
    </form>
  </div>
</main>
