<script lang="ts">
  import { SIDE } from '../core/construction';
  import type { Vec } from '../core/construction';
  import { ringBBox, ringCenter, rotateRingQuarterAbout } from '../core/geometry';
  import Piece from './Piece.svelte';
  import { game, pendingSpin, WORLD } from './game.svelte';

  let svgEl: SVGSVGElement;

  let mode = $state<'idle' | 'drag' | 'rotate'>('idle');
  let last: Vec = [0, 0];
  let rotateCenter: Vec = [0, 0];
  let rotateStartAngle = 0;
  let freeAngle = $state(0);

  function toWorld(evt: PointerEvent): Vec {
    const ctm = svgEl.getScreenCTM();
    if (!ctm) return last;
    const p = new DOMPoint(evt.clientX, evt.clientY).matrixTransform(ctm.inverse());
    return [p.x, p.y];
  }

  function pointerAngle(p: Vec, c: Vec): number {
    return (Math.atan2(p[1] - c[1], p[0] - c[0]) * 180) / Math.PI;
  }

  function onPointerDown(evt: PointerEvent) {
    const target = evt.target as Element;
    const idxAttr = target.closest('[data-index]')?.getAttribute('data-index');
    if (idxAttr != null) {
      const i = Number(idxAttr);
      game.select(i);
      game.dragging = i;
      mode = 'drag';
      last = toWorld(evt);
      svgEl.setPointerCapture(evt.pointerId);
      evt.preventDefault();
    } else if (!target.closest('.affordance')) {
      game.select(null);
    }
  }

  function startRotate(evt: PointerEvent) {
    if (game.selected == null) return;
    mode = 'rotate';
    rotateCenter = ringCenter(game.ringOf(game.selected));
    rotateStartAngle = pointerAngle(toWorld(evt), rotateCenter);
    svgEl.setPointerCapture(evt.pointerId);
    evt.stopPropagation();
    evt.preventDefault();
  }

  function onPointerMove(evt: PointerEvent) {
    if (mode === 'drag' && game.dragging != null) {
      const p = toWorld(evt);
      game.moveBy(game.dragging, p[0] - last[0], p[1] - last[1]);
      last = p;
    } else if (mode === 'rotate' && game.selected != null) {
      freeAngle = pointerAngle(toWorld(evt), rotateCenter) - rotateStartAngle;
    }
  }

  function onPointerUp() {
    if (mode === 'drag' && game.dragging != null) {
      const i = game.dragging;
      game.dragging = null;
      game.settle(i);
      // Dropped back in the tray: it has already shrunk, so let it go.
      if (!game.onBoard(i)) game.select(null);
    } else if (mode === 'rotate' && game.selected != null) {
      const quarters = Math.round(freeAngle / 90);
      pendingSpin.set(game.selected, freeAngle - quarters * 90);
      let target = game.ringOf(game.selected);
      const c = ringCenter(target);
      const steps = ((quarters % 4) + 4) % 4;
      for (let k = 0; k < steps; k++) target = rotateRingQuarterAbout(target, c);
      game.commitRing(game.selected, target);
      freeAngle = 0;
    }
    mode = 'idle';
  }

  function onWheel(evt: WheelEvent) {
    if (game.selected == null) return;
    const target = evt.target as Element;
    if (!target.closest('[data-index]')) return;
    evt.preventDefault();
    game.rotateQuarter(game.selected);
  }

  function onKey(evt: KeyboardEvent) {
    if (game.selected == null) return;
    if (evt.key === 'r' || evt.key === 'R') game.rotateQuarter(game.selected);
    if (evt.key === 'f' || evt.key === 'F') game.flip(game.selected);
  }

  const drawOrder = $derived(
    [...game.placements.keys()].sort((a, b) =>
      a === game.dragging ? 1 : b === game.dragging ? -1 : a === game.selected ? 1 : b === game.selected ? -1 : 0
    )
  );
  const restPieces = $derived(drawOrder.filter((i) => i !== game.selected && i !== game.dragging));
  const activePieces = $derived(drawOrder.filter((i) => i === game.selected || i === game.dragging));

  const selBBox = $derived(game.selected != null ? ringBBox(game.ringOf(game.selected)) : null);
  const selCenter = $derived(selBBox ? [(selBBox.minX + selBBox.maxX) / 2, (selBBox.minY + selBBox.maxY) / 2] : null);

  const ghost = $derived.by(() => {
    if (mode !== 'rotate' || game.selected == null || Math.abs(freeAngle) < 1) return null;
    const quarters = ((Math.round(freeAngle / 90) % 4) + 4) % 4;
    let ring = game.ringOf(game.selected);
    const c = ringCenter(ring);
    for (let k = 0; k < quarters; k++) ring = rotateRingQuarterAbout(ring, c);
    return 'M' + ring.map(([x, y]) => `${x},${y}`).join('L') + 'Z';
  });

  const gridLines = Array.from({ length: SIDE - 1 }, (_, i) => i + 1);
</script>

<svelte:window onkeydown={onKey} />

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<svg
  bind:this={svgEl}
  viewBox={`${WORLD.x} ${WORLD.y} ${WORLD.w} ${WORLD.h}`}
  role="application"
  aria-label="Ostomachion game world: the twelve by twelve board and scattered pieces"
  onpointerdown={onPointerDown}
  onpointermove={onPointerMove}
  onpointerup={onPointerUp}
  onpointercancel={onPointerUp}
  onwheel={onWheel}
>
  <defs>
    <filter id="board-grain" x="0%" y="0%" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="6" numOctaves="2" result="noise" />
      <feColorMatrix
        in="noise"
        type="matrix"
        values="0 0 0 0 0.92  0 0 0 0 0.86  0 0 0 0 0.78  0 0 0 0.025 0"
        result="tinted"
      />
      <feComposite in="tinted" in2="SourceAlpha" operator="in" result="clipped" />
      <feMerge>
        <feMergeNode in="SourceGraphic" />
        <feMergeNode in="clipped" />
      </feMerge>
    </filter>
    <linearGradient id="well-shade-top" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" style="stop-color: oklch(0.18 0.03 45)" stop-opacity="0.4" />
      <stop offset="1" style="stop-color: oklch(0.18 0.03 45)" stop-opacity="0" />
    </linearGradient>
    <linearGradient id="well-shade-left" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" style="stop-color: oklch(0.18 0.03 45)" stop-opacity="0.2" />
      <stop offset="1" style="stop-color: oklch(0.18 0.03 45)" stop-opacity="0" />
    </linearGradient>
    <linearGradient id="well-shade-right" x1="1" y1="0" x2="0" y2="0">
      <stop offset="0" style="stop-color: oklch(0.18 0.03 45)" stop-opacity="0.12" />
      <stop offset="1" style="stop-color: oklch(0.18 0.03 45)" stop-opacity="0" />
    </linearGradient>
    <linearGradient id="well-light-bottom" x1="0" y1="1" x2="0" y2="0">
      <stop offset="0" style="stop-color: var(--cream-slip)" stop-opacity="0.1" />
      <stop offset="1" style="stop-color: var(--cream-slip)" stop-opacity="0" />
    </linearGradient>
    <filter id="piece-grain" x="-5%" y="-5%" width="110%" height="110%">
      <feTurbulence type="fractalNoise" baseFrequency="8" numOctaves="2" result="noise" />
      <feColorMatrix
        in="noise"
        type="matrix"
        values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.05 0"
        result="tinted"
      />
      <feComposite in="tinted" in2="SourceAlpha" operator="in" result="clipped" />
      <feMerge>
        <feMergeNode in="SourceGraphic" />
        <feMergeNode in="clipped" />
      </feMerge>
    </filter>
  </defs>

  <rect
    x="0"
    y="0"
    width={SIDE}
    height={SIDE}
    fill="var(--clay-well)"
    filter="url(#board-grain)"
  />
  <rect x="0" y="0" width={SIDE} height="0.6" fill="url(#well-shade-top)" />
  <rect x="0" y="0" width="0.45" height={SIDE} fill="url(#well-shade-left)" />
  <rect x={SIDE - 0.45} y="0" width="0.45" height={SIDE} fill="url(#well-shade-right)" />
  <rect x="0" y={SIDE - 0.3} width={SIDE} height="0.3" fill="url(#well-light-bottom)" />
  <g class="grid" class:visible={game.dragging != null} stroke="var(--cream-slip)" stroke-width="0.02">
    {#each gridLines as i (i)}
      <line x1={i} y1="0" x2={i} y2={SIDE} />
      <line x1="0" y1={i} x2={SIDE} y2={i} />
    {/each}
  </g>
  <g class="pieces" class:won={game.win != null}>
    {#each restPieces as i (i)}
      <Piece index={i} freeAngle={0} />
    {/each}
  </g>

  <!-- Rim drawn above the settled pieces, centered on the exact board bounds:
       its lip covers the half of each piece's centered outline stroke that
       would otherwise poke past the well edge on flush placements. The active
       (selected or dragged) piece renders above the rim so the border never
       cuts across a piece in hand. -->
  <rect
    x="0"
    y="0"
    width={SIDE}
    height={SIDE}
    fill="none"
    stroke="var(--ink)"
    stroke-width="0.22"
    pointer-events="none"
  />

  <g class="pieces" class:won={game.win != null}>
    {#each activePieces as i (i)}
      <Piece index={i} freeAngle={game.selected === i ? freeAngle : 0} />
    {/each}
  </g>

  {#if ghost}
    <path class="ghost" d={ghost} />
  {/if}

  {#if game.win}
    <rect class="laurel" x="-0.15" y="-0.15" width={SIDE + 0.3} height={SIDE + 0.3} />
  {/if}

  {#if selBBox && selCenter && mode !== 'drag'}
    {@const above = selBBox.minY - 1.4 >= WORLD.y + 0.7}
    {@const ky = above ? selBBox.minY - 1.4 : Math.min(selBBox.maxY + 1.4, WORLD.y + WORLD.h - 0.7)}
    {@const kx = Math.min(Math.max(selCenter[0], WORLD.x + 1.2), WORLD.x + WORLD.w - 3.6)}
    {@const fx = kx + 2.4}
    <g
      class="affordance"
      role="button"
      aria-label="Rotate piece"
      tabindex="0"
      onpointerdown={startRotate}
      onkeydown={(e) => {
        if (e.key === 'Enter' && game.selected != null) game.rotateQuarter(game.selected);
      }}
    >
      <circle cx={kx} cy={ky} r="1.2" fill="transparent" />
      <circle cx={kx} cy={ky} r="0.5" class="knob" />
      <path
        d={`M${kx - 0.28},${ky - 0.12} A0.32,0.32 0 1 1 ${kx - 0.12},${ky + 0.28}`}
        class="knob-arrow"
      />
      <line
        x1={kx}
        y1={above ? ky + 0.5 : ky - 0.5}
        x2={selCenter[0]}
        y2={above ? selBBox.minY : selBBox.maxY}
        class="tether-casing"
      />
      <line
        x1={kx}
        y1={above ? ky + 0.5 : ky - 0.5}
        x2={selCenter[0]}
        y2={above ? selBBox.minY : selBBox.maxY}
        class="tether"
      />
    </g>
    <g
      class="affordance"
      role="button"
      aria-label="Flip piece"
      tabindex="0"
      onkeydown={(e) => {
        if (e.key === 'Enter' && game.selected != null) game.flip(game.selected);
      }}
      onpointerdown={(e) => {
        e.stopPropagation();
        e.preventDefault();
        if (game.selected != null) game.flip(game.selected);
      }}
    >
      <circle cx={fx} cy={ky} r="1.2" fill="transparent" />
      <circle cx={fx} cy={ky} r="0.5" class="knob" />
      <path
        d={`M${fx - 0.36},${ky} L${fx - 0.1},${ky - 0.22} L${fx - 0.1},${ky + 0.22} Z M${fx + 0.36},${ky} L${fx + 0.1},${ky - 0.22} L${fx + 0.1},${ky + 0.22} Z`}
        class="flip-icon"
      />
    </g>
  {/if}
</svg>

<style>
  svg {
    display: block;
    width: min(96vw, calc(66vh * 13.5 / 19.5), 44rem);
    aspect-ratio: 13.5 / 19.5;
    touch-action: none;
    user-select: none;
  }

  .grid {
    opacity: 0;
    transition: opacity var(--duration-ui) var(--ease-out-expo);
  }

  .grid.visible {
    opacity: 0.22;
  }

  .ghost {
    fill: none;
    stroke: var(--cream-slip);
    stroke-width: 0.08;
    stroke-dasharray: 0.25 0.18;
    opacity: 0.7;
    pointer-events: none;
  }

  .laurel {
    fill: none;
    stroke: var(--laurel);
    stroke-width: 0.2;
    animation: laurel-in 600ms var(--ease-out-expo) both;
    pointer-events: none;
  }

  @keyframes laurel-in {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  .pieces.won :global(path) {
    stroke-width: 0.1;
  }

  .pieces.won {
    animation: burst 480ms var(--ease-out-expo);
    transform-box: view-box;
    transform-origin: 33% 40%;
  }

  @keyframes burst {
    0% {
      transform: scale(1);
    }
    35% {
      transform: scale(1.025);
    }
    100% {
      transform: scale(1);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .pieces.won {
      animation: none;
    }
  }

  .knob {
    fill: var(--cream-slip);
    stroke: var(--ink);
    stroke-width: 0.06;
  }

  .knob-arrow {
    fill: none;
    stroke: var(--ink);
    stroke-width: 0.09;
    stroke-linecap: round;
    pointer-events: none;
  }

  .flip-icon {
    fill: var(--ink);
    pointer-events: none;
  }

  .tether-casing {
    stroke: var(--cream-slip);
    stroke-width: 0.09;
    stroke-dasharray: 0.12 0.12;
    opacity: 0.55;
    pointer-events: none;
  }

  .tether {
    stroke: var(--ink);
    stroke-width: 0.03;
    stroke-dasharray: 0.12 0.12;
    opacity: 0.5;
    pointer-events: none;
  }

  .affordance {
    cursor: pointer;
  }
</style>
