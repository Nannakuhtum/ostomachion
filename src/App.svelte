<script lang="ts">
  import ModeTabs from './lib/ModeTabs.svelte';
  import Board from './lib/Board.svelte';
  import { ui } from './lib/state.svelte';
  import { game } from './lib/game.svelte';

  const caption = $derived.by(() => {
    if (ui.mode === 'figures') return 'Tile a figure from history. Coming soon.';
    if (ui.mode === 'collection')
      return `${game.solutionCount} of 536 solutions found. Gallery coming soon.`;
    if (game.win)
      return game.win.kind === 'new'
        ? `Solved: ${game.win.total} of 536 found.`
        : 'Solved again; already in your collection.';
    return 'Tile the square with all fourteen pieces.';
  });
</script>

<div class="page">
  <header>
    <h1>Ostomachion</h1>
    <ModeTabs />
  </header>

  <main>
    <div id="panel-{ui.mode}" class="panel" role="tabpanel" aria-labelledby="tab-{ui.mode}">
      <Board />
      <p class="caption" class:laurel={game.win != null && ui.mode === 'classic'} aria-live="polite">
        {caption}
      </p>
      {#if ui.mode === 'classic'}
        <button class="scatter" onclick={() => game.reset()}>Scatter anew</button>
      {/if}
    </div>
  </main>

  <footer>
    <p>After the puzzle of Archimedes, c. 250 BC.</p>
  </footer>
</div>

<style>
  .page {
    min-height: 100dvh;
    display: grid;
    grid-template-rows: auto 1fr auto;
    justify-items: center;
    padding: 1.5rem 1rem 0.75rem;
    gap: 1.75rem;
  }

  header {
    display: grid;
    justify-items: center;
    gap: 1.25rem;
  }

  h1 {
    margin: 0;
    font-family: var(--font-display);
    font-weight: 400;
    font-size: var(--text-2xl);
    letter-spacing: var(--tracking-display);
  }

  main {
    display: grid;
    align-content: start;
  }

  .panel {
    display: grid;
    justify-items: center;
    gap: 0.75rem;
  }

  .caption {
    margin: 0;
    font-size: var(--text-base);
    color: var(--umber);
  }

  .caption.laurel {
    color: var(--laurel);
  }

  .scatter {
    appearance: none;
    background: none;
    border: none;
    padding: 0.2rem 0.4rem;
    font-family: var(--font-body);
    font-size: var(--text-sm);
    color: var(--terracotta-deep);
    cursor: pointer;
    text-decoration: underline;
    text-underline-offset: 0.2em;
  }

  footer p {
    margin: 0;
    font-size: var(--text-sm);
    color: var(--umber);
  }
</style>
