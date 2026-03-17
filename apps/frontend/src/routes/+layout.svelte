<script lang="ts">
  import "./layout.css";
  import favicon from "$lib/assets/favicon.svg";
  import { enhance } from "$app/forms";

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

<div class="navbar shadow-sm bg-base-200 md:px-10 lg:px-20">
  <div class="flex-1">
    <a class="btn btn-ghost text-xl" href="/">Gastro Gorlice</a>
  </div>
  <div class="flex-none">
    <ul class="menu menu-horizontal px-1">
      <li><button onclick={openLoginModal}>Logowanie</button></li>
    </ul>
  </div>
</div>

<dialog bind:this={loginModal} class="modal modal-bottom sm:modal-middle">
  <div class="modal-box">
    <!-- Close button -->
    <form method="dialog">
      <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
        >✕</button
      >
    </form>

    <h3 class="text-lg font-bold">Logowanie</h3>

    <!-- Username input -->
    <form action="/?/login" method="post" use:enhance>
      <label class="input my-4 w-full">
        <svg
          class="h-[1em] opacity-50"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
        >
          <g
            stroke-linejoin="round"
            stroke-linecap="round"
            stroke-width="2.5"
            fill="none"
            stroke="currentColor"
          >
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </g>
        </svg>
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
        <svg
          class="h-[1em] opacity-50"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
        >
          <g
            stroke-linejoin="round"
            stroke-linecap="round"
            stroke-width="2.5"
            fill="none"
            stroke="currentColor"
          >
            <path
              d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z"
            ></path>
            <circle cx="16.5" cy="7.5" r=".5" fill="currentColor"></circle>
          </g>
        </svg>
        <input
          type="password"
          required
          placeholder="Hasło"
          bind:value={password}
          name="password"
        />
      </label>

      {#if props.form?.message}
        <p class="text-red-500 text-sm my-2">{props.form?.message}</p>
      {/if}

      <!-- Login button -->
      <div class="modal-action">
        <button class="btn btn-block">Zaloguj się</button>
      </div>
    </form>
  </div>
  <form method="dialog" class="modal-backdrop">
    <button>close</button>
  </form>
</dialog>

{@render props.children()}
