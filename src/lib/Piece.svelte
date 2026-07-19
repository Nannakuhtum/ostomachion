<script lang="ts">
  import { Spring } from 'svelte/motion';
  import { PIECES } from '../core/construction';
  import { ringCenter } from '../core/geometry';
  import { game, pendingSpin } from './game.svelte';
  import { FILLS } from './fills';

  let { index, freeAngle = 0 }: { index: number; freeAngle?: number } = $props();

  const d = $derived('M' + PIECES[index].vertices.map(([x, y]) => `${x},${y}`).join('L') + 'Z');

  const reduced =
    typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

  const pos = new Spring({ x: 0, y: 0 }, { stiffness: 0.2, damping: 0.8 });
  const spin = new Spring(0, { stiffness: 0.16, damping: 0.72 });
  const flipS = new Spring(1, { stiffness: 0.18, damping: 0.9 });

  let prevRot: number | null = null;
  let prevFlipped: boolean | null = null;

  $effect(() => {
    const p = game.placements[index];
    const first = prevRot === null;
    const rotChanged = !first && p.rot !== prevRot;
    const flipChanged = !first && p.flipped !== prevFlipped;
    const pending = pendingSpin.get(index);
    if (first || reduced) {
      pos.set({ x: p.tx, y: p.ty }, { instant: true });
    } else if (flipChanged) {
      // The new rendering mirrored about the piece's vertical center axis IS
      // the old visual, so a scale sweep -1 → 1 about the center covers the
      // whole change (including any rot/translation the pose solver folded in).
      pos.set({ x: p.tx, y: p.ty }, { instant: true });
      flipS.set(-1, { instant: true });
      flipS.target = 1;
    } else if (rotChanged || pending !== undefined) {
      // Center-pivot spin about the piece's world center. With a knob
      // release, start from the residual of the user's own rotation so the
      // settle continues from where they let go, in their direction;
      // otherwise (R key, wheel) unwind the shortest quarter-turn delta.
      pos.set({ x: p.tx, y: p.ty }, { instant: true });
      const start =
        pending !== undefined
          ? pending
          : (((((prevRot! - p.rot + 2) % 4) + 4) % 4) - 2) * 90;
      spin.set(start, { instant: true });
      spin.target = 0;
    } else {
      pos.target = { x: p.tx, y: p.ty };
    }
    pendingSpin.delete(index);
    prevRot = p.rot;
    prevFlipped = p.flipped;
  });

  const pose = $derived(game.placements[index]);
  const center = $derived(ringCenter(game.ringOf(index)));
  const selected = $derived(game.selected === index);
  const lifted = $derived(game.dragging === index);
</script>

<g
  transform={`rotate(${freeAngle + spin.current} ${center[0]} ${center[1]}) translate(${center[0]} 0) scale(${flipS.current} 1) translate(${-center[0]} 0)`}
>
  <path
    {d}
    data-index={index}
    role="button"
    aria-label={`Piece ${index + 1}`}
    tabindex="0"
    class:selected
    class:lifted
    fill={FILLS[index % FILLS.length]}
    transform={`translate(${pos.current.x} ${pos.current.y}) rotate(${pose.rot * 90}) ${
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
