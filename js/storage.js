// localStorage can be unavailable (private mode, blocked cookies, full quota).
// The game must keep working then, just without persistence.

export function loadJSON(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function saveJSON(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Persistence is optional.
  }
}
