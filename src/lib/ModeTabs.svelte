<script lang="ts">
  import { ui, MODES, MODE_LABELS, type Mode } from './state.svelte';

  let tabs: HTMLButtonElement[] = [];

  function select(mode: Mode) {
    ui.mode = mode;
  }

  function onKeydown(event: KeyboardEvent, index: number) {
    let next: number | null = null;
    if (event.key === 'ArrowRight') next = (index + 1) % MODES.length;
    if (event.key === 'ArrowLeft') next = (index - 1 + MODES.length) % MODES.length;
    if (next === null) return;
    event.preventDefault();
    ui.mode = MODES[next];
    tabs[next]?.focus();
  }
</script>

<div class="tabs" role="tablist" aria-label="Game mode">
  {#each MODES as mode, i (mode)}
    <button
      bind:this={tabs[i]}
      role="tab"
      id="tab-{mode}"
      aria-selected={ui.mode === mode}
      aria-controls="panel-{mode}"
      tabindex={ui.mode === mode ? 0 : -1}
      class:active={ui.mode === mode}
      onclick={() => select(mode)}
      onkeydown={(e) => onKeydown(e, i)}
    >
      {MODE_LABELS[mode]}
    </button>
  {/each}
</div>

<style>
  .tabs {
    display: flex;
    gap: 1.75rem;
  }

  button {
    appearance: none;
    background: none;
    border: none;
    padding: 0.25rem 0;
    font-family: var(--font-display);
    font-size: var(--text-md);
    letter-spacing: var(--tracking-display);
    color: var(--ink);
    cursor: pointer;
    border-bottom: 2px solid transparent;
    transition: border-color var(--duration-ui) var(--ease-out-expo);
  }

  button.active {
    border-bottom-color: var(--terracotta);
  }

  button:not(.active):hover {
    border-bottom-color: var(--ochre);
  }
</style>
