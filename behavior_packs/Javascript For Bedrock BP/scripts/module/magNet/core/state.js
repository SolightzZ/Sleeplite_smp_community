const data = {
  users: new Set(),
  timer: null,
};

export function addUser(player) {
  data.users.add(player.id);
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
export function getUserIds() {
  return Array.from(data.users);
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
