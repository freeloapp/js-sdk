import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
  input: 'https://api.freelo.io/docs/v1/freelo-api.yaml',
  output: {
    path: 'src/generated',
  },
  plugins: [
    '@hey-api/typescript',
    '@hey-api/sdk',
    '@hey-api/client-fetch',
  ],
});
