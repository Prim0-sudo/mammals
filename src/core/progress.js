// Saved progress on this device (blueprint v6.1, GAME-CONTENTS "Saved state").
// Scope: this browser on this device only; one versioned key per app holds every game's
// no-repeat cycle, its unfinished round and the last Meet the Words card per group.
// Rounds are stored as item ids and keyed by stable mode ids, so renamed games keep working.
// Every read and write is guarded so a blocked or full store never breaks play.
const VERSION = 1;

export function createProgress(topicId) {
  const key = `ludimi.${topicId}.progress.v${VERSION}`;
  let data = null;
  try {
    data = JSON.parse(localStorage.getItem(key) || "null");
  } catch {
    data = null;
  }
  if (!data || typeof data !== "object" || data.version !== VERSION) data = {};
  data = {
    version: VERSION,
    cycles: plain(data.cycles),
    rounds: plain(data.rounds),
    learn: plain(data.learn),
    prefs: plain(data.prefs),
  };
  return {
    key,
    data,
    write() {
      try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
      } catch {
        return false;
      }
    },
  };
}

const plain = (value) =>
  value && typeof value === "object" && !Array.isArray(value) ? value : {};

// Turns stored ids back into items; returns null when any id no longer exists.
export function fromIds(ids, lookup) {
  if (!Array.isArray(ids)) return null;
  const items = ids.map((id) => lookup.get(id));
  return items.every(Boolean) ? items : null;
}
