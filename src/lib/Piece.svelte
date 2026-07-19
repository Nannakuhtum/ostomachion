<script lang="ts">
  import { Spring } from 'svelte/motion';
  import { PIECES } from '../core/construction';
  import { ringCenter } from '../core/geometry';
  import { game } from './game.svelte';

  let { index, freeAngle = 0 }: { index: number; freeAngle?: number } = $props();

  const FILLS = [
    'var(--cream-slip)',
    'var(--ochre)',
    'var(--terracotta-deep)',
    'var(--umber)',
  ];

  const base = PIECES[index].vertices;
  const d = 'M' + base.map(([x, y]) => `${x},${y}`).join('L') + 'Z';

  const reduced =
    typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

  const pos = new Spring({ x: 0, y: 0 }, { stiffness: 0.2, damping: 0.8 });
  const spin = new Spring(0, { stiffness: 0.16, damping: 0.72 });

  let prevRot: number | null = null;

  $effect(() => {
    const p = game.placements[index];
    if (prevRot === null) {
      pos.set({ x: p.tx, y: p.ty }, { instant: true });
      prevRot = p.rot;
      return;
    }
    if (reduced) {
      pos.set({ x: p.tx, y: p.ty }, { instant: true });
    } else {
      pos.target = { x: p.tx, y: p.ty };
    }
    if (p.rot !== prevRot) {
      const dq = ((((prevRot - p.rot + 2) % 4) + 4) % 4) - 2; // shortest quarter path
      if (!reduced) {
        spin.set(spin.current + dq * 90, { instant: true });
        spin.target = 0;
      }
      prevRot = p.rot;
    }
  });

  const pose = $derived(game.placements[index]);
  const center = $derived(ringCenter(game.ringOf(index)));
  const selected = $derived(game.selected === index);
  const lifted = $derived(game.dragging === index);
</script>

<g transform={freeAngle ? `rotate(${freeAngle} ${center[0]} ${center[1]})` : undefined}>
  <path
    {d}
    data-index={index}
    role="button"
    aria-label={`Piece ${index + 1}`}
    tabindex="0"
    class:selected
    class:lifted
    fill={FILLS[index % FILLS.length]}
    transform={`translate(${pos.current.x} ${pos.current.y}) rotate(${pose.rot * 90 + spin.current}) ${
      pose.flipped ? 'scale(-1 1)' : ''
    }`}
    onfocus={() => game.select(index)}
  />
</g>

<style>
  path {
    stroke: var(--ink);
    stroke-width: 0.1;
    stroke-linejoin: round;
    cursor: grab;
    filter: url(#piece-grain);
    outline: none;
    touch-action: none;
  }

  path.selected {
    stroke-width: 0.18;
  }

  path.lifted {
    cursor: grabbing;
    filter: url(#piece-grain)
      drop-shadow(0.06px 0.18px 0.22px oklch(0.26 0.02 50 / 0.4));
  }

  path:focus-visible {
    stroke: var(--terracotta-deep);
    stroke-width: 0.22;
  }
</style>
