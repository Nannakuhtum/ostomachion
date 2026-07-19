export type View = 'play' | 'collection';

export const ui = $state<{ view: View }>({ view: 'play' });
