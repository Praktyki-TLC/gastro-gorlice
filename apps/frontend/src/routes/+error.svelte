<script lang="ts">
    import { page } from '$app/state';
</script>

<style>
    main {
        height: calc(100dvh - 65px);
        display: flex;
        justify-content: center;
        align-items: center;
    }
</style>

<main>
    <img src={`https://http.cat/${page.status}`} alt={page.error?.message}>
</main>