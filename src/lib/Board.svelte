<script lang="ts">
</script>

<svg viewBox="0 0 12 12" role="img" aria-label="Puzzle board, twelve by twelve units">
  <defs>
    <filter id="grain">
      <feTurbulence type="fractalNoise" baseFrequency="6" numOctaves="2" result="noise" />
      <feColorMatrix
        in="noise"
        type="matrix"
        values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.04 0"
      />
      <feComposite operator="over" in2="SourceGraphic" />
    </filter>
  </defs>
  <rect x="0" y="0" width="12" height="12" fill="var(--terracotta)" filter="url(#grain)" />
  <rect
    x="0.06"
    y="0.06"
    width="11.88"
    height="11.88"
    fill="none"
    stroke="var(--ink)"
    stroke-width="0.12"
  />
</svg>

<style>
  svg {
    display: block;
    width: min(88vw, 66vh, 34rem);
    aspect-ratio: 1;
  }
</style>
