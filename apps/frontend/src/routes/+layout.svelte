<script lang="ts">
  import "./layout.css";

  import { goto, invalidateAll } from "$app/navigation";
  import { enhance, applyAction } from "$app/forms";

  import favicon from "$lib/assets/favicon.svg";
  import PasswordIcon from "$lib/components/icons/PasswordIcon.svelte";
  import UserIcon from "$lib/components/icons/UserIcon.svelte";

  let props = $props();

  let loginModal: HTMLDialogElement;

  let login: string = $state("");
  let password: string = $state("");

  function openLoginModal(e: MouseEvent) {
    e.preventDefault();
    loginModal.showModal();
  }
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<div class="bg-base-200 shadow-sm">
  <div class="navbar max-w-screen-2xl mx-auto p-4 md:px-8 lg:px-20">
    <div class="flex-1">
      <a class="text-xl font-bold" href="/"> Gastro Gorlice </a>
    </div>
    <div class="flex-none">
      <ul class="menu menu-horizontal p-0">
        {#if props.data.isLoggedIn}
          <li><a href="/admin" class="btn btn-ghost">Panel</a></li>
        {:else}
          <li>
            <button onclick={openLoginModal} class="btn btn-ghost">
              Zaloguj się
            </button>
          </li>
        {/if}
      </ul>
    </div>
  </div>
</div>

<!-- Login modal -->
<dialog bind:this={loginModal} class="modal modal-middle">
  <div class="modal-box">
    <!-- Close button -->
    <form method="dialog">
      <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
        ✕
      </button>
    </form>

    <h3 class="text-xl font-bold mb-6">Zaloguj się</h3>

    <form
      action="/?/login"
      method="post"
      class="space-y-4"
      use:enhance={() => {
        return async ({ result }) => {
          if (result.type === "redirect") {
            loginModal.close();
            await invalidateAll();
            goto(result.location);
          } else {
            await applyAction(result);
          }
        };
      }}
    >
      <!-- Username input -->
      <label class="input w-full">
        <UserIcon />
        <input
          type="text"
          required
          placeholder="Login"
          bind:value={login}
          name="username"
        />
      </label>

      <!-- Password input -->
      <label class="input w-full">
        <PasswordIcon />
        <input
          type="password"
          required
          placeholder="Hasło"
          bind:value={password}
          name="password"
        />
      </label>

      {#if props.form?.message}
        <div class="text-red-500 text-sm mt-2">
          <span>{props.form?.message}</span>
        </div>
      {/if}

      <!-- Login button -->
      <button class="btn btn-block">Zaloguj się</button>
    </form>
  </div>
  <form method="dialog" class="modal-backdrop">
    <button>zamknij</button>
  </form>
</dialog>

<div class="min-h-[calc(100vh-4rem)]">
  {@render props.children()}
</div>
