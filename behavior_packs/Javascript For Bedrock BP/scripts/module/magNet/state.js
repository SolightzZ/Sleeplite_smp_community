const data = {
  users: new Map(),
  timer: null,
};

function addUser(player) {
  data.users.set(player.id, player);
}
function removeUser(id) {
  data.users.delete(id);
}
function hasUser(id) {
  return data.users.has(id);
}
function countUser() {
  return data.users.size;
}
function getUserEntries() {
  return data.users.entries();
}

function setTimer(id) {
  data.timer = id;
}
function clearTimer() {
  data.timer = null;
}
function hasTimer() {
  return data.timer !== null;
}
function getTimer() {
  return data.timer;
}

export {
  addUser,
  removeUser,
  hasUser,
  countUser,
  getUserEntries,
  setTimer,
  clearTimer,
  hasTimer,
  getTimer,
};
