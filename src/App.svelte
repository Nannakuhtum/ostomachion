<script lang="ts">
  import ModeTabs from './lib/ModeTabs.svelte';
  import Board from './lib/Board.svelte';
  import { ui, type Mode } from './lib/state.svelte';

  const captions: Record<Mode, string> = {
    classic: 'Tile the square with all fourteen pieces.',
    figures: 'Tile a figure from history. Coming soon.',
    collection: 'Every solution you find, kept. Coming soon.',
  };
</script>

<div class="page">
  <header>
    <h1>Ostomachion</h1>
    <ModeTabs />
  </header>

  <main>
    <div id="panel-{ui.mode}" class="panel" role="tabpanel" aria-labelledby="tab-{ui.mode}">
      <Board />
      <p class="caption">{captions[ui.mode]}</p>
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
    gap: 2.5rem;
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
    align-content: center;
  }

  .panel {
    display: grid;
    justify-items: center;
    gap: 1.5rem;
  }

  .caption {
    margin: 0;
    font-size: var(--text-base);
    color: var(--umber);
  }

  footer p {
    margin: 0;
    font-size: var(--text-sm);
    color: var(--umber);
  }
</style>
