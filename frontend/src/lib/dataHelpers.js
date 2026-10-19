// Small pure functions used by the data store (src/store/DataContext.jsx).

// Insert or update by id. Fields we already know (a land's ownership record) are kept.
export function upsert(list, items) {
  const next = [...list];
  for (const item of items) {
    if (!item || item.id == null) continue;
    const i = next.findIndex((x) => x.id === item.id);
    if (i === -1) next.push(item);
    else next[i] = { ...next[i], ...item };
  }
  return next;
}

export const without = (list, id) => list.filter((x) => x.id !== id);

// True when two loads produced the same data. Used so a refresh that found nothing new
// changes nothing, and nothing on the page re-renders.
export function sameData(a, b, keys) {
  return keys.every((k) => JSON.stringify(a[k]) === JSON.stringify(b[k]));
}

/*
  The lands the pages read.

  `lands` comes from the list endpoints and is replaced on every refresh. `details` holds what
  only the single-land endpoint sends (the ownership record). A land in both gets the fresh list
  fields plus the stored details. A land that is only in `details` is NOT added to the list:
  if it was deleted on the server, it must disappear from the lists.
*/
export function composeLands(lands, details) {
  return lands.map((l) => (details[l.id] ? { ...details[l.id], ...l } : l));
}

/*
  A background refresh must never undo something the person just did.
  Its answer is thrown away if an action was running while it loaded, or finished meanwhile.
*/
export function refreshIsStale({ actionsRunning, writeVersionAtStart, writeVersionNow, newerLoadStarted }) {
  return newerLoadStarted || actionsRunning > 0 || writeVersionAtStart !== writeVersionNow;
}
