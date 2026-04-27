const data = {
  users: new Map(),
  timer: null,
};

export function addUser(player) {
  data.users.set(player.id, player);
}
export function removeUser(id) {
  data.users.delete(id);
}
export function hasUser(id) {
  return data.users.has(id);
}
export function countUser() {
  return data.users.size;
}
export function getUserEntries() {
  return data.users.entries();
}

export function setTimer(id) {
  data.timer = id;
}
export function clearTimer() {
  data.timer = null;
}
export function hasTimer() {
  return data.timer !== null;
}
export function getTimer() {
  return data.timer;
}
