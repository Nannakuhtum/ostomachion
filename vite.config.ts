/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { svelteTesting } from '@testing-library/svelte/vite';

export default defineConfig({
  base: '/ostomachion/',
  plugins: [svelte(), svelteTesting()],
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'jsdom',
  },
});
