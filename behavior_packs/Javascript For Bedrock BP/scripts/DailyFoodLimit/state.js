const PREFIX = "dailyfood:";

export function getcount(player, food) {
  return player.getDynamicProperty(PREFIX + food) ?? 0;
}

export function add(player, food) {
  const key = PREFIX + food;
  const next = (player.getDynamicProperty(key) ?? 0) + 1;
  player.setDynamicProperty(key, next);
  return next;
}

export function clear(player) {
  for (const id of player.getDynamicPropertyIds()) {
    if (id.startsWith(PREFIX)) {
      player.setDynamicProperty(id, undefined);
    }
  }
}
