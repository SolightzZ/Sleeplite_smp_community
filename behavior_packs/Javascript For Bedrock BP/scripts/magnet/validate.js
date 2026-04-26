export function canUse(player) {
  return player && player.isValid && player.location && player.dimension;
}
