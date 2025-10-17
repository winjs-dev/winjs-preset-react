import { defineConfig } from '@rslib/core';

export default defineConfig({
  source: {
    entry: {
      index: './src/**/*.ts',
    },
  },
  output: {
    target: 'node'
  },
  lib: [
    {
      format: 'cjs',
      syntax: 'es2021',
      dts: { bundle: false },
      bundle: false,
    },
  ],
});
