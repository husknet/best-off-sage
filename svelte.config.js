import adapter from '@sveltejs/adapter-auto';
import preprocess from 'svelte-preprocess';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    adapter: adapter(),

    // You can set a base path if deploying under a subdirectory
    alias: {
      $lib: './src/lib',
      $components: './src/components'
    }
  },

  // Preprocess allows TypeScript, PostCSS, SCSS, etc.
  preprocess: preprocess()
};

export default config;
