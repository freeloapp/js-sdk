/**
 * Corrections applied to the upstream OpenAPI spec before generation.
 *
 * The spec is hand-maintained in freelo-db and has documented some query
 * parameters under names the API does not read. The API ignores an unknown
 * parameter silently, so a client generated from the spec sends a filter that
 * is dropped and gets the unfiltered answer back — `only_unread=1` on
 * `/all-notifications` answering every notification, read or not.
 *
 * Each entry renames a parameter to the one the API reads. A rename whose old
 * name is no longer in the spec does nothing, so an entry becomes a no-op once
 * upstream is fixed and can then be deleted.
 */

interface QueryParameter {
  in?: string;
  name?: string;
}

/** `'METHOD /path'` → `{ documented name: name the API reads }`. */
export const QUERY_PARAMETER_RENAMES: Record<string, Record<string, string>> = {
  // NotificationsPresenter::actionFindAllNotifications reads `is_only_unread`
  // (NotificationsCondsDto::ONLY_UNREAD) and `notifications_types`
  // (Notification::NOTIFICATIONS_TYPES).
  'GET /all-notifications': {
    only_unread: 'is_only_unread',
    'notification_types[]': 'notifications_types[]',
  },
};

export function renameQueryParameters(
  renames: Record<string, Record<string, string>>,
): Record<string, (operation: { parameters?: readonly unknown[] }) => void> {
  return Object.fromEntries(
    Object.entries(renames).map(([operation, names]) => [
      operation,
      (operationObject: { parameters?: readonly unknown[] }): void => {
        for (const parameter of operationObject.parameters ?? []) {
          const query = parameter as QueryParameter;

          if (query.in !== 'query' || query.name == null) {
            continue;
          }

          const renamed = names[query.name];

          if (renamed != null) {
            query.name = renamed;
          }
        }
      },
    ]),
  );
}
