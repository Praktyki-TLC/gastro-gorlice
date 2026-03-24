<script lang="ts">
    import { page } from '$app/state';
</script>

<main class="h-[calc(100dvh-65px)] flex flex-col justify-center items-center gap-4">
    <img src={`https://http.cat/${page.status}`} alt={page.error?.message}>
    <p class="font-semibold text-xl">{page.error?.message}</p>
</main>