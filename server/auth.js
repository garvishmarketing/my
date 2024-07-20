const sessionmap = new Map();

export function setUser(id, user) {
  sessionmap.set(id, user);
}

export function getUser(id) {
  return sessionmap.get(id);
}
