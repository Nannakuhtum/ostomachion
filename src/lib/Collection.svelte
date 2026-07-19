<script lang="ts">
  import { PIECES, SIDE } from '../core/construction';
  import { transformRing } from '../core/geometry';
  import { loadSolutions } from './persist';
  import { FILLS } from './fills';

  const solutions = loadSolutions().sort((a, b) => a.foundAt - b.foundAt);

  function pathFor(solutionIndex: number, pieceIndex: number): string {
    const ring = transformRing(PIECES[pieceIndex].vertices, solutions[solutionIndex].placements[pieceIndex]);
    return 'M' + ring.map(([x, y]) => `${x},${y}`).join('L') + 'Z';
  }
</script>

<section class="collection" aria-label="Collection">
  <h2>{solutions.length} of 536 solutions</h2>
  <p class="hint">
    There are 536 truly distinct ways to tile the square with the fourteen pieces. Every
    arrangement you solve is recorded here.
  </p>

  {#if solutions.length === 0}
    <p class="empty">Solve the square to begin your collection.</p>
  {:else}
    <ul class="gallery">
      {#each solutions as sol, s (sol.signature)}
        <li>
          <svg
            viewBox={`-0.1 -0.1 ${SIDE + 0.2} ${SIDE + 0.2}`}
            role="img"
            aria-label={`Solution ${s + 1}, found ${new Date(sol.foundAt).toLocaleDateString()}`}
          >
            {#each PIECES as _, i (i)}
              <path
                d={pathFor(s, i)}
                fill={FILLS[i % FILLS.length]}
                stroke="var(--ink)"
                stroke-width="0.12"
                stroke-linejoin="round"
              />
            {/each}
            <rect
              x="0"
              y="0"
              width={SIDE}
              height={SIDE}
              fill="none"
              stroke="var(--ink)"
              stroke-width="0.2"
            />
          </svg>
        </li>
      {/each}
    </ul>
  {/if}
</section>

<style>
  .collection {
    display: grid;
    justify-items: center;
    gap: 1.75rem;
    width: min(100vw - 2rem, 44rem);
  }

  h2 {
    margin: 0;
    font-family: var(--font-display);
    font-weight: 400;
    font-size: var(--text-lg);
    letter-spacing: var(--tracking-display);
    font-variant-numeric: tabular-nums;
  }

  .hint {
    margin: -1rem 0 0;
    max-width: 32rem;
    text-align: center;
    font-size: var(--text-sm);
    color: var(--umber);
  }

  .empty {
    margin: 0;
    font-size: var(--text-base);
    color: var(--umber);
  }

  .gallery {
    list-style: none;
    margin: 0;
    padding: 0;
    width: 100%;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(6.5rem, 1fr));
    gap: 1.5rem;
  }

  .gallery svg {
    display: block;
    width: 100%;
    aspect-ratio: 1;
  }
</style>
