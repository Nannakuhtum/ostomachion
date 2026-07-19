<script lang="ts">
  import Board from './lib/Board.svelte';
  import Collection from './lib/Collection.svelte';
  import { ui } from './lib/state.svelte';
  import { game } from './lib/game.svelte';

  const caption = $derived.by(() => {
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
  </header>

  <main>
    {#if ui.view === 'play'}
      <div class="panel">
        <button
          class="corner"
          onclick={() => (ui.view = 'collection')}
          aria-label={`Collection: ${game.solutionCount} of 536 solutions found`}
        >
          {game.solutionCount}&hairsp;/&hairsp;536
        </button>
        <Board />
        <p class="caption" class:laurel={game.win != null} aria-live="polite">
          {caption}
        </p>
        <button class="scatter" onclick={() => game.reset()}>Scatter anew</button>
      </div>
    {:else}
      <div class="panel">
        <button class="corner" onclick={() => (ui.view = 'play')}>&larr; Board</button>
        <Collection />
      </div>
    {/if}
  </main>

  <footer>
    <p>
      After the puzzle of Archimedes, c. 250 BC. &middot;
      <a href="https://games.aakkagam.com/">Aakkagam Games</a> &middot;
      <a href="mailto:admin@aakkagam.com?subject=Feedback%20from%20ostomachion">Feedback</a>
    </p>
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

  h1 {
    margin: 0;
    font-family: var(--font-display);
    font-weight: 400;
    font-size: var(--text-2xl);
    letter-spacing: var(--tracking-display);
  }

  .corner {
    justify-self: start;
    white-space: nowrap;
    appearance: none;
    background: none;
    border: none;
    padding: 0.25rem 0.4rem;
    font-family: var(--font-body);
    font-size: var(--text-base);
    font-variant-numeric: tabular-nums;
    color: var(--laurel);
    cursor: pointer;
    text-decoration: underline;
    text-decoration-color: transparent;
    text-underline-offset: 0.25em;
    transition: text-decoration-color var(--duration-ui) var(--ease-out-expo);
  }

  .corner:hover,
  .corner:focus-visible {
    text-decoration-color: var(--laurel);
  }

  @media (max-width: 32rem) {
    h1 {
      font-size: var(--text-xl);
    }

    .corner {
      font-size: var(--text-sm);
    }
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

  footer a {
    color: inherit;
    text-underline-offset: 0.2em;
    transition: color var(--duration-ui) var(--ease-out-expo);
  }

  footer a:hover,
  footer a:focus-visible {
    color: var(--laurel);
  }
</style>
