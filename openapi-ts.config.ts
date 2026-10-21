import { defineConfig } from '@hey-api/openapi-ts';

import { renameQueryParameters, QUERY_PARAMETER_RENAMES } from './openapi-patches';

export default defineConfig({
  input: 'https://api.freelo.io/docs/v1/freelo-api.yaml',
  output: {
    path: 'src/generated',
  },
  parser: {
    patch: {
      operations: renameQueryParameters(QUERY_PARAMETER_RENAMES),
    },
  },
  plugins: [
    '@hey-api/typescript',
    '@hey-api/sdk',
    '@hey-api/client-fetch',
  ],
});
