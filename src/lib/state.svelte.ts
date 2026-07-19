export type Mode = 'classic' | 'figures' | 'collection';

export const MODES: readonly Mode[] = ['classic', 'figures', 'collection'];

export const MODE_LABELS: Record<Mode, string> = {
  classic: 'Classic',
  figures: 'Figures',
  collection: 'Collection',
};

export const ui = $state<{ mode: Mode }>({ mode: 'classic' });
