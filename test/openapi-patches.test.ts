import { describe, it, expect } from 'vitest';
import {
  QUERY_PARAMETER_RENAMES,
  renameQueryParameters,
} from '../openapi-patches';

describe('renameQueryParameters', () => {
  const patch = renameQueryParameters(QUERY_PARAMETER_RENAMES)['GET /all-notifications'];

  it('renames the notification filters to the names the API reads', () => {
    const operation = {
      parameters: [
        { name: 'only_unread', in: 'query' },
        { name: 'notification_types[]', in: 'query' },
        { name: 'order', in: 'query' },
      ],
    };

    patch?.(operation);

    expect(operation.parameters.map((parameter) => parameter.name)).toEqual([
      'is_only_unread',
      'notifications_types[]',
      'order',
    ]);
  });

  it('leaves an already corrected spec as it is', () => {
    const operation = {
      parameters: [{ name: 'is_only_unread', in: 'query' }],
    };

    patch?.(operation);

    expect(operation.parameters).toEqual([{ name: 'is_only_unread', in: 'query' }]);
  });

  it('touches query parameters only', () => {
    const operation = { parameters: [{ name: 'only_unread', in: 'header' }] };

    patch?.(operation);

    expect(operation.parameters).toEqual([{ name: 'only_unread', in: 'header' }]);
  });
});
