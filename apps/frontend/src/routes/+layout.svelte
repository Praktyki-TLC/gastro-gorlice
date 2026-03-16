<script lang="ts">
  import "./layout.css";
  import favicon from "$lib/assets/favicon.svg";

  let { children } = $props();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<div class="navbar bg-base-200 shadow-sm">
  <div class="flex-1">
    <a class="btn btn-ghost text-xl" href="/">Dania dnia</a>
  </div>
  <div class="flex-none">
    <ul class="menu menu-horizontal px-1">
      <li><a href="/login">Logowanie</a></li>
    </ul>
  </div>
</div>

{@render children()}
